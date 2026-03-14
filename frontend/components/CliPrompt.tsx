'use client';

import { cn } from '@/lib/utils';

interface CliPromptProps {
  /** The $ or > prefix character. Defaults to '>'. */
  prefix?: string;
  children: React.ReactNode;
  className?: string;
  /** Show a blinking cursor at the end */
  showCursor?: boolean;
}

/**
 * Renders a single terminal-style prompt line with a configurable prefix.
 */
export default function CliPrompt({
  prefix = '>',
  children,
  className,
  showCursor = false,
}: CliPromptProps) {
  return (
    <div className={cn('flex gap-2 items-start leading-relaxed', className)}>
      <span className="text-green-500 select-none shrink-0">{prefix}</span>
      <span className="flex-1">
        {children}
        {showCursor && (
          <span className="ml-0.5 animate-pulse text-green-400">▌</span>
        )}
      </span>
    </div>
  );
}
