import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { Provider, Model } from "@/types";

// ────────────────────────────────────────────────────────
// Provider registry — defines all supported providers/models
// API keys are read from process.env (server-side only)
// ────────────────────────────────────────────────────────

export interface ProviderConfig {
  id: string;
  name: string;
  envKey: string;
  models: ModelConfig[];
}

export interface ModelConfig {
  id: string;
  name: string;
  description: string;
  providerId: string;
}

export const PROVIDER_CONFIGS: ProviderConfig[] = [
  {
    id: "openai",
    name: "OpenAI",
    envKey: "OPENAI_API_KEY",
    models: [
      {
        id: "gpt-4o",
        name: "GPT-4o",
        description: "Most capable OpenAI model",
        providerId: "openai",
      },
      {
        id: "gpt-4o-mini",
        name: "GPT-4o Mini",
        description: "Fast and affordable",
        providerId: "openai",
      },
    ],
  },
  {
    id: "anthropic",
    name: "Anthropic",
    envKey: "ANTHROPIC_API_KEY",
    models: [
      {
        id: "claude-sonnet-4-20250514",
        name: "Claude Sonnet 4",
        description: "Most capable Claude model",
        providerId: "anthropic",
      },
      {
        id: "claude-3-5-haiku-20241022",
        name: "Claude 3.5 Haiku",
        description: "Fast and efficient",
        providerId: "anthropic",
      },
    ],
  },
  {
    id: "google",
    name: "Google",
    envKey: "GOOGLE_GENERATIVE_AI_API_KEY",
    models: [
      {
        id: "gemini-2.0-flash",
        name: "Gemini 2.0 Flash",
        description: "Latest Gemini model",
        providerId: "google",
      },
      {
        id: "gemini-2.0-flash-lite",
        name: "Gemini 2.0 Flash Lite",
        description: "Lightweight and fast",
        providerId: "google",
      },
    ],
  },
];

/**
 * Check if a provider has its API key configured
 */
export function isProviderAvailable(providerId: string): boolean {
  const config = PROVIDER_CONFIGS.find((p) => p.id === providerId);
  if (!config) return false;
  return !!process.env[config.envKey];
}

/**
 * Get available providers (only those with API keys set)
 */
export function getAvailableProviders(): Provider[] {
  return PROVIDER_CONFIGS.filter((config) => !!process.env[config.envKey]).map(
    (config) => ({
      id: config.id,
      name: config.name,
      models: config.models.map((m) => ({
        id: m.id,
        name: m.name,
        providerId: m.providerId,
        description: m.description,
      })),
    })
  );
}

/**
 * Get ALL providers and models (marking availability)
 * Used by the /api/models endpoint
 */
export function getAllProvidersWithAvailability(): (Provider & {
  available: boolean;
})[] {
  return PROVIDER_CONFIGS.map((config) => ({
    id: config.id,
    name: config.name,
    available: !!process.env[config.envKey],
    models: config.models.map((m) => ({
      id: m.id,
      name: m.name,
      providerId: m.providerId,
      description: m.description,
    })),
  }));
}

/**
 * Get the Vercel AI SDK language model instance for a given provider + model combo
 * This is the core routing function that creates the right SDK client
 */
export function getLanguageModel(providerId: string, modelId: string) {
  const config = PROVIDER_CONFIGS.find((p) => p.id === providerId);
  if (!config) {
    throw new Error(`Unknown provider: ${providerId}`);
  }

  const apiKey = process.env[config.envKey];
  if (!apiKey) {
    throw new Error(
      `API key not configured for ${config.name}. Set ${config.envKey} in your environment variables.`
    );
  }

  // Validate model exists
  const modelConfig = config.models.find((m) => m.id === modelId);
  if (!modelConfig) {
    throw new Error(
      `Unknown model "${modelId}" for provider "${config.name}"`
    );
  }

  switch (providerId) {
    case "openai": {
      const openai = createOpenAI({ apiKey });
      return openai(modelId);
    }
    case "anthropic": {
      const anthropic = createAnthropic({ apiKey });
      return anthropic(modelId);
    }
    case "google": {
      const google = createGoogleGenerativeAI({ apiKey });
      return google(modelId);
    }
    default:
      throw new Error(`Unsupported provider: ${providerId}`);
  }
}
