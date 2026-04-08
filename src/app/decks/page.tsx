"use client";

import Link from "next/link";
import { useAppState } from "@/context/AppContext";

export default function DecksPage() {
  const { shortcutDecks, userStats } = useAppState();
  const { correct, total } = userStats.quizAccuracy;

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Shortcuts</h1>
          <p className="mt-1 text-sm text-white/30">Choose a deck to test your shortcut knowledge</p>
        </div>
        {total > 0 && (
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-400 tabular-nums">
              {Math.round((correct / total) * 100)}%
            </p>
            <p className="text-xs text-white/30">
              {correct}/{total} correct
            </p>
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {shortcutDecks.map((deck) => (
          <Link
            key={deck.slug}
            href={`/quiz/${deck.slug}`}
            className="glass glass-hover group relative block overflow-hidden p-6"
          >
            {/* Accent bar */}
            <div className="absolute left-0 top-0 h-full w-[2px] bg-blue-500/0 transition-all duration-300 group-hover:bg-blue-500/80 group-hover:shadow-[0_0_8px_rgba(59,130,246,0.4)]" />

            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white/90 transition-colors group-hover:text-blue-400">
                  {deck.deckName}
                </h2>
                <p className="mt-1.5 text-sm text-white/30">
                  {deck.shortcuts.length} shortcut{deck.shortcuts.length !== 1 && "s"}
                </p>
              </div>
              <span className="mt-1 text-white/15 transition-all duration-300 group-hover:text-blue-400/60 group-hover:translate-x-1 text-lg">
                &rarr;
              </span>
            </div>

            {/* Preview of first 3 shortcuts */}
            <div className="mt-4 flex flex-wrap gap-1.5">
              {deck.shortcuts.slice(0, 3).map((s) => (
                <kbd
                  key={s.action}
                  className="rounded-md bg-white/[0.05] px-2 py-0.5 font-mono text-[11px] text-white/25"
                >
                  {s.keystroke}
                </kbd>
              ))}
              {deck.shortcuts.length > 3 && (
                <span className="px-1 text-[11px] text-white/15">
                  +{deck.shortcuts.length - 3} more
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>

      {shortcutDecks.length === 0 && (
        <div className="glass p-10 text-center">
          <p className="text-white/30 text-sm">No decks yet. Add shortcuts in the Builder tab.</p>
        </div>
      )}
    </div>
  );
}
