# T3 Chat

A modern AI chat application inspired by [t3.chat](https://t3.chat), built with **Next.js 15**, **TypeScript**, **Tailwind CSS**, and the **Vercel AI SDK**. Supports multiple AI providers with a clean, responsive UI.

## Features

- 🤖 **Multi-provider support** — OpenAI (GPT-4o, GPT-4o-mini), Anthropic (Claude 3.5 Sonnet, Claude 3 Haiku), Google (Gemini Pro, Gemini Flash)
- 💬 **Streaming responses** — Real-time token streaming via Vercel AI SDK
- 📝 **Markdown rendering** — Full markdown support with syntax-highlighted code blocks
- 🗂️ **Conversation management** — Multiple conversations with sidebar navigation
- 🌙 **Dark/Light theme** — System-aware with manual toggle
- 📱 **Responsive design** — Works great on mobile and desktop
- 🔐 **Secure API keys** — Keys stored as server-side environment variables (Vercel env vars)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- At least one API key from a supported provider

### Installation

```bash
# Clone the repository
git clone https://github.com/harsh-libra/t3-test.git
cd t3-test

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your API keys

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

| Variable | Description | Required |
|---|---|---|
| `OPENAI_API_KEY` | OpenAI API key for GPT models | At least one |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude models | At least one |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google AI API key for Gemini models | At least one |

You need **at least one** API key configured for the app to work. Providers without keys will be hidden from the model selector.

### Deploying to Vercel

1. Push this repository to GitHub
2. Import the project on [Vercel](https://vercel.com)
3. Go to **Settings → Environment Variables**
4. Add your API keys (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`)
5. Deploy!

> ⚠️ **Security**: API keys are only accessed server-side via `process.env`. They are never exposed to the browser or included in client bundles.

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **AI SDK**: [Vercel AI SDK](https://sdk.vercel.ai/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Markdown**: [react-markdown](https://github.com/remarkjs/react-markdown) + [remark-gfm](https://github.com/remarkjs/remark-gfm)
- **Syntax Highlighting**: [react-syntax-highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter)

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts       # Chat streaming endpoint
│   │   └── models/route.ts     # Available models endpoint
│   ├── globals.css             # Global styles & CSS variables
│   ├── layout.tsx              # Root layout with theme support
│   └── page.tsx                # Main chat page
├── components/
│   ├── ChatWindow.tsx          # Main chat container
│   ├── ChatInput.tsx           # Message input area
│   ├── MessageBubble.tsx       # Individual message display
│   ├── ModelSelector.tsx       # Provider/model picker
│   ├── Sidebar.tsx             # Conversation list
│   └── ThemeToggle.tsx         # Dark/light mode toggle
├── lib/
│   ├── providers.ts            # AI provider configuration
│   └── conversations.ts        # Conversation storage logic
└── types/
    └── index.ts                # TypeScript type definitions
```

## License

MIT
