export default function AuditLogs() {
  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#fff', margin: 0 }}>
          Audit Logs
        </h1>
        <p style={{ fontSize: '14px', color: '#888', marginTop: '8px', margin: 0 }}>
          View API key activity and tool call history
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
          This page will display audit logs including tool calls, outcomes, durations,
          and error messages. Backend API integration is needed to fetch log data.
        </p>
        <div style={{
          backgroundColor: '#333',
          borderRadius: '8px',
          padding: '16px',
          textAlign: 'left',
          maxWidth: '600px',
          margin: '0 auto',
        }}>
          <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>
            <strong>Planned Features:</strong>
          </p>
          <ul style={{ fontSize: '13px', color: '#888', marginTop: '8px', paddingLeft: '20px', margin: 0 }}>
            <li>Filterable log table with timestamps</li>
            <li>User and API key attribution</li>
            <li>Tool name and upstream server</li>
            <li>Success/failure status and error details</li>
            <li>Duration metrics</li>
            <li>Export functionality</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
