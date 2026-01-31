import type { ModelConfig, ProviderConfig, ProviderId } from './types';

// ==========================================
// Model Registry - Comprehensive AI Model Database
// Updated January 2026
// ==========================================

export const modelRegistry: Record<string, ModelConfig> = {
  // ==========================================
  // Anthropic Models (Latest: Claude 4 Opus, Claude 3.5 Sonnet v2)
  // ==========================================
  'claude-sonnet-4-20250514': {
    id: 'claude-sonnet-4-20250514',
    provider: 'anthropic',
    name: 'claude-sonnet-4-20250514',
    displayName: 'Claude Sonnet 4',
    contextWindow: 200000,
    inputPricePerMillion: 3.0,
    outputPricePerMillion: 15.0,
    supportedKnobs: ['temperature', 'topP', 'maxOutputTokens'],
    capabilities: ['vision', 'function_calling', 'streaming', 'extended_thinking'],
    isDefault: true,
  },
  'claude-opus-4-20250514': {
    id: 'claude-opus-4-20250514',
    provider: 'anthropic',
    name: 'claude-opus-4-20250514',
    displayName: 'Claude Opus 4',
    contextWindow: 200000,
    inputPricePerMillion: 15.0,
    outputPricePerMillion: 75.0,
    supportedKnobs: ['temperature', 'topP', 'maxOutputTokens'],
    capabilities: ['vision', 'function_calling', 'streaming', 'extended_thinking'],
  },
  'claude-3-5-haiku-20241022': {
    id: 'claude-3-5-haiku-20241022',
    provider: 'anthropic',
    name: 'claude-3-5-haiku-20241022',
    displayName: 'Claude 3.5 Haiku',
    contextWindow: 200000,
    inputPricePerMillion: 0.80,
    outputPricePerMillion: 4.0,
    supportedKnobs: ['temperature', 'topP', 'maxOutputTokens'],
    capabilities: ['vision', 'function_calling', 'streaming'],
  },

  // ==========================================
  // OpenAI Models (Latest: GPT-4o, o1, o3-mini)
  // ==========================================
  'gpt-4o': {
    id: 'gpt-4o',
    provider: 'openai',
    name: 'gpt-4o',
    displayName: 'GPT-4o',
    contextWindow: 128000,
    inputPricePerMillion: 2.5,
    outputPricePerMillion: 10.0,
    supportedKnobs: ['temperature', 'topP', 'maxOutputTokens', 'responseFormat'],
    capabilities: ['vision', 'function_calling', 'streaming', 'json_mode'],
  },
  'gpt-4o-mini': {
    id: 'gpt-4o-mini',
    provider: 'openai',
    name: 'gpt-4o-mini',
    displayName: 'GPT-4o Mini',
    contextWindow: 128000,
    inputPricePerMillion: 0.15,
    outputPricePerMillion: 0.6,
    supportedKnobs: ['temperature', 'topP', 'maxOutputTokens', 'responseFormat'],
    capabilities: ['vision', 'function_calling', 'streaming', 'json_mode'],
  },
  'o1': {
    id: 'o1',
    provider: 'openai',
    name: 'o1',
    displayName: 'o1',
    contextWindow: 200000,
    inputPricePerMillion: 15.0,
    outputPricePerMillion: 60.0,
    supportedKnobs: ['maxOutputTokens', 'reasoningEffort'],
    capabilities: ['reasoning', 'streaming', 'vision'],
  },
  'o3-mini': {
    id: 'o3-mini',
    provider: 'openai',
    name: 'o3-mini',
    displayName: 'o3-mini',
    contextWindow: 200000,
    inputPricePerMillion: 1.10,
    outputPricePerMillion: 4.40,
    supportedKnobs: ['maxOutputTokens', 'reasoningEffort'],
    capabilities: ['reasoning', 'streaming'],
  },
  'o1-mini': {
    id: 'o1-mini',
    provider: 'openai',
    name: 'o1-mini',
    displayName: 'o1-mini',
    contextWindow: 128000,
    inputPricePerMillion: 1.10,
    outputPricePerMillion: 4.40,
    supportedKnobs: ['maxOutputTokens', 'reasoningEffort'],
    capabilities: ['reasoning', 'streaming'],
  },

  // ==========================================
  // Google Gemini Models (Latest: Gemini 2.0, 2.5)
  // ==========================================
  'gemini-2.5-pro-preview-05-06': {
    id: 'gemini-2.5-pro-preview-05-06',
    provider: 'gemini',
    name: 'gemini-2.5-pro-preview-05-06',
    displayName: 'Gemini 2.5 Pro',
    contextWindow: 1000000,
    inputPricePerMillion: 1.25,
    outputPricePerMillion: 10.0,
    supportedKnobs: ['temperature', 'topP', 'maxOutputTokens'],
    capabilities: ['vision', 'function_calling', 'streaming', 'thinking', 'long_context'],
  },
  'gemini-2.0-flash': {
    id: 'gemini-2.0-flash',
    provider: 'gemini',
    name: 'gemini-2.0-flash',
    displayName: 'Gemini 2.0 Flash',
    contextWindow: 1000000,
    inputPricePerMillion: 0.10,
    outputPricePerMillion: 0.40,
    supportedKnobs: ['temperature', 'topP', 'maxOutputTokens'],
    capabilities: ['vision', 'function_calling', 'streaming', 'thinking'],
  },
  'gemini-2.0-flash-lite': {
    id: 'gemini-2.0-flash-lite',
    provider: 'gemini',
    name: 'gemini-2.0-flash-lite',
    displayName: 'Gemini 2.0 Flash Lite',
    contextWindow: 1000000,
    inputPricePerMillion: 0.075,
    outputPricePerMillion: 0.30,
    supportedKnobs: ['temperature', 'topP', 'maxOutputTokens'],
    capabilities: ['vision', 'function_calling', 'streaming'],
  },
  'gemini-1.5-pro': {
    id: 'gemini-1.5-pro',
    provider: 'gemini',
    name: 'gemini-1.5-pro',
    displayName: 'Gemini 1.5 Pro',
    contextWindow: 2000000,
    inputPricePerMillion: 1.25,
    outputPricePerMillion: 5.0,
    supportedKnobs: ['temperature', 'topP', 'maxOutputTokens'],
    capabilities: ['vision', 'function_calling', 'streaming', 'long_context'],
  },

  // ==========================================
  // DeepSeek Models (Latest: V3, R1)
  // ==========================================
  'deepseek-chat': {
    id: 'deepseek-chat',
    provider: 'deepseek',
    name: 'deepseek-chat',
    displayName: 'DeepSeek V3',
    contextWindow: 64000,
    inputPricePerMillion: 0.27,
    outputPricePerMillion: 1.10,
    supportedKnobs: ['temperature', 'topP', 'maxOutputTokens'],
    capabilities: ['function_calling', 'streaming'],
  },
  'deepseek-reasoner': {
    id: 'deepseek-reasoner',
    provider: 'deepseek',
    name: 'deepseek-reasoner',
    displayName: 'DeepSeek R1',
    contextWindow: 64000,
    inputPricePerMillion: 0.55,
    outputPricePerMillion: 2.19,
    supportedKnobs: ['temperature', 'maxOutputTokens'],
    capabilities: ['reasoning', 'streaming'],
  },
};

