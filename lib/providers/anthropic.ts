import type { ProviderAdapter, BuildPayloadParams, SendParams, ProviderResponse, ProviderRequest } from './types';
import { createProviderError } from './types';

// ==========================================
// Anthropic (Claude) Provider Adapter
// ==========================================

export class AnthropicAdapter implements ProviderAdapter {
  id = 'anthropic' as const;
  displayName = 'Anthropic';

  private getApiKey(): string | undefined {
    return process.env.ANTHROPIC_API_KEY;
  }

  isConfigured(): boolean {
    return !!this.getApiKey();
  }

  buildPayload(params: BuildPayloadParams): ProviderRequest {
    const { model, messages, knobs } = params;

    // Separate system message from other messages
    const systemMessage = messages.find((m) => m.role === 'system');
    const conversationMessages = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role,
        content: m.content,
      }));

    // Ensure there's at least one user message
    if (conversationMessages.length === 0) {
      conversationMessages.push({
        role: 'user',
        content: systemMessage?.content || 'Hello',
      });
    }

    const body: Record<string, unknown> = {
      model,
      messages: conversationMessages,
      max_tokens: knobs.maxOutputTokens || 4096,
    };

    // Add system message if present
    if (systemMessage) {
      body.system = systemMessage.content;
    }

    // Add optional parameters
    if (knobs.temperature !== undefined) {
      body.temperature = knobs.temperature;
    }
    if (knobs.topP !== undefined) {
      body.top_p = knobs.topP;
    }

    return {
      url: 'https://api.anthropic.com/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.getApiKey() || '',
        'anthropic-version': '2023-06-01',
      },
      body,
    };
  }

  async send(params: SendParams): Promise<ProviderResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'Anthropic API key not configured',
      };
    }

    const request = this.buildPayload(params);

    try {
      const response = await fetch(request.url, {
        method: request.method,
        headers: request.headers,
        body: JSON.stringify(request.body),
        signal: params.signal,
      });

      const data = await response.json();

      if (!response.ok) {
        throw createProviderError(
          data.error?.message || 'Anthropic API error',
          data.error?.type || 'api_error',
          'anthropic',
          response.status
        );
      }

      return {
        success: true,
        content: data.content?.[0]?.text || '',
        usage: {
          inputTokens: data.usage?.input_tokens || 0,
          outputTokens: data.usage?.output_tokens || 0,
          totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
        },
        raw: data,
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          error: 'Request cancelled',
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export const anthropicAdapter = new AnthropicAdapter();
