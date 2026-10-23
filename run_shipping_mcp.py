
import runpy
import uvicorn

module = runpy.run_path("apps/shipping-mcp/main.py")
app = module["app"]

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8003)