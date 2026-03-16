'use client';

import { useState, useEffect } from 'react';
import AdminPasswordGate from '@/components/AdminPasswordGate';
import AdminDashboard from '@/components/AdminDashboard';
import CliTerminal from '@/components/CliTerminal';
import type { Submission } from '@/lib/types';
import { getSubmissions, getSubmissionCount } from '@/actions/submissions';

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Admin page — protected by a fullscreen password gate.
 * Converts to client component so useState can guard the dashboard.
 * Data is fetched client-side after unlock to avoid sending it before auth.
 */
export default function AdminPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [count, setCount] = useState(0);

  // Fetch data only after the gate is unlocked
  useEffect(() => {
    if (!unlocked) return;

    async function load() {
      const [subs, cnt] = await Promise.all([
        getSubmissions(),
        getSubmissionCount(),
      ]);
      setSubmissions(subs);
      setCount(cnt);
    }

    load();
  }, [unlocked]);

  if (!unlocked) {
    return <AdminPasswordGate onUnlock={() => setUnlocked(true)} />;
  }

  return (
    <main className="min-h-screen p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <CliTerminal title="faith-hack — admin">
          <AdminDashboard
            initialSubmissions={submissions}
            initialCount={count}
          />
        </CliTerminal>
      </div>
    </main>
  );
}
