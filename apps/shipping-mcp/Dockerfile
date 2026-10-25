FROM python:3.11-slim

WORKDIR /app

COPY apps/shipping-mcp/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY apps/shipping-mcp/main.py .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8003"]
