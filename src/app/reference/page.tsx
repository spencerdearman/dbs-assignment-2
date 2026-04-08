"use client";

import { useState, useMemo } from "react";
import { useAppState } from "@/context/AppContext";

export default function ReferencePage() {
  const { shortcutDecks } = useAppState();
  const [search, setSearch] = useState("");
  const [filterDeck, setFilterDeck] = useState("all");

  const allShortcuts = useMemo(() => {
    return shortcutDecks.flatMap((deck) =>
      deck.shortcuts.map((s) => ({
        action: s.action,
        keystroke: s.keystroke,
        deckName: deck.deckName,
        deckSlug: deck.slug,
      }))
    );
  }, [shortcutDecks]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allShortcuts.filter((s) => {
      const matchesDeck = filterDeck === "all" || s.deckSlug === filterDeck;
      const matchesSearch =
        !q ||
        s.action.toLowerCase().includes(q) ||
        s.keystroke.toLowerCase().includes(q) ||
        s.deckName.toLowerCase().includes(q);
      return matchesDeck && matchesSearch;
    });
  }, [allShortcuts, search, filterDeck]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Master Cheatsheet</h1>

      {/* Search & Filter Bar */}
      <div className="glass flex flex-wrap items-center gap-3 p-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search shortcuts..."
          className="flex-1 min-w-[200px] rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-blue-500 transition-colors"
        />
        <select
          value={filterDeck}
          onChange={(e) => setFilterDeck(e.target.value)}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-500 transition-colors"
        >
          <option value="all" className="bg-[#0a0a0f]">
            All Decks
          </option>
          {shortcutDecks.map((d) => (
            <option key={d.slug} value={d.slug} className="bg-[#0a0a0f]">
              {d.deckName}
            </option>
          ))}
        </select>
        <span className="text-xs text-white/30">
          {filtered.length} shortcut{filtered.length !== 1 && "s"}
        </span>
      </div>

      {/* Table */}
      <div className="glass overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-white/50">
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium">Keystroke</th>
              <th className="px-4 py-3 font-medium hidden sm:table-cell">Deck</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => (
              <tr
                key={`${s.deckSlug}-${s.action}-${i}`}
                className={`border-b border-white/5 transition-colors hover:bg-white/5 ${
                  i % 2 === 0 ? "bg-white/[0.02]" : ""
                }`}
              >
                <td className="px-4 py-3 text-white/80">{s.action}</td>
                <td className="px-4 py-3">
                  <kbd className="rounded bg-white/10 px-2 py-0.5 font-mono text-xs text-blue-400">
                    {s.keystroke}
                  </kbd>
                </td>
                <td className="px-4 py-3 text-white/40 hidden sm:table-cell">
                  {s.deckName}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-white/30">
            {allShortcuts.length === 0
              ? "No shortcuts yet. Add some in the Builder tab."
              : "No shortcuts match your search."}
          </div>
        )}
      </div>
    </div>
  );
}
