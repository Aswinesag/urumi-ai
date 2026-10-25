FROM python:3.11-slim

WORKDIR /app

# Copy requirements first for better caching
COPY apps/gateway/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy entire apps/gateway directory (includes all Python files and migrations)
COPY apps/gateway/ ./apps/gateway/

# Copy the apps __init__.py files to make it a proper package
COPY apps/__init__.py ./apps/
COPY apps/gateway/__init__.py ./apps/gateway/

# Copy alembic.ini to the root for migration support
COPY alembic.ini .

# Run uvicorn with module import
CMD ["uvicorn", "apps.gateway.main:app", "--host", "0.0.0.0", "--port", "8000"]
