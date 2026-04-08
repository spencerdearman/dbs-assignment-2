"use client";

import { useState, useEffect, useCallback, useRef, useLayoutEffect, useMemo } from "react";
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

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateWords(count: number, opts: { punctuation: boolean; numbers: boolean }): string {
  const words: string[] = [];
  for (let i = 0; i < count; i++) {
    if (opts.numbers && Math.random() < 0.08) {
      const len = Math.random() < 0.5 ? 1 : Math.floor(Math.random() * 3) + 2;
      let num = "";
      for (let d = 0; d < len; d++) num += pick(DIGITS);
      words.push(num);
    } else {
      let word = pick(COMMON_WORDS);
      if (opts.punctuation && Math.random() < 0.12) {
        const mark = pick(PUNCTUATION_MARKS);
        if (mark === '"' || mark === "'") word = mark + word + mark;
        else if (mark === "(") word = "(" + word + ")";
        else word = word + mark;
      }
      words.push(word);
    }
  }
  return words.join(" ");
}

/* ── Types ── */
type TopMode = "words" | "code" | "custom";
type TimerDuration = 15 | 30 | 60 | 120;

const LINE_HEIGHT = 56;
const VISIBLE_LINES = 3;
const CODE_LINE_HEIGHT = 28;

/* ── Smooth Caret ── */
function SmoothCaret({
  charRefs, index, containerRef, targetText, isTyping,
}: {
  charRefs: React.RefObject<(HTMLSpanElement | null)[]>;
  index: number;
  containerRef: React.RefObject<HTMLElement | null>;
  targetText: string;
  isTyping: boolean;
}) {
  const [pos, setPos] = useState({ left: 0, top: 0, height: 0 });
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    const measure = () => {
      const chars = charRefs.current;
      const container = containerRef.current;
      if (!chars || !container) return;
      const el = chars[index];
      if (el) {
        const cRect = container.getBoundingClientRect();
        const eRect = el.getBoundingClientRect();
        setPos({ left: eRect.left - cRect.left, top: eRect.top - cRect.top, height: eRect.height });
        setReady(true);
      } else if (index > 0 && chars[index - 1]) {
        const cRect = container.getBoundingClientRect();
        const eRect = chars[index - 1]!.getBoundingClientRect();
        setPos({ left: eRect.right - cRect.left, top: eRect.top - cRect.top, height: eRect.height });
        setReady(true);
      }
    };
    measure();
    const raf = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(raf);
  }, [index, charRefs, containerRef, targetText]);

  return (
    <span
      className="pointer-events-none absolute w-[2.5px] rounded-full bg-amber-400"
      style={{
        left: pos.left,
        top: pos.top,
        height: pos.height || 24,
        opacity: ready ? 1 : 0,
        transition: ready ? "left 80ms ease-out, top 60ms ease-out, opacity 150ms" : "opacity 150ms",
        animation: isTyping ? "none" : "caret-blink 1s step-end infinite",
      }}
    />
  );
}

/* ── Language-aware syntax coloring for untyped chars ── */
const KEYWORDS: Record<string, Set<string>> = {
  JavaScript: new Set(["const","let","var","function","return","if","else","for","while","class","new","this","import","export","from","async","await","try","catch","throw","typeof","instanceof","of","in","true","false","null","undefined"]),
  TypeScript: new Set(["const","let","var","function","return","if","else","for","while","class","new","this","import","export","from","async","await","try","catch","throw","typeof","instanceof","of","in","true","false","null","undefined","interface","type","enum","extends","implements","readonly","as","keyof","Promise","string","number","boolean","void","any","never"]),
  Python: new Set(["def","class","return","if","else","elif","for","while","import","from","as","with","try","except","raise","in","not","and","or","is","None","True","False","self","lambda","yield","pass","break","continue","global"]),
  Swift: new Set(["func","var","let","struct","class","enum","protocol","return","if","else","for","while","switch","case","import","guard","self","true","false","nil","in","throws","async","await","init","deinit","extension","where","default"]),
  C: new Set(["int","char","float","double","void","return","if","else","for","while","do","switch","case","break","continue","struct","typedef","sizeof","malloc","free","NULL","const","static","extern","unsigned","long","short","include"]),
  "C++": new Set(["int","char","float","double","void","return","if","else","for","while","do","switch","case","break","continue","class","struct","template","typename","public","private","protected","virtual","override","const","static","new","delete","this","auto","using","namespace","std","true","false","nullptr","include"]),
  Rust: new Set(["fn","let","mut","const","struct","enum","impl","trait","pub","return","if","else","for","while","loop","match","use","mod","self","Self","true","false","Some","None","Ok","Err","where","move","ref","as","in","type"]),
  Go: new Set(["func","var","const","type","struct","interface","return","if","else","for","range","switch","case","break","continue","package","import","go","defer","chan","map","nil","true","false","err"]),
  Java: new Set(["public","private","protected","static","final","class","interface","enum","extends","implements","return","if","else","for","while","new","this","super","void","int","String","boolean","double","float","long","import","package","try","catch","throw","throws","null","true","false","record"]),
  Ruby: new Set(["def","class","module","end","if","else","elsif","unless","while","until","for","do","return","nil","true","false","self","puts","require","attr_accessor","attr_reader","initialize","yield","block","lambda","proc"]),
};