export const defaultProviders: ProviderConfig[] = [
  {
    id: 'anthropic',
    displayName: 'Anthropic',
    enabled: true,
    models: Object.values(modelRegistry).filter((m) => m.provider === 'anthropic'),
  },
  {
    id: 'openai',
    displayName: 'OpenAI',
    enabled: true,
    models: Object.values(modelRegistry).filter((m) => m.provider === 'openai'),
  },
  {
    id: 'gemini',
    displayName: 'Google Gemini',
    enabled: true,
    models: Object.values(modelRegistry).filter((m) => m.provider === 'gemini'),
  },
  {
    id: 'deepseek',
    displayName: 'DeepSeek',
    enabled: true,
    models: Object.values(modelRegistry).filter((m) => m.provider === 'deepseek'),
  },
  {
    id: 'openai_compatible',
    displayName: 'OpenAI Compatible',
    enabled: false,
    models: [],
  },
];

export function getModelById(modelId: string): ModelConfig | undefined {
  return modelRegistry[modelId];
}

// Alias for getModelById
export function getModelConfig(modelId: string): ModelConfig | undefined {
  return modelRegistry[modelId];
}

export function getModelsByProvider(providerId: ProviderId): ModelConfig[] {
  return Object.values(modelRegistry).filter((m) => m.provider === providerId);
}

export function getDefaultModel(): ModelConfig {
  return modelRegistry['claude-sonnet-4-20250514'];
}

export function getContextWindowUsage(
  modelId: string,
  inputTokens: number,
  outputTokens: number
): { used: number; total: number; percentage: number } {
  const model = getModelById(modelId);
  if (!model) {
    return { used: 0, total: 0, percentage: 0 };
  }
  const used = inputTokens + outputTokens;
  return {
    used,
    total: model.contextWindow,
    percentage: Math.min(100, (used / model.contextWindow) * 100),
  };
}

export function calculateCost(
  modelId: string,
  inputTokens: number,
  outputTokens: number
): { inputCost: number; outputCost: number; totalCost: number } {
  const model = getModelById(modelId);
  if (!model) {
    return { inputCost: 0, outputCost: 0, totalCost: 0 };
  }
  const inputCost = (inputTokens / 1_000_000) * model.inputPricePerMillion;
  const outputCost = (outputTokens / 1_000_000) * model.outputPricePerMillion;
  return {
    inputCost,
    outputCost,
    totalCost: inputCost + outputCost,
  };
}
