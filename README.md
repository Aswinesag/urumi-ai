# Urumi AI — Team MCP Gateway Platform

A Kubernetes-based platform for hosting WooCommerce and exposing
store operations through a secured, multi-user MCP gateway.

## Project structure

- apps/gateway: Authenticated MCP gateway and API
- apps/woocommerce-mcp: WooCommerce MCP server
- apps/inventory-mcp: Inventory MCP server
- apps/shipping-mcp: Shipping MCP server
- apps/frontend: Team dashboard and chat interface
- charts/urumi-platform: Helm deployment chart
- deploy: Local and production deployment configuration
- docs: Architecture and setup documentation
- tests: Automated tests
