"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAppState } from "@/context/AppContext";

const COMMON_WORDS = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "it",
  "for", "not", "on", "with", "he", "as", "you", "do", "at", "this",
  "but", "his", "by", "from", "they", "we", "say", "her", "she", "or",
  "an", "will", "my", "one", "all", "would", "there", "their", "what",
  "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
  "when", "make", "can", "like", "time", "no", "just", "him", "know",
  "take", "people", "into", "year", "your", "good", "some", "could",
  "them", "see", "other", "than", "then", "now", "look", "only", "come",
  "its", "over", "think", "also", "back", "after", "use", "two", "how",
  "our", "work", "first", "well", "way", "even", "new", "want", "because",
  "any", "these", "give", "day", "most", "us", "great", "between", "need",
  "large", "often", "important", "while", "move", "right", "still", "try",
  "always", "every", "never", "start", "city", "hand", "high", "keep",
  "follow", "change", "place", "point", "turn", "real", "under", "help",
  "begin", "life", "world", "next", "live", "state", "much", "must",
];

type Mode = "snippet" | "random" | "timed";
type TimerDuration = 15 | 30 | 60;

function generateRandomText(wordCount: number): string {
  const words: string[] = [];
  for (let i = 0; i < wordCount; i++) {
    words.push(COMMON_WORDS[Math.floor(Math.random() * COMMON_WORDS.length)]);
  }
  return words.join(" ");
}

