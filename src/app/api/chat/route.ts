import { streamText } from "ai";
import { z } from "zod";
import { getLanguageModel } from "@/lib/providers";
import { db } from "@/lib/db";

// Force dynamic — we need runtime env vars, not static generation
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Zod schema for request validation
const ChatRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"]),
      content: z.string(),
    })
  ),
  provider: z.string().min(1, "Provider is required"),
  model: z.string().min(1, "Model is required"),
  conversationId: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate request body
    const parseResult = ChatRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid request",
          details: parseResult.error.flatten().fieldErrors,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { messages, provider, model, conversationId } = parseResult.data;

    // Get the language model instance (handles key lookup + validation)
    let languageModel;
    try {
      languageModel = getLanguageModel(provider, model);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to initialize provider";
      return new Response(JSON.stringify({ error: message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Stream the response using Vercel AI SDK
    const result = streamText({
      model: languageModel,
      messages,
      maxTokens: 4096,
      async onFinish({ text }) {
        if (conversationId) {
          try {
            // Save the latest user message and assistant response
            const lastUserMessage = messages[messages.length - 1];
            await db.message.createMany({
              data: [
                {
                  role: lastUserMessage.role,
                  content: lastUserMessage.content,
                  conversationId,
                },
                {
                  role: "assistant",
                  content: text,
                  conversationId,
                },
              ],
            });
            // Update conversation timestamp
            await db.conversation.update({
              where: { id: conversationId },
              data: { updatedAt: new Date() },
            });
          } catch (err) {
            console.error("[Chat API] Failed to persist messages:", err);
            // Don't throw — message was already streamed to the client
          }
        }
      },
    });

    // Return the streaming response
    return result.toDataStreamResponse();
  } catch (error) {
    console.error("[Chat API Error]", error);

    // Handle rate limits
    if (error instanceof Error && error.message.includes("rate")) {
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded. Please wait a moment and try again.",
        }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred. Please try again.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
