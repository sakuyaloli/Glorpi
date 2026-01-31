import { describe, it, expect } from 'vitest';
import {
  estimateTokensForText,
  estimateTokensForBlock,
  estimatePromptTokens,
  blocksToMessages,
} from '@/lib/token-estimation';
import type { PromptBlock } from '@/lib/types';

describe('Token Estimation', () => {
  describe('estimateTokensForText', () => {
    it('should return 0 for empty text', () => {
      expect(estimateTokensForText('')).toBe(0);
      expect(estimateTokensForText('', 'openai')).toBe(0);
    });

    it('should estimate tokens for simple text', () => {
      const text = 'Hello, world!';
      const tokens = estimateTokensForText(text, 'anthropic');
      expect(tokens).toBeGreaterThan(0);
      expect(tokens).toBeLessThan(20);
    });

    it('should estimate more tokens for longer text', () => {
      const shortText = 'Hello';
      const longText = 'Hello, this is a much longer piece of text that should have more tokens.';

      const shortTokens = estimateTokensForText(shortText);
      const longTokens = estimateTokensForText(longText);

      expect(longTokens).toBeGreaterThan(shortTokens);
    });

    it('should vary estimates by provider', () => {
      const text = 'The quick brown fox jumps over the lazy dog.';

      const anthropicTokens = estimateTokensForText(text, 'anthropic');
      const openaiTokens = estimateTokensForText(text, 'openai');

      // Different providers have different tokenization
      // Anthropic typically has fewer tokens (3.5 chars/token vs 4)
      expect(anthropicTokens).not.toBe(openaiTokens);
    });

    it('should handle code blocks with overhead', () => {
      const textWithCode = `Here is some code:
\`\`\`javascript
function hello() {
  console.log('Hello, world!');
}
\`\`\``;

      const tokens = estimateTokensForText(textWithCode);
      expect(tokens).toBeGreaterThan(20);
    });

    it('should handle special characters', () => {
      const textWithSpecial = 'Hello! @user #hashtag $variable {object} [array]';
      const tokens = estimateTokensForText(textWithSpecial);
      expect(tokens).toBeGreaterThan(0);
    });
  });

  describe('estimateTokensForBlock', () => {
    it('should return 0 for disabled blocks', () => {
      const block: PromptBlock = {
        id: '1',
        type: 'system',
        title: 'Test',
        content: 'This is test content.',
        enabled: false,
        locked: false,
        collapsed: false,
      };

      expect(estimateTokensForBlock(block)).toBe(0);
    });

    it('should include title and content in estimation', () => {
      const block: PromptBlock = {
        id: '1',
        type: 'system',
        title: 'System Instructions',
        content: 'You are a helpful assistant.',
        enabled: true,
        locked: false,
        collapsed: false,
      };

      const tokens = estimateTokensForBlock(block);
      expect(tokens).toBeGreaterThan(5);
    });

    it('should add overhead for different block types', () => {
      const systemBlock: PromptBlock = {
        id: '1',
        type: 'system',
        title: 'Test',
        content: 'Content',
        enabled: true,
        locked: false,
        collapsed: false,
      };

      const examplesBlock: PromptBlock = {
        id: '2',
        type: 'examples',
        title: 'Test',
        content: 'Content',
        enabled: true,
        locked: false,
        collapsed: false,
      };

      const systemTokens = estimateTokensForBlock(systemBlock);
      const examplesTokens = estimateTokensForBlock(examplesBlock);

      // Examples block should have more overhead
      expect(examplesTokens).toBeGreaterThan(systemTokens);
    });
  });

  describe('estimatePromptTokens', () => {
    it('should return estimate with breakdown', () => {
      const blocks: PromptBlock[] = [
        {
          id: '1',
          type: 'system',
          title: 'System',
          content: 'You are helpful.',
          enabled: true,
          locked: false,
          collapsed: false,
        },
        {
          id: '2',
          type: 'goal',
          title: 'Goal',
          content: 'Help users.',
          enabled: true,
          locked: false,
          collapsed: false,
        },
      ];

      const estimate = estimatePromptTokens(blocks);

      expect(estimate.inputTokens).toBeGreaterThan(0);
      expect(estimate.outputTokens).toBeGreaterThan(0);
      expect(estimate.totalTokens).toBe(estimate.inputTokens + estimate.outputTokens);
      expect(estimate.confidence).toBe('high');
      expect(estimate.breakdown).toBeDefined();
      expect(Object.keys(estimate.breakdown!)).toHaveLength(2);
    });

    it('should exclude disabled blocks', () => {
      const blocks: PromptBlock[] = [
        {
          id: '1',
          type: 'system',
          title: 'System',
          content: 'You are helpful.',
          enabled: true,
          locked: false,
          collapsed: false,
        },
        {
          id: '2',
          type: 'goal',
          title: 'Goal',
          content: 'Help users with a very long detailed explanation.',
          enabled: false,
          locked: false,
          collapsed: false,
        },
      ];

      const estimate = estimatePromptTokens(blocks);
      expect(estimate.breakdown!['2']).toBeUndefined();
    });
  });

  describe('blocksToMessages', () => {
    it('should convert blocks to messages format', () => {
      const blocks: PromptBlock[] = [
        {
          id: '1',
          type: 'system',
          title: 'System',
          content: 'You are a helpful assistant.',
          enabled: true,
          locked: false,
          collapsed: false,
        },
        {
          id: '2',
          type: 'goal',
          title: 'Goal',
          content: 'Complete the task.',
          enabled: true,
          locked: false,
          collapsed: false,
        },
      ];

      const messages = blocksToMessages(blocks);

      expect(messages).toHaveLength(2);
      expect(messages[0].role).toBe('system');
      expect(messages[1].role).toBe('user');
    });

    it('should exclude disabled blocks', () => {
      const blocks: PromptBlock[] = [
        {
          id: '1',
          type: 'system',
          title: 'System',
          content: 'You are a helpful assistant.',
          enabled: true,
          locked: false,
          collapsed: false,
        },
        {
          id: '2',
          type: 'goal',
          title: 'Goal',
          content: 'Complete the task.',
          enabled: false,
          locked: false,
          collapsed: false,
        },
      ];

      const messages = blocksToMessages(blocks);

      // Only system block should be included
      expect(messages).toHaveLength(1);
    });
  });
});
