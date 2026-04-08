"use client";

import { useState } from "react";
import { useAppState } from "@/context/AppContext";

const CATEGORIES = ["Code", "Prose", "Terminal", "Other"];

export default function BuilderPage() {
  const { shortcutDecks, addSnippet, addShortcut } = useAppState();

  // Snippet form state
  const [snippetTitle, setSnippetTitle] = useState("");
  const [snippetText, setSnippetText] = useState("");
  const [snippetCategory, setSnippetCategory] = useState(CATEGORIES[0]);
  const [snippetSuccess, setSnippetSuccess] = useState(false);

  // Shortcut form state
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

  const inputClasses =
    "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-blue-500 transition-colors";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">The Builder</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Form A: Add Typing Snippet */}
        <form onSubmit={handleSnippetSubmit} className="glass space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Add Typing Snippet</h2>
            {snippetSuccess && (
              <span className="text-sm text-green-400">Added!</span>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-white/50">Title</label>
            <input
              type="text"
              value={snippetTitle}
              onChange={(e) => setSnippetTitle(e.target.value)}
              placeholder="e.g. Python List Comprehensions"
              className={inputClasses}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-white/50">Text</label>
            <textarea
              value={snippetText}
              onChange={(e) => setSnippetText(e.target.value)}
              placeholder="Paste or type the text to be used for typing practice..."
              rows={4}
              className={`${inputClasses} resize-none`}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-white/50">Category</label>
            <select
              value={snippetCategory}
              onChange={(e) => setSnippetCategory(e.target.value)}
              className={inputClasses}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c} className="bg-[#0a0a0f]">
                  {c}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-500 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
          >
            Add Snippet
          </button>
        </form>

        {/* Form B: Add Shortcut */}
        <form onSubmit={handleShortcutSubmit} className="glass space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Add Shortcut</h2>
            {shortcutSuccess && (
              <span className="text-sm text-green-400">Added!</span>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-white/50">Deck</label>
            <div className="flex gap-1 rounded-lg bg-white/5 p-1">
              <button
                type="button"
                onClick={() => setDeckMode("existing")}
                className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  deckMode === "existing"
                    ? "bg-blue-500 text-white"
                    : "text-white/50 hover:text-white/80"
                }`}
              >
                Existing
              </button>
              <button
                type="button"
                onClick={() => setDeckMode("new")}
                className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  deckMode === "new"
                    ? "bg-blue-500 text-white"
                    : "text-white/50 hover:text-white/80"
                }`}
              >
                New Deck
              </button>
            </div>
          </div>

          {deckMode === "existing" ? (
            <div className="space-y-1">
              <label className="text-xs font-medium text-white/50">Select Deck</label>
              <select
                value={selectedDeckSlug}
                onChange={(e) => setSelectedDeckSlug(e.target.value)}
                className={inputClasses}
              >
                {shortcutDecks.map((d) => (
                  <option key={d.slug} value={d.slug} className="bg-[#0a0a0f]">
                    {d.deckName}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-1">
              <label className="text-xs font-medium text-white/50">New Deck Name</label>
              <input
                type="text"
                value={newDeckName}
                onChange={(e) => setNewDeckName(e.target.value)}
                placeholder="e.g. Figma"
                className={inputClasses}
                required={deckMode === "new"}
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-medium text-white/50">Action</label>
            <input
              type="text"
              value={shortcutAction}
              onChange={(e) => setShortcutAction(e.target.value)}
              placeholder="e.g. Save File"
              className={inputClasses}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-white/50">Keystroke</label>
            <input
              type="text"
              value={shortcutKeystroke}
              onChange={(e) => setShortcutKeystroke(e.target.value)}
              placeholder="e.g. Cmd+S"
              className={inputClasses}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-500 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
          >
            Add Shortcut
          </button>
        </form>
      </div>
    </div>
  );
}
