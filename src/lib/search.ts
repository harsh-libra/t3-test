import Fuse, {
  type IFuseOptions,
  type FuseResult,
  type FuseResultMatch,
} from "fuse.js";
import type { Conversation } from "@/types";

export type { FuseResultMatch };

const fuseOptions: IFuseOptions<Conversation> = {
  keys: [
    { name: "title", weight: 2 },
    { name: "messages.content", weight: 1 },
  ],
  threshold: 0.4,
  ignoreLocation: true,
  includeMatches: true,
  minMatchCharLength: 2,
};

export function searchConversations(
  conversations: Conversation[],
  query: string
): FuseResult<Conversation>[] {
  if (!query.trim()) {
    return conversations.map((item) => ({
      item,
      refIndex: 0,
      matches: [],
    }));
  }

  const fuse = new Fuse(conversations, fuseOptions);
  return fuse.search(query);
}
