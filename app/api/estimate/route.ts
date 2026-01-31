import { NextRequest, NextResponse } from 'next/server';
import { estimateTokensForText, estimateTokensForMessages } from '@/lib/token-estimation';
import { calculateCost } from '@/lib/models-registry';
import type { ProviderId, Message } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, model, messages, text } = body as {
      provider: ProviderId;
      model: string;
      messages?: Message[];
      text?: string;
    };

    // Validate required fields
    if (!provider || !model) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: provider, model' },
        { status: 400 }
      );
    }

    if (!messages && !text) {
      return NextResponse.json(
        { success: false, error: 'Must provide either messages or text' },
        { status: 400 }
      );
    }

    // Estimate tokens
    let inputTokens: number;
    if (messages) {
      inputTokens = estimateTokensForMessages(messages, provider);
    } else {
      inputTokens = estimateTokensForText(text!, provider);
    }

    // Estimate output tokens (default 30% of input)
    const outputTokens = Math.ceil(inputTokens * 0.3);

    // Calculate cost
    const cost = calculateCost(model, inputTokens, outputTokens);

    return NextResponse.json({
      success: true,
      estimate: {
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens,
        confidence: inputTokens > 50000 ? 'low' : inputTokens > 10000 ? 'medium' : 'high',
      },
      cost: {
        inputCost: cost.inputCost,
        outputCost: cost.outputCost,
        totalCost: cost.totalCost,
        currency: 'USD',
      },
    });
  } catch (error) {
    console.error('Estimate API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
