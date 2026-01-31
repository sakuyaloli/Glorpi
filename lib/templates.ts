import type { PromptTemplate, BlockType } from './types';

// ==========================================
// Prompt Templates Library
// ==========================================

export const promptTemplates: PromptTemplate[] = [
  {
    id: 'ui-spec',
    name: 'UI Specification Prompt',
    description: 'Detailed prompt for generating UI components with accessibility and design system adherence.',
    category: 'Development',
    blocks: [
      {
        type: 'system',
        title: 'System',
        content: `You are an expert UI/UX engineer with deep knowledge of React, TypeScript, accessibility standards (WCAG 2.1 AA), and modern design systems. You create production-ready components that are both beautiful and functional.`,
        enabled: true,
        locked: false,
        collapsed: false,
      },
      {
        type: 'role',
        title: 'Role',
        content: `Act as a senior frontend developer who:
- Prioritizes accessibility and keyboard navigation
- Writes semantic HTML
- Uses TypeScript with strict types
- Follows component composition patterns
- Considers edge cases and error states`,
        enabled: true,
        locked: false,
        collapsed: false,
      },
      {
        type: 'goal',
        title: 'Goal',
        content: `Create a [COMPONENT_NAME] component that:
- [Primary functionality]
- [Key interactions]
- [Visual requirements]`,
        enabled: true,
        locked: false,
        collapsed: false,
      },
      {
        type: 'ui_aesthetic',
        title: 'Design Requirements',
        content: `Visual Style:
- Follow [DESIGN_SYSTEM] guidelines
- Use consistent spacing (8px grid)
- Support light and dark modes
- Implement smooth transitions (150-300ms)

Color & Typography:
- Use semantic color tokens
- Maintain proper contrast ratios (4.5:1 for text)
- Use responsive typography scale`,
        enabled: true,
        locked: false,
        collapsed: false,
      },
      {
        type: 'accessibility',
        title: 'Accessibility',
        content: `WCAG 2.1 AA Requirements:
- Proper ARIA labels and roles
- Keyboard navigation support (Tab, Enter, Escape)
- Focus management and visible focus indicators
- Screen reader announcements for dynamic content
- Reduced motion support via prefers-reduced-motion`,
        enabled: true,
        locked: false,
        collapsed: false,
      },
      {
        type: 'output_format',
        title: 'Output Format',
        content: `Provide:
1. Complete TypeScript component code
2. Props interface with JSDoc comments
3. Usage example
4. Brief explanation of key accessibility features`,
        enabled: true,
        locked: false,
        collapsed: false,
      },
    ],
  },
  {
    id: 'codegen',
    name: 'Code Generation Prompt',
    description: 'Comprehensive prompt for generating high-quality, production-ready code.',
    category: 'Development',
    blocks: [
      {
        type: 'system',
        title: 'System',
        content: `You are an expert software engineer specializing in clean, maintainable code. You write code that is:
- Well-documented with clear comments
- Following SOLID principles
- Properly typed (in typed languages)
- Covered by appropriate tests
- Optimized for readability over cleverness`,
        enabled: true,
        locked: false,
        collapsed: false,
      },
      {
        type: 'constraints',
        title: 'Constraints',
        content: `Technical Requirements:
- Language: [LANGUAGE/FRAMEWORK]
- Style Guide: [STYLE_GUIDE]
- No external dependencies unless specified
- Handle edge cases and errors gracefully
- Include input validation`,
        enabled: true,
        locked: false,
        collapsed: false,
      },
      {
        type: 'goal',
        title: 'Task',
        content: `Implement [FEATURE/FUNCTION] that:
- [Requirement 1]
- [Requirement 2]
- [Requirement 3]`,
        enabled: true,
        locked: false,
        collapsed: false,
      },
      {
        type: 'examples',
        title: 'Examples',
        content: `Input/Output Examples:
\`\`\`
Input: [example input]
Output: [expected output]
\`\`\``,
        enabled: true,
        locked: false,
        collapsed: false,
      },
      {
        type: 'testing',
        title: 'Testing',
        content: `Include tests for:
- Happy path scenarios
- Edge cases (empty inputs, null values)
- Error conditions
- Boundary values`,
        enabled: true,
        locked: false,
        collapsed: false,
      },
      {
        type: 'output_format',
        title: 'Output',
        content: `Provide:
1. Implementation code
2. Unit tests
3. Usage documentation
4. Time/space complexity analysis (if applicable)`,
        enabled: true,
        locked: false,
        collapsed: false,
      },
    ],
  },
  {
    id: 'product-spec',
    name: 'Product Specification Prompt',
    description: 'Template for generating detailed product requirements and specifications.',
    category: 'Product',
    blocks: [
      {
        type: 'system',
        title: 'System',
        content: `You are a senior product manager with expertise in writing clear, actionable product specifications. You balance user needs, technical feasibility, and business value.`,
        enabled: true,
        locked: false,
        collapsed: false,
      },
      {
        type: 'role',
        title: 'Role',
        content: `As a product specialist, you:
- Think from the user's perspective first
- Consider edge cases and failure modes
- Define clear success metrics
- Account for technical constraints
- Plan for iterative improvement`,
        enabled: true,
        locked: false,
        collapsed: false,
      },
      {
        type: 'goal',
        title: 'Feature',
        content: `Feature: [FEATURE_NAME]

Problem Statement:
[What user problem does this solve?]

Target Users:
[Who is this for?]

Success Metrics:
[How do we measure success?]`,
        enabled: true,
        locked: false,
        collapsed: false,
      },
      {
        type: 'constraints',
        title: 'Constraints',
        content: `Scope Boundaries:
- In scope: [What's included]
- Out of scope: [What's NOT included]
- Dependencies: [Required systems/features]
- Timeline considerations: [Any deadlines]`,
        enabled: true,
        locked: false,
        collapsed: false,
      },
      {
        type: 'output_format',
        title: 'Output Format',
        content: `Generate a specification with:
1. Executive Summary
2. User Stories (As a [user], I want [action], so that [benefit])
3. Functional Requirements
4. Non-Functional Requirements
5. Acceptance Criteria
6. Open Questions`,
        enabled: true,
        locked: false,
        collapsed: false,
      },
    ],
  },
  {
    id: 'eval-harness',
    name: 'Evaluation Harness Prompt',
    description: 'Template for creating LLM evaluation and testing prompts.',
    category: 'Testing',
    blocks: [
      {
        type: 'system',
        title: 'System',
        content: `You are an AI evaluation specialist. Your role is to objectively assess AI responses against defined criteria, providing structured scores and detailed feedback.`,
        enabled: true,
        locked: false,
        collapsed: false,
      },
      {
        type: 'evaluation',
        title: 'Evaluation Criteria',
        content: `Score each dimension from 1-5:

1. **Accuracy** (factual correctness)
   - 5: Completely accurate
   - 3: Minor errors, core message correct
   - 1: Significant factual errors

2. **Completeness** (addresses all requirements)
   - 5: Fully comprehensive
   - 3: Covers main points, misses details
   - 1: Major gaps

3. **Clarity** (understandable and well-organized)
   - 5: Crystal clear, excellent structure
   - 3: Generally clear, some confusion
   - 1: Confusing or disorganized

4. **Relevance** (stays on topic)
   - 5: Highly focused and relevant
   - 3: Mostly relevant, some tangents
   - 1: Off-topic or irrelevant`,
        enabled: true,
        locked: false,
        collapsed: false,
      },
      {
        type: 'goal',
        title: 'Evaluation Task',
        content: `Evaluate the following response:

**Original Prompt:**
[ORIGINAL_PROMPT]

**Response to Evaluate:**
[RESPONSE]`,
        enabled: true,
        locked: false,
        collapsed: false,
      },
      {
        type: 'output_format',
        title: 'Output Format',
        content: `Provide evaluation in this format:

## Scores
| Criterion | Score | Justification |
|-----------|-------|---------------|
| Accuracy | X/5 | Brief reason |
| Completeness | X/5 | Brief reason |
| Clarity | X/5 | Brief reason |
| Relevance | X/5 | Brief reason |

## Overall Score: X/20

## Key Strengths
- [Strength 1]
- [Strength 2]

## Areas for Improvement
- [Improvement 1]
- [Improvement 2]

## Detailed Feedback
[Narrative analysis]`,
        enabled: true,
        locked: false,
        collapsed: false,
      },
    ],
  },
  {
    id: 'rag-instruction',
    name: 'RAG Instruction Prompt',
    description: 'Template for retrieval-augmented generation with proper context handling.',
    category: 'Advanced',
    blocks: [
      {
        type: 'system',
        title: 'System',
        content: `You are a knowledgeable assistant that answers questions based on provided context. You have access to retrieved documents and should prioritize information from these sources.

Core Principles:
- Ground answers in provided context
- Cite sources when possible
- Acknowledge limitations clearly
- Never fabricate information not in context`,
        enabled: true,
        locked: false,
        collapsed: false,
      },
      {
        type: 'constraints',
        title: 'Retrieval Constraints',
        content: `Context Handling Rules:
1. If context contains the answer: respond based on context
2. If context is partial: provide what's available, note gaps
3. If context doesn't contain answer: clearly state this
4. If context seems outdated: mention this caveat

Citation Style: [Inline/Footnote/None]`,
        enabled: true,
        locked: false,
        collapsed: false,
      },
      {
        type: 'environment',
        title: 'Retrieved Context',
        content: `<retrieved_context>
[DOCUMENT 1]
Source: [URL/Title]
Content: [Content]

[DOCUMENT 2]
Source: [URL/Title]
Content: [Content]
</retrieved_context>`,
        enabled: true,
        locked: false,
        collapsed: false,
      },
      {
        type: 'goal',
        title: 'Query',
        content: `User Question: [USER_QUESTION]`,
        enabled: true,
        locked: false,
        collapsed: false,
      },
      {
        type: 'output_format',
        title: 'Output Format',
        content: `Response Structure:
1. Direct answer to the question
2. Supporting details from context
3. Source citations
4. Confidence indicator (High/Medium/Low)
5. Any caveats or limitations`,
        enabled: true,
        locked: false,
        collapsed: false,
      },
    ],
  },
  {
    id: 'blank',
    name: 'Blank Canvas',
    description: 'Start from scratch with minimal structure.',
    category: 'Basic',
    blocks: [
      {
        type: 'system',
        title: 'System',
        content: '',
        enabled: true,
        locked: false,
        collapsed: false,
      },
      {
        type: 'goal',
        title: 'Goal',
        content: '',
        enabled: true,
        locked: false,
        collapsed: false,
      },
    ],
  },
];

