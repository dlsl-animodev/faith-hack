import type { ReactNode } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface CliTerminalProps {
  children: ReactNode;
  title?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Reusable dark terminal window shell with macOS-style title bar.
 * Wraps content in a scrollable monospace viewport.
 */
export default function CliTerminal({
  children,
  title = 'faith-hack — bash',
}: CliTerminalProps) {
  return (
    <div className="rounded-lg border border-zinc-700 overflow-hidden shadow-2xl shadow-black">
      {/* Title bar */}
      <div className="bg-zinc-800 px-4 py-2 flex items-center gap-2 border-b border-zinc-700">
        <span className="w-3 h-3 rounded-full bg-red-500" />
        <span className="w-3 h-3 rounded-full bg-yellow-400" />
        <span className="w-3 h-3 rounded-full bg-green-500" />
        <span className="ml-3 text-xs text-zinc-400">{title}</span>
      </div>

      {/* Scrollable content area */}
      <div className="bg-zinc-950 p-6 space-y-4 min-h-[400px] max-h-[80vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
