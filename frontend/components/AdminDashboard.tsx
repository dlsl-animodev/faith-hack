'use client';

import type { Submission } from '@/lib/types';
import StackedSubmissions from '@/components/StackedSubmissions';
import CliPrompt from '@/components/CliPrompt';

// ─── Types ───────────────────────────────────────────────────────────────────

interface AdminDashboardProps {
  initialSubmissions: Submission[];
  initialCount: number;
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Admin dashboard shell.
 * Realtime subscription and stack state are managed inside StackedSubmissions.
 */
export default function AdminDashboard({
  initialSubmissions,
  initialCount,
}: AdminDashboardProps) {
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="border-b border-zinc-800 pb-4 space-y-2">
        <CliPrompt prefix="$">
          <span className="text-zinc-300">
            faith-hack <span className="text-green-400">--admin</span>
          </span>
        </CliPrompt>
        <div className="flex items-baseline gap-3 pl-4">
          <span className="text-3xl font-bold text-green-400">
            📋 {initialCount} submission{initialCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Stacked submission cards */}
      {initialSubmissions.length === 0 ? (
        <CliPrompt prefix=">">
          <span className="text-zinc-500">No submissions yet.</span>
        </CliPrompt>
      ) : (
        <StackedSubmissions initialSubmissions={initialSubmissions} />
      )}

      {/* Footer */}
      <div className="pt-4 border-t border-zinc-800">
        <CliPrompt prefix=">">
          <a
            href="/home"
            className="text-zinc-500 hover:text-green-400 transition-colors text-sm"
          >
            ← Go to submission form
          </a>
        </CliPrompt>
      </div>
    </div>
  );
}
