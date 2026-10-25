import { useState, useEffect } from 'react'
import Card from '../components/Card'
import { apiClient, ApiError } from '../lib/api'
import { RefreshCw } from 'lucide-react'

type ServiceStatus = 'healthy' | 'unhealthy' | 'unknown' | 'loading' | 'unavailable'

interface ServiceHealth {
  gateway: ServiceStatus
  postgresql: ServiceStatus
  woocommerceMcp: ServiceStatus
  inventoryMcp: ServiceStatus
  shippingMcp: ServiceStatus
}

export default function Overview() {
  const [health, setHealth] = useState<ServiceHealth>({
    gateway: 'loading',
    postgresql: 'unavailable',
    woocommerceMcp: 'unavailable',
    inventoryMcp: 'unavailable',
    shippingMcp: 'unavailable',
  })
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const checkGatewayHealth = async () => {
    try {
      await apiClient.getHealth()
      setHealth(prev => ({ ...prev, gateway: 'healthy' }))
      setError(null)
    } catch (err) {
      if (err instanceof ApiError) {
        setHealth(prev => ({ ...prev, gateway: 'unhealthy' }))
        setError(err.message)
      } else {
        setHealth(prev => ({ ...prev, gateway: 'unknown' }))
      }
    }
  }

  const refresh = async () => {
    setIsRefreshing(true)
    await checkGatewayHealth()
    setIsRefreshing(false)
  }

  useEffect(() => {
    checkGatewayHealth()
  }, [])

  const getStatusValue = (status: ServiceStatus) => {
    switch (status) {
      case 'healthy': return 'Healthy'
      case 'unhealthy': return 'Unhealthy'
      case 'loading': return 'Checking...'
      case 'unavailable': return 'Not available'
      case 'unknown': return 'Unknown'
      default: return 'Unknown'
    }
  }

  const getStatusColor = (status: ServiceStatus) => {
    switch (status) {
      case 'healthy': return 'healthy' as const
      case 'unhealthy': return 'error' as const
      case 'loading': return 'neutral' as const
      case 'unavailable': return 'neutral' as const
      case 'unknown': return 'warning' as const
      default: return 'neutral' as const
    }
  }

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#fff', margin: 0 }}>
            Overview
          </h1>
          <p style={{ fontSize: '14px', color: '#888', marginTop: '8px', margin: 0 }}>
            System status and activity summary
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={isRefreshing}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: '#333',
            border: '1px solid #444',
            borderRadius: '6px',
            color: '#fff',
            fontSize: '13px',
            cursor: isRefreshing ? 'not-allowed' : 'pointer',
          }}
        >
          <RefreshCw size={16} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      {error && (
        <div style={{
          marginBottom: '24px',
          padding: '16px',
          backgroundColor: '#3a1a1a',
          border: '1px solid #ef4444',
          borderRadius: '8px',
        }}>
          <p style={{ fontSize: '13px', color: '#ef4444', margin: 0 }}>
            {error}
          </p>
        </div>
      )}

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
            value={getStatusValue(health.gateway)}
            subtitle="Checked via health endpoint"
            status={getStatusColor(health.gateway)}
          />
          <Card
            title="PostgreSQL"
            value={getStatusValue(health.postgresql)}
            subtitle="No health check endpoint"
            status={getStatusColor(health.postgresql)}
          />
          <Card
            title="WooCommerce MCP"
            value={getStatusValue(health.woocommerceMcp)}
            subtitle="No health check endpoint"
            status={getStatusColor(health.woocommerceMcp)}
          />
          <Card
            title="Inventory MCP"
            value={getStatusValue(health.inventoryMcp)}
            subtitle="No health check endpoint"
            status={getStatusColor(health.inventoryMcp)}
          />
          <Card
            title="Shipping MCP"
            value={getStatusValue(health.shippingMcp)}
            subtitle="No health check endpoint"
            status={getStatusColor(health.shippingMcp)}
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
            value="Not available"
            subtitle="Use MCP Tools page to discover"
            status="neutral"
          />
          <Card
            title="API Keys"
            value="Not available"
            subtitle="No listing endpoint"
            status="neutral"
          />
          <Card
            title="Recent Calls"
            value="Not available"
            subtitle="Audit logs stored but not readable"
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
          margin: 0,
        }}>
          <strong>Limitations:</strong> The gateway exposes a health check endpoint but does not provide
          endpoints for PostgreSQL health, MCP server health, tool counts, API key listings, or audit log reading.
          Activity metrics are recorded but cannot be retrieved via the current API.
        </p>
      </div>
    </div>
  )
}
