"use client";

import { useState } from "react";
import { useAppState } from "@/context/AppContext";
import KeystrokeInput from "@/components/KeystrokeInput";

const CATEGORIES = ["Code", "Prose", "Terminal", "Other"];

export default function BuilderPage() {
  const { shortcutDecks, addSnippet, addShortcut } = useAppState();

  const [snippetTitle, setSnippetTitle] = useState("");
  const [snippetText, setSnippetText] = useState("");
  const [snippetCategory, setSnippetCategory] = useState(CATEGORIES[0]);
  const [snippetSuccess, setSnippetSuccess] = useState(false);

  const [shortcutAction, setShortcutAction] = useState("");
  const [shortcutKeystroke, setShortcutKeystroke] = useState("");
  const [deckMode, setDeckMode] = useState<"existing" | "new">("existing");
  const [selectedDeckSlug, setSelectedDeckSlug] = useState(shortcutDecks[0]?.slug ?? "");
  const [newDeckName, setNewDeckName] = useState("");
  const [shortcutSuccess, setShortcutSuccess] = useState(false);

  const handleSnippetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!snippetTitle.trim() || !snippetText.trim()) return;
    addSnippet({ title: snippetTitle.trim(), text: snippetText.trim(), category: snippetCategory });
    setSnippetTitle("");
    setSnippetText("");
    setSnippetCategory(CATEGORIES[0]);
    setSnippetSuccess(true);
    setTimeout(() => setSnippetSuccess(false), 2000);
  };

  const handleShortcutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shortcutAction.trim() || !shortcutKeystroke.trim()) return;

    let slug: string;
    let name: string;

    if (deckMode === "new") {
      if (!newDeckName.trim()) return;
      name = newDeckName.trim();
      slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    } else {
      const deck = shortcutDecks.find((d) => d.slug === selectedDeckSlug);
      if (!deck) return;
      slug = deck.slug;
      name = deck.deckName;
    }

    addShortcut(slug, name, {
      action: shortcutAction.trim(),
      keystroke: shortcutKeystroke.trim(),
    });

    setShortcutAction("");
    setShortcutKeystroke("");
    setNewDeckName("");
    setShortcutSuccess(true);
    setTimeout(() => setShortcutSuccess(false), 2000);
  };

  // Radius: inputs 16px, toggle buttons 14px, toggle container 14+4=18px, submit buttons 18px
  const fieldCls =
    "w-full border border-white/[0.06] bg-white/[0.04] px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-white/20 transition-colors focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20";
  const R = { field: { borderRadius: 16 }, toggleOuter: { borderRadius: 18 }, toggleBtn: { borderRadius: 14 }, submit: { borderRadius: 18 } };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Builder</h1>
        <p className="mt-1 text-sm text-white/30">Add typing snippets and keyboard shortcuts</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Form A: Add Typing Snippet */}
        <form onSubmit={handleSnippetSubmit} className="glass space-y-5 p-7">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold tracking-wide">Add Typing Snippet</h2>
            {snippetSuccess && (
              <span className="rounded-full bg-green-500/10 px-3 py-0.5 text-xs font-medium text-green-400 ring-1 ring-green-500/20">
                Added!
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium uppercase tracking-widest text-white/35">Title</label>
            <input
              type="text"
              value={snippetTitle}
              onChange={(e) => setSnippetTitle(e.target.value)}
              placeholder="e.g. Python List Comprehensions"
              className={fieldCls}
              style={R.field}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium uppercase tracking-widest text-white/35">Text</label>
            <textarea
              value={snippetText}
              onChange={(e) => setSnippetText(e.target.value)}
              placeholder="Paste or type the text to be used for typing practice..."
              rows={4}
              className={`${fieldCls} resize-none`}
              style={R.field}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium uppercase tracking-widest text-white/35">Category</label>
            <select
              value={snippetCategory}
              onChange={(e) => setSnippetCategory(e.target.value)}
              className={fieldCls}
              style={R.field}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c} className="bg-[#08080c]">{c}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 py-2.5 text-sm font-medium text-white shadow-[0_0_15px_rgba(59,130,246,0.25)] transition-all hover:bg-blue-400 hover:shadow-[0_0_20px_rgba(59,130,246,0.35)]"
            style={R.submit}
          >
            Add Snippet
          </button>
        </form>

        {/* Form B: Add Shortcut */}
        <form onSubmit={handleShortcutSubmit} className="glass space-y-5 p-7">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold tracking-wide">Add Shortcut</h2>
            {shortcutSuccess && (
              <span className="rounded-full bg-green-500/10 px-3 py-0.5 text-xs font-medium text-green-400 ring-1 ring-green-500/20">
                Added!
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium uppercase tracking-widest text-white/35">Deck</label>
            <div className="flex gap-0.5 bg-white/[0.04] p-1" style={R.toggleOuter}>
              <button
                type="button"
                onClick={() => setDeckMode("existing")}
                className={`flex-1 px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                  deckMode === "existing"
                    ? "bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                    : "text-white/40 hover:text-white/70"
                }`}
                style={R.toggleBtn}
              >
                Existing
              </button>
              <button
                type="button"
                onClick={() => setDeckMode("new")}
                className={`flex-1 px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                  deckMode === "new"
                    ? "bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                    : "text-white/40 hover:text-white/70"
                }`}
                style={R.toggleBtn}
              >
                New Deck
              </button>
            </div>
          </div>

          {deckMode === "existing" ? (
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium uppercase tracking-widest text-white/35">Select Deck</label>
              <select
                value={selectedDeckSlug}
                onChange={(e) => setSelectedDeckSlug(e.target.value)}
                className={fieldCls}
                style={R.field}
              >
                {shortcutDecks.map((d) => (
                  <option key={d.slug} value={d.slug} className="bg-[#08080c]">{d.deckName}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium uppercase tracking-widest text-white/35">New Deck Name</label>
              <input
                type="text"
                value={newDeckName}
                onChange={(e) => setNewDeckName(e.target.value)}
                placeholder="e.g. Figma"
                className={fieldCls}
                style={R.field}
                required={deckMode === "new"}
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium uppercase tracking-widest text-white/35">Action</label>
            <input
              type="text"
              value={shortcutAction}
              onChange={(e) => setShortcutAction(e.target.value)}
              placeholder="e.g. Save File"
              className={fieldCls}
              style={R.field}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium uppercase tracking-widest text-white/35">Keystroke</label>
            <KeystrokeInput
              value={shortcutKeystroke}
              onChange={setShortcutKeystroke}
              placeholder="Press a key combination..."
              className="w-full"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 py-2.5 text-sm font-medium text-white shadow-[0_0_15px_rgba(59,130,246,0.25)] transition-all hover:bg-blue-400 hover:shadow-[0_0_20px_rgba(59,130,246,0.35)]"
            style={R.submit}
          >
            Add Shortcut
          </button>
        </form>
      </div>
    </div>
  );
}
