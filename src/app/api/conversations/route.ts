import { db } from "@/lib/db";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/conversations
 * List all conversations sorted by updatedAt desc.
 * Includes message count but not full message content for performance.
 */
export async function GET() {
  try {
    const conversations = await db.conversation.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        _count: { select: { messages: true } },
      },
    });

    return Response.json(conversations);
  } catch (error) {
    console.error("[Conversations API] GET error:", error);
    return Response.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

const CreateConversationSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  provider: z.string().min(1, "Provider is required"),
  model: z.string().min(1, "Model is required"),
});

/**
 * POST /api/conversations
 * Create a new conversation.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parseResult = CreateConversationSchema.safeParse(body);
    if (!parseResult.success) {
      return Response.json(
        {
          error: "Invalid request",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { id, title, provider, model } = parseResult.data;

    const conversation = await db.conversation.create({
      data: {
        ...(id ? { id } : {}),
        title,
        provider,
        model,
      },
      include: {
        _count: { select: { messages: true } },
      },
    });

    return Response.json(conversation, { status: 201 });
  } catch (error) {
    console.error("[Conversations API] POST error:", error);
    return Response.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}
