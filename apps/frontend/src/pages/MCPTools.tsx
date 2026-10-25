export default function MCPTools() {
  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#fff', margin: 0 }}>
          MCP Tools
        </h1>
        <p style={{ fontSize: '14px', color: '#888', marginTop: '8px', margin: 0 }}>
          Manage and test MCP server tools
        </p>
      </div>

      <div style={{
        padding: '48px',
        backgroundColor: '#2a2a2a',
        border: '1px solid #333',
        borderRadius: '12px',
        textAlign: 'center',
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>
          Backend Integration Required
        </h2>
        <p style={{ fontSize: '14px', color: '#888', marginBottom: '24px', margin: 0 }}>
          This page will display available MCP tools from WooCommerce, Inventory, and Shipping servers.
          Backend API integration is needed to fetch and execute tools.
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          textAlign: 'left',
        }}>
          <div style={{
            padding: '16px',
            backgroundColor: '#333',
            borderRadius: '8px',
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '8px', margin: 0 }}>
              WooCommerce
            </h3>
            <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>
              • List products<br />
              • Create product<br />
              • List orders<br />
              • Update order status
            </p>
          </div>
          <div style={{
            padding: '16px',
            backgroundColor: '#333',
            borderRadius: '8px',
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '8px', margin: 0 }}>
              Inventory
            </h3>
            <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>
              • Get stock by SKU<br />
              • Update stock quantity
            </p>
          </div>
          <div style={{
            padding: '16px',
            backgroundColor: '#333',
            borderRadius: '8px',
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '8px', margin: 0 }}>
              Shipping
            </h3>
            <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>
              • Track shipment<br />
              • Update shipment status
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
