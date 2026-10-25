# Urumi AI Frontend

A React + Vite + TypeScript dashboard for the Urumi AI Team MCP Gateway Platform.

## Tech Stack

- React 18
- TypeScript
- Vite
- React Router
- Lucide React (icons)

## Setup

1. Install dependencies:
   ```bash
   cd apps/frontend
   npm install
   ```

2. Configure gateway API URL (optional):
   - Copy `.env.example` to `.env`
   - Update `VITE_GATEWAY_API_URL` to point to your gateway instance
   - Default: `http://localhost:8000`

3. Start development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

5. Preview production build:
   ```bash
   npm run preview
   ```

## Project Structure

```
src/
├── components/
│   ├── Sidebar.tsx      # Navigation sidebar with auth
│   ├── Layout.tsx       # Main layout wrapper
│   ├── Card.tsx         # Reusable status card
│   └── AuthModal.tsx    # API key authentication modal
├── contexts/
│   └── AuthContext.tsx  # Authentication state management
├── lib/
│   └── api.ts           # Gateway API client
├── pages/
│   ├── Overview.tsx     # Dashboard with gateway health
│   ├── MCPTools.tsx     # MCP tool discovery and execution
│   ├── AuditLogs.tsx    # Audit log information (not readable via API)
│   └── AccessControl.tsx # Access control information
├── App.tsx              # Main app with routing
├── main.tsx             # Entry point
└── index.css            # Global styles
```

## Pages

- **Overview**: Gateway health check from `/health` endpoint. Other services marked as unavailable due to lack of health check endpoints.
- **MCP Tools**: Discover and execute tools from WooCommerce, Inventory, and Shipping MCP servers via `/mcp/tools` and `/mcp/call` endpoints.
- **Audit Logs**: Information page explaining that audit logs are recorded but not readable via API (no read endpoint exists).
- **Access Control**: Information page explaining available features (admin-only key revocation) and limitations (no user/key listing endpoints).

## Backend Integration

The frontend integrates with the gateway API using Bearer token authentication.

**Authentication:**
- Enter API key via Login button in sidebar
- Key stored in memory only (cleared on browser close or logout)
- Key sent as `Authorization: Bearer <key>` header

**Available Endpoints:**
- `GET /health` - Gateway health (no auth required)
- `GET /mcp/tools?upstream=...` - List tools (requires auth)
- `POST /mcp/call?upstream=...` - Execute tool (requires auth)
- `POST /admin/api-keys/{id}/revoke` - Revoke key (admin only, requires auth)

**Not Available:**
- PostgreSQL health check endpoint
- MCP server health check endpoints
- User listing endpoint
- API key listing endpoint
- Audit log reading endpoint
- User role endpoint (role is only enforced on specific admin-only endpoints)

## Two-User Demo

To demonstrate admin vs member permissions:

1. Use an admin API key to login
2. Attempt to revoke an API key via `/admin/api-keys/{id}/revoke` (requires knowing the key ID from database)
3. Logout and use a member API key
4. Attempt the same revoke operation - will receive 403 Forbidden

The frontend does not automatically create users or keys. These must be created via the backend scripts or database.

## CORS and Networking

The gateway must allow CORS requests from the frontend origin. For local development with `http://localhost:3000`, the gateway should be configured to allow this origin. This may require backend configuration changes.

## Demo Limitations

- Inventory and Shipping MCP servers use in-memory data (changes not persisted)
- WooCommerce operations affect the actual WordPress/WooCommerce instance
- Audit logs are recorded but cannot be viewed in the UI
- API keys and users cannot be created or listed in the UI
- User role is not displayed (no endpoint to retrieve it)

## Development

The development server runs on `http://localhost:3000` by default.