export default function TypingArena() {
  const { typingSnippets, updatePersonalBest, recordWpm } = useAppState();

  const [mode, setMode] = useState<Mode>("snippet");
  const [selectedSnippetId, setSelectedSnippetId] = useState(typingSnippets[0]?.id ?? "");
  const [timerDuration, setTimerDuration] = useState<TimerDuration>(30);
  const [targetText, setTargetText] = useState("");
  const [typedChars, setTypedChars] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load target text based on mode
  const loadText = useCallback(() => {
    setTypedChars([]);
    setIsRunning(false);
    setIsFinished(false);
    setStartTime(null);
    setElapsed(0);

    if (mode === "snippet") {
      const snippet = typingSnippets.find((s) => s.id === selectedSnippetId);
      setTargetText(snippet?.text ?? "");
    } else if (mode === "random") {
      setTargetText(generateRandomText(50));
    } else {
      setTargetText(generateRandomText(200));
      setTimeLeft(timerDuration);
    }
  }, [mode, selectedSnippetId, timerDuration, typingSnippets]);

  useEffect(() => {
    loadText();
  }, [loadText]);

  // Timer logic
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (isRunning && !isFinished) {
      intervalRef.current = setInterval(() => {
        if (mode === "timed") {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              setIsFinished(true);
              setIsRunning(false);
              return 0;
            }
            return prev - 1;
          });
        }
        setElapsed((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, isFinished, mode]);

  // Keystroke handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFinished) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "Tab" || e.key === "Escape") return;

      e.preventDefault();

      if (e.key === "Backspace") {
        setTypedChars((prev) => prev.slice(0, -1));
        return;
      }

      if (e.key.length !== 1) return;

      if (!isRunning) {
        setIsRunning(true);
        setStartTime(Date.now());
      }

      setTypedChars((prev) => {
        const next = [...prev, e.key];
        // Check if done (non-timed modes)
        if (mode !== "timed" && next.length >= targetText.length) {
          setIsFinished(true);
          setIsRunning(false);
        }
        return next;
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRunning, isFinished, targetText, mode]);

  // Focus container on mount
  useEffect(() => {
    containerRef.current?.focus();
  }, [targetText]);

  // Calculate results
  const correctChars = typedChars.filter((ch, i) => ch === targetText[i]).length;
  const totalTyped = typedChars.length;
  const effectiveElapsed = startTime ? (Date.now() - startTime) / 1000 : 0;
  const minutes = effectiveElapsed / 60;
  const wpm = minutes > 0 ? Math.round(correctChars / 5 / minutes) : 0;
  const accuracy = totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 100;

  // Record results on finish
  useEffect(() => {
    if (isFinished && wpm > 0) {
      recordWpm(wpm);
      if (mode === "snippet" && selectedSnippetId) {
        updatePersonalBest(selectedSnippetId, wpm);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinished]);

  const selectedSnippet = typingSnippets.find((s) => s.id === selectedSnippetId);

  return (
    <div className="space-y-6" ref={containerRef} tabIndex={-1}>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Typing Arena</h1>
        {isRunning && (
          <div className="font-mono text-lg tabular-nums text-white/70">
            {mode === "timed" ? (
              <span className={timeLeft <= 5 ? "text-red-400" : ""}>{timeLeft}s</span>
            ) : (
              <span>{elapsed}s</span>
            )}
          </div>
        )}
      </div>

      {/* Mode Selector */}
      <div className="glass flex flex-wrap items-center gap-3 p-4">
        <div className="flex gap-1 rounded-lg bg-white/5 p-1">
          {(["snippet", "random", "timed"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                mode === m
                  ? "bg-blue-500 text-white"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              {m === "snippet" ? "Snippet" : m === "random" ? "Random" : "Timed"}
            </button>
          ))}
        </div>

        {mode === "snippet" && (
          <select
            value={selectedSnippetId}
            onChange={(e) => setSelectedSnippetId(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white outline-none focus:border-blue-500"
          >
            {typingSnippets.map((s) => (
              <option key={s.id} value={s.id} className="bg-[#0a0a0f]">
                {s.title}
              </option>
            ))}
          </select>
        )}

        {mode === "timed" && (
          <div className="flex gap-1 rounded-lg bg-white/5 p-1">
            {([15, 30, 60] as TimerDuration[]).map((d) => (
              <button
                key={d}
                onClick={() => setTimerDuration(d)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  timerDuration === d
                    ? "bg-blue-500 text-white"
                    : "text-white/50 hover:text-white/80"
                }`}
              >
                {d}s
              </button>
            ))}
          </div>
        )}

        <button
          onClick={loadText}
          className="ml-auto rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white/50 transition-colors hover:border-white/20 hover:text-white/80"
        >
          Reset
        </button>
      </div>

      {/* Typing Display */}
      {!isFinished ? (
        <div className="glass cursor-text p-6 md:p-8">
          <div className="font-mono text-lg leading-relaxed tracking-wide select-none">
            {targetText.split("").map((char, i) => {
              let color = "text-white/30";
              if (i < typedChars.length) {
                color = typedChars[i] === char ? "text-white" : "text-red-400";
              }
              const isCursor = i === typedChars.length;
              return (
                <span key={i} className={`${color} relative`}>
                  {isCursor && (
                    <span className="absolute left-0 top-0 h-full w-[2px] animate-pulse bg-blue-500" />
                  )}
                  {char}
                </span>
              );
            })}
          </div>
          {!isRunning && !isFinished && typedChars.length === 0 && (
            <p className="mt-4 text-sm text-white/30">Start typing to begin...</p>
          )}
        </div>
      ) : (
        /* Results Card */
        <div className="glass space-y-6 p-8">
          <h2 className="text-xl font-semibold">Results</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg bg-white/5 p-4 text-center">
              <p className="text-3xl font-bold text-blue-500">{wpm}</p>
              <p className="mt-1 text-sm text-white/50">WPM</p>
            </div>
            <div className="rounded-lg bg-white/5 p-4 text-center">
              <p className="text-3xl font-bold text-white">{accuracy}%</p>
              <p className="mt-1 text-sm text-white/50">Accuracy</p>
            </div>
            <div className="rounded-lg bg-white/5 p-4 text-center">
              <p className="text-3xl font-bold text-white">{correctChars}</p>
              <p className="mt-1 text-sm text-white/50">Correct</p>
            </div>
            <div className="rounded-lg bg-white/5 p-4 text-center">
              <p className="text-3xl font-bold text-white">{Math.round(effectiveElapsed)}s</p>
              <p className="mt-1 text-sm text-white/50">Time</p>
            </div>
          </div>
          {mode === "snippet" && selectedSnippet?.personalBestWPM && (
            <p className="text-sm text-white/40">
              Personal Best: <span className="text-blue-400">{selectedSnippet.personalBestWPM} WPM</span>
            </p>
          )}
          <button
            onClick={loadText}
            className="rounded-lg bg-blue-500 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Live Stats Bar */}
      {isRunning && (
        <div className="flex gap-6 text-sm text-white/40">
          <span>WPM: <span className="text-white/70">{wpm}</span></span>
          <span>Accuracy: <span className="text-white/70">{accuracy}%</span></span>
          <span>Chars: <span className="text-white/70">{totalTyped}</span></span>
        </div>
      )}
    </div>
  );
}
