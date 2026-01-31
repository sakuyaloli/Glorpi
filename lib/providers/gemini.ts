import type { ProviderAdapter, BuildPayloadParams, SendParams, ProviderResponse, ProviderRequest } from './types';
import { createProviderError } from './types';

// ==========================================
// Google Gemini Provider Adapter
// ==========================================

export class GeminiAdapter implements ProviderAdapter {
  id = 'gemini' as const;
  displayName = 'Google Gemini';

  private getApiKey(): string | undefined {
    return process.env.GOOGLE_API_KEY;
  }

  isConfigured(): boolean {
    return !!this.getApiKey();
  }

  buildPayload(params: BuildPayloadParams): ProviderRequest {
    const { model, messages, knobs } = params;

    // Convert messages to Gemini format
    const systemInstruction = messages.find((m) => m.role === 'system')?.content;
    const contents = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    // Ensure alternating roles (Gemini requirement)
    const normalizedContents: Array<{ role: string; parts: Array<{ text: string }> }> = [];
    for (let i = 0; i < contents.length; i++) {
      const current = contents[i];
      const prev = normalizedContents[normalizedContents.length - 1];
      
      if (prev && prev.role === current.role) {
        // Merge consecutive same-role messages
        prev.parts.push(...current.parts);
      } else {
        normalizedContents.push(current);
      }
    }

    // Ensure conversation starts with user
    if (normalizedContents.length === 0 || normalizedContents[0].role !== 'user') {
      normalizedContents.unshift({
        role: 'user',
        parts: [{ text: systemInstruction || 'Hello' }],
      });
    }

    const body: Record<string, unknown> = {
      contents: normalizedContents,
      generationConfig: {
        maxOutputTokens: knobs.maxOutputTokens || 8192,
      },
    };

    // Add system instruction
    if (systemInstruction && normalizedContents[0]?.parts[0]?.text !== systemInstruction) {
      body.systemInstruction = {
        parts: [{ text: systemInstruction }],
      };
    }

    // Add optional parameters
    if (knobs.temperature !== undefined) {
      (body.generationConfig as Record<string, unknown>).temperature = knobs.temperature;
    }
    if (knobs.topP !== undefined) {
      (body.generationConfig as Record<string, unknown>).topP = knobs.topP;
    }

    const apiKey = this.getApiKey();
    return {
      url: `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    };
  }

  async send(params: SendParams): Promise<ProviderResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'Google API key not configured',
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
          data.error?.message || 'Gemini API error',
          data.error?.code || 'api_error',
          'gemini',
          response.status
        );
      }

      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const usageMetadata = data.usageMetadata || {};

      return {
        success: true,
        content,
        usage: {
          inputTokens: usageMetadata.promptTokenCount || 0,
          outputTokens: usageMetadata.candidatesTokenCount || 0,
          totalTokens: usageMetadata.totalTokenCount || 0,
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

export const geminiAdapter = new GeminiAdapter();
