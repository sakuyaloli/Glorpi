import { NextRequest, NextResponse } from 'next/server';
import type { CompanionPlanRequest, CompanionPlanResponse, PromptPlan, PlanBlock, PromptBlock } from '@/lib/types';

export const dynamic = 'force-dynamic';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// System prompt for generating structured prompt plans
const PLAN_SYSTEM_PROMPT = `You are Glorpi, an AI assistant that helps users build effective prompts. Your job is to:

1. Understand what the user wants to accomplish
2. Generate a structured prompt plan with clear blocks

IMPORTANT: You must respond with a JSON object containing two fields:
- "chatReply": A brief, friendly message (1-3 sentences) acknowledging the user's request and explaining what you're creating
- "plan": A structured prompt plan object

The plan must follow this exact schema:
{
  "title": "Optional title for the prompt",
  "blocks": [
    {
      "type": "system" | "role" | "goal" | "constraints" | "output_format" | "examples" | "tools" | "environment" | "evaluation" | "notes",
      "heading": "Human-readable heading",
      "content": "The actual prompt content",
      "enabled": true
    }
  ],
  "modelHints": {
    "reasoning": "low" | "medium" | "high",
    "outputStyle": "concise" | "standard" | "verbose"
  }
}

Block types and their purposes:
- system: Core instructions, persona, behavior guidelines
- role: Specific expertise or role to embody
- goal: The primary objective or task
- constraints: Rules, limitations, what NOT to do
- output_format: How to structure the response (JSON, markdown, etc.)
- examples: Few-shot examples of input/output
- tools: Available tools or functions
- environment: Runtime context, variables, technical constraints
- evaluation: How to evaluate quality, success criteria
- notes: Additional context or meta-information

Guidelines:
- Keep blocks focused and concise
- Use clear, actionable language
- Include 3-6 blocks typically (system, goal, and output_format are most common)
- Don't repeat information across blocks
- Make content immediately usable

Current user blocks will be provided for context. You can suggest additions, modifications, or a complete new structure based on the user's request.`;

// Format current blocks for context
function formatBlocksForContext(blocks: PromptBlock[]): string {
  if (!blocks || blocks.length === 0) {
    return 'No existing blocks.';
  }
  
  return blocks
    .filter(b => b.enabled)
    .map(b => `[${b.type.toUpperCase()}] ${b.title}\n${b.content}`)
    .join('\n\n---\n\n');
}

// Parse and validate the response
function parseResponse(text: string): CompanionPlanResponse {
  try {
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        chatReply: text,
        error: 'Could not parse structured response',
      };
    }

    const parsed = JSON.parse(jsonMatch[0]);
    
    // Validate required fields
    if (!parsed.chatReply || typeof parsed.chatReply !== 'string') {
      return {
        chatReply: 'I understand your request. Let me help you build that prompt.',
        plan: parsed.plan,
      };
    }

    // Validate plan structure
    if (parsed.plan && parsed.plan.blocks) {
      const validTypes = ['system', 'role', 'goal', 'constraints', 'output_format', 'examples', 'tools', 'environment', 'evaluation', 'notes'];
      
      parsed.plan.blocks = parsed.plan.blocks.filter((block: PlanBlock) => {
        return (
          validTypes.includes(block.type) &&
          typeof block.heading === 'string' &&
          typeof block.content === 'string'
        );
      });

      // Ensure enabled defaults to true
      parsed.plan.blocks = parsed.plan.blocks.map((block: PlanBlock) => ({
        ...block,
        enabled: block.enabled !== false,
      }));
    }

    return {
      chatReply: parsed.chatReply,
      plan: parsed.plan,
    };
  } catch (e) {
    return {
      chatReply: text,
      error: 'Failed to parse response',
    };
  }
}

export async function POST(request: NextRequest) {
  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json(
      {
        chatReply: "I'd love to help, but the Anthropic API key isn't configured. Please add it in Settings to enable AI-powered prompt generation.",
        error: 'ANTHROPIC_API_KEY not configured',
      } satisfies CompanionPlanResponse,
      { status: 200 }
    );
  }

  try {
    const body: CompanionPlanRequest = await request.json();
    const { userMessage, currentBlocks, provider, model } = body;

    if (!userMessage || userMessage.trim().length === 0) {
      return NextResponse.json(
        {
          chatReply: "What would you like to build? Tell me about your use case and I'll help you create an effective prompt.",
        } satisfies CompanionPlanResponse,
        { status: 200 }
      );
    }

    // Build the user message with context
    const contextMessage = `Current prompt blocks:
${formatBlocksForContext(currentBlocks)}

---

User request: ${userMessage}

${provider && model ? `Target: ${provider} / ${model}` : ''}

Please generate a response with both a friendly chatReply and a structured plan.`;

    // Call Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: PLAN_SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: contextMessage,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', errorText);
      return NextResponse.json(
        {
          chatReply: "I encountered an issue while generating your prompt. Let's try again!",
          error: `API error: ${response.status}`,
        } satisfies CompanionPlanResponse,
        { status: 200 }
      );
    }

    const data = await response.json();
    const content = data.content?.[0]?.text || '';

    const result = parseResponse(content);
    
    return NextResponse.json(result satisfies CompanionPlanResponse);
  } catch (error) {
    console.error('Companion plan error:', error);
    return NextResponse.json(
      {
        chatReply: "Something went wrong while processing your request. Please try again.",
        error: error instanceof Error ? error.message : 'Unknown error',
      } satisfies CompanionPlanResponse,
      { status: 200 }
    );
  }
}
