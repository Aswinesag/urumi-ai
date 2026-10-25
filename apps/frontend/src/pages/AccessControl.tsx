import { useAuth } from '../contexts/AuthContext'
import { AlertCircle, Shield } from 'lucide-react'

export default function AccessControl() {
  const { isAuthenticated } = useAuth()

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

      {!isAuthenticated ? (
        <div style={{
          padding: '48px',
          backgroundColor: '#2a2a2a',
          border: '1px solid #333',
          borderRadius: '12px',
          textAlign: 'center',
        }}>
          <AlertCircle size={48} style={{ color: '#f59e0b', marginBottom: '16px' }} />
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#fff', marginBottom: '16px', margin: 0 }}>
            Authentication Required
          </h2>
          <p style={{ fontSize: '14px', color: '#888', margin: 0 }}>
            Please login with your API key to access control features.
          </p>
        </div>
      ) : (
        <div style={{
          padding: '48px',
          backgroundColor: '#2a2a2a',
          border: '1px solid #333',
          borderRadius: '12px',
          textAlign: 'center',
        }}>
          <Shield size={48} style={{ color: '#646cff', marginBottom: '16px' }} />
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#fff', marginBottom: '16px', margin: 0 }}>
            Limited Access Control Features
          </h2>
          <p style={{ fontSize: '14px', color: '#888', marginBottom: '24px', margin: 0 }}>
            The gateway has limited access control capabilities. Most administrative operations
            require direct database access or backend changes.
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
                Available (Admin Only)
              </h3>
              <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>
                • Revoke API keys (via API endpoint)<br />
                <span style={{ color: '#666' }}>Requires key ID from database</span>
              </p>
            </div>
            <div style={{
              padding: '16px',
              backgroundColor: '#333',
              borderRadius: '8px',
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '8px', margin: 0 }}>
                Not Available
              </h3>
              <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>
                • List users<br />
                • List API keys<br />
                • Create users<br />
                • Generate API keys<br />
                • View current user role
              </p>
            </div>
            <div style={{
              padding: '16px',
              backgroundColor: '#333',
              borderRadius: '8px',
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '8px', margin: 0 }}>
                Authentication
              </h3>
              <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>
                • API key based (Bearer token)<br />
                • Roles: admin, member<br />
                • Role enforced on revoke endpoint
              </p>
            </div>
          </div>
          <div style={{
            marginTop: '24px',
            padding: '16px',
            backgroundColor: '#1a1a1a',
            borderRadius: '8px',
            textAlign: 'left',
          }}>
            <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
              <strong>Two-User Demo:</strong> To demonstrate admin vs member permissions, you need
              two API keys (one admin, one member). Use the admin key to revoke the member key
              via the revoke endpoint (requires knowing the key ID from the database). The member
              key will receive a 403 Forbidden when attempting to revoke keys.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
