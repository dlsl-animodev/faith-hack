'use client';

import { useEffect, useState } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface TypewriterTextProps {
  lines: string[];
  speed?: number;
  onComplete?: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Animates each line character-by-character with a blinking cursor.
 * After each line finishes, pauses 300ms before starting the next.
 */
export default function TypewriterText({
  lines,
  speed = 40,
  onComplete,
}: TypewriterTextProps) {
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentChars, setCurrentChars] = useState(0);

  useEffect(() => {
    setDisplayedLines([]);
    setCurrentLineIndex(0);
    setCurrentChars(0);
  }, [lines]);

  useEffect(() => {
    if (currentLineIndex >= lines.length) {
      onComplete?.();
      return;
    }

    const line = lines[currentLineIndex];

    if (currentChars < line.length) {
      const timer = setTimeout(() => {
        setCurrentChars((c) => c + 1);
      }, speed);
      return () => clearTimeout(timer);
    }

    // Line complete — pause 300ms then move to next
    const pause = setTimeout(() => {
      setDisplayedLines((prev) => [...prev, line]);
      setCurrentLineIndex((i) => i + 1);
      setCurrentChars(0);
    }, 300);

    return () => clearTimeout(pause);
  }, [currentLineIndex, currentChars, lines, speed, onComplete]);

  const activeLine =
    currentLineIndex < lines.length
      ? lines[currentLineIndex].slice(0, currentChars)
      : null;

  return (
    <div className="font-mono text-green-400 space-y-1">
      {displayedLines.map((line, i) => (
        <p key={i}>{line}</p>
      ))}
      {activeLine !== null && (
        <p>
          {activeLine}
          <span className="animate-pulse">▌</span>
        </p>
      )}
    </div>
  );
}
