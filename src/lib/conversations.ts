import type { Conversation } from "@/types";

const STORAGE_KEY = "t3chat-conversations";

/**
 * Get all conversations from localStorage, sorted by updatedAt descending
 */
export function listConversations(): Conversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const conversations: Conversation[] = JSON.parse(raw);
    return conversations.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

/**
 * Get a single conversation by ID
 */
export function getConversation(id: string): Conversation | null {
  const conversations = listConversations();
  return conversations.find((c) => c.id === id) || null;
}

/**
 * Create a new conversation and save it
 */
export function createConversation(
  conversation: Conversation
): Conversation {
  const conversations = listConversations();
  conversations.unshift(conversation);
  saveAll(conversations);
  return conversation;
}

/**
 * Update an existing conversation
 */
export function updateConversation(
  updated: Conversation
): Conversation | null {
  const conversations = listConversations();
  const index = conversations.findIndex((c) => c.id === updated.id);
  if (index === -1) {
    // If not found, create it
    conversations.unshift(updated);
  } else {
    conversations[index] = updated;
  }
  saveAll(conversations);
  return updated;
}

/**
 * Delete a conversation by ID
 */
export function deleteConversation(id: string): boolean {
  const conversations = listConversations();
  const filtered = conversations.filter((c) => c.id !== id);
  if (filtered.length === conversations.length) return false;
  saveAll(filtered);
  return true;
}

/**
 * Delete all conversations
 */
export function clearAllConversations(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Internal: save all conversations to localStorage
 */
function saveAll(conversations: Conversation[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch (err) {
    console.error("Failed to save conversations:", err);
    // localStorage might be full — try to trim old conversations
    if (conversations.length > 50) {
      const trimmed = conversations.slice(0, 50);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    }
  }
}

/**
 * Generate a simple ID
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}
