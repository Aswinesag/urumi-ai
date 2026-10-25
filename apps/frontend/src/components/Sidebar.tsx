import { Link, useLocation } from 'react-router-dom'
import { Layout, Layers, FileText, Shield, LogIn, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useState } from 'react'
import AuthModal from './AuthModal'

const menuItems = [
  { path: '/', icon: Layout, label: 'Overview' },
  { path: '/mcp-tools', icon: Layers, label: 'MCP Tools' },
  { path: '/audit-logs', icon: FileText, label: 'Audit Logs' },
  { path: '/access-control', icon: Shield, label: 'Access Control' },
]

export default function Sidebar() {
  const location = useLocation()
  const { isAuthenticated, clearApiKey } = useAuth()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  return (
    <>
      <aside style={{
        width: '280px',
        backgroundColor: '#1a1a1a',
        borderRight: '1px solid #333',
        padding: '24px 0',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{ padding: '0 24px 32px' }}>
          <h1 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#fff',
            margin: 0,
          }}>
            Urumi AI
          </h1>
          <p style={{
            fontSize: '13px',
            color: '#888',
            marginTop: '4px',
            margin: 0,
          }}>
            Team MCP Gateway
          </p>
        </div>

        <nav style={{ flex: 1 }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path

              return (
                <li key={item.path} style={{ marginBottom: '4px' }}>
                  <Link
                    to={item.path}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 24px',
                      textDecoration: 'none',
                      color: isActive ? '#fff' : '#888',
                      backgroundColor: isActive ? '#333' : 'transparent',
                      borderRadius: '8px',
                      margin: '0 12px',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div style={{ padding: '24px', borderTop: '1px solid #333' }}>
          {isAuthenticated ? (
            <button
              onClick={() => clearApiKey()}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px',
                backgroundColor: '#333',
                border: '1px solid #444',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '13px',
                cursor: 'pointer',
                marginBottom: '12px',
              }}
            >
              <LogOut size={16} />
              Logout
            </button>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px',
                backgroundColor: '#646cff',
                border: 'none',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '13px',
                cursor: 'pointer',
                marginBottom: '12px',
              }}
            >
              <LogIn size={16} />
              Login
            </button>
          )}
          <p style={{
            fontSize: '12px',
            color: '#666',
            margin: 0,
          }}>
            v0.1.0
          </p>
        </div>
      </aside>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  )
}
