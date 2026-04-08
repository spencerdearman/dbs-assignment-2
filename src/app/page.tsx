"use client";

import { useState, useEffect, useCallback, useRef, useLayoutEffect } from "react";
import { useAppState } from "@/context/AppContext";

/* ── Word bank ── */
const COMMON_WORDS = [
  "the","be","to","of","and","a","in","that","have","it","for","not","on",
  "with","he","as","you","do","at","this","but","his","by","from","they",
  "we","say","her","she","or","an","will","my","one","all","would","there",
  "their","what","so","up","out","if","about","who","get","which","go","me",
  "when","make","can","like","time","no","just","him","know","take","people",
  "into","year","your","good","some","could","them","see","other","than",
  "then","now","look","only","come","its","over","think","also","back",
  "after","use","two","how","our","work","first","well","way","even","new",
  "want","because","any","these","give","day","most","us","great","between",
  "need","large","often","important","while","move","right","still","try",
  "always","every","never","start","city","hand","high","keep","follow",
  "change","place","point","turn","real","under","help","begin","life",
  "world","next","live","state","much","must","through","long","small",
  "number","off","group","own","found","let","here","thing","many","very",
  "name","same","old","line","does","set","open","run","end","both","play",
  "home","read","last","might","story","far","head","left","close","seem",
  "hard","house","school","stand","such","learn","kind","talk","before",
];

const PUNCTUATION_MARKS = [".", ",", ";", ":", "!", "?", "'", '"', "-", "(", ")"];
const DIGITS = ["0","1","2","3","4","5","6","7","8","9"];

/* ── Text generators ── */
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateWords(
  count: number,
  opts: { punctuation: boolean; numbers: boolean }
): string {
  const words: string[] = [];
  for (let i = 0; i < count; i++) {
    if (opts.numbers && Math.random() < 0.08) {
      // occasional number
      const len = Math.random() < 0.5 ? 1 : Math.floor(Math.random() * 3) + 2;
      let num = "";
      for (let d = 0; d < len; d++) num += pick(DIGITS);
      words.push(num);
    } else {
      let word = pick(COMMON_WORDS);
      if (opts.punctuation && Math.random() < 0.12) {
        const mark = pick(PUNCTUATION_MARKS);
        // some marks wrap, most trail
        if (mark === '"' || mark === "'") {
          word = mark + word + mark;
        } else if (mark === "(") {
          word = "(" + word + ")";
        } else {
          word = word + mark;
        }
      }
      words.push(word);
    }
  }
  return words.join(" ");
}

/* ── Types ── */
type TopMode = "words" | "code" | "custom";
type TimerDuration = 15 | 30 | 60 | 120;

/* ── Smooth Caret component ── */
function SmoothCaret({
  charRefs,
  index,
  containerRef,
  targetText,
}: {
  charRefs: React.RefObject<(HTMLSpanElement | null)[]>;
  index: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
  targetText: string;
}) {
  const [pos, setPos] = useState({ left: 0, top: 0, height: 0 });
  const [ready, setReady] = useState(false);

  // Re-measure whenever index changes or text is first rendered
  useLayoutEffect(() => {
    const measure = () => {
      const chars = charRefs.current;
      const container = containerRef.current;
      if (!chars || !container) return;

      const el = chars[index];
      if (el) {
        const cRect = container.getBoundingClientRect();
        const eRect = el.getBoundingClientRect();
        setPos({
          left: eRect.left - cRect.left,
          top: eRect.top - cRect.top,
          height: eRect.height,
        });
        setReady(true);
      } else if (index > 0 && chars[index - 1]) {
        const cRect = container.getBoundingClientRect();
        const eRect = chars[index - 1]!.getBoundingClientRect();
        setPos({
          left: eRect.right - cRect.left,
          top: eRect.top - cRect.top,
          height: eRect.height,
        });
        setReady(true);
      }
    };

    // Measure immediately, then also after a frame to catch late ref assignments
    measure();
    const raf = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(raf);
  }, [index, charRefs, containerRef, targetText]);

  return (
    <span
      className="pointer-events-none absolute w-[2.5px] rounded-full bg-blue-500"
      style={{
        left: pos.left,
        top: pos.top,
        height: pos.height || 28,
        opacity: ready ? 1 : 0,
        transition: ready
          ? "left 80ms ease-out, top 60ms ease-out, opacity 150ms"
          : "opacity 150ms",
        animation: "caret-blink 1s step-end infinite",
      }}
    />
  );
}

