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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Master Cheatsheet</h1>
        <p className="mt-1 text-sm text-white/30">Quick reference for all keyboard shortcuts</p>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass flex flex-wrap items-center gap-3 p-4">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search shortcuts..."
            className="w-full rounded-xl border border-white/[0.06] bg-white/[0.04] py-2.5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-white/20 transition-colors focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
          />
        </div>
        <select
          value={filterDeck}
          onChange={(e) => setFilterDeck(e.target.value)}
          className="rounded-xl border border-white/[0.06] bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-blue-500/50"
        >
          <option value="all" className="bg-[#08080c]">All Decks</option>
          {shortcutDecks.map((d) => (
            <option key={d.slug} value={d.slug} className="bg-[#08080c]">
              {d.deckName}
            </option>
          ))}
        </select>
        <span className="text-xs tabular-nums text-white/20">
          {filtered.length} result{filtered.length !== 1 && "s"}
        </span>
      </div>

      {/* Table */}
      <div className="glass overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="px-5 py-3.5 text-[11px] font-medium uppercase tracking-widest text-white/35">Action</th>
              <th className="px-5 py-3.5 text-[11px] font-medium uppercase tracking-widest text-white/35">Keystroke</th>
              <th className="px-5 py-3.5 text-[11px] font-medium uppercase tracking-widest text-white/35 hidden sm:table-cell">Deck</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => (
              <tr
                key={`${s.deckSlug}-${s.action}-${i}`}
                className={`border-b border-white/[0.03] transition-colors duration-150 hover:bg-white/[0.04] ${
                  i % 2 === 0 ? "bg-white/[0.015]" : ""
                }`}
              >
                <td className="px-5 py-3 text-white/70">{s.action}</td>
                <td className="px-5 py-3">
                  <kbd className="inline-flex items-center rounded-lg bg-white/[0.06] px-2.5 py-1 font-mono text-xs text-blue-400 ring-1 ring-white/[0.06]">
                    {s.keystroke}
                  </kbd>
                </td>
                <td className="px-5 py-3 text-white/30 hidden sm:table-cell">
                  {s.deckName}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-10 text-center text-sm text-white/25">
            {allShortcuts.length === 0
              ? "No shortcuts yet. Add some in the Builder tab."
              : "No shortcuts match your search."}
          </div>
        )}
      </div>
    </div>
  );
}
