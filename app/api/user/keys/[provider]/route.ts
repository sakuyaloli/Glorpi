/**
 * Individual Provider Key API
 * DELETE - Remove stored key for provider
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getOrCreateUserId } from '@/lib/auth/user-identity';
import type { Provider } from '@prisma/client';

const validProviders: Provider[] = ['openai', 'anthropic', 'gemini', 'deepseek', 'openai_compatible'];

export async function DELETE(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  try {
    const userId = await getOrCreateUserId();
    const provider = params.provider as Provider;
    
    // Validate provider
    if (!validProviders.includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid provider' },
        { status: 400 }
      );
    }
    
    // Get label from query if provided
    const { searchParams } = new URL(request.url);
    const label = searchParams.get('label');
    
    // Delete the key
    await prisma.providerKey.deleteMany({
      where: {
        userId,
        provider,
        label: label ?? null,
      },
    });
    
    return NextResponse.json({ success: true, provider });
  } catch (error) {
    console.error('[Key DELETE] Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete key' },
      { status: 500 }
    );
  }
}
