import type { ProviderAdapter, BuildPayloadParams, SendParams, ProviderResponse, ProviderRequest } from './types';
import { createProviderError } from './types';

// ==========================================
// OpenAI (GPT) Provider Adapter
// ==========================================

export class OpenAIAdapter implements ProviderAdapter {
  id = 'openai' as const;
  displayName = 'OpenAI';

  private getApiKey(): string | undefined {
    return process.env.OPENAI_API_KEY;
  }

  isConfigured(): boolean {
    return !!this.getApiKey();
  }

  buildPayload(params: BuildPayloadParams): ProviderRequest {
    const { model, messages, knobs } = params;

    const formattedMessages = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const body: Record<string, unknown> = {
      model,
      messages: formattedMessages,
    };

    // Add optional parameters
    if (knobs.maxOutputTokens) {
      body.max_tokens = knobs.maxOutputTokens;
    }
    if (knobs.temperature !== undefined) {
      body.temperature = knobs.temperature;
    }
    if (knobs.topP !== undefined) {
      body.top_p = knobs.topP;
    }

    // Response format for JSON mode
    if (knobs.responseFormat === 'json') {
      body.response_format = { type: 'json_object' };
    }

    // Reasoning effort for o1 models
    if (knobs.reasoningEffort && model.startsWith('o1')) {
      body.reasoning_effort = knobs.reasoningEffort;
    }

    return {
      url: 'https://api.openai.com/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getApiKey()}`,
      },
      body,
    };
  }

  async send(params: SendParams): Promise<ProviderResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'OpenAI API key not configured',
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
          data.error?.message || 'OpenAI API error',
          data.error?.code || 'api_error',
          'openai',
          response.status
        );
      }

      return {
        success: true,
        content: data.choices?.[0]?.message?.content || '',
        usage: {
          inputTokens: data.usage?.prompt_tokens || 0,
          outputTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0,
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

export const openaiAdapter = new OpenAIAdapter();
