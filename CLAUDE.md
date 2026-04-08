@AGENTS.md

# Keyboard Productivity Tool (KeyPro)

## Project Overview
A Next.js (App Router) + Tailwind CSS application combining a WPM typing test with a keyboard shortcut flashcard system. All state is client-side only (React Context) and resets on refresh.

## Tech Stack
- **Framework**: Next.js 16 (App Router) with TypeScript
- **Styling**: Tailwind CSS 4
- **State**: React Context (in-memory, no persistence)
- **Testing**: Playwright (via MCP)
- **Deployment**: Vercel

## Data Model

### `codeSnippets[]` (src/data/codeSnippets.ts)
```ts
{ id: string, title: string, language: string, difficulty: "easy" | "medium" | "hard", text: string, personalBestWPM: number | null }
```
30 snippets across 10 languages (JS, TS, Python, Swift, C, C++, Rust, Go, Java, Ruby) x 3 difficulty levels.

### `typingSnippets[]`
```ts
{ id: string, title: string, text: string, category: string, personalBestWPM: number | null }
```

### `shortcutDecks[]`
```ts
{ slug: string, deckName: string, shortcuts: { action: string, keystroke: string }[] }
```
Seeded with 4 decks: VS Code, Chrome, macOS, Terminal/Zsh.

### `userStats`
```ts
{ wpmHistory: number[], quizAccuracy: { correct: number, total: number } }
```

## Pages & Routes

| Route | Tab Name | Purpose |
|-------|----------|---------|
| `/` | Arena | Typing test — Code (IDE-style), Words (monkeytype-style), Custom modes |
| `/decks` | Shortcuts | Grid of shortcut deck cards |
| `/quiz/[slug]` | (dynamic) | Flashcard quiz with keycap tile UI |
| `/builder` | Builder | Forms to add snippets and shortcuts to state |
| `/reference` | Reference | Searchable/filterable table of all shortcuts |

## Design System
- **Palette**: Monochrome dark background (#08080c) with glassmorphism cards
- **Accent**: Electric blue `#3B82F6` for active states; amber `#F59E0B` for typing cursor
- **Glass cards**: `backdrop-blur`, translucent bg, 24px border-radius
- **Pill radius math**: outer_radius = inner_radius + padding (e.g. 16px button + 4px padding = 20px container)
- **Typography**: Monospace in typing arena/code, Geist Sans elsewhere
- **Selects**: Custom SVG chevron via global CSS (appearance: none)

## Key Features
- **Code mode**: IDE-style panel with line numbers, auto-indent on Enter, smart backspace
- **Words mode**: 3-line scrolling display, timed (15/30/60/120s), punctuation/numbers toggles
- **Shortcut quiz**: Real keystroke capture, keycap tile rendering with live modifier preview
- **KeystrokeInput component**: Captures actual key combos, shows keys as physical tiles

## Commands
- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — run ESLint
