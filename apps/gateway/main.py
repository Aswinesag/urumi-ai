
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from mcp import ClientSession
from mcp.client.streamable_http import streamable_http_client

WOOCOMMERCE_MCP_URL = os.getenv(
    "WOOCOMMERCE_MCP_URL",
    "http://127.0.0.1:8001/mcp",
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.mcp_ready = False
    yield


app = FastAPI(
    title="Urumi AI MCP Gateway",
    description="Team gateway for securely accessing MCP tools.",
    version="0.1.0",
    lifespan=lifespan,
)


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "urumi-gateway",
        "version": "0.1.0",
    }


@app.get("/mcp/tools")
async def list_upstream_tools():
    """List tools exposed by the WooCommerce MCP server."""
    try:
        async with streamable_http_client(WOOCOMMERCE_MCP_URL) as (
            read_stream,
            write_stream,
        ):
            async with ClientSession(read_stream, write_stream) as session:
                await session.initialize()
                result = await session.list_tools()

                return {
                    "upstream": "woocommerce",
                    "tools": [
                        {
                            "name": tool.name,
                            "description": tool.description,
                        }
                        for tool in result.tools
                    ],
                }
    except Exception:
        raise HTTPException(
            status_code=502,
            detail="Unable to communicate with the WooCommerce MCP server.",
        ) from None

        
from pydantic import BaseModel, Field


class ToolCallRequest(BaseModel):
    name: str = Field(min_length=1)
    arguments: dict = Field(default_factory=dict)


@app.post("/mcp/call")
async def call_upstream_tool(request: ToolCallRequest):
    """Execute a tool on the WooCommerce MCP server."""
    try:
        async with streamable_http_client(WOOCOMMERCE_MCP_URL) as (
            read_stream,
            write_stream,
        ):
            async with ClientSession(read_stream, write_stream) as session:
                await session.initialize()
                result = await session.call_tool(
                    request.name,
                    arguments=request.arguments,
                )

                return {
                    "upstream": "woocommerce",
                    "tool": request.name,
                    "is_error": result.is_error,
                    "content": [
                        {"type": item.type, "text": item.text}
                        if hasattr(item, "text")
                        else {"type": item.type}
                        for item in result.content
                    ],
                }
    except Exception:
        raise HTTPException(
            status_code=502,
            detail="Unable to execute the requested WooCommerce MCP tool.",
        ) from None
