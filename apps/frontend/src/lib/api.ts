const GATEWAY_URL = (import.meta.env as { VITE_GATEWAY_API_URL?: string }).VITE_GATEWAY_API_URL || 'http://localhost:8000';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
}

export interface Tool {
  name: string;
  description: string;
}

export interface ToolsResponse {
  upstream: string;
  tools: Tool[];
}

export interface ToolCallRequest {
  name: string;
  arguments: Record<string, unknown>;
}

export interface ToolCallResponse {
  upstream: string;
  tool: string;
  is_error: boolean;
  request_id: string;
  content: Array<{ type: string; text?: string }>;
}

export interface RevokeResponse {
  status: string;
  api_key_id: number;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public detail?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private apiKey: string | null = null;

  setApiKey(key: string | null) {
    this.apiKey = key;
  }

  getApiKey(): string | null {
    return this.apiKey;
  }

  clearApiKey() {
    this.apiKey = null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${GATEWAY_URL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
      signal: AbortSignal.timeout(30000), // 30 second timeout
    };

    try {
      const response = await fetch(url, config);
      
      let data: unknown;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        const detail = typeof data === 'object' && data !== null && 'detail' in data 
          ? String(data.detail) 
          : undefined;
        throw new ApiError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          detail
        );
      }

      return data as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new ApiError('Network error: Unable to connect to gateway', 0);
      }
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new ApiError('Request timeout', 0);
      }
      throw new ApiError('Unexpected error occurred', 0);
    }
  }

  async getHealth(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/health');
  }

  async listTools(upstream: string): Promise<ToolsResponse> {
    return this.request<ToolsResponse>(`/mcp/tools?upstream=${encodeURIComponent(upstream)}`);
  }

  async callTool(upstream: string, request: ToolCallRequest): Promise<ToolCallResponse> {
    return this.request<ToolCallResponse>(`/mcp/call?upstream=${encodeURIComponent(upstream)}`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async revokeApiKey(apiKeyId: number): Promise<RevokeResponse> {
    return this.request<RevokeResponse>(`/admin/api-keys/${apiKeyId}/revoke`, {
      method: 'POST',
    });
  }
}

export const apiClient = new ApiClient();
