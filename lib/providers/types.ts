import type { Message, ModelKnobs, ProviderId } from '../types';

// ==========================================
// Provider Adapter Types
// ==========================================

export interface ProviderAdapter {
  id: ProviderId;
  displayName: string;

  /** Check if provider is configured (API key exists) */
  isConfigured(): boolean;

  /** Build the request payload for this provider */
  buildPayload(params: BuildPayloadParams): ProviderRequest;

  /** Send a request to the provider */
  send(params: SendParams): Promise<ProviderResponse>;

  /** Estimate tokens (if provider supports it) */
  estimateTokens?(text: string): Promise<number>;
}

export interface BuildPayloadParams {
  model: string;
  messages: Message[];
  knobs: ModelKnobs;
}

export interface SendParams {
  model: string;
  messages: Message[];
  knobs: ModelKnobs;
  signal?: AbortSignal;
}

export interface ProviderRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: Record<string, unknown>;
}

export interface ProviderResponse {
  success: boolean;
  content?: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  error?: string;
  raw?: unknown;
}

export interface ProviderError extends Error {
  code: string;
  status?: number;
  provider: ProviderId;
}

export function createProviderError(
  message: string,
  code: string,
  provider: ProviderId,
  status?: number
): ProviderError {
  const error = new Error(message) as ProviderError;
  error.code = code;
  error.provider = provider;
  error.status = status;
  return error;
}
