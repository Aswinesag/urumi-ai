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
│   ├── Sidebar.tsx      # Navigation sidebar
│   ├── Layout.tsx       # Main layout wrapper
│   └── Card.tsx         # Reusable status card
├── pages/
│   ├── Overview.tsx     # Dashboard overview page
│   ├── MCPTools.tsx     # MCP tools management (placeholder)
│   ├── AuditLogs.tsx    # Audit log viewer (placeholder)
│   └── AccessControl.tsx # User/key management (placeholder)
├── App.tsx              # Main app with routing
├── main.tsx             # Entry point
└── index.css            # Global styles
```

## Pages

- **Overview**: Service status cards and activity summary (placeholder data)
- **MCP Tools**: Tool listing and execution (awaiting backend integration)
- **Audit Logs**: Activity log viewer (awaiting backend integration)
- **Access Control**: User and API key management (awaiting backend integration)

## Backend Integration

The frontend is designed to integrate with the gateway API. Currently, all data is placeholder/demo.
The gateway API base URL is configured via `VITE_GATEWAY_API_URL` environment variable.

## Development

The development server runs on `http://localhost:3000` by default.
