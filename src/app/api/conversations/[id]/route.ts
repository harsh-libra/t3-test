import { db } from "@/lib/db";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/conversations/[id]
 * Get a single conversation by ID with all its messages.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const conversation = await db.conversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!conversation) {
      return Response.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    return Response.json(conversation);
  } catch (error) {
    console.error("[Conversations API] GET [id] error:", error);
    return Response.json(
      { error: "Failed to fetch conversation" },
      { status: 500 }
    );
  }
}

const UpdateConversationSchema = z.object({
  title: z.string().min(1).optional(),
  provider: z.string().min(1).optional(),
  model: z.string().min(1).optional(),
  messages: z
    .array(
      z.object({
        id: z.string().optional(),
        role: z.enum(["user", "assistant", "system"]),
        content: z.string(),
      })
    )
    .optional(),
});

/**
 * PUT /api/conversations/[id]
 * Update a conversation (title, provider, model, and optionally sync messages).
 */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const parseResult = UpdateConversationSchema.safeParse(body);
    if (!parseResult.success) {
      return Response.json(
        {
          error: "Invalid request",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { title, provider, model, messages } = parseResult.data;

    // Check if conversation exists
    const existing = await db.conversation.findUnique({ where: { id } });
    if (!existing) {
      return Response.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Build the update data
    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (provider !== undefined) updateData.provider = provider;
    if (model !== undefined) updateData.model = model;

    const conversation = await db.$transaction(async (tx) => {
      // If messages are provided, replace all messages (delete existing + create new)
      if (messages !== undefined) {
        await tx.message.deleteMany({ where: { conversationId: id } });

        if (messages.length > 0) {
          await tx.message.createMany({
            data: messages.map((m) => ({
              ...(m.id ? { id: m.id } : {}),
              role: m.role,
              content: m.content,
              conversationId: id,
            })),
          });
        }
        
        // Force updatedAt change if only messages were updated
        updateData.updatedAt = new Date();
      }

      return await tx.conversation.update({
        where: { id },
        data: updateData,
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      });
    });

    return Response.json(conversation);
  } catch (error) {
    console.error("[Conversations API] PUT [id] error:", error);
    return Response.json(
      { error: "Failed to update conversation" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/conversations/[id]
 * Delete a conversation and all its messages (cascade).
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if conversation exists
    const existing = await db.conversation.findUnique({ where: { id } });
    if (!existing) {
      return Response.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    await db.conversation.delete({ where: { id } });

    return Response.json({ success: true });
  } catch (error) {
    console.error("[Conversations API] DELETE [id] error:", error);
    return Response.json(
      { error: "Failed to delete conversation" },
      { status: 500 }
    );
  }
}
