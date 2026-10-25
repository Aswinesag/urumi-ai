
import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from mcp.server.mcpserver import MCPServer


mcp_server = MCPServer(
    name="urumi-inventory",
    instructions=(
        "Provides inventory tools for looking up stock by SKU "
        "and updating stock quantities."
    ),
    version="0.1.0",
)

# Temporary in-memory inventory for local development.
# This will be replaced with persistent storage later.
_inventory: dict[str, dict] = {
    "URUMI-TSHIRT-001": {
        "sku": "URUMI-TSHIRT-001",
        "product_name": "Urumi Demo T-Shirt",
        "quantity": 25,
        "reserved": 0,
    },
    "URUMI-MUG-001": {
        "sku": "URUMI-MUG-001",
        "product_name": "Urumi Demo Mug",
        "quantity": 40,
        "reserved": 0,
    },
}


@mcp_server.tool()
def ping() -> str:
    """Check whether the Inventory MCP server is responsive."""
    return "Inventory MCP server is healthy."


@mcp_server.tool()
def get_stock(sku: str) -> dict:
    """Get available stock details for an SKU."""
    sku = sku.strip().upper()

    if not sku:
        return {"error": "SKU is required."}

    item = _inventory.get(sku)
    if item is None:
        return {"error": "Inventory item not found.", "sku": sku}

    return {
        **item,
        "available": item["quantity"] - item["reserved"],
    }


@mcp_server.tool()
def update_stock(sku: str, quantity: int) -> dict:
    """Set the physical stock quantity for an existing SKU."""
    sku = sku.strip().upper()

    if not sku:
        return {"error": "SKU is required."}

    if quantity < 0:
        return {"error": "quantity cannot be negative."}

    item = _inventory.get(sku)
    if item is None:
        return {"error": "Inventory item not found.", "sku": sku}

    item["quantity"] = quantity

    return {
        "success": True,
        "sku": sku,
        "quantity": item["quantity"],
        "reserved": item["reserved"],
        "available": item["quantity"] - item["reserved"],
    }


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with mcp_server.session_manager.run():
        yield


app = FastAPI(
    title="Urumi Inventory MCP",
    description="MCP server for inventory lookup and stock updates.",
    version="0.1.0",
    lifespan=lifespan,
)

# Middleware to bypass MCP library's strict host header validation
@app.middleware("http")
async def bypass_host_validation(request: Request, call_next):
    # Allow any host header for service-to-service communication
    response = await call_next(request)
    return response


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "urumi-inventory-mcp",
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