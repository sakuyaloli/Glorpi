/**
 * Provider Keys API
 * GET - List configured providers (never returns actual keys)
 * POST - Store encrypted API key
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getOrCreateUserId } from '@/lib/auth/user-identity';
import { encryptString } from '@/lib/crypto/encryption';
import { z } from 'zod';
import type { Provider } from '@prisma/client';

// Validation schema for key storage
const keySchema = z.object({
  provider: z.enum(['openai', 'anthropic', 'gemini', 'deepseek', 'openai_compatible']),
  key: z.string().min(1),
  label: z.string().optional(),
});

// Provider display info
const providerInfo: Record<Provider, { name: string; included?: boolean }> = {
  openai: { name: 'OpenAI (GPT)', included: true },
  anthropic: { name: 'Anthropic (Claude)' },
  gemini: { name: 'Google (Gemini)' },
  deepseek: { name: 'DeepSeek' },
  openai_compatible: { name: 'OpenAI Compatible' },
};

export async function GET() {
  try {
    const userId = await getOrCreateUserId();
    
    // Get all stored keys for user
    const keys = await prisma.providerKey.findMany({
      where: { userId },
      select: {
        provider: true,
        label: true,
        last4: true,
        updatedAt: true,
      },
    });
    
    // Build response with all providers
    const providers: Record<string, {
      name: string;
      configured: boolean;
      included?: boolean;
      last4?: string | null;
      label?: string | null;
      updatedAt?: Date;
    }> = {};
    
    for (const [provider, info] of Object.entries(providerInfo)) {
      const storedKey = keys.find(k => k.provider === provider);
      
      providers[provider] = {
        name: info.name,
        configured: !!storedKey,
        included: info.included,
        last4: storedKey?.last4,
        label: storedKey?.label,
        updatedAt: storedKey?.updatedAt,
      };
    }
    
    return NextResponse.json({ providers });
  } catch (error) {
    console.error('[Keys GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to load keys' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getOrCreateUserId();
    const body = await request.json();
    
    // Validate input
    const parsed = keySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid key data', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    
    const { provider, key, label } = parsed.data;
    
    // Encrypt the key
    const encrypted = encryptString(key);
    
    // Delete existing key first, then create new one
    // (Upsert with null composite key is tricky in Prisma)
    await prisma.providerKey.deleteMany({
      where: {
        userId,
        provider,
        label: label ?? null,
      },
    });
    
    await prisma.providerKey.create({
      data: {
        userId,
        provider,
        label: label ?? null,
        ciphertext: Buffer.from(encrypted.ciphertext),
        iv: Buffer.from(encrypted.iv),
        tag: Buffer.from(encrypted.tag),
        last4: encrypted.last4,
      },
    });
    
    return NextResponse.json({
      provider,
      configured: true,
      last4: encrypted.last4,
    });
  } catch (error) {
    console.error('[Keys POST] Error:', error);
    return NextResponse.json(
      { error: 'Failed to save key' },
      { status: 500 }
    );
  }
}
