
import asyncio
import os
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any

import requests
from dotenv import load_dotenv
from fastapi import FastAPI
from mcp.server.mcpserver import MCPServer
from requests_oauthlib import OAuth1

load_dotenv(Path(__file__).with_name(".env"))

store_url = os.getenv("WOOCOMMERCE_URL", "").rstrip("/")
consumer_key = os.getenv("WOOCOMMERCE_CONSUMER_KEY", "")
consumer_secret = os.getenv("WOOCOMMERCE_CONSUMER_SECRET", "")

mcp_server = MCPServer(
    name="urumi-woocommerce",
    instructions=(
        "Provides tools for listing and creating WooCommerce products, "
        "listing and retrieving orders, and updating order statuses."
    ),
    version="0.1.0",
)


def _woocommerce_request(
    method: str,
    resource: str,
    *,
    params: dict[str, Any] | None = None,
    payload: dict[str, Any] | None = None,
) -> Any:
    """Make an authenticated WooCommerce REST API request."""
    if not store_url or not consumer_key or not consumer_secret:
        raise RuntimeError("WooCommerce credentials are not configured.")

    auth = OAuth1(
        consumer_key,
        client_secret=consumer_secret,
        signature_method="HMAC-SHA1",
    )

    response = requests.request(
        method=method,
        url=f"{store_url}/wp-json/wc/v3/{resource.lstrip('/')}",
        params=params,
        json=payload,
        auth=auth,
        timeout=20,
    )
    response.raise_for_status()
    return response.json()


def _error_result(exc: Exception) -> dict:
    """Return safe errors without exposing credentials or response bodies."""
    if isinstance(exc, RuntimeError):
        return {"error": str(exc)}

    if isinstance(exc, requests.HTTPError):
        status = exc.response.status_code if exc.response is not None else None
        return {
            "error": "WooCommerce API returned an HTTP error.",
            "status_code": status,
        }

    if isinstance(exc, requests.RequestException):
        return {"error": "Unable to connect to WooCommerce."}

    if isinstance(exc, ValueError):
        return {"error": "WooCommerce returned an invalid response."}

    return {"error": "The WooCommerce operation failed."}


async def _run_request(
    method: str,
    resource: str,
    *,
    params: dict[str, Any] | None = None,
    payload: dict[str, Any] | None = None,
) -> Any:
    return await asyncio.to_thread(
        _woocommerce_request,
        method,
        resource,
        params=params,
        payload=payload,
    )


@mcp_server.tool()
def ping() -> str:
    """Check whether the WooCommerce MCP tool server is responsive."""
    return "WooCommerce MCP server is healthy."


@mcp_server.tool()
async def list_products(limit: int = 10) -> dict:
    """List published products with IDs, names, SKUs, prices, and status."""
    if not 1 <= limit <= 100:
        return {"error": "limit must be between 1 and 100."}

    try:
        products = await _run_request(
            "GET",
            "products",
            params={"per_page": limit, "status": "publish"},
        )
        return {
            "count": len(products),
            "products": [
                {
                    "id": p["id"],
                    "name": p["name"],
                    "sku": p.get("sku", ""),
                    "price": p.get("price", ""),
                    "status": p["status"],
                }
                for p in products
            ],
        }
    except Exception as exc:
        return _error_result(exc)


@mcp_server.tool()
async def create_product(
    name: str,
    regular_price: str,
    description: str = "",
    sku: str = "",
) -> dict:
    """Create a simple published WooCommerce product."""
    name = name.strip()
    regular_price = regular_price.strip()
    sku = sku.strip()

    if not name:
        return {"error": "Product name is required."}

    try:
        price = float(regular_price)
        if not (price >= 0 and price < float("inf")):
            raise ValueError
    except (ValueError, TypeError):
        return {"error": "regular_price must be a non-negative number."}

    payload: dict[str, Any] = {
        "name": name,
        "type": "simple",
        "regular_price": regular_price,
        "description": description,
        "status": "draft",
    }
    if sku:
        payload["sku"] = sku

    try:
        product = await _run_request("POST", "products", payload=payload)
        return {
            "success": True,
            "product": {
                "id": product["id"],
                "name": product["name"],
                "sku": product.get("sku", ""),
                "regular_price": product.get("regular_price", ""),
                "status": product["status"],
            },
            "message": "Product created as a draft; publish it in WooCommerce when ready.",
        }
    except Exception as exc:
        return _error_result(exc)


@mcp_server.tool()
async def list_orders(limit: int = 10) -> dict:
    """List recent WooCommerce orders with basic customer and total details."""
    if not 1 <= limit <= 100:
        return {"error": "limit must be between 1 and 100."}

    try:
        orders = await _run_request(
            "GET",
            "orders",
            params={"per_page": limit, "orderby": "date", "order": "desc"},
        )
        return {
            "count": len(orders),
            "orders": [
                {
                    "id": o["id"],
                    "status": o["status"],
                    "currency": o.get("currency", ""),
                    "total": o.get("total", ""),
                    "date_created": o.get("date_created", ""),
                    "customer_id": o.get("customer_id", 0),
                }
                for o in orders
            ],
        }
    except Exception as exc:
        return _error_result(exc)


@mcp_server.tool()
async def get_order(order_id: int) -> dict:
    """Retrieve a WooCommerce order by its numeric ID."""
    if order_id < 1:
        return {"error": "order_id must be a positive integer."}

    try:
        order = await _run_request("GET", f"orders/{order_id}")
        return {
            "order": {
                "id": order["id"],
                "status": order["status"],
                "currency": order.get("currency", ""),
                "total": order.get("total", ""),
                "date_created": order.get("date_created", ""),
                "customer_id": order.get("customer_id", 0),
                "line_items": [
                    {
                        "product_id": item.get("product_id"),
                        "name": item.get("name", ""),
                        "quantity": item.get("quantity", 0),
                        "total": item.get("total", ""),
                    }
                    for item in order.get("line_items", [])
                ],
            }
        }
    except Exception as exc:
        return _error_result(exc)


@mcp_server.tool()
async def update_order_status(order_id: int, status: str) -> dict:
    """Update an order to a supported WooCommerce status."""
    allowed_statuses = {
        "pending",
        "processing",
        "on-hold",
        "completed",
        "cancelled",
        "refunded",
        "failed",
    }

    status = status.strip().lower()

    if order_id < 1:
        return {"error": "order_id must be a positive integer."}
    if status not in allowed_statuses:
        return {
            "error": "Unsupported order status.",
            "allowed_statuses": sorted(allowed_statuses),
        }

    try:
        order = await _run_request(
            "PUT",
            f"orders/{order_id}",
            payload={"status": status},
        )
        return {
            "success": True,
            "order_id": order["id"],
            "status": order["status"],
        }
    except Exception as exc:
        return _error_result(exc)


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with mcp_server.session_manager.run():
        yield


app = FastAPI(
    title="Urumi WooCommerce MCP",
    description="MCP server for WooCommerce store operations.",
    version="0.1.0",
    lifespan=lifespan,
)


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "urumi-woocommerce-mcp",
        "version": "0.1.0",
    }


app.mount(
    "/",
    mcp_server.streamable_http_app(
        streamable_http_path="/mcp",
        json_response=True,
        stateless_http=True,
    ),
)