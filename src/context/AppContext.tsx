"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { CodeSnippet, defaultCodeSnippets } from "@/data/codeSnippets";

export type { CodeSnippet };

export interface TypingSnippet {
  id: string;
  title: string;
  text: string;
  category: string;
  personalBestWPM: number | null;
}

export interface Shortcut {
  action: string;
  keystroke: string;
}

export interface ShortcutDeck {
  slug: string;
  deckName: string;
  shortcuts: Shortcut[];
}

export interface UserStats {
  wpmHistory: number[];
  quizAccuracy: { correct: number; total: number };
}

interface AppState {
  typingSnippets: TypingSnippet[];
  codeSnippets: CodeSnippet[];
  shortcutDecks: ShortcutDeck[];
  userStats: UserStats;
  addSnippet: (snippet: Omit<TypingSnippet, "id" | "personalBestWPM">) => void;
  addShortcut: (deckSlug: string, deckName: string, shortcut: Shortcut) => void;
  updatePersonalBest: (snippetId: string, wpm: number) => void;
  updateCodeBest: (snippetId: string, wpm: number) => void;
  recordWpm: (wpm: number) => void;
  recordQuizResult: (correct: boolean) => void;
}

const defaultSnippets: TypingSnippet[] = [
  {
    id: "snippet-1",
    title: "JavaScript Array Methods",
    text: "const numbers = [1, 2, 3, 4, 5]; const doubled = numbers.map(n => n * 2); const evens = numbers.filter(n => n % 2 === 0); const sum = numbers.reduce((acc, n) => acc + n, 0);",
    category: "Code",
    personalBestWPM: null,
  },
  {
    id: "snippet-2",
    title: "The Art of Typing",
    text: "Touch typing is the ability to use muscle memory to find keys fast without using the sense of sight. It significantly increases typing speed and reduces errors over time.",
    category: "Prose",
    personalBestWPM: null,
  },
  {
    id: "snippet-3",
    title: "Terminal Commands",
    text: "git status && git add . && git commit -m 'update' && git push origin main && echo 'deployed successfully' && npm run build && npm start",
    category: "Terminal",
    personalBestWPM: null,
  },
];