function getWordAt(text: string, pos: number): string {
  let start = pos;
  while (start > 0 && /[a-zA-Z_]/.test(text[start - 1])) start--;
  let end = pos;
  while (end < text.length && /[a-zA-Z_]/.test(text[end])) end++;
  return text.slice(start, end);
}

/* ── Main component ── */
export default function TypingArena() {
  const { typingSnippets, codeSnippets, updatePersonalBest, updateCodeBest, recordWpm } = useAppState();

  const [topMode, setTopMode] = useState<TopMode>("words");
  const [timerDuration, setTimerDuration] = useState<TimerDuration>(30);
  const [punctuation, setPunctuation] = useState(false);
  const [numbers, setNumbers] = useState(false);
  const [selectedCodeId, setSelectedCodeId] = useState(codeSnippets[0]?.id ?? "");
  const [customText, setCustomText] = useState("");
  const [customSubmitted, setCustomSubmitted] = useState(false);

  const [targetText, setTargetText] = useState("");
  const [typedChars, setTypedChars] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [scrollOffset, setScrollOffset] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const codePreRef = useRef<HTMLPreElement>(null);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const selectedCode = codeSnippets.find((s) => s.id === selectedCodeId);
  const isCodeMode = topMode === "code";

  // Get unique languages for filtering
  const languages = useMemo(() => {
    const langs = [...new Set(codeSnippets.map((s) => s.language))];
    return langs.sort();
  }, [codeSnippets]);

  const [selectedLang, setSelectedLang] = useState<string>("all");
  const filteredSnippets = useMemo(() => {
    if (selectedLang === "all") return codeSnippets;
    return codeSnippets.filter((s) => s.language === selectedLang);
  }, [codeSnippets, selectedLang]);

  // Build keyword set for current language
  const currentKeywords = useMemo(() => {
    if (!isCodeMode || !selectedCode) return new Set<string>();
    return KEYWORDS[selectedCode.language] ?? new Set<string>();
  }, [isCodeMode, selectedCode]);

  /* ── Line scroll for words mode ── */
  useLayoutEffect(() => {
    if (isCodeMode) return;
    const chars = charRefs.current;
    const container = textRef.current;
    if (!chars || !container || chars.length === 0) return;
    const cursorEl = chars[typedChars.length] ?? chars[chars.length - 1];
    if (!cursorEl) return;
    const containerTop = container.getBoundingClientRect().top;
    const charTop = cursorEl.getBoundingClientRect().top;
    const relativeTop = charTop - containerTop + scrollOffset;
    const currentLine = Math.floor(relativeTop / LINE_HEIGHT);
    if (currentLine >= 1) setScrollOffset(currentLine * LINE_HEIGHT);
  }, [typedChars.length, targetText, scrollOffset, isCodeMode]);

  const loadText = useCallback(() => {
    setTypedChars([]);
    setIsRunning(false);
    setIsFinished(false);
    setStartTime(null);
    setElapsed(0);
    setScrollOffset(0);
    charRefs.current = [];

    if (topMode === "words") {
      setTargetText(generateWords(200, { punctuation, numbers }));
      setTimeLeft(timerDuration);
    } else if (topMode === "code") {
      const snippet = codeSnippets.find((s) => s.id === selectedCodeId);
      setTargetText(snippet?.text ?? "");
    } else if (topMode === "custom") {
      if (customSubmitted && customText.trim()) setTargetText(customText.trim());
    }
  }, [topMode, timerDuration, punctuation, numbers, selectedCodeId, codeSnippets, customText, customSubmitted]);

  useEffect(() => { loadText(); }, [loadText]);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (isRunning && !isFinished) {
      intervalRef.current = setInterval(() => {
        if (topMode === "words") {
          setTimeLeft((prev) => {
            if (prev <= 1) { setIsFinished(true); setIsRunning(false); return 0; }
            return prev - 1;
          });
        }
        setElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, isFinished, topMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFinished || !targetText) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      // In code mode, allow Tab and Enter
      if (!isCodeMode && (e.key === "Tab" || e.key === "Escape")) return;
      if (isCodeMode && e.key === "Escape") return;

      e.preventDefault();

      /* ── Code mode: editor-like behavior ── */
      if (isCodeMode) {
        const pos = typedChars.length;

        if (e.key === "Backspace") {
          // Smart backspace: if cursor is in leading whitespace of a line,
          // delete back to the newline (undo the whole auto-indent at once)
          setTypedChars((prev) => {
            if (prev.length === 0) return prev;
            const lastIdx = prev.length - 1;
            // Check if we're in leading whitespace after a \n
            let wsStart = lastIdx;
            while (wsStart > 0 && (prev[wsStart] === " " || prev[wsStart] === "\t")) wsStart--;
            if (wsStart >= 0 && prev[wsStart] === "\n" && wsStart < lastIdx) {
              // Delete the whole auto-indented whitespace + the newline
              return prev.slice(0, wsStart);
            }
            return prev.slice(0, -1);
          });
          return;
        }

        if (e.key === "Enter") {
          // Auto-indent: insert \n plus all leading whitespace of the next line
          if (pos < targetText.length && targetText[pos] === "\n") {
            if (!isRunning) { setIsRunning(true); setStartTime(Date.now()); }
            setTypedChars((prev) => {
              const chars = [...prev, "\n"];
              // Consume all leading whitespace on the next line
              let nextPos = pos + 1;
              while (nextPos < targetText.length && (targetText[nextPos] === " " || targetText[nextPos] === "\t")) {
                chars.push(targetText[nextPos]);
                nextPos++;
              }
              if (chars.length >= targetText.length) {
                setIsFinished(true); setIsRunning(false);
              }
              return chars;
            });
          }
          return;
        }

        if (e.key === "Tab") {
          // Insert any upcoming whitespace block at current position
          const upcoming = targetText.slice(pos);
          const wsMatch = upcoming.match(/^( +|\t+)/);
          if (wsMatch) {
            if (!isRunning) { setIsRunning(true); setStartTime(Date.now()); }
            setTypedChars((prev) => {
              const next = [...prev, ...wsMatch[0].split("")];
              if (next.length >= targetText.length) {
                setIsFinished(true); setIsRunning(false);
              }
              return next;
            });
          }
          return;
        }

        // Regular character in code mode
        if (e.key.length !== 1) return;
        if (!isRunning) { setIsRunning(true); setStartTime(Date.now()); }
        setTypedChars((prev) => {
          const next = [...prev, e.key];
          if (next.length >= targetText.length) {
            setIsFinished(true); setIsRunning(false);
          }
          return next;
        });
        return;
      }

      /* ── Words / custom mode ── */
      if (e.key === "Backspace") {
        setTypedChars((prev) => prev.slice(0, -1));
        return;
      }
      if (e.key.length !== 1) return;

      if (!isRunning) { setIsRunning(true); setStartTime(Date.now()); }

      setTypedChars((prev) => {
        const next = [...prev, e.key];
        if (topMode !== "words" && next.length >= targetText.length) {
          setIsFinished(true); setIsRunning(false);
        }
        return next;
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRunning, isFinished, targetText, topMode, isCodeMode, typedChars.length]);

  useEffect(() => { containerRef.current?.focus(); }, [targetText]);

  const correctChars = typedChars.filter((ch, i) => ch === targetText[i]).length;
  const totalTyped = typedChars.length;
  const effectiveElapsed = startTime ? (Date.now() - startTime) / 1000 : 0;
  const minutes = effectiveElapsed / 60;
  const wpm = minutes > 0 ? Math.round(correctChars / 5 / minutes) : 0;
  const accuracy = totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 100;

  useEffect(() => {
    if (isFinished && wpm > 0) {
      recordWpm(wpm);
      if (topMode === "code" && selectedCodeId) updateCodeBest(selectedCodeId, wpm);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinished]);

  const toggleBtn = (active: boolean, label: string, onClick: () => void) => (
    <button
      onClick={onClick}
      className={`rounded-2xl px-3 py-1.5 text-[13px] font-medium transition-all duration-200 ${
        active ? "bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/30" : "text-white/35 hover:text-white/60"
      }`}
    >
      {label}
    </button>
  );

  /* ── Split code into lines for IDE display ── */
  const codeLines = useMemo(() => {
    if (!isCodeMode || !targetText) return [];
    return targetText.split("\n");
  }, [isCodeMode, targetText]);

  // Map flat char index → { line, col }
  const charToLine = useMemo(() => {
    if (!isCodeMode) return [];
    const map: { line: number; col: number }[] = [];
    let line = 0, col = 0;
    for (const ch of targetText) {
      map.push({ line, col });
      if (ch === "\n") { line++; col = 0; } else { col++; }
    }
    return map;
  }, [isCodeMode, targetText]);

  return (
    <div className="space-y-6 outline-none" ref={containerRef} tabIndex={-1}>
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Arena</h1>
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
      <div className="glass flex flex-wrap items-center gap-3 p-2" style={{ borderRadius: 28 }}>
        <div className="flex gap-0.5 bg-white/[0.04] p-1" style={{ borderRadius: 20 }}>
          {(["words", "code", "custom"] as TopMode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setTopMode(m); setCustomSubmitted(false); }}
              className={`px-3.5 py-1.5 text-[13px] font-medium capitalize transition-all duration-200 ${
                topMode === m
                  ? "bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                  : "text-white/40 hover:text-white/70"
              }`}
              style={{ borderRadius: 16 }}
            >{m}</button>
          ))}
        </div>

        {topMode === "words" && (
          <>
            <div className="flex gap-0.5 bg-white/[0.04] p-1" style={{ borderRadius: 20 }}>
              {([15, 30, 60, 120] as TimerDuration[]).map((d) => (
                <button key={d} onClick={() => setTimerDuration(d)}
                  className={`px-2.5 py-1 text-[13px] font-medium transition-all duration-200 ${
                    timerDuration === d ? "bg-white/10 text-white" : "text-white/30 hover:text-white/60"
                  }`}
                  style={{ borderRadius: 16 }}
                >{d}s</button>
              ))}
            </div>
            <span className="text-white/10">|</span>
            {toggleBtn(punctuation, "@ punctuation", () => setPunctuation((p) => !p))}
            {toggleBtn(numbers, "# numbers", () => setNumbers((n) => !n))}
          </>
        )}

        {topMode === "code" && (
          <>
            <select value={selectedLang} onChange={(e) => { setSelectedLang(e.target.value); }}
              className="border border-white/[0.06] bg-white/[0.04] pl-3 py-1.5 text-[13px] text-white outline-none transition-colors focus:border-blue-500/50"
              style={{ borderRadius: 16 }}
            >
              <option value="all" className="bg-[#08080c]">All Languages</option>
              {languages.map((l) => (
                <option key={l} value={l} className="bg-[#08080c]">{l}</option>
              ))}
            </select>
            <select value={selectedCodeId} onChange={(e) => setSelectedCodeId(e.target.value)}
              className="border border-white/[0.06] bg-white/[0.04] pl-3 py-1.5 text-[13px] text-white outline-none transition-colors focus:border-blue-500/50"
              style={{ borderRadius: 16 }}
            >
              {filteredSnippets.map((s) => (
                <option key={s.id} value={s.id} className="bg-[#08080c]">
                  {s.title}
                </option>
              ))}
            </select>
          </>
        )}

        {topMode === "custom" && !customSubmitted && (
          <form onSubmit={(e) => { e.preventDefault(); if (customText.trim()) setCustomSubmitted(true); }} className="flex flex-1 gap-2">
            <input type="text" value={customText} onChange={(e) => setCustomText(e.target.value)}
              placeholder="Paste or type your custom text..."
              className="flex-1 rounded-2xl border border-white/[0.06] bg-white/[0.04] px-3 py-1.5 text-[13px] text-white outline-none placeholder:text-white/25 transition-colors focus:border-blue-500/50"
            />
            <button type="submit"
              className="rounded-2xl bg-blue-500 px-4 py-1.5 text-[13px] font-medium text-white shadow-[0_0_10px_rgba(59,130,246,0.3)] transition-all hover:bg-blue-400"
            >Go</button>
          </form>
        )}

        <button
          onClick={() => { if (topMode === "custom") setCustomSubmitted(false); loadText(); }}
          className="ml-auto border border-white/[0.06] px-4 py-1.5 text-[13px] text-white/30 transition-all duration-200 hover:border-white/15 hover:text-white/60"
          style={{ borderRadius: 20 }}
        >{topMode === "custom" && customSubmitted ? "Change text" : "Reset"}</button>
      </div>

      {/* ── Typing display ── */}
      {!isFinished && targetText ? (
        isCodeMode ? (
          /* ── IDE-style code display ── */
          <div className="glass overflow-hidden mt-8">
            {/* Title bar */}
            <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-2.5">
              <span className="text-xs text-white/30 font-mono">{selectedCode?.title}.{
                selectedCode?.language === "Python" ? "py" :
                selectedCode?.language === "Swift" ? "swift" :
                selectedCode?.language === "C" ? "c" :
                selectedCode?.language === "C++" ? "cpp" :
                selectedCode?.language === "Rust" ? "rs" :
                selectedCode?.language === "Go" ? "go" :
                selectedCode?.language === "Java" ? "java" :
                selectedCode?.language === "Ruby" ? "rb" :
                selectedCode?.language === "TypeScript" ? "ts" : "js"
              }</span>
              <span className="ml-auto text-[11px] text-white/20 uppercase tracking-widest">{selectedCode?.language}</span>
            </div>
            {/* Code area with line numbers */}
            <div className="flex overflow-auto max-h-[420px]">
              {/* Line numbers */}
              <div className="sticky left-0 flex flex-col border-r border-white/[0.04] bg-white/[0.02] px-3 py-4 text-right font-mono text-xs text-white/15 select-none"
                style={{ lineHeight: `${CODE_LINE_HEIGHT}px` }}
              >
                {codeLines.map((_, i) => (
                  <span key={i}>{i + 1}</span>
                ))}
              </div>
              {/* Code content */}
              <div className="relative flex-1 px-5 py-4">
                <pre
                  ref={codePreRef}
                  className="relative font-mono text-[15px] select-none whitespace-pre"
                  style={{ lineHeight: `${CODE_LINE_HEIGHT}px` }}
                >
                  <SmoothCaret
                    charRefs={charRefs}
                    index={typedChars.length}
                    containerRef={codePreRef}
                    targetText={targetText}
                    isTyping={isRunning}
                  />
                  {targetText.split("").map((char, i) => {
                    // Determine syntax color for untyped chars
                    let colorClass = "text-white/20";
                    if (i < typedChars.length) {
                      colorClass = typedChars[i] === char ? "text-white/90" : "text-red-400 bg-red-500/10";
                    } else {
                      // Syntax hints for untyped code
                      const word = getWordAt(targetText, i);
                      if (currentKeywords.has(word) && i === targetText.indexOf(word, i - (i - targetText.lastIndexOf(" ", i) - 1)) + (i - targetText.lastIndexOf(" ", i) - 1) - (i - targetText.lastIndexOf(" ", i) - 1)) {
                        // Simplified: color keywords
                      }
                      if (char === "\n" || char === " " || char === "\t") colorClass = "text-transparent";
                      else if (/[{}()\[\];,.]/.test(char)) colorClass = "text-white/15";
                      else if (/[0-9]/.test(char)) colorClass = "text-amber-500/25";
                      else if (char === '"' || char === "'" || char === '`') colorClass = "text-green-500/25";
                    }

                    // Render newlines as actual newlines
                    if (char === "\n") {
                      return (
                        <span key={i} ref={(el) => { charRefs.current[i] = el; }} className={i < typedChars.length ? (typedChars[i] === "\n" ? "" : "text-red-400 bg-red-500/10") : ""}>
                          {"\n"}
                        </span>
                      );
                    }

                    return (
                      <span key={i} ref={(el) => { charRefs.current[i] = el; }} className={colorClass}>
                        {char}
                      </span>
                    );
                  })}
                </pre>
              </div>
            </div>
          </div>
        ) : (
          /* ── Words / custom mode — 3 line scrolling display ── */
          <div className="relative cursor-text overflow-hidden mt-16" style={{ height: LINE_HEIGHT * VISIBLE_LINES }}>
            <div ref={textRef} className="relative font-mono text-[1.75rem] select-none"
              style={{ lineHeight: `${LINE_HEIGHT}px`, transform: `translateY(-${scrollOffset}px)`, transition: "transform 200ms ease-out" }}
            >
              <SmoothCaret charRefs={charRefs} index={typedChars.length} containerRef={textRef} targetText={targetText} isTyping={isRunning} />
              {targetText.split("").map((char, i) => {
                let colorClass = "text-white/20";
                if (i < typedChars.length) {
                  colorClass = typedChars[i] === char ? "text-white" : "text-red-400 bg-red-500/10 rounded-sm";
                }
                return (
                  <span key={i} ref={(el) => { charRefs.current[i] = el; }} className={colorClass}>{char}</span>
                );
              })}
            </div>
          </div>
        )
      ) : isFinished ? (
        <div className="glass space-y-8 p-8 md:p-10">
          <h2 className="text-lg font-semibold text-white/70 tracking-wide uppercase">Results</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-3xl bg-blue-500/[0.08] ring-1 ring-blue-500/20 p-5 text-center">
              <p className="text-4xl font-bold text-blue-400 tabular-nums">{wpm}</p>
              <p className="mt-2 text-xs font-medium text-blue-400/60 uppercase tracking-widest">WPM</p>
            </div>
            <div className="rounded-3xl bg-white/[0.03] ring-1 ring-white/[0.06] p-5 text-center">
              <p className="text-4xl font-bold text-white/90 tabular-nums">{accuracy}%</p>
              <p className="mt-2 text-xs font-medium text-white/30 uppercase tracking-widest">Accuracy</p>
            </div>
            <div className="rounded-3xl bg-white/[0.03] ring-1 ring-white/[0.06] p-5 text-center">
              <p className="text-4xl font-bold text-white/90 tabular-nums">{correctChars}</p>
              <p className="mt-2 text-xs font-medium text-white/30 uppercase tracking-widest">Correct</p>
            </div>
            <div className="rounded-3xl bg-white/[0.03] ring-1 ring-white/[0.06] p-5 text-center">
              <p className="text-4xl font-bold text-white/90 tabular-nums">{Math.round(effectiveElapsed)}s</p>
              <p className="mt-2 text-xs font-medium text-white/30 uppercase tracking-widest">Time</p>
            </div>
          </div>
          {topMode === "code" && selectedCode?.personalBestWPM && (
            <p className="text-sm text-white/35">
              Personal Best: <span className="text-blue-400 font-medium">{selectedCode.personalBestWPM} WPM</span>
            </p>
          )}
          <button
            onClick={() => { if (topMode === "custom") setCustomSubmitted(true); loadText(); }}
            className="rounded-2xl bg-blue-500 px-6 py-2.5 text-sm font-medium text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all hover:bg-blue-400 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]"
          >Try Again</button>
        </div>
      ) : topMode === "custom" && !customSubmitted ? (
        <div className="glass p-10 text-center text-white/25 text-sm">
          Enter your custom text above and click Go.
        </div>
      ) : null}

      {/* ── Live stats ── */}
      {isRunning && (
        <div className="flex justify-center gap-8 text-[13px] text-white/30">
          <span>WPM <span className="ml-1 text-white/60 tabular-nums font-medium">{wpm}</span></span>
          <span>Accuracy <span className="ml-1 text-white/60 tabular-nums font-medium">{accuracy}%</span></span>
          <span>Chars <span className="ml-1 text-white/60 tabular-nums font-medium">{totalTyped}</span></span>
        </div>
      )}
    </div>
  );
}
