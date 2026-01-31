/**
 * Server-side utility to get API key for provider calls
 * Decrypts user's stored key or falls back to server env key
 */

import { prisma } from '@/lib/db';
import { decryptToString } from '@/lib/crypto/encryption';
import type { Provider } from '@prisma/client';

export interface ApiKeyResult {
  key: string;
  source: 'user' | 'server';
}

/**
 * Get API key for a provider
 * Priority:
 * 1. User's stored key (decrypted)
 * 2. Server environment key (for OpenAI, this is "included" free usage)
 */
export async function getApiKeyForProvider(
  userId: string,
  provider: Provider
): Promise<ApiKeyResult | null> {
  // Try to get user's stored key first
  const storedKey = await prisma.providerKey.findFirst({
    where: {
      userId,
      provider,
    },
  });
  
  if (storedKey) {
    try {
      const decrypted = decryptToString({
        ciphertext: storedKey.ciphertext,
        iv: storedKey.iv,
        tag: storedKey.tag,
      });
      return { key: decrypted, source: 'user' };
    } catch (error) {
      console.error(`[getApiKey] Failed to decrypt ${provider} key:`, error);
      // Fall through to server key
    }
  }
  
  // Fall back to server environment key
  const envKey = getServerEnvKey(provider);
  if (envKey) {
    return { key: envKey, source: 'server' };
  }
  
  return null;
}

/**
 * Get server-side environment key for a provider
 */
function getServerEnvKey(provider: Provider): string | null {
  switch (provider) {
    case 'openai':
      return process.env.OPENAI_API_KEY ?? null;
    case 'anthropic':
      return process.env.ANTHROPIC_API_KEY ?? null;
    case 'gemini':
      return process.env.GOOGLE_API_KEY ?? null;
    case 'deepseek':
      return process.env.DEEPSEEK_API_KEY ?? null;
    case 'openai_compatible':
      return process.env.CUSTOM_OPENAI_API_KEY ?? null;
    default:
      return null;
  }
}

/**
 * Check if a provider has any key available (user or server)
 */
export async function hasApiKeyForProvider(
  userId: string,
  provider: Provider
): Promise<boolean> {
  const result = await getApiKeyForProvider(userId, provider);
  return result !== null;
}
