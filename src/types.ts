export type ProviderType = 'gemini' | 'openai';

export type ResponseMode = 'balanced' | 'quick' | 'detailed' | 'coding' | 'study' | 'writing' | 'translation' | 'data-analysis';

export type QuickResponseSpeed = 'quick' | 'balanced' | 'detailed';

export interface GroundingSource {
  title: string;
  url: string;
}

export interface AttachmentItem {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  base64: string;
  previewUrl?: string;
  textContent?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  model?: string;
  provider?: ProviderType;
  sources?: GroundingSource[];
  attachments?: AttachmentItem[];
  liked?: boolean;
  disliked?: boolean;
  isStreaming?: boolean;
  error?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  model: string;
  provider: ProviderType;
  mode: ResponseMode;
  quickResponse: boolean;
  createdAt: number;
  updatedAt: number;
  isPinned?: boolean;
  isArchived?: boolean;
  projectId?: string;
  assistantId?: string;
}

export interface AIModel {
  id: string;
  name: string;
  provider: ProviderType;
  description: string;
  capabilities: string[];
  isDefault?: boolean;
  enabled?: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  instructions: string;
  notes: string;
  createdAt: number;
  updatedAt: number;
}

export interface CustomAssistant {
  id: string;
  name: string;
  description: string;
  instructions: string;
  personality: string;
  tools: string[];
  model: string;
  avatar: string;
  category: string;
}

export interface CanvasDocument {
  id: string;
  title: string;
  content: string;
  type: 'document' | 'code';
  language?: string;
  createdAt: number;
  updatedAt: number;
}

export interface StoredFile {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl?: string;
  textContent?: string;
  createdAt: number;
  projectId?: string;
}

export interface GeneratedImage {
  id: string;
  prompt: string;
  url: string;
  aspectRatio: string;
  style: string;
  provider: ProviderType;
  model: string;
  createdAt: number;
}

export interface UserMemory {
  id: string;
  content: string;
  category?: string;
  createdAt: number;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  defaultProvider: ProviderType;
  defaultModel: string;
  quickResponseMode: QuickResponseSpeed;
  fontSize: 'small' | 'medium' | 'large';
  chatDensity: 'comfortable' | 'compact';
  enterToSend: boolean;
  voiceName: string;
  voiceSpeed: number;
  autoRead: boolean;
  memoryEnabled: boolean;
}

export interface ConfigStatus {
  geminiConfigured: boolean;
  openAiConfigured: boolean;
  defaultProvider: string;
  searchConfigured: boolean;
  imageConfigured: boolean;
  environment: string;
}
