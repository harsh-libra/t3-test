"use client";

import { useEffect } from "react";

interface KeyboardShortcutsProps {
  onNewChat: () => void;
  onToggleSidebar: () => void;
}

export default function KeyboardShortcuts({
  onNewChat,
  onToggleSidebar,
}: KeyboardShortcutsProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isMod = e.metaKey || e.ctrlKey;

      // Cmd/Ctrl + K — New chat
      if (isMod && e.key === "k") {
        e.preventDefault();
        onNewChat();
      }

      // Cmd/Ctrl + B — Toggle sidebar
      if (isMod && e.key === "b") {
        e.preventDefault();
        onToggleSidebar();
      }

      // Cmd/Ctrl + Shift + S — Toggle sidebar (alternative)
      if (isMod && e.shiftKey && e.key === "S") {
        e.preventDefault();
        onToggleSidebar();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onNewChat, onToggleSidebar]);

  return null;
}