export function getTemplateById(id: string): PromptTemplate | undefined {
  return promptTemplates.find((t) => t.id === id);
}

export function getTemplatesByCategory(category: string): PromptTemplate[] {
  return promptTemplates.filter((t) => t.category === category);
}

export function getAllCategories(): string[] {
  return [...new Set(promptTemplates.map((t) => t.category))];
}

export const blockTypeConfig: Record<BlockType, { label: string; description: string; icon: string; color: string }> = {
  system: {
    label: 'System',
    description: 'Core system instructions and behavior',
    icon: 'cpu',
    color: 'text-glorpi-mint',
  },
  role: {
    label: 'Role',
    description: 'Define the persona or expertise',
    icon: 'user',
    color: 'text-accent-orange',
  },
  goal: {
    label: 'Goal',
    description: 'Primary objective or task',
    icon: 'target',
    color: 'text-validation-success',
  },
  constraints: {
    label: 'Constraints',
    description: 'Limitations and boundaries',
    icon: 'shield',
    color: 'text-validation-warning',
  },
  output_format: {
    label: 'Output Format',
    description: 'Expected response structure',
    icon: 'file-text',
    color: 'text-validation-info',
  },
  examples: {
    label: 'Examples',
    description: 'Input/output demonstrations',
    icon: 'list',
    color: 'text-ink-graphite',
  },
  tools: {
    label: 'Tools',
    description: 'Available functions or capabilities',
    icon: 'wrench',
    color: 'text-glorpi-mint-dark',
  },
  evaluation: {
    label: 'Evaluation',
    description: 'Success criteria and rubrics',
    icon: 'check-square',
    color: 'text-accent-amber',
  },
  environment: {
    label: 'Environment',
    description: 'Runtime context and settings',
    icon: 'terminal',
    color: 'text-ink-slate',
  },
  ui_aesthetic: {
    label: 'UI Aesthetic',
    description: 'Visual and design requirements',
    icon: 'palette',
    color: 'text-glorpi-mint-light',
  },
  accessibility: {
    label: 'Accessibility',
    description: 'A11y requirements and standards',
    icon: 'accessibility',
    color: 'text-validation-info',
  },
  testing: {
    label: 'Testing',
    description: 'Test requirements and coverage',
    icon: 'test-tube',
    color: 'text-validation-warning',
  },
  deployment: {
    label: 'Deployment',
    description: 'Deployment and infrastructure',
    icon: 'rocket',
    color: 'text-accent-orange-dark',
  },
  custom: {
    label: 'Custom',
    description: 'Custom block type',
    icon: 'plus',
    color: 'text-ink-muted',
  },
};
