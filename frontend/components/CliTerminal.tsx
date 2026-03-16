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
    <div className="rounded-xl border border-zinc-700 overflow-hidden shadow-2xl shadow-black">
      {/* Title bar */}
      <div className="bg-zinc-800 px-5 py-3 flex items-center gap-2.5 border-b border-zinc-700">
        <span className="w-3.5 h-3.5 rounded-full bg-red-500" />
        <span className="w-3.5 h-3.5 rounded-full bg-yellow-400" />
        <span className="w-3.5 h-3.5 rounded-full bg-green-500" />
        <span className="ml-3 text-sm text-zinc-400">{title}</span>
      </div>

      {/* Scrollable content area */}
      <div className="bg-black p-8 space-y-5 min-h-[540px] max-h-[85vh] overflow-y-auto text-base">
        {children}
      </div>
    </div>
  );
}
