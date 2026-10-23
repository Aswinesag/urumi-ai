
from contextlib import asynccontextmanager

from fastapi import FastAPI
from mcp.server.mcpserver import MCPServer


mcp_server = MCPServer(
    name="urumi-woocommerce",
    instructions="Provides tools for interacting with a WooCommerce store.",
    version="0.1.0",
)


@mcp_server.tool()
def ping() -> str:
    """Check whether the WooCommerce MCP tool server is responsive."""
    return "WooCommerce MCP server is healthy."


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