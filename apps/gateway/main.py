import os
from contextlib import asynccontextmanager
import time
import uuid
import logging
from apps.gateway.models import AuditLog, APIKey
from datetime import datetime, timezone
from sqlalchemy import select

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from mcp import ClientSession
from mcp.client.streamable_http import streamable_http_client
from typing import Annotated

from fastapi import Depends, Header
from sqlalchemy.orm import Session

from apps.gateway.database import SessionLocal
from apps.gateway.security import AuthenticatedUser, authenticate_api_key

WOOCOMMERCE_MCP_URL = os.getenv(
    "WOOCOMMERCE_MCP_URL",
    "http://127.0.0.1:8001/mcp",
)

INVENTORY_MCP_URL = os.getenv(
    "INVENTORY_MCP_URL",
    "http://127.0.0.1:8002/mcp",
)

SHIPPING_MCP_URL = os.getenv(
    "SHIPPING_MCP_URL",
    "http://127.0.0.1:8003/mcp",
)

logger = logging.getLogger(__name__)

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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def require_api_key(
    authorization: Annotated[str | None, Header()] = None,
    db: Session = Depends(get_db),
) -> AuthenticatedUser:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Missing or invalid API key.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    plaintext_key = authorization.removeprefix("Bearer ").strip()
    authenticated = authenticate_api_key(db, plaintext_key)

    if authenticated is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired API key.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return authenticated


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "urumi-gateway",
        "version": "0.1.0",
    }



@app.get("/mcp/tools")
async def list_upstream_tools(
    upstream: str = "woocommerce",
    current_user: AuthenticatedUser = Depends(require_api_key),
):
    upstream_urls = {
        "woocommerce": WOOCOMMERCE_MCP_URL,
        "inventory": INVENTORY_MCP_URL,
         "shipping": SHIPPING_MCP_URL,
    }

    upstream_url = upstream_urls.get(upstream)
    if upstream_url is None:
        raise HTTPException(
            status_code=400,
            detail="Unsupported upstream. Choose 'woocommerce' or 'inventory'.",
        )

    try:
        # Use service name with port to ensure valid Host header
        # The MCP library validates Host headers for security
        service_urls = {
            "woocommerce": "http://urumi-woocommerce-mcp:8001/mcp",
            "inventory": "http://urumi-inventory-mcp:8002/mcp",
            "shipping": "http://urumi-shipping-mcp:8003/mcp",
        }
        service_url = service_urls.get(upstream, upstream_url)
        
        async with streamable_http_client(service_url) as (
            read_stream,
            write_stream,
        ):
            async with ClientSession(read_stream, write_stream) as session:
                await session.initialize()
                result = await session.list_tools()

                return {
                    "upstream": upstream,
                    "tools": [
                        {
                            "name": tool.name,
                            "description": tool.description,
                        }
                        for tool in result.tools
                    ],
                }
    except Exception:
        logger.exception(
            "Failed to discover MCP tools",
            extra={"upstream": upstream},
        )
        raise HTTPException(
            status_code=502,
            detail=f"Unable to communicate with the {upstream} MCP server.",
        ) from None

        
from pydantic import BaseModel, Field


class ToolCallRequest(BaseModel):
    name: str = Field(min_length=1)
    arguments: dict = Field(default_factory=dict)




@app.post("/mcp/call")
async def call_upstream_tool(
    request: ToolCallRequest,
    upstream: str = "woocommerce",
    current_user: AuthenticatedUser = Depends(require_api_key),
):
    """Execute an authenticated MCP tool call and record its outcome."""
    upstream_urls = {
        "woocommerce": WOOCOMMERCE_MCP_URL,
        "inventory": INVENTORY_MCP_URL,
        "shipping": SHIPPING_MCP_URL,
    }

    upstream_url = upstream_urls.get(upstream)
    if upstream_url is None:
        raise HTTPException(
            status_code=400,
            detail="Unsupported upstream. Choose 'woocommerce' or 'inventory'.",
        )

    started_at = time.perf_counter()
    request_id = str(uuid.uuid4())
    outcome = "failure"
    error_message = None

    try:
        # Use service name with port to ensure valid Host header
        service_urls = {
            "woocommerce": "http://urumi-woocommerce-mcp:8001/mcp",
            "inventory": "http://urumi-inventory-mcp:8002/mcp",
            "shipping": "http://urumi-shipping-mcp:8003/mcp",
        }
        service_url = service_urls.get(upstream, upstream_url)
        
        async with streamable_http_client(service_url) as (
            read_stream,
            write_stream,
        ):
            async with ClientSession(read_stream, write_stream) as session:
                await session.initialize()
                result = await session.call_tool(
                    request.name,
                    arguments=request.arguments,
                )

                outcome = "failure" if result.is_error else "success"

                return {
                    "upstream": upstream,
                    "tool": request.name,
                    "is_error": result.is_error,
                    "request_id": request_id,
                    "content": [
                        {"type": item.type, "text": item.text}
                        if hasattr(item, "text")
                        else {"type": item.type}
                        for item in result.content
                    ],
                }

    except Exception:
        error_message = f"Unable to execute the requested {upstream} MCP tool."
        logger.exception(
            "MCP tool execution failed",
            extra={"upstream": upstream, "request_id": request_id},
        )
        raise HTTPException(
            status_code=502,
            detail=error_message,
        ) from None

    finally:
        duration_ms = round((time.perf_counter() - started_at) * 1000)

        try:
            with SessionLocal() as db:
                db.add(
                    AuditLog(
                        user_id=current_user.user.id,
                        api_key_id=current_user.api_key.id,
                        upstream_name=upstream,
                        tool_name=request.name,
                        outcome=outcome,
                        duration_ms=duration_ms,
                        error_message=error_message,
                        request_id=request_id,
                    )
                )
                db.commit()
        except Exception:
            logger.exception(
                "Failed to persist MCP audit log",
                extra={
                    "request_id": request_id,
                    "upstream": upstream,
                    "tool_name": request.name,
                },
            )

@app.post("/admin/api-keys/{api_key_id}/revoke")
def revoke_api_key(
    api_key_id: int,
    current_user: AuthenticatedUser = Depends(require_api_key),
):
    """Revoke an API key. Administrators only."""

    if current_user.user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Administrator privileges are required.",
        )

    with SessionLocal() as db:
        api_key = db.scalar(
            select(APIKey).where(APIKey.id == api_key_id)
        )

        if api_key is None:
            raise HTTPException(
                status_code=404,
                detail="API key not found.",
            )

        if api_key.revoked_at is not None:
            return {
                "status": "already_revoked",
                "api_key_id": api_key_id,
            }

        api_key.revoked_at = datetime.now(timezone.utc)
        db.commit()

    return {
        "status": "revoked",
        "api_key_id": api_key_id,
    }