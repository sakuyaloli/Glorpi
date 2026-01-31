import type { TokenEstimate, PromptBlock, Message, ProviderId } from './types';

// ==========================================
// Token Estimation Utilities
// ==========================================

// Character-to-token ratios by provider (empirically derived)
const CHARS_PER_TOKEN: Record<ProviderId, number> = {
  anthropic: 3.5,
  openai: 4.0,
  gemini: 4.0,
  deepseek: 3.8,
  openai_compatible: 4.0,
};

// Special token overhead estimates
const MESSAGE_OVERHEAD = {
  anthropic: 4,
  openai: 4,
  gemini: 3,
  deepseek: 4,
  openai_compatible: 4,
};

const ROLE_TOKENS = {
  system: 2,
  user: 2,
  assistant: 2,
};

/**
 * Estimate tokens for a given text string
 */
export function estimateTokensForText(text: string, provider: ProviderId = 'anthropic'): number {
  if (!text || text.length === 0) return 0;

  const charsPerToken = CHARS_PER_TOKEN[provider] || 4.0;

  // Count words and special characters
  const words = text.split(/\s+/).filter(Boolean);
  const specialChars = (text.match(/[{}[\]().,;:!?@#$%^&*+=<>"/\\|`~-]/g) || []).length;
  const codeBlocks = (text.match(/```[\s\S]*?```/g) || []).length;
  const numbers = (text.match(/\d+/g) || []).length;

  // Base estimation from character count
  let tokens = Math.ceil(text.length / charsPerToken);

  // Adjust for special patterns
  tokens += specialChars * 0.3; // Special chars often tokenize separately
  tokens += codeBlocks * 3; // Code blocks have overhead
  tokens += numbers * 0.2; // Numbers sometimes split

  // Adjust for whitespace patterns
  const whitespaceRatio = (text.match(/\s/g) || []).length / text.length;
  if (whitespaceRatio > 0.2) {
    tokens *= 0.95; // More whitespace = fewer tokens
  }

  return Math.ceil(tokens);
}

/**
 * Estimate tokens for a single message
 */
export function estimateTokensForMessage(
  message: Message,
  provider: ProviderId = 'anthropic'
): number {
  const contentTokens = estimateTokensForText(message.content, provider);
  const roleTokens = ROLE_TOKENS[message.role] || 2;
  const overhead = MESSAGE_OVERHEAD[provider] || 4;

  return contentTokens + roleTokens + overhead;
}

/**
 * Estimate tokens for an array of messages
 */
export function estimateTokensForMessages(
  messages: Message[],
  provider: ProviderId = 'anthropic'
): number {
  let total = 0;

  for (const message of messages) {
    total += estimateTokensForMessage(message, provider);
  }

  // Add conversation overhead
  total += 3; // Start/end tokens

  return total;
}

/**
 * Estimate tokens for a single prompt block
 */
export function estimateTokensForBlock(
  block: PromptBlock,
  provider: ProviderId = 'anthropic'
): number {
  if (!block.enabled) return 0;

  // Include title in estimation
  const titleTokens = estimateTokensForText(block.title, provider);
  const contentTokens = estimateTokensForText(block.content, provider);

  // Add block-type-specific overhead (formatting markers, etc.)
  const blockOverhead = getBlockOverhead(block.type);

  return titleTokens + contentTokens + blockOverhead;
}

/**
 * Get overhead tokens for different block types
 */
function getBlockOverhead(blockType: string): number {
  const overheads: Record<string, number> = {
    system: 5,
    role: 3,
    goal: 3,
    constraints: 4,
    output_format: 5,
    examples: 8,
    tools: 6,
    evaluation: 4,
    environment: 3,
    ui_aesthetic: 3,
    accessibility: 3,
    testing: 4,
    deployment: 3,
    custom: 2,
  };
  return overheads[blockType] || 2;
}

/**
 * Comprehensive token estimation for a full prompt
 */
export function estimatePromptTokens(
  blocks: PromptBlock[],
  provider: ProviderId = 'anthropic'
): TokenEstimate {
  const enabledBlocks = blocks.filter((b) => b.enabled);
  const breakdown: Record<string, number> = {};

  let inputTokens = 0;

  for (const block of enabledBlocks) {
    const blockTokens = estimateTokensForBlock(block, provider);
    breakdown[block.id] = blockTokens;
    inputTokens += blockTokens;
  }

  // Add structural overhead for combining blocks
  const structuralOverhead = Math.ceil(enabledBlocks.length * 2);
  inputTokens += structuralOverhead;

  // Estimate output tokens (default to 30% of input as a baseline)
  // This will be adjusted by the user via slider
  const outputTokens = Math.ceil(inputTokens * 0.3);

  // Determine confidence based on input size
  let confidence: 'high' | 'medium' | 'low' = 'high';
  if (inputTokens > 50000) {
    confidence = 'low';
  } else if (inputTokens > 10000) {
    confidence = 'medium';
  }

  return {
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
    confidence,
    breakdown,
  };
}

/**
 * Estimate output tokens based on expected verbosity
 */
export function estimateOutputTokens(
  inputTokens: number,
  verbosity: 'minimal' | 'standard' | 'detailed' | 'comprehensive'
): number {
  const multipliers = {
    minimal: 0.1,
    standard: 0.3,
    detailed: 0.6,
    comprehensive: 1.0,
  };

  const baseOutput = inputTokens * multipliers[verbosity];

  // Clamp to reasonable bounds
  return Math.max(100, Math.min(baseOutput, 32000));
}

/**
 * Convert blocks to messages format for provider APIs
 */
export function blocksToMessages(blocks: PromptBlock[]): Message[] {
  const enabledBlocks = blocks.filter((b) => b.enabled);
  const messages: Message[] = [];

  // Combine system-type blocks into a system message
  const systemBlocks = enabledBlocks.filter((b) =>
    ['system', 'role', 'constraints', 'environment'].includes(b.type)
  );

  if (systemBlocks.length > 0) {
    const systemContent = systemBlocks
      .map((b) => {
        const header = b.title ? `## ${b.title}\n` : '';
        return header + b.content;
      })
      .join('\n\n');

    messages.push({
      role: 'system',
      content: systemContent,
    });
  }

  // Combine remaining blocks into user message
  const userBlocks = enabledBlocks.filter(
    (b) => !['system', 'role', 'constraints', 'environment'].includes(b.type)
  );

  if (userBlocks.length > 0) {
    const userContent = userBlocks
      .map((b) => {
        const header = b.title ? `## ${b.title}\n` : '';
        return header + b.content;
      })
      .join('\n\n');

    messages.push({
      role: 'user',
      content: userContent,
    });
  }

  return messages;
}

/**
 * Format token count for display
 */
export function formatTokenCount(tokens: number): string {
  if (tokens >= 1_000_000) {
    return (tokens / 1_000_000).toFixed(1) + 'M';
  }
  if (tokens >= 1_000) {
    return (tokens / 1_000).toFixed(1) + 'K';
  }
  return tokens.toString();
}
