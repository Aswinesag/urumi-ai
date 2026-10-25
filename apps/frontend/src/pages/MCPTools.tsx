import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { apiClient, ApiError, Tool, ToolCallRequest } from '../lib/api'
import { RefreshCw, AlertCircle, CheckCircle } from 'lucide-react'

const UPSTREAMS = ['woocommerce', 'inventory', 'shipping'] as const
type Upstream = typeof UPSTREAMS[number]

export default function MCPTools() {
  const { isAuthenticated } = useAuth()
  const [selectedUpstream, setSelectedUpstream] = useState<Upstream>('woocommerce')
  const [tools, setTools] = useState<Tool[]>([])
  const [isLoadingTools, setIsLoadingTools] = useState(false)
  const [toolsError, setToolsError] = useState<string | null>(null)

  const [selectedTool, setSelectedTool] = useState<Tool | null>(null)
  const [toolArguments, setToolArguments] = useState<Record<string, string>>({})
  const [isCalling, setIsCalling] = useState(false)
  const [callResult, setCallResult] = useState<string | null>(null)
  const [callError, setCallError] = useState<string | null>(null)

  const loadTools = async () => {
    if (!isAuthenticated) return
    
    setIsLoadingTools(true)
    setToolsError(null)
    setTools([])
    
    try {
      const response = await apiClient.listTools(selectedUpstream)
      setTools(response.tools)
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setToolsError('Authentication required. Please login with your API key.')
        } else if (err.status === 403) {
          setToolsError('Access denied. Your API key may not have permission.')
        } else if (err.status === 502) {
          setToolsError(`Unable to connect to ${selectedUpstream} MCP server.`)
        } else {
          setToolsError(err.detail || err.message)
        }
      } else {
        setToolsError('Failed to load tools')
      }
    } finally {
      setIsLoadingTools(false)
    }
  }

  useEffect(() => {
    loadTools()
  }, [selectedUpstream, isAuthenticated])

  const handleToolSelect = (tool: Tool) => {
    setSelectedTool(tool)
    setToolArguments({})
    setCallResult(null)
    setCallError(null)
  }

  const handleCallTool = async () => {
    if (!selectedTool) return

    setIsCalling(true)
    setCallResult(null)
    setCallError(null)

    try {
      const request: ToolCallRequest = {
        name: selectedTool.name,
        arguments: toolArguments,
      }
      const response = await apiClient.callTool(selectedUpstream, request)
      
      if (response.is_error) {
        setCallError('Tool execution returned an error')
      }
      
      const resultText = response.content
        .map(item => item.text || JSON.stringify(item))
        .join('\n')
      setCallResult(resultText)
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setCallError('Authentication required')
        } else if (err.status === 403) {
          setCallError('Access denied')
        } else if (err.status === 502) {
          setCallError(`Unable to execute tool on ${selectedUpstream} server`)
        } else {
          setCallError(err.detail || err.message)
        }
      } else {
        setCallError('Failed to execute tool')
      }
    } finally {
      setIsCalling(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#fff', marginBottom: '16px', margin: 0 }}>
          MCP Tools
        </h1>
        <div style={{
          padding: '48px',
          backgroundColor: '#2a2a2a',
          border: '1px solid #333',
          borderRadius: '12px',
          textAlign: 'center',
        }}>
          <AlertCircle size={48} style={{ color: '#f59e0b', marginBottom: '16px' }} />
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#fff', marginBottom: '8px', margin: 0 }}>
            Authentication Required
          </h2>
          <p style={{ fontSize: '14px', color: '#888', margin: 0 }}>
            Please login with your API key to access MCP tools.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#fff', margin: 0 }}>
          MCP Tools
        </h1>
        <p style={{ fontSize: '14px', color: '#888', marginTop: '8px', margin: 0 }}>
          Discover and execute tools from MCP servers
        </p>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ fontSize: '13px', color: '#888', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
          Upstream Server
        </label>
        <select
          value={selectedUpstream}
          onChange={(e) => setSelectedUpstream(e.target.value as Upstream)}
          style={{
            padding: '10px 12px',
            backgroundColor: '#333',
            border: '1px solid #444',
            borderRadius: '6px',
            color: '#fff',
            fontSize: '14px',
            minWidth: '200px',
          }}
        >
          {UPSTREAMS.map(upstream => (
            <option key={upstream} value={upstream} style={{ backgroundColor: '#333' }}>
              {upstream.charAt(0).toUpperCase() + upstream.slice(1)}
            </option>
          ))}
        </select>
        <button
          onClick={loadTools}
          disabled={isLoadingTools}
          style={{
            marginLeft: '12px',
            padding: '10px 16px',
            backgroundColor: '#333',
            border: '1px solid #444',
            borderRadius: '6px',
            color: '#fff',
            fontSize: '13px',
            cursor: isLoadingTools ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <RefreshCw size={16} style={{ animation: isLoadingTools ? 'spin 1s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      {toolsError && (
        <div style={{
          marginBottom: '24px',
          padding: '16px',
          backgroundColor: '#3a1a1a',
          border: '1px solid #ef4444',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <AlertCircle size={20} style={{ color: '#ef4444' }} />
          <p style={{ fontSize: '13px', color: '#ef4444', margin: 0 }}>
            {toolsError}
          </p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>
            Available Tools
          </h2>
          {isLoadingTools ? (
            <p style={{ fontSize: '14px', color: '#888' }}>Loading tools...</p>
          ) : tools.length === 0 ? (
            <p style={{ fontSize: '14px', color: '#888' }}>No tools found</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {tools.map((tool) => (
                <button
                  key={tool.name}
                  onClick={() => handleToolSelect(tool)}
                  style={{
                    padding: '16px',
                    backgroundColor: selectedTool?.name === tool.name ? '#3a3a3a' : '#2a2a2a',
                    border: selectedTool?.name === tool.name ? '1px solid #646cff' : '1px solid #333',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '14px',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>{tool.name}</div>
                  <div style={{ fontSize: '12px', color: '#888' }}>{tool.description}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>
            Tool Execution
          </h2>
          {!selectedTool ? (
            <p style={{ fontSize: '14px', color: '#888' }}>Select a tool to execute</p>
          ) : (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '8px', margin: 0 }}>
                  {selectedTool.name}
                </h3>
                <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>{selectedTool.description}</p>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '13px', color: '#888', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
                  Arguments (JSON)
                </label>
                <textarea
                  value={JSON.stringify(toolArguments, null, 2)}
                  onChange={(e) => {
                    try {
                      setToolArguments(JSON.parse(e.target.value))
                    } catch {
                      // Allow invalid JSON while typing
                    }
                  }}
                  placeholder='{"key": "value"}'
                  style={{
                    width: '100%',
                    minHeight: '120px',
                    padding: '12px',
                    backgroundColor: '#333',
                    border: '1px solid #444',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '13px',
                    fontFamily: 'monospace',
                    resize: 'vertical',
                  }}
                />
              </div>

              <button
                onClick={handleCallTool}
                disabled={isCalling}
                style={{
                  padding: '10px 20px',
                  backgroundColor: isCalling ? '#444' : '#646cff',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '14px',
                  cursor: isCalling ? 'not-allowed' : 'pointer',
                }}
              >
                {isCalling ? 'Executing...' : 'Execute Tool'}
              </button>

              {callResult && (
                <div style={{
                  marginTop: '16px',
                  padding: '16px',
                  backgroundColor: '#1a3a1a',
                  border: '1px solid #10b981',
                  borderRadius: '8px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <CheckCircle size={16} style={{ color: '#10b981' }} />
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#10b981' }}>Success</span>
                  </div>
                  <pre style={{
                    fontSize: '12px',
                    color: '#fff',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    margin: 0,
                  }}>
                    {callResult}
                  </pre>
                </div>
              )}

              {callError && (
                <div style={{
                  marginTop: '16px',
                  padding: '16px',
                  backgroundColor: '#3a1a1a',
                  border: '1px solid #ef4444',
                  borderRadius: '8px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <AlertCircle size={16} style={{ color: '#ef4444' }} />
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#ef4444' }}>Error</span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#ef4444', margin: 0 }}>
                    {callError}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div style={{
        marginTop: '32px',
        padding: '24px',
        backgroundColor: '#2a2a2a',
        border: '1px solid #333',
        borderRadius: '12px',
      }}>
        <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>
          <strong>Demo Note:</strong> The Inventory and Shipping MCP servers use in-memory data.
          Changes made via tool calls are not persisted. WooCommerce operations affect the actual
          WordPress/WooCommerce instance in the cluster.
        </p>
      </div>
    </div>
  )
}
