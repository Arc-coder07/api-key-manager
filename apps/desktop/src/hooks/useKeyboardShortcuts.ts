import { useEffect } from "react";

interface KeyboardShortcutHandlers {
  onNewKey?: () => void;
  onSearch?: () => void;
  onLockVault?: () => void;
}

/**
 * Global keyboard shortcuts for the Vaultic app.
 * - ⌘+N / Ctrl+N → New key
 * - ⌘+K / Ctrl+K → Focus search
 * - ⌘+L / Ctrl+L → Lock vault
 */
export function useKeyboardShortcuts({
  onNewKey,
  onSearch,
  onLockVault,
}: KeyboardShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      if (!isMod) return;

      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      const isInputFocused =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable;

      switch (e.key.toLowerCase()) {
        case "n":
          if (!isInputFocused) {
            e.preventDefault();
            onNewKey?.();
          }
          break;
        case "k":
          e.preventDefault();
          onSearch?.();
          break;
        case "l":
          if (!isInputFocused) {
            e.preventDefault();
            onLockVault?.();
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onNewKey, onSearch, onLockVault]);
}
