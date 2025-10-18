/**
 * 类型定义文件
 */

export interface ChatMessage {
  role: string;
  content: string | Array<{ type: string; text: string }>;
}

export interface ChatRequest {
  model?: string;
  messages: ChatMessage[];
  stream?: boolean;
}

export interface SSEChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: { content?: string };
    finish_reason: string | null;
    logprobs: null;
  }>;
}

export interface CompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: { role: string; content: string };
    finish_reason: string;
    logprobs: null;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface Cookie {
  id: string;
  value: string;
  isValid: boolean;
  failCount: number;
  isDefault: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface ApiKey {
  id: string;
  key: string;
  isEnabled: boolean;
  isDefault: boolean;
  createdAt: number;
  requestCount: number;
}

export interface RequestLog {
  id: string;
  timestamp: number;
  ip: string;
  path: string;
  method: string;
  statusCode: number;
  apiKey?: string;
  model?: string;
}

export interface SystemStats {
  totalCookies: number;
  validCookies: number;
  invalidCookies: number;
  totalApiKeys: number;
  totalRequests: number;
  modelsRequests: number;
}

export interface SystemSettings {
  rotationStrategy: "random" | "sequential";
  apiBaseUrl: string;
  maxFailNum: number;
  maxRequestRecordNum: number;
  perApiKeyRpm: number;
  systemRpm: number;
  jwtExpiryDays: number;
}

export interface ModelMapping {
  displayName: string;
  internalName: string;
}
