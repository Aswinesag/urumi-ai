import Card from '../components/Card'

export default function Overview() {
  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#fff', margin: 0 }}>
          Overview
        </h1>
        <p style={{ fontSize: '14px', color: '#888', marginTop: '8px', margin: 0 }}>
          System status and activity summary
        </p>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>
          Service Status
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
        }}>
          <Card
            title="Gateway"
            value="Running"
            subtitle="HTTP/8000"
            status="healthy"
          />
          <Card
            title="PostgreSQL"
            value="Connected"
            subtitle="urumi-gateway namespace"
            status="healthy"
          />
          <Card
            title="WooCommerce MCP"
            value="Running"
            subtitle="HTTP/8001"
            status="healthy"
          />
          <Card
            title="Inventory MCP"
            value="Running"
            subtitle="HTTP/8002"
            status="healthy"
          />
          <Card
            title="Shipping MCP"
            value="Running"
            subtitle="HTTP/8003"
            status="healthy"
          />
        </div>
      </div>

      <div>
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>
          Activity Summary
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
        }}>
          <Card
            title="Available Tools"
            value="12"
            subtitle="Across 3 MCP servers"
            status="neutral"
          />
          <Card
            title="API Keys"
            value="3"
            subtitle="2 admin, 1 member"
            status="neutral"
          />
          <Card
            title="Recent Calls"
            value="0"
            subtitle="Last 24 hours"
            status="neutral"
          />
        </div>
      </div>

      <div style={{
        marginTop: '32px',
        padding: '24px',
        backgroundColor: '#2a2a2a',
        border: '1px solid #333',
        borderRadius: '12px',
      }}>
        <p style={{
          fontSize: '13px',
          color: '#888',
          fontStyle: 'italic',
          margin: 0,
        }}>
          Note: Service status and activity data are placeholder values. Backend API integration
          is required to display real-time status and metrics.
        </p>
      </div>
    </div>
  )
}
