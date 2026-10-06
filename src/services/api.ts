import { ConfigStatus, AIModel, GroundingSource, AttachmentItem, ProviderType, ResponseMode } from '../types.ts';

export interface ChatRequestPayload {
  message: string;
  conversation: Array<{ role: 'user' | 'assistant'; content: string }>;
  provider?: ProviderType;
  model?: string;
  quickResponse?: boolean;
  mode?: ResponseMode;
  webSearch?: boolean;
  attachments?: AttachmentItem[];
  systemInstruction?: string;
  targetLanguage?: string;
  tone?: string;
  stream?: boolean;
}

export const ApiService = {
  async getConfigStatus(): Promise<ConfigStatus> {
    const res = await fetch('/api/config-status');
    if (!res.ok) {
      throw new Error(`Failed to load config status: HTTP ${res.status}`);
    }
    return res.json();
  },

  async getModels(): Promise<AIModel[]> {
    const res = await fetch('/api/models');
    if (!res.ok) {
      throw new Error(`Failed to fetch models: HTTP ${res.status}`);
    }
    const data = await res.json();
    return data.models || [];
  },

  async testConnection(provider: ProviderType): Promise<{
    success: boolean;
    provider: string;
    model?: string;
    latencyMs?: number;
    response?: string;
    error?: string;
    details?: string;
  }> {
    const res = await fetch('/api/test-connection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider }),
    });
    return res.json();
  },

  async streamChat(
    payload: ChatRequestPayload,
    callbacks: {
      onChunk: (textChunk: string) => void;
      onDone: (fullText: string, sources: GroundingSource[]) => void;
      onError: (errorMessage: string) => void;
    },
    signal?: AbortSignal
  ): Promise<void> {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, stream: true }),
        signal,
      });

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        const errMessage = errorJson.error || errorJson.details || `Server returned error (${res.status})`;
        callbacks.onError(errMessage);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        throw new Error('Response body stream not available');
      }

      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data: ')) continue;
          const dataStr = trimmed.slice(6).trim();

          try {
            const eventData = JSON.parse(dataStr);
            if (eventData.type === 'chunk' && eventData.text) {
              callbacks.onChunk(eventData.text);
            } else if (eventData.type === 'done') {
              callbacks.onDone(eventData.fullText || '', eventData.sources || []);
              return;
            } else if (eventData.type === 'error') {
              callbacks.onError(eventData.error || 'Generation error encountered.');
              return;
            }
          } catch {
            // Partial json chunk, continue
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        callbacks.onError('Generation stopped by user.');
      } else {
        callbacks.onError(err.message || 'Network error occurred while connecting to Safdar AI backend.');
      }
    }
  },

  async generateImage(params: {
    prompt: string;
    aspectRatio?: string;
    style?: string;
    provider?: ProviderType;
  }): Promise<{
    success: boolean;
    imageUrl: string;
    prompt: string;
    aspectRatio: string;
    provider: ProviderType;
    model: string;
  }> {
    const res = await fetch('/api/image/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || data.details || 'Image generation failed');
    }
    return data;
  },

  async editImage(params: {
    imageBase64: string;
    mimeType?: string;
    instruction: string;
  }): Promise<{
    success: boolean;
    imageUrl: string;
    instruction: string;
  }> {
    const res = await fetch('/api/image/edit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || data.details || 'Image editing failed');
    }
    return data;
  },

  async analyzeData(params: {
    content: string;
    format?: string;
    fileName?: string;
  }): Promise<{
    success: boolean;
    fileName: string;
    totalRows: number;
    totalColumns: number;
    headers: string[];
    preview: Record<string, any>[];
    stats: Record<string, any>;
  }> {
    const res = await fetch('/api/analyze-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || data.details || 'Data analysis failed');
    }
    return data;
  },
};
