"use client";

import { useState, useRef, useCallback, useEffect } from "react";

function KeyCap({ label, wide = false, active = false }: { label: string; wide?: boolean; active?: boolean }) {
  const isSymbol = label.length === 1 && !/[A-Z0-9]/.test(label);
  return (
    <span
      className={`inline-flex items-center justify-center font-mono text-sm font-medium
        border border-white/[0.08] bg-white/[0.06] shadow-[0_2px_0_rgba(255,255,255,0.04)]
        transition-all duration-100
        ${wide ? "px-3 py-2 min-w-[56px]" : isSymbol ? "px-3 py-2 min-w-[36px]" : "px-3 py-2 min-w-[36px]"}
        ${active ? "bg-blue-500/20 border-blue-500/40 text-blue-400 shadow-[0_2px_0_rgba(59,130,246,0.15),0_0_12px_rgba(59,130,246,0.1)]" : "text-white/80"}
      `}
      style={{ borderRadius: 10 }}
    >
      {label}
    </span>
  );
}

const WIDE_KEYS = new Set(["Cmd", "Ctrl", "Alt", "Shift", "Space", "Enter", "Tab", "Backspace", "Delete", "Esc", "Option"]);

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
  const [heldMods, setHeldMods] = useState<string[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  const formatKeystroke = useCallback((e: KeyboardEvent): string | null => {
    if (["Meta", "Control", "Alt", "Shift"].includes(e.key)) return null;

    const parts: string[] = [];
    if (e.metaKey) parts.push("Cmd");
    if (e.ctrlKey) parts.push("Ctrl");
    if (e.altKey) parts.push("Alt");
    if (e.shiftKey) parts.push("Shift");

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
      // F-keys
    } else if (key === "`") key = "`";
    else if (key.length === 1) key = key.toUpperCase();

    parts.push(key);
    return parts.join("+");
  }, []);

  // Track held modifier keys for live preview
  useEffect(() => {
    if (!isFocused || disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Update held modifiers
      const mods: string[] = [];
      if (e.metaKey) mods.push("Cmd");
      if (e.ctrlKey) mods.push("Ctrl");
      if (e.altKey) mods.push("Alt");
      if (e.shiftKey) mods.push("Shift");
      setHeldMods(mods);

      const keystroke = formatKeystroke(e);
      if (keystroke) {
        onChange(keystroke);
      }
    };

    const handleKeyUp = () => {
      setHeldMods([]);
    };

    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("keyup", handleKeyUp, true);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("keyup", handleKeyUp, true);
    };
  }, [isFocused, disabled, formatKeystroke, onChange]);

  useEffect(() => {
    if (autoFocus && ref.current) ref.current.focus();
  }, [autoFocus]);

  // Split value into individual keys for rendering
  const keys = value ? value.split("+") : [];
  const showHeld = isFocused && !value && heldMods.length > 0;

  return (
    <div
      ref={ref}
      tabIndex={0}
      onFocus={() => setIsFocused(true)}
      onBlur={() => { setIsFocused(false); setHeldMods([]); }}
      className={`flex items-center gap-2 rounded-2xl border bg-white/[0.03] px-5 py-4 outline-none transition-all duration-200 min-h-[60px] ${
        isFocused
          ? "border-blue-500/40 shadow-[0_0_20px_rgba(59,130,246,0.08)]"
          : "border-white/[0.06]"
      } ${disabled ? "pointer-events-none opacity-40" : "cursor-pointer"} ${className}`}
    >
      {value ? (
        /* ── Completed keystroke — show as key tiles ── */
        <div className="flex items-center gap-1.5">
          {keys.map((key, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-white/15 text-xs">+</span>}
              <KeyCap label={key} wide={WIDE_KEYS.has(key)} />
            </span>
          ))}
        </div>
      ) : showHeld ? (
        /* ── Live modifier preview — keys light up as held ── */
        <div className="flex items-center gap-1.5">
          {heldMods.map((mod, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-blue-400/30 text-xs">+</span>}
              <KeyCap label={mod} wide active />
            </span>
          ))}
          <span className="text-blue-400/30 text-xs">+</span>
          <span className="inline-flex items-center justify-center border border-dashed border-blue-500/20 bg-blue-500/5 px-3 py-2 min-w-[36px] text-sm text-blue-400/40 font-mono" style={{ borderRadius: 10 }}>
            ?
          </span>
        </div>
      ) : (
        /* ── Placeholder ── */
        <span className="text-white/20 text-sm">{placeholder}</span>
      )}
    </div>
  );
}
