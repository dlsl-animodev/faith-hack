'use client';

import { useCallback, useEffect, useState } from 'react';
import SubmissionCard from '@/components/SubmissionCard';
import CliPrompt from '@/components/CliPrompt';
import supabase from '@/lib/supabaseClient';
import { getSubmissions, getCount, type Submission } from '@/lib/api';

// ─── Component ──────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [count, setCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // ── Data Fetching ────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    try {
      const [subs, { count: total }] = await Promise.all([
        getSubmissions(),
        getCount(),
      ]);
      setSubmissions(subs);
      setCount(total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load submissions.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Realtime Subscription ────────────────────────────────────────────────

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('submissions-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'submissions' },
        () => {
          // Refresh full list + count on any new insert
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="border-b border-zinc-800 pb-4 space-y-2">
          <CliPrompt prefix="$">
            <span className="text-zinc-300">faith-hack <span className="text-green-400">--admin</span></span>
          </CliPrompt>
          <div className="flex items-baseline gap-3 pl-4">
            <span className="text-3xl font-bold text-green-400">
              📋 {isLoading ? '…' : count} submission{count !== 1 ? 's' : ''}
            </span>
            <span className="text-zinc-600 text-xs">(realtime)</span>
          </div>
          <div className="pl-4 text-xs text-zinc-500">
            ● Realtime active — new submissions appear automatically
          </div>
        </div>

        {/* Error state */}
        {error && (
          <CliPrompt prefix="!">
            <span className="text-red-400">{error}</span>
          </CliPrompt>
        )}

        {/* Loading state */}
        {isLoading && (
          <CliPrompt prefix=">" showCursor>
            <span className="text-zinc-400">Loading submissions…</span>
          </CliPrompt>
        )}

        {/* Empty state */}
        {!isLoading && !error && count === 0 && (
          <CliPrompt prefix=">">
            <span className="text-zinc-500">No submissions yet.</span>
          </CliPrompt>
        )}

        {/* Submission list */}
        {!isLoading && submissions.length > 0 && (
          <div className="space-y-3">
            {submissions.map((sub) => (
              <SubmissionCard key={sub.id} submission={sub} />
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-zinc-800">
          <CliPrompt prefix=">">
            <a href="/home" className="text-zinc-500 hover:text-green-400 transition-colors text-sm">
              ← Go to submission form
            </a>
          </CliPrompt>
        </div>
      </div>
    </main>
  );
}
