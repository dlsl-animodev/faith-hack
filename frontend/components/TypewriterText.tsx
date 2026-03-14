'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface TypewriterTextProps {
  text: string;
  /** Characters per second. Defaults to 40. */
  speed?: number;
  className?: string;
  onComplete?: () => void;
}

/**
 * Renders `text` character-by-character for a retro terminal typewriter effect.
 */
export default function TypewriterText({
  text,
  speed = 40,
  className,
  onComplete,
}: TypewriterTextProps) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    setDisplayed('');
    let index = 0;
    const interval = setInterval(() => {
      index += 1;
      setDisplayed(text.slice(0, index));
      if (index >= text.length) {
        clearInterval(interval);
        onComplete?.();
      }
    }, 1000 / speed);

    return () => clearInterval(interval);
  }, [text, speed, onComplete]);

  return (
    <span className={cn('whitespace-pre-wrap', className)}>
      {displayed}
      <span className="animate-pulse">▌</span>
    </span>
  );
}
