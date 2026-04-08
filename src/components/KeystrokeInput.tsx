"use client";

import { useState, useRef, useCallback, useEffect } from "react";

/**
 * Captures real keyboard shortcuts (e.g. pressing Cmd+Shift+P)
 * and displays them as formatted strings like "Cmd+Shift+P".
 */
export default function KeystrokeInput({
  value,
  onChange,
  disabled = false,
  placeholder = "Press a key combination...",
  className = "",
  autoFocus = false,
}: {
  value: string;
  onChange: (keystroke: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}) {
  const [isFocused, setIsFocused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const formatKeystroke = useCallback((e: KeyboardEvent): string | null => {
    // Ignore standalone modifier presses
    if (
      e.key === "Meta" ||
      e.key === "Control" ||
      e.key === "Alt" ||
      e.key === "Shift"
    )
      return null;

    const parts: string[] = [];
    if (e.metaKey) parts.push("Cmd");
    if (e.ctrlKey) parts.push("Ctrl");
    if (e.altKey) parts.push("Alt");
    if (e.shiftKey) parts.push("Shift");

    // Normalize key name
    let key = e.key;
    if (key === " ") key = "Space";
    else if (key === "ArrowUp") key = "Up";
    else if (key === "ArrowDown") key = "Down";
    else if (key === "ArrowLeft") key = "Left";
    else if (key === "ArrowRight") key = "Right";
    else if (key === "Escape") key = "Esc";
    else if (key === "Backspace") key = "Backspace";
    else if (key === "Delete") key = "Delete";
    else if (key === "Enter") key = "Enter";
    else if (key === "Tab") key = "Tab";
    else if (key.startsWith("F") && key.length > 1 && !isNaN(Number(key.slice(1)))) {
      // F-keys: keep as-is (F1, F11, etc.)
    } else if (key === "`") key = "`";
    else if (key.length === 1) key = key.toUpperCase();

    parts.push(key);
    return parts.join("+");
  }, []);

  useEffect(() => {
    if (!isFocused || disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const keystroke = formatKeystroke(e);
      if (keystroke) {
        onChange(keystroke);
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [isFocused, disabled, formatKeystroke, onChange]);

  useEffect(() => {
    if (autoFocus && ref.current) {
      ref.current.focus();
    }
  }, [autoFocus]);

  return (
    <div
      ref={ref}
      tabIndex={0}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      className={`flex items-center rounded-lg border bg-white/5 px-3 py-2 text-sm outline-none transition-colors ${
        isFocused
          ? "border-blue-500 ring-1 ring-blue-500/30"
          : "border-white/10"
      } ${disabled ? "pointer-events-none opacity-50" : "cursor-pointer"} ${className}`}
    >
      {value ? (
        <kbd className="font-mono text-white">{value}</kbd>
      ) : (
        <span className="text-white/30">{placeholder}</span>
      )}
      {isFocused && !value && (
        <span className="ml-1 inline-block h-4 w-[2px] animate-pulse bg-blue-500" />
      )}
    </div>
  );
}
