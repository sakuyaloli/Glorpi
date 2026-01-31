import { describe, it, expect } from 'vitest';
import { getAdapter, getConfiguredProviders, isProviderConfigured } from '@/lib/providers';
import { anthropicAdapter } from '@/lib/providers/anthropic';
import { openaiAdapter } from '@/lib/providers/openai';

describe('Provider Adapters', () => {
  describe('getAdapter', () => {
    it('should return anthropic adapter', () => {
      const adapter = getAdapter('anthropic');
      expect(adapter.id).toBe('anthropic');
      expect(adapter.displayName).toBe('Anthropic');
    });

    it('should return openai adapter', () => {
      const adapter = getAdapter('openai');
      expect(adapter.id).toBe('openai');
      expect(adapter.displayName).toBe('OpenAI');
    });

    it('should return gemini adapter', () => {
      const adapter = getAdapter('gemini');
      expect(adapter.id).toBe('gemini');
      expect(adapter.displayName).toBe('Google Gemini');
    });

    it('should return deepseek adapter', () => {
      const adapter = getAdapter('deepseek');
      expect(adapter.id).toBe('deepseek');
      expect(adapter.displayName).toBe('DeepSeek');
    });

    it('should throw for unknown provider', () => {
      expect(() => getAdapter('unknown' as any)).toThrow('Unknown provider');
    });
  });

  describe('Anthropic Adapter', () => {
    it('should have correct id and name', () => {
      expect(anthropicAdapter.id).toBe('anthropic');
      expect(anthropicAdapter.displayName).toBe('Anthropic');
    });

    it('should build correct payload structure', () => {
      const payload = anthropicAdapter.buildPayload({
        model: 'claude-sonnet-4-20250514',
        messages: [
          { role: 'system', content: 'You are helpful.' },
          { role: 'user', content: 'Hello!' },
        ],
        knobs: { temperature: 0.7, maxOutputTokens: 1000 },
      });

      expect(payload.url).toBe('https://api.anthropic.com/v1/messages');
      expect(payload.method).toBe('POST');
      expect(payload.headers['anthropic-version']).toBe('2023-06-01');
      expect(payload.body.model).toBe('claude-sonnet-4-20250514');
      expect(payload.body.max_tokens).toBe(1000);
      expect(payload.body.temperature).toBe(0.7);
    });

    it('should separate system message', () => {
      const payload = anthropicAdapter.buildPayload({
        model: 'claude-sonnet-4-20250514',
        messages: [
          { role: 'system', content: 'System instructions.' },
          { role: 'user', content: 'User message.' },
        ],
        knobs: {},
      });

      expect(payload.body.system).toBe('System instructions.');
      expect((payload.body.messages as any[]).length).toBe(1);
      expect((payload.body.messages as any[])[0].role).toBe('user');
    });
  });

  describe('OpenAI Adapter', () => {
    it('should have correct id and name', () => {
      expect(openaiAdapter.id).toBe('openai');
      expect(openaiAdapter.displayName).toBe('OpenAI');
    });

    it('should build correct payload structure', () => {
      const payload = openaiAdapter.buildPayload({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are helpful.' },
          { role: 'user', content: 'Hello!' },
        ],
        knobs: { temperature: 0.7, maxOutputTokens: 1000 },
      });

      expect(payload.url).toBe('https://api.openai.com/v1/chat/completions');
      expect(payload.method).toBe('POST');
      expect(payload.body.model).toBe('gpt-4o');
      expect(payload.body.max_tokens).toBe(1000);
      expect(payload.body.temperature).toBe(0.7);
    });

    it('should include all messages inline', () => {
      const payload = openaiAdapter.buildPayload({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'System.' },
          { role: 'user', content: 'User.' },
        ],
        knobs: {},
      });

      expect((payload.body.messages as any[]).length).toBe(2);
    });

    it('should handle response format knob', () => {
      const payload = openaiAdapter.buildPayload({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: 'Hello' }],
        knobs: { responseFormat: 'json' },
      });

      expect(payload.body.response_format).toEqual({ type: 'json_object' });
    });
  });

  describe('Provider Configuration', () => {
    it('should check if provider is configured', () => {
      // Without env vars, providers should not be configured
      const configured = isProviderConfigured('anthropic');
      expect(typeof configured).toBe('boolean');
    });

    it('should return array of configured providers', () => {
      const configured = getConfiguredProviders();
      expect(Array.isArray(configured)).toBe(true);
    });
  });
});
