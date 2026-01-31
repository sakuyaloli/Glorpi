// ==========================================
// Core Types for Glorpi Prompt Studio
// ==========================================

// Block types for the visual prompt builder
export type BlockType =
  | 'system'
  | 'role'
  | 'goal'
  | 'constraints'
  | 'output_format'
  | 'examples'
  | 'tools'
  | 'evaluation'
  | 'environment'
  | 'ui_aesthetic'
  | 'accessibility'
  | 'testing'
  | 'deployment'
  | 'custom';

export interface PromptBlock {
  id: string;
  type: BlockType;
  title: string;
  content: string;
  enabled: boolean;
  locked: boolean;
  collapsed: boolean;
  metadata?: Record<string, unknown>;
  tokenCount?: number;
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  blocks: PromptBlock[];
  selectedProvider: string;
  selectedModel: string;
  knobs: ModelKnobs;
  snapshots: ProjectSnapshot[];
}

export interface ProjectSnapshot {
  id: string;
  name: string;
  createdAt: string;
  blocks: PromptBlock[];
  knobs: ModelKnobs;
}

// Provider and Model types
export type ProviderId = 'anthropic' | 'openai' | 'gemini' | 'deepseek' | 'openai_compatible';

export interface ModelKnobs {
  temperature?: number;
  topP?: number;
  maxOutputTokens?: number;
  reasoningEffort?: 'low' | 'medium' | 'high';
  toolChoice?: 'auto' | 'required' | 'none';
  responseFormat?: 'text' | 'json' | 'markdown';
  [key: string]: unknown;
}

export interface ModelConfig {
  id: string;
  provider: ProviderId;
  name: string;
  displayName: string;
  contextWindow: number;
  inputPricePerMillion: number;
  outputPricePerMillion: number;
  supportedKnobs: string[];
  capabilities: string[];
  isDefault?: boolean;
}

export interface ProviderConfig {
  id: ProviderId;
  displayName: string;
  enabled: boolean;
  models: ModelConfig[];
  baseUrl?: string;
}

// Token estimation types
export interface TokenEstimate {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  confidence: 'high' | 'medium' | 'low';
  breakdown?: Record<string, number>;
}

export interface CostEstimate {
  inputCost: number;
  outputCost: number;
  totalCost: number;
  currency: string;
}

// Validation types
export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface ValidationIssue {
  id: string;
  severity: ValidationSeverity;
  title: string;
  description: string;
  blockId?: string;
  suggestion?: string;
  autoFixable?: boolean;
}

export interface PreflightResult {
  valid: boolean;
  issues: ValidationIssue[];
  payload: ProviderPayload;
  tokenEstimate: TokenEstimate;
  costEstimate: CostEstimate;
}

// Provider payload types
export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ProviderPayload {
  provider: ProviderId;
  model: string;
  messages: Message[];
  knobs: ModelKnobs;
}

// API Response types
export interface SendResponse {
  success: boolean;
  content?: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  error?: string;
  latencyMs?: number;
}

// Companion chat types
export interface CompanionMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestions?: CompanionSuggestion[];
}

export interface CompanionSuggestion {
  id: string;
  type: 'add_block' | 'modify_block' | 'replace_block' | 'add_knob';
  title: string;
  description: string;
  blockType?: BlockType;
  blockContent?: string;
  targetBlockId?: string;
  knobKey?: string;
  knobValue?: unknown;
}

// Template types
export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  blocks: Omit<PromptBlock, 'id'>[];
  suggestedKnobs?: Partial<ModelKnobs>;
}

// ==========================================
// Prompt Plan Types (for AI-powered generation)
// ==========================================

export type PlanBlockType =
  | 'system'
  | 'role'
  | 'goal'
  | 'constraints'
  | 'output_format'
  | 'examples'
  | 'tools'
  | 'environment'
  | 'evaluation'
  | 'notes';

export interface PlanBlock {
  type: PlanBlockType;
  heading: string;
  content: string;
  enabled?: boolean;
}

export interface PromptPlan {
  title?: string;
  blocks: PlanBlock[];
  modelHints?: {
    reasoning?: 'low' | 'medium' | 'high';
    outputStyle?: 'concise' | 'standard' | 'verbose';
  };
}

export interface CompanionPlanRequest {
  userMessage: string;
  currentBlocks: PromptBlock[];
  provider?: ProviderId;
  model?: string;
  projectContext?: string;
}

export interface CompanionPlanResponse {
  chatReply: string;
  plan?: PromptPlan;
  error?: string;
}

// Studio mode types
export type StudioMode = 'build' | 'review';

// Streaming event types for real-time block updates
export interface BlockStreamEvent {
  event: 'block_start' | 'block_delta' | 'block_end' | 'chat_delta' | 'done' | 'error';
  block?: Partial<PlanBlock>;
  delta?: string;
  chatDelta?: string;
  error?: string;
}
