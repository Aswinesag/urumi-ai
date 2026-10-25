export default function AccessControl() {
  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#fff', margin: 0 }}>
          Access Control
        </h1>
        <p style={{ fontSize: '14px', color: '#888', marginTop: '8px', margin: 0 }}>
          Manage users, API keys, and permissions
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
          This page will provide user management and API key administration. Backend API
          integration is needed to manage users and keys.
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px',
          textAlign: 'left',
        }}>
          <div style={{
            padding: '16px',
            backgroundColor: '#333',
            borderRadius: '8px',
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '8px', margin: 0 }}>
              Users
            </h3>
            <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>
              • Create admin/member users<br />
              • Manage user roles<br />
              • Activate/deactivate accounts
            </p>
          </div>
          <div style={{
            padding: '16px',
            backgroundColor: '#333',
            borderRadius: '8px',
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '8px', margin: 0 }}>
              API Keys
            </h3>
            <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>
              • Generate new keys<br />
              • Revoke keys<br />
              • View key activity
            </p>
          </div>
          <div style={{
            padding: '16px',
            backgroundColor: '#333',
            borderRadius: '8px',
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '8px', margin: 0 }}>
              Permissions
            </h3>
            <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>
              • Role-based access<br />
              • Tool permissions<br />
              • Audit trail
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
