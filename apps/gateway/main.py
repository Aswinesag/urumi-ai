from fastapi import FastAPI

app = FastAPI(
    title="Urumi AI MCP Gateway",
    description="Team gateway for securely accessing MCP tools.",
    version="0.1.0",
)


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "urumi-gateway",
        "version": "0.1.0",
    }
