"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAppState } from "@/context/AppContext";

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

  // Clear feedback after delay and advance
  useEffect(() => {
    if (feedback === "correct") {
      const timer = setTimeout(advance, 800);
      return () => clearTimeout(timer);
    }
  }, [feedback, advance]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!current || feedback) return;

    const normalized = userInput.trim().toLowerCase().replace(/\s+/g, "");
    const expected = current.keystroke.toLowerCase().replace(/\s+/g, "");

    const isCorrect = normalized === expected;
    setFeedback(isCorrect ? "correct" : "incorrect");
    setScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));
    recordQuizResult(isCorrect);

    if (!isCorrect) {
      setShowAnswer(true);
    }
  };

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
          style={{ width: `${((currentIndex) / shortcuts.length) * 100}%` }}
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

        <form onSubmit={handleSubmit} className="mt-6 flex gap-3">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type the keystroke (e.g. Cmd+S)"
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-blue-500 transition-colors"
            autoFocus
            disabled={!!feedback}
          />
          <button
            type="submit"
            disabled={!userInput.trim() || !!feedback}
            className="rounded-lg bg-blue-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-600 disabled:opacity-40"
          >
            Check
          </button>
        </form>

        {/* Feedback */}
        {feedback === "correct" && (
          <p className="mt-4 text-sm font-medium text-green-400">Correct!</p>
        )}

        {feedback === "incorrect" && showAnswer && (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium text-red-400">
              Incorrect. The answer is:{" "}
              <span className="font-mono text-white">{current?.keystroke}</span>
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
