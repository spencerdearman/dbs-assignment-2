"use client";

import Link from "next/link";
import { useAppState } from "@/context/AppContext";

export default function DecksPage() {
  const { shortcutDecks, userStats } = useAppState();
  const { correct, total } = userStats.quizAccuracy;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Shortcut Quiz</h1>
        {total > 0 && (
          <p className="text-sm text-white/40">
            Overall accuracy:{" "}
            <span className="text-blue-400">
              {Math.round((correct / total) * 100)}%
            </span>
            <span className="ml-1 text-white/30">({correct}/{total})</span>
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shortcutDecks.map((deck) => (
          <Link
            key={deck.slug}
            href={`/quiz/${deck.slug}`}
            className="glass glass-hover group block p-6 transition-all"
          >
            <h2 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
              {deck.deckName}
            </h2>
            <p className="mt-1 text-sm text-white/40">
              {deck.shortcuts.length} shortcut{deck.shortcuts.length !== 1 && "s"}
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-white/30">
              <span>Start quiz</span>
              <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
            </div>
          </Link>
        ))}
      </div>

      {shortcutDecks.length === 0 && (
        <div className="glass p-8 text-center">
          <p className="text-white/40">No decks yet. Add shortcuts in the Builder tab.</p>
        </div>
      )}
    </div>
  );
}