const defaultDecks: ShortcutDeck[] = [
  {
    slug: "vs-code",
    deckName: "VS Code",
    shortcuts: [
      { action: "Open Command Palette", keystroke: "Cmd+Shift+P" },
      { action: "Toggle Sidebar", keystroke: "Cmd+B" },
      { action: "Quick Open File", keystroke: "Cmd+P" },
      { action: "Toggle Terminal", keystroke: "Ctrl+`" },
      { action: "Find in Files", keystroke: "Cmd+Shift+F" },
      { action: "Go to Line", keystroke: "Ctrl+G" },
      { action: "Duplicate Line", keystroke: "Shift+Alt+Down" },
      { action: "Delete Line", keystroke: "Cmd+Shift+K" },
      { action: "Toggle Comment", keystroke: "Cmd+/" },
      { action: "Format Document", keystroke: "Shift+Alt+F" },
    ],
  },
  {
    slug: "chrome",
    deckName: "Chrome",
    shortcuts: [
      { action: "New Tab", keystroke: "Cmd+T" },
      { action: "Close Tab", keystroke: "Cmd+W" },
      { action: "Reopen Closed Tab", keystroke: "Cmd+Shift+T" },
      { action: "Open DevTools", keystroke: "Cmd+Option+I" },
      { action: "Focus Address Bar", keystroke: "Cmd+L" },
      { action: "Next Tab", keystroke: "Ctrl+Tab" },
      { action: "Previous Tab", keystroke: "Ctrl+Shift+Tab" },
      { action: "Hard Refresh", keystroke: "Cmd+Shift+R" },
      { action: "Bookmark Page", keystroke: "Cmd+D" },
      { action: "Find on Page", keystroke: "Cmd+F" },
    ],
  },
  {
    slug: "macos",
    deckName: "macOS",
    shortcuts: [
      { action: "Spotlight Search", keystroke: "Cmd+Space" },
      { action: "Force Quit App", keystroke: "Cmd+Option+Esc" },
      { action: "Screenshot (Full)", keystroke: "Cmd+Shift+3" },
      { action: "Screenshot (Selection)", keystroke: "Cmd+Shift+4" },
      { action: "Lock Screen", keystroke: "Ctrl+Cmd+Q" },
      { action: "Switch App", keystroke: "Cmd+Tab" },
      { action: "Minimize Window", keystroke: "Cmd+M" },
      { action: "Close Window", keystroke: "Cmd+W" },
      { action: "Show Desktop", keystroke: "F11" },
      { action: "Mission Control", keystroke: "Ctrl+Up" },
    ],
  },
  {
    slug: "terminal-zsh",
    deckName: "Terminal / Zsh",
    shortcuts: [
      { action: "Clear Screen", keystroke: "Ctrl+L" },
      { action: "Cancel Command", keystroke: "Ctrl+C" },
      { action: "End of Input (EOF)", keystroke: "Ctrl+D" },
      { action: "Move to Line Start", keystroke: "Ctrl+A" },
      { action: "Move to Line End", keystroke: "Ctrl+E" },
      { action: "Delete Word Back", keystroke: "Ctrl+W" },
      { action: "Search History", keystroke: "Ctrl+R" },
      { action: "Suspend Process", keystroke: "Ctrl+Z" },
      { action: "Move Back One Word", keystroke: "Alt+B" },
      { action: "Move Forward One Word", keystroke: "Alt+F" },
    ],
  },
];

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [typingSnippets, setTypingSnippets] = useState<TypingSnippet[]>(defaultSnippets);
  const [codeSnippets, setCodeSnippets] = useState<CodeSnippet[]>(defaultCodeSnippets);
  const [shortcutDecks, setShortcutDecks] = useState<ShortcutDeck[]>(defaultDecks);
  const [userStats, setUserStats] = useState<UserStats>({
    wpmHistory: [],
    quizAccuracy: { correct: 0, total: 0 },
  });

  const addSnippet = (snippet: Omit<TypingSnippet, "id" | "personalBestWPM">) => {
    setTypingSnippets((prev) => [
      ...prev,
      { ...snippet, id: `snippet-${Date.now()}`, personalBestWPM: null },
    ]);
  };

  const addShortcut = (deckSlug: string, deckName: string, shortcut: Shortcut) => {
    setShortcutDecks((prev) => {
      const existing = prev.find((d) => d.slug === deckSlug);
      if (existing) {
        return prev.map((d) =>
          d.slug === deckSlug
            ? { ...d, shortcuts: [...d.shortcuts, shortcut] }
            : d
        );
      }
      return [...prev, { slug: deckSlug, deckName, shortcuts: [shortcut] }];
    });
  };

  const updatePersonalBest = (snippetId: string, wpm: number) => {
    setTypingSnippets((prev) =>
      prev.map((s) =>
        s.id === snippetId && (s.personalBestWPM === null || wpm > s.personalBestWPM)
          ? { ...s, personalBestWPM: wpm }
          : s
      )
    );
  };

  const updateCodeBest = (snippetId: string, wpm: number) => {
    setCodeSnippets((prev) =>
      prev.map((s) =>
        s.id === snippetId && (s.personalBestWPM === null || wpm > s.personalBestWPM)
          ? { ...s, personalBestWPM: wpm }
          : s
      )
    );
  };

  const recordWpm = (wpm: number) => {
    setUserStats((prev) => ({
      ...prev,
      wpmHistory: [...prev.wpmHistory, wpm],
    }));
  };

  const recordQuizResult = (correct: boolean) => {
    setUserStats((prev) => ({
      ...prev,
      quizAccuracy: {
        correct: prev.quizAccuracy.correct + (correct ? 1 : 0),
        total: prev.quizAccuracy.total + 1,
      },
    }));
  };

  return (
    <AppContext.Provider
      value={{
        typingSnippets,
        codeSnippets,
        shortcutDecks,
        userStats,
        addSnippet,
        addShortcut,
        updatePersonalBest,
        updateCodeBest,
        recordWpm,
        recordQuizResult,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppState must be used within AppProvider");
  return context;
}
