import { NextResponse } from 'next/server';
import { getConfiguredProviders, isProviderConfigured } from '@/lib/providers';
import type { ProviderId } from '@/lib/types';

const allProviders: ProviderId[] = ['anthropic', 'openai', 'gemini', 'deepseek', 'openai_compatible'];

export async function GET() {
  try {
    const configured = getConfiguredProviders();

    // Return detailed status for each provider
    const providers = allProviders.map(id => ({
      id,
      configured: isProviderConfigured(id),
    }));

    return NextResponse.json({
      success: true,
      configured,
      providers,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Provider status error:', error);
    return NextResponse.json(
      {
        success: false,
        configured: [],
        providers: allProviders.map(id => ({ id, configured: false })),
        error: 'Failed to check provider status',
      },
      { status: 500 }
    );
  }
}