/* ── Main component ── */
export default function TypingArena() {
  const { typingSnippets, updatePersonalBest, recordWpm } = useAppState();

  /* ── Top-level mode ── */
  const [topMode, setTopMode] = useState<TopMode>("words");

  /* ── Words mode options ── */
  const [timerDuration, setTimerDuration] = useState<TimerDuration>(30);
  const [punctuation, setPunctuation] = useState(false);
  const [numbers, setNumbers] = useState(false);

  /* ── Code mode options ── */
  const [selectedSnippetId, setSelectedSnippetId] = useState(typingSnippets[0]?.id ?? "");

  /* ── Custom mode ── */
  const [customText, setCustomText] = useState("");
  const [customSubmitted, setCustomSubmitted] = useState(false);

  /* ── Core state ── */
  const [targetText, setTargetText] = useState("");
  const [typedChars, setTypedChars] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── Load / reload text ── */
  const loadText = useCallback(() => {
    setTypedChars([]);
    setIsRunning(false);
    setIsFinished(false);
    setStartTime(null);
    setElapsed(0);
    charRefs.current = [];

    if (topMode === "words") {
      setTargetText(generateWords(200, { punctuation, numbers }));
      setTimeLeft(timerDuration);
    } else if (topMode === "code") {
      const snippet = typingSnippets.find((s) => s.id === selectedSnippetId);
      setTargetText(snippet?.text ?? "");
    } else if (topMode === "custom") {
      if (customSubmitted && customText.trim()) {
        setTargetText(customText.trim());
      }
    }
  }, [topMode, timerDuration, punctuation, numbers, selectedSnippetId, typingSnippets, customText, customSubmitted]);

  useEffect(() => {
    loadText();
  }, [loadText]);

  /* ── Timer ── */
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (isRunning && !isFinished) {
      intervalRef.current = setInterval(() => {
        if (topMode === "words") {
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
  }, [isRunning, isFinished, topMode]);

  /* ── Keystroke handler ── */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFinished) return;
      if (!targetText) return;
      // Allow cmd/ctrl shortcuts through
      if (e.metaKey || e.ctrlKey || e.altKey) return;
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
        // Finish for non-timed modes when text is fully typed
        if (topMode !== "words" && next.length >= targetText.length) {
          setIsFinished(true);
          setIsRunning(false);
        }
        return next;
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRunning, isFinished, targetText, topMode]);

  /* ── Focus on load ── */
  useEffect(() => {
    containerRef.current?.focus();
  }, [targetText]);

  /* ── Stats ── */
  const correctChars = typedChars.filter((ch, i) => ch === targetText[i]).length;
  const totalTyped = typedChars.length;
  const effectiveElapsed = startTime ? (Date.now() - startTime) / 1000 : 0;
  const minutes = effectiveElapsed / 60;
  const wpm = minutes > 0 ? Math.round(correctChars / 5 / minutes) : 0;
  const accuracy = totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 100;

  /* ── Record on finish ── */
  useEffect(() => {
    if (isFinished && wpm > 0) {
      recordWpm(wpm);
      if (topMode === "code" && selectedSnippetId) {
        updatePersonalBest(selectedSnippetId, wpm);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinished]);

  const selectedSnippet = typingSnippets.find((s) => s.id === selectedSnippetId);

  /* ── Toggle helper ── */
  const toggleBtn = (active: boolean, label: string, onClick: () => void) => (
    <button
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 text-[13px] font-medium transition-all duration-200 ${
        active
          ? "bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/30"
          : "text-white/35 hover:text-white/60"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6 outline-none" ref={containerRef} tabIndex={-1}>
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Typing Arena</h1>
        {isRunning && (
          <div className="font-mono text-2xl tabular-nums font-light">
            {topMode === "words" ? (
              <span className={timeLeft <= 5 ? "text-red-400" : "text-blue-400"}>{timeLeft}</span>
            ) : (
              <span className="text-white/60">{elapsed}s</span>
            )}
          </div>
        )}
      </div>

      {/* ── Controls bar ── */}
      <div className="glass flex flex-wrap items-center gap-3 p-3">
        {/* Top mode selector */}
        <div className="flex gap-0.5 rounded-xl bg-white/[0.04] p-1">
          {(["words", "code", "custom"] as TopMode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setTopMode(m); setCustomSubmitted(false); }}
              className={`rounded-lg px-3.5 py-1.5 text-[13px] font-medium capitalize transition-all duration-200 ${
                topMode === m
                  ? "bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* ── Words mode options ── */}
        {topMode === "words" && (
          <>
            {/* Time selector */}
            <div className="flex gap-0.5 rounded-xl bg-white/[0.04] p-1">
              {([15, 30, 60, 120] as TimerDuration[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setTimerDuration(d)}
                  className={`rounded-lg px-2.5 py-1 text-[13px] font-medium transition-all duration-200 ${
                    timerDuration === d
                      ? "bg-white/10 text-white"
                      : "text-white/30 hover:text-white/60"
                  }`}
                >
                  {d}s
                </button>
              ))}
            </div>

            <span className="text-white/10">|</span>

            {toggleBtn(punctuation, "@ punctuation", () => setPunctuation((p) => !p))}
            {toggleBtn(numbers, "# numbers", () => setNumbers((n) => !n))}
          </>
        )}

        {/* ── Code mode options ── */}
        {topMode === "code" && (
          <select
            value={selectedSnippetId}
            onChange={(e) => setSelectedSnippetId(e.target.value)}
            className="rounded-xl border border-white/[0.06] bg-white/[0.04] px-3 py-1.5 text-[13px] text-white outline-none transition-colors focus:border-blue-500/50"
          >
            {typingSnippets.map((s) => (
              <option key={s.id} value={s.id} className="bg-[#08080c]">
                {s.title}
              </option>
            ))}
          </select>
        )}

        {/* ── Custom mode input ── */}
        {topMode === "custom" && !customSubmitted && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (customText.trim()) setCustomSubmitted(true);
            }}
            className="flex flex-1 gap-2"
          >
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Paste or type your custom text..."
              className="flex-1 rounded-xl border border-white/[0.06] bg-white/[0.04] px-3 py-1.5 text-[13px] text-white outline-none placeholder:text-white/25 transition-colors focus:border-blue-500/50"
            />
            <button
              type="submit"
              className="rounded-xl bg-blue-500 px-4 py-1.5 text-[13px] font-medium text-white shadow-[0_0_10px_rgba(59,130,246,0.3)] transition-all hover:bg-blue-400"
            >
              Go
            </button>
          </form>
        )}

        {/* Reset */}
        <button
          onClick={() => {
            if (topMode === "custom") setCustomSubmitted(false);
            loadText();
          }}
          className="ml-auto rounded-xl border border-white/[0.06] px-3 py-1.5 text-[13px] text-white/30 transition-all duration-200 hover:border-white/15 hover:text-white/60"
        >
          {topMode === "custom" && customSubmitted ? "Change text" : "Reset"}
        </button>
      </div>

      {/* ── Typing display ── */}
      {!isFinished && targetText ? (
        <div className="glass relative cursor-text overflow-hidden p-8 md:p-10">
          <div
            ref={textRef}
            className="relative font-mono text-[1.35rem] leading-[2.2] tracking-[0.02em] select-none"
          >
            <SmoothCaret
              charRefs={charRefs}
              index={typedChars.length}
              containerRef={textRef}
              targetText={targetText}
            />
            {targetText.split("").map((char, i) => {
              let colorClass = "text-white/20";
              if (i < typedChars.length) {
                colorClass =
                  typedChars[i] === char
                    ? "text-white"
                    : "text-red-400 bg-red-500/10 rounded-sm";
              }
              return (
                <span
                  key={i}
                  ref={(el) => { charRefs.current[i] = el; }}
                  className={colorClass}
                >
                  {char}
                </span>
              );
            })}
          </div>
          {!isRunning && typedChars.length === 0 && (
            <p className="mt-6 text-[13px] text-white/20 tracking-wide">
              Start typing to begin...
            </p>
          )}
        </div>
      ) : isFinished ? (
        /* ── Results card ── */
        <div className="glass space-y-8 p-8 md:p-10">
          <h2 className="text-lg font-semibold text-white/70 tracking-wide uppercase">Results</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl bg-blue-500/[0.08] ring-1 ring-blue-500/20 p-5 text-center">
              <p className="text-4xl font-bold text-blue-400 tabular-nums">{wpm}</p>
              <p className="mt-2 text-xs font-medium text-blue-400/60 uppercase tracking-widest">WPM</p>
            </div>
            <div className="rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06] p-5 text-center">
              <p className="text-4xl font-bold text-white/90 tabular-nums">{accuracy}%</p>
              <p className="mt-2 text-xs font-medium text-white/30 uppercase tracking-widest">Accuracy</p>
            </div>
            <div className="rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06] p-5 text-center">
              <p className="text-4xl font-bold text-white/90 tabular-nums">{correctChars}</p>
              <p className="mt-2 text-xs font-medium text-white/30 uppercase tracking-widest">Correct</p>
            </div>
            <div className="rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06] p-5 text-center">
              <p className="text-4xl font-bold text-white/90 tabular-nums">{Math.round(effectiveElapsed)}s</p>
              <p className="mt-2 text-xs font-medium text-white/30 uppercase tracking-widest">Time</p>
            </div>
          </div>
          {topMode === "code" && selectedSnippet?.personalBestWPM && (
            <p className="text-sm text-white/35">
              Personal Best: <span className="text-blue-400 font-medium">{selectedSnippet.personalBestWPM} WPM</span>
            </p>
          )}
          <button
            onClick={() => {
              if (topMode === "custom") setCustomSubmitted(true);
              loadText();
            }}
            className="rounded-xl bg-blue-500 px-6 py-2.5 text-sm font-medium text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all hover:bg-blue-400 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]"
          >
            Try Again
          </button>
        </div>
      ) : topMode === "custom" && !customSubmitted ? (
        <div className="glass p-10 text-center text-white/25 text-sm">
          Enter your custom text above and click Go.
        </div>
      ) : null}

      {/* ── Live stats ── */}
      {isRunning && (
        <div className="flex gap-8 text-[13px] text-white/30">
          <span>WPM <span className="ml-1 text-white/60 tabular-nums font-medium">{wpm}</span></span>
          <span>Accuracy <span className="ml-1 text-white/60 tabular-nums font-medium">{accuracy}%</span></span>
          <span>Chars <span className="ml-1 text-white/60 tabular-nums font-medium">{totalTyped}</span></span>
        </div>
      )}
    </div>
  );
}
