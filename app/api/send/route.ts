import { NextRequest, NextResponse } from 'next/server';
import { getAdapter } from '@/lib/providers';
import type { ProviderId, Message, ModelKnobs } from '@/lib/types';

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // requests per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded. Please wait a moment.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { provider, model, messages, knobs } = body as {
      provider: ProviderId;
      model: string;
      messages: Message[];
      knobs: ModelKnobs;
    };

    // Validate required fields
    if (!provider || !model || !messages) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: provider, model, messages' },
        { status: 400 }
      );
    }

    // Get the adapter
    const adapter = getAdapter(provider);

    // Check if provider is configured
    if (!adapter.isConfigured()) {
      // Return mock response if not configured
      return NextResponse.json({
        success: true,
        content: `[Mock Response - ${provider} not configured]\n\nThis is a simulated response. To get real responses, configure your ${provider.toUpperCase()} API key in .env.local.\n\nYour prompt was received with ${messages.length} message(s).`,
        usage: {
          inputTokens: Math.ceil(JSON.stringify(messages).length / 4),
          outputTokens: 50,
          totalTokens: Math.ceil(JSON.stringify(messages).length / 4) + 50,
        },
        mock: true,
      });
    }

    // Send the request
    const response = await adapter.send({
      model,
      messages,
      knobs: knobs || {},
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Send API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
