interface CardProps {
  title: string
  value: string | number
  subtitle?: string
  status?: 'healthy' | 'warning' | 'error' | 'neutral'
}

const statusColors = {
  healthy: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  neutral: '#6b7280',
}

export default function Card({ title, value, subtitle, status = 'neutral' }: CardProps) {
  return (
    <div style={{
      backgroundColor: '#2a2a2a',
      border: '1px solid #333',
      borderRadius: '12px',
      padding: '24px',
      minHeight: '140px',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '16px',
      }}>
        <p style={{
          fontSize: '13px',
          color: '#888',
          margin: 0,
          fontWeight: '500',
        }}>
          {title}
        </p>
        {status && (
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: statusColors[status],
            }}
          />
        )}
      </div>
      <p style={{
        fontSize: '32px',
        fontWeight: '600',
        color: '#fff',
        margin: 0,
      }}>
        {value}
      </p>
      {subtitle && (
        <p style={{
          fontSize: '12px',
          color: '#666',
          marginTop: '8px',
          margin: 0,
        }}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
