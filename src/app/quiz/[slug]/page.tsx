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

  // Auto-advance after correct answer
  useEffect(() => {
    if (feedback === "correct") {
      const timer = setTimeout(advance, 800);
      return () => clearTimeout(timer);
    }
  }, [feedback, advance]);

  // Normalize keystroke for comparison: lowercase, no spaces, sort modifiers
  const normalize = (s: string) => {
    const parts = s.toLowerCase().replace(/\s+/g, "").split("+");
    const modOrder = ["cmd", "ctrl", "alt", "shift"];
    const mods = parts.filter((p) => modOrder.includes(p)).sort((a, b) => modOrder.indexOf(a) - modOrder.indexOf(b));
    const keys = parts.filter((p) => !modOrder.includes(p));
    return [...mods, ...keys].join("+");
  };

  // Auto-check when keystroke is captured
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
        <div className="glass p-8">
          <p className="text-white/50">
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
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">{deck.deckName} — Complete</h1>
        <div className="glass space-y-6 p-8">
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-white/5 p-4 text-center">
              <p className="text-3xl font-bold text-blue-500">{pct}%</p>
              <p className="mt-1 text-sm text-white/50">Accuracy</p>
            </div>
            <div className="rounded-lg bg-white/5 p-4 text-center">
              <p className="text-3xl font-bold text-green-400">{score.correct}</p>
              <p className="mt-1 text-sm text-white/50">Correct</p>
            </div>
            <div className="rounded-lg bg-white/5 p-4 text-center">
              <p className="text-3xl font-bold text-white">{score.total}</p>
              <p className="mt-1 text-sm text-white/50">Total</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={restart}
              className="rounded-lg bg-blue-500 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
            >
              Try Again
            </button>
            <Link
              href="/decks"
              className="rounded-lg border border-white/10 px-6 py-2 text-sm font-medium text-white/50 transition-colors hover:border-white/20 hover:text-white/80"
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
        <h1 className="text-2xl font-bold tracking-tight">{deck.deckName}</h1>
        <span className="text-sm text-white/40">
          {currentIndex + 1} / {shortcuts.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-blue-500 transition-all duration-300"
          style={{ width: `${(currentIndex / shortcuts.length) * 100}%` }}
        />
      </div>

      {/* Flashcard */}
      <div
        className={`glass p-8 transition-all duration-300 ${
          feedback === "correct"
            ? "border-green-500/40"
            : feedback === "incorrect"
            ? "border-red-500/40"
            : ""
        }`}
      >
        <p className="text-sm font-medium text-white/40">What is the shortcut for:</p>
        <p className="mt-2 text-2xl font-semibold text-white">{current?.action}</p>

        <div className="mt-6">
          <KeystrokeInput
            value={userInput}
            onChange={handleKeystroke}
            disabled={!!feedback}
            placeholder="Press the key combination..."
            className="w-full py-3 text-base"
            autoFocus
          />
        </div>

        {/* Feedback */}
        {feedback === "correct" && (
          <p className="mt-4 text-sm font-medium text-green-400">Correct!</p>
        )}

        {feedback === "incorrect" && showAnswer && (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium text-red-400">
              Incorrect. The answer is:{" "}
              <kbd className="rounded bg-white/10 px-2 py-0.5 font-mono text-white">{current?.keystroke}</kbd>
            </p>
            <button
              onClick={advance}
              className="rounded-lg border border-white/10 px-4 py-1.5 text-sm text-white/50 transition-colors hover:border-white/20 hover:text-white/80"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Score + Skip */}
      <div className="flex items-center justify-between text-sm text-white/40">
        <span>
          Score: <span className="text-white/70">{score.correct}/{score.total}</span>
        </span>
        <button
          onClick={handleSkip}
          className="text-white/30 transition-colors hover:text-white/60"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
