'use client';

import { useEffect, useState } from 'react';
import type { Submission } from '@/lib/types';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import SubmissionCard from '@/components/SubmissionCard';
import CliPrompt from '@/components/CliPrompt';

// ─── Types ───────────────────────────────────────────────────────────────────

interface AdminDashboardProps {
  initialSubmissions: Submission[];
  initialCount: number;
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Client component that renders the admin dashboard with live Realtime updates.
 * Receives SSR-seeded data as props and subscribes to new INSERTs via Supabase.
 */
export default function AdminDashboard({
  initialSubmissions,
  initialCount,
}: AdminDashboardProps) {
  const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions);
  const [count, setCount] = useState<number>(initialCount);

  // ── Realtime Subscription ────────────────────────────────────────────────

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    const channel = supabase
      .channel('submissions-feed')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'submissions' },
        (payload) => {
          setSubmissions((prev) => [payload.new as Submission, ...prev]);
          setCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ── Render ───────────────────────────────────────────────────────────────

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
            📋 {count} submission{count !== 1 ? 's' : ''}
          </span>
        </div>

      </div>

      {/* Empty state */}
      {count === 0 && (
        <CliPrompt prefix=">">
          <span className="text-zinc-500">No submissions yet.</span>
        </CliPrompt>
      )}

      {/* Submission list */}
      {submissions.length > 0 && (
        <div className="space-y-3">
          {submissions.map((sub) => (
            <SubmissionCard key={sub.id} submission={sub} />
          ))}
        </div>
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
