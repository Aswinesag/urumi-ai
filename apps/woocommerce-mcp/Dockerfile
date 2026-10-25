FROM python:3.11-slim

WORKDIR /app

COPY apps/woocommerce-mcp/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY apps/woocommerce-mcp/main.py .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
