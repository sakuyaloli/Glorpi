import type { ProviderAdapter } from './types';
import type { ProviderId } from '../types';
import { anthropicAdapter } from './anthropic';
import { openaiAdapter } from './openai';
import { geminiAdapter } from './gemini';
import { deepseekAdapter } from './deepseek';
import { openaiCompatibleAdapter } from './openai-compatible';

// ==========================================
// Provider Registry
// ==========================================

export const providerAdapters: Record<ProviderId, ProviderAdapter> = {
  anthropic: anthropicAdapter,
  openai: openaiAdapter,
  gemini: geminiAdapter,
  deepseek: deepseekAdapter,
  openai_compatible: openaiCompatibleAdapter,
};

export function getAdapter(providerId: ProviderId): ProviderAdapter {
  const adapter = providerAdapters[providerId];
  if (!adapter) {
    throw new Error(`Unknown provider: ${providerId}`);
  }
  return adapter;
}

export function getConfiguredProviders(): ProviderId[] {
  return (Object.keys(providerAdapters) as ProviderId[]).filter((id) =>
    providerAdapters[id].isConfigured()
  );
}

export function isProviderConfigured(providerId: ProviderId): boolean {
  return providerAdapters[providerId]?.isConfigured() || false;
}

export * from './types';
export { anthropicAdapter } from './anthropic';
export { openaiAdapter } from './openai';
export { geminiAdapter } from './gemini';
export { deepseekAdapter } from './deepseek';
export { openaiCompatibleAdapter } from './openai-compatible';
