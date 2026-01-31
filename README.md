# Glorpi Prompt Studio

A visual prompt builder, token estimator, and multi-provider sender for crafting production-ready AI prompts.

![Glorpi Prompt Studio](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-3-cyan)

## Features

- **Visual Prompt Builder** - Build prompts with modular blocks: system, role, constraints, examples, and more
- **Real-time Token Estimation** - Accurate token counting with per-block breakdown
- **Cost Calculator** - Instant cost estimates for all supported providers
- **Preflight Validation** - Automatic checks for prompt injection, conflicting instructions, and common issues
- **Multi-Provider Support** - Send to Claude, GPT, Gemini, DeepSeek, or any OpenAI-compatible endpoint
- **Companion Chat** - AI-powered assistant that helps craft better prompts
- **Live2D Character** - Adorable Glorpi companion with mouse tracking

## Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd glorpi-prompt-studio

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Configure API Keys

Edit `.env.local` and add your API keys:

```env
# Required for real API calls (optional - app works with mock responses)
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=...
DEEPSEEK_API_KEY=...

# Optional: Custom OpenAI-compatible endpoint
CUSTOM_OPENAI_API_KEY=...
CUSTOM_OPENAI_BASE_URL=https://your-endpoint.com/v1

# Optional: Rate limiting with Upstash Redis
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

**Note:** The app works without any API keys configured - it will return mock responses. This is useful for testing and development.

## Project Structure

```
glorpi-prompt-studio/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes (send, estimate, providers)
│   ├── studio/            # Main workspace
│   ├── models/            # Model registry editor
│   ├── settings/          # Provider configuration
│   └── docs/              # Documentation
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── design/            # Custom design system (GlassPanel, TokenRuler, etc.)
│   ├── studio/            # Studio-specific components
│   ├── companion/         # Chat and Live2D components
│   └── layout/            # Navigation, Footer
├── lib/
│   ├── providers/         # API adapters (Anthropic, OpenAI, Gemini, etc.)
│   ├── models-registry.ts # Model configurations and pricing
│   ├── token-estimation.ts # Token counting utilities
│   ├── validation.ts      # Preflight validation rules
│   └── templates.ts       # Prompt templates
├── glorpi_cat/            # Live2D model assets
└── tests/                 # Test files
```

## Usage

### Studio Workflow

1. **Build** - Add blocks to construct your prompt (system, role, constraints, etc.)
2. **Validate** - Review the preflight panel for issues and suggestions
3. **Configure** - Select provider, model, and adjust parameters
4. **Send** - Review the final payload and send to the API

### Block Types

| Block | Purpose |
|-------|---------|
| System | Core instructions and behavior |
| Role | Persona or expertise definition |
| Goal | Primary objective or task |
| Constraints | Limitations and boundaries |
| Output Format | Expected response structure |
| Examples | Input/output demonstrations |
| Tools | Available functions |
| Evaluation | Success criteria |
| Environment | Runtime context |
| UI Aesthetic | Visual requirements |
| Accessibility | A11y standards |
| Testing | Test requirements |
| Deployment | Infrastructure notes |

### Supported Providers

| Provider | Models | Features |
|----------|--------|----------|
| Anthropic | Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku | 200K context, vision |
| OpenAI | GPT-4o, GPT-4o Mini, o1-preview, o1-mini | 128K context, JSON mode |
| Google | Gemini 1.5 Pro, Gemini 1.5 Flash, Gemini 2.0 Flash | Up to 2M context |
| DeepSeek | DeepSeek Chat, DeepSeek Reasoner | 64K context, affordable |
| Custom | Any OpenAI-compatible API | Configurable |

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Add environment variables in project settings
4. Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Environment Variables for Production

Add these in your Vercel project settings:

- `ANTHROPIC_API_KEY`
- `OPENAI_API_KEY`
- `GOOGLE_API_KEY`
- `DEEPSEEK_API_KEY`
- `UPSTASH_REDIS_REST_URL` (optional, for rate limiting)
- `UPSTASH_REDIS_REST_TOKEN` (optional)

## Development

### Scripts

```bash
pnpm dev        # Start development server
pnpm build      # Build for production
pnpm start      # Start production server
pnpm test       # Run tests
pnpm lint       # Lint code
pnpm format     # Format code
```

### Testing

```bash
# Run all tests
pnpm test

# Run tests once
pnpm test:run

# Run specific test file
pnpm test tests/token-estimation.test.ts
```

### Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Animation**: Framer Motion
- **Drag & Drop**: dnd-kit
- **Live2D**: PixiJS + pixi-live2d-display
- **Storage**: IndexedDB (idb-keyval)
- **Testing**: Vitest

## Token Estimation

Token estimation uses a hybrid approach:

1. **Character-based estimation** - Uses provider-specific character-to-token ratios
2. **Pattern adjustment** - Accounts for code blocks, special characters, and whitespace
3. **Confidence levels** - High (<10K), Medium (10K-50K), Low (>50K tokens)

Estimates are labeled clearly and may differ from actual API token counts.

## Privacy & Security

- **Local-first**: Projects stored in browser IndexedDB
- **Server-side keys**: API keys never exposed to client
- **No logging**: Prompts sent directly to provider APIs
- **Rate limiting**: Built-in protection against abuse

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details.

---

Built with care for prompt engineers. Powered by Glorpi.
