
from contextlib import asynccontextmanager

from fastapi import FastAPI
from mcp.server.mcpserver import MCPServer


mcp_server = MCPServer(
    name="urumi-shipping",
    instructions=(
        "Provides shipment tracking and shipment status updates "
        "for the Urumi demo store."
    ),
    version="0.1.0",
)

# Temporary shipment data for local development.
_shipments: dict[str, dict] = {
    "URUMI-SHIP-001": {
        "tracking_id": "URUMI-SHIP-001",
        "order_id": 13,
        "carrier": "Demo Express",
        "status": "in_transit",
        "estimated_delivery": "2026-10-27",
    },
    "URUMI-SHIP-002": {
        "tracking_id": "URUMI-SHIP-002",
        "order_id": 14,
        "carrier": "Demo Express",
        "status": "processing",
        "estimated_delivery": "2026-10-29",
    },
}


@mcp_server.tool()
def ping() -> str:
    """Check whether the Shipping MCP server is responsive."""
    return "Shipping MCP server is healthy."


@mcp_server.tool()
def track_shipment(tracking_id: str) -> dict:
    """Retrieve tracking details for a shipment."""
    tracking_id = tracking_id.strip().upper()

    if not tracking_id:
        return {"error": "Tracking ID is required."}

    shipment = _shipments.get(tracking_id)
    if shipment is None:
        return {
            "error": "Shipment not found.",
            "tracking_id": tracking_id,
        }

    return dict(shipment)


@mcp_server.tool()
def update_shipment_status(
    tracking_id: str,
    status: str,
) -> dict:
    """Update a shipment's status."""
    tracking_id = tracking_id.strip().upper()
    status = status.strip().lower()

    allowed_statuses = {
        "processing",
        "dispatched",
        "in_transit",
        "delivered",
        "delayed",
        "cancelled",
    }

    if not tracking_id:
        return {"error": "Tracking ID is required."}

    if status not in allowed_statuses:
        return {
            "error": "Unsupported shipment status.",
            "allowed_statuses": sorted(allowed_statuses),
        }

    shipment = _shipments.get(tracking_id)
    if shipment is None:
        return {
            "error": "Shipment not found.",
            "tracking_id": tracking_id,
        }

    shipment["status"] = status

    return {
        "success": True,
        **shipment,
    }


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with mcp_server.session_manager.run():
        yield


app = FastAPI(
    title="Urumi Shipping MCP",
    description="MCP server for shipment tracking and status updates.",
    version="0.1.0",
    lifespan=lifespan,
)


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "urumi-shipping-mcp",
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