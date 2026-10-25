import { AlertCircle } from 'lucide-react'

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
        <AlertCircle size={48} style={{ color: '#f59e0b', marginBottom: '16px' }} />
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#fff', marginBottom: '16px', margin: 0 }}>
          Audit Logs Not Available
        </h2>
        <p style={{ fontSize: '14px', color: '#888', marginBottom: '24px', margin: 0 }}>
          The gateway records audit logs for all tool calls, but does not currently expose
          an endpoint to retrieve them.
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
            <strong>What is recorded:</strong>
          </p>
          <ul style={{ fontSize: '13px', color: '#888', marginTop: '8px', paddingLeft: '20px', margin: 0 }}>
            <li>User and API key attribution</li>
            <li>Tool name and upstream server</li>
            <li>Success/failure status</li>
            <li>Duration metrics</li>
            <li>Error messages (if any)</li>
            <li>Request ID for tracing</li>
          </ul>
          <p style={{ fontSize: '12px', color: '#888', marginTop: '16px', margin: 0 }}>
            <strong>Why it's not visible:</strong>
          </p>
          <p style={{ fontSize: '13px', color: '#888', marginTop: '8px', margin: 0 }}>
            The backend has no read endpoint for audit logs. To view logs, you would need to
            query the PostgreSQL database directly or the gateway maintainers would need to add a
            read endpoint with appropriate authorization controls.
          </p>
        </div>
      </div>
    </div>
  )
}
