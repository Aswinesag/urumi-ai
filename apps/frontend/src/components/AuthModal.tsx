import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { setApiKey } = useAuth();
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      setApiKey(key);
      onClose();
      setKey('');
    } catch (err) {
      setError('Failed to set API key');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#2a2a2a',
          border: '1px solid #333',
          borderRadius: '12px',
          padding: '32px',
          width: '400px',
          maxWidth: '90%',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#fff', marginBottom: '8px', margin: 0 }}>
          Authentication
        </h2>
        <p style={{ fontSize: '13px', color: '#888', marginBottom: '24px', margin: '0 0 24px 0' }}>
          Enter your API key to access the gateway
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                color: '#888',
                marginBottom: '8px',
                fontWeight: '500',
              }}
            >
              API Key
            </label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="urumi_..."
              style={{
                width: '100%',
                padding: '10px 12px',
                backgroundColor: '#333',
                border: '1px solid #444',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
              autoFocus
            />
          </div>

          {error && (
            <p style={{ fontSize: '12px', color: '#ef4444', marginBottom: '16px', margin: '0 0 16px 0' }}>
              {error}
            </p>
          )}

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: '#333',
                border: '1px solid #444',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !key}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: isLoading || !key ? '#444' : '#646cff',
                border: 'none',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '14px',
                cursor: isLoading || !key ? 'not-allowed' : 'pointer',
              }}
            >
              {isLoading ? 'Setting...' : 'Authenticate'}
            </button>
          </div>
        </form>

        <p style={{ fontSize: '11px', color: '#666', marginTop: '16px', margin: '16px 0 0 0' }}>
          Note: API key is stored in memory only and cleared when you close the browser.
        </p>
      </div>
    </div>
  );
}
