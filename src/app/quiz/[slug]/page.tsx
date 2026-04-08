"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAppState } from "@/context/AppContext";
import KeystrokeInput from "@/components/KeystrokeInput";

export default function QuizPage() {
  const { slug } = useParams<{ slug: string }>();
  const { shortcutDecks, recordQuizResult } = useAppState();

  const deck = shortcutDecks.find((d) => d.slug === slug);
  const shortcuts = deck?.shortcuts ?? [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [isComplete, setIsComplete] = useState(false);

  const current = shortcuts[currentIndex];

  const advance = useCallback(() => {
    setUserInput("");
    setFeedback(null);
    setShowAnswer(false);

    if (currentIndex + 1 >= shortcuts.length) {
      setIsComplete(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, shortcuts.length]);

  useEffect(() => {
    if (feedback === "correct") {
      const timer = setTimeout(advance, 800);
      return () => clearTimeout(timer);
    }
  }, [feedback, advance]);

  const normalize = (s: string) => {
    const parts = s.toLowerCase().replace(/\s+/g, "").split("+");
    const modOrder = ["cmd", "ctrl", "alt", "shift"];
    const mods = parts.filter((p) => modOrder.includes(p)).sort((a, b) => modOrder.indexOf(a) - modOrder.indexOf(b));
    const keys = parts.filter((p) => !modOrder.includes(p));
    return [...mods, ...keys].join("+");
  };

  const handleKeystroke = useCallback(
    (keystroke: string) => {
      if (!current || feedback) return;
      setUserInput(keystroke);

      const isCorrect = normalize(keystroke) === normalize(current.keystroke);
      setFeedback(isCorrect ? "correct" : "incorrect");
      setScore((prev) => ({
        correct: prev.correct + (isCorrect ? 1 : 0),
        total: prev.total + 1,
      }));
      recordQuizResult(isCorrect);

      if (!isCorrect) {
        setShowAnswer(true);
      }
    },
    [current, feedback, recordQuizResult]
  );

  const handleSkip = () => {
    setScore((prev) => ({ ...prev, total: prev.total + 1 }));
    recordQuizResult(false);
    advance();
  };

  const restart = () => {
    setCurrentIndex(0);
    setUserInput("");
    setFeedback(null);
    setShowAnswer(false);
    setScore({ correct: 0, total: 0 });
    setIsComplete(false);
  };

  if (!deck) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Deck not found</h1>
        <div className="glass p-10">
          <p className="text-white/40 text-sm">
            No deck with slug &quot;{slug}&quot;.{" "}
            <Link href="/decks" className="text-blue-400 hover:underline">
              Back to decks
            </Link>
          </p>
        </div>
      </div>
    );
  }

  if (isComplete) {
    const pct = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
    return (
      <div className="space-y-8">
        <h1 className="text-2xl font-bold tracking-tight">{deck.deckName} — Complete</h1>
        <div className="glass space-y-8 p-8 md:p-10">
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-2xl bg-blue-500/[0.08] ring-1 ring-blue-500/20 p-5 text-center">
              <p className="text-4xl font-bold text-blue-400 tabular-nums">{pct}%</p>
              <p className="mt-2 text-xs font-medium text-blue-400/60 uppercase tracking-widest">Accuracy</p>
            </div>
            <div className="rounded-2xl bg-green-500/[0.06] ring-1 ring-green-500/15 p-5 text-center">
              <p className="text-4xl font-bold text-green-400 tabular-nums">{score.correct}</p>
              <p className="mt-2 text-xs font-medium text-green-400/50 uppercase tracking-widest">Correct</p>
            </div>
            <div className="rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06] p-5 text-center">
              <p className="text-4xl font-bold text-white/90 tabular-nums">{score.total}</p>
              <p className="mt-2 text-xs font-medium text-white/30 uppercase tracking-widest">Total</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={restart}
              className="rounded-2xl bg-blue-500 px-6 py-2.5 text-sm font-medium text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all hover:bg-blue-400"
            >
              Try Again
            </button>
            <Link
              href="/decks"
              className="rounded-2xl border border-white/[0.08] px-6 py-2.5 text-sm font-medium text-white/40 transition-all hover:border-white/15 hover:text-white/70"
            >
              All Decks
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/decks" className="text-xs text-white/25 hover:text-white/50 transition-colors">
            &larr; All Decks
          </Link>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">{deck.deckName}</h1>
        </div>
        <span className="text-sm tabular-nums text-white/30 font-medium">
          {currentIndex + 1}<span className="text-white/15"> / </span>{shortcuts.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)] transition-all duration-500 ease-out"
          style={{ width: `${(currentIndex / shortcuts.length) * 100}%` }}
        />
      </div>

      {/* Flashcard */}
      <div
        className={`glass p-8 md:p-10 transition-all duration-300 ${
          feedback === "correct"
            ? "border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.08)]"
            : feedback === "incorrect"
            ? "border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.08)]"
            : ""
        }`}
      >
        <p className="text-xs font-medium uppercase tracking-widest text-white/30">What is the shortcut for</p>
        <p className="mt-3 text-3xl font-semibold text-white/90">{current?.action}</p>

        <div className="mt-8">
          <KeystrokeInput
            value={userInput}
            onChange={handleKeystroke}
            disabled={!!feedback}
            placeholder="Press the key combination..."
            className="w-full py-3.5 text-base"
            autoFocus
          />
        </div>

        {feedback === "correct" && (
          <p className="mt-5 text-sm font-medium text-green-400">Correct!</p>
        )}

        {feedback === "incorrect" && showAnswer && (
          <div className="mt-5 space-y-3">
            <div className="flex items-center gap-2 text-sm text-red-400/80">
              <span>Not quite. The answer is</span>
              <span className="inline-flex items-center gap-1">
                {current?.keystroke.split("+").map((k, i) => (
                  <span key={i} className="flex items-center gap-1">
                    {i > 0 && <span className="text-white/15 text-xs">+</span>}
                    <kbd className="inline-flex items-center justify-center font-mono text-xs font-medium border border-white/[0.08] bg-white/[0.06] text-white/90 px-2 py-1 min-w-[28px]" style={{ borderRadius: 8 }}>
                      {k}
                    </kbd>
                  </span>
                ))}
              </span>
            </div>
            <button
              onClick={advance}
              className="rounded-2xl border border-white/[0.08] px-5 py-2 text-sm text-white/40 transition-all hover:border-white/15 hover:text-white/70"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Score + Skip */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-white/25">
          Score <span className="ml-1 font-medium tabular-nums text-white/50">{score.correct}/{score.total}</span>
        </span>
        <button
          onClick={handleSkip}
          className="text-white/20 transition-colors hover:text-white/50"
        >
          Skip &rarr;
        </button>
      </div>
    </div>
  );
}
