'use client';

import { useState, useEffect, useRef } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { Submission } from '@/lib/types';

interface StackedSubmissionsProps {
  initialSubmissions: Submission[];
}

function formatTimestamp(iso: string) {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  };
}

function shortRef(id: string) {
  return id.slice(0, 8).toUpperCase();
}

export default function StackedSubmissions({ initialSubmissions }: StackedSubmissionsProps) {
  const [stack, setStack] = useState<Submission[]>(initialSubmissions);
  const [expanded, setExpanded] = useState<{ sub: Submission; index: number } | null>(null);
  const [toast, setToast] = useState('');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Realtime subscription ──────────────────────────────────────────────
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel('stacked-submissions-feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'submissions' }, (payload) => {
        setStack((prev) => [payload.new as Submission, ...prev]);
        showToast('> New submission received');
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  function showToast(message: string) {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 3000);
  }

  function handleNext() {
    if (!expanded) return;
    setStack((prev) => prev.filter((_, i) => i !== expanded.index));
    setExpanded(null);
  }

  if (stack.length === 0) {
    return <p className="text-zinc-500 text-sm font-mono">&gt; Stack cleared. No more submissions.</p>;
  }

  return (
    <div className="relative">
      {/* Counter */}
      <p className="text-zinc-500 text-xs font-mono mb-4">
        &gt; {stack.length} file{stack.length !== 1 ? 's' : ''} in stack
      </p>

      {/* Scrollable folder list */}
      <div className="flex flex-col gap-3 max-h-[420px] overflow-y-auto pr-1">
        {stack.map((sub, i) => {
          const isBug = sub.type === 'bug';
          const t = formatTimestamp(sub.created_at);
          const preview = sub.content.length > 52 ? sub.content.slice(0, 52) + '...' : sub.content;

          return (
            <div key={sub.id}>
              {/* Folder tab */}
              <div
                className={`inline-block px-3 py-0.5 rounded-t text-[11px] font-semibold uppercase tracking-wide -mb-px relative z-10 ${
                  isBug
                    ? 'bg-red-100 text-red-800 border border-red-300 border-b-0'
                    : 'bg-blue-100 text-blue-900 border border-blue-300 border-b-0'
                }`}
              >
                {isBug ? '🐛 Bug' : '🔍 Debug'}
              </div>

              {/* Folder body */}
              <div
                onClick={() => setExpanded({ sub, index: i })}
                className="bg-zinc-900 border border-zinc-700 rounded-b rounded-tr p-3 flex items-center justify-between cursor-pointer hover:bg-zinc-800 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[11px] text-zinc-500">#{shortRef(sub.id)}</span>
                    <span className="text-[11px] text-zinc-600">{t.date} · {t.time}</span>
                  </div>
                  <p className="text-sm text-zinc-400 truncate">{preview}</p>
                </div>
                <span className="text-zinc-600 text-lg ml-3 flex-shrink-0">›</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Modal ───────────────────────────────────────────────────────── */}
      {expanded && (
        <div
          className="fixed inset-0 z-[9998] bg-black/60 flex items-center justify-center p-4"
          style={{ animation: 'fadeIn 150ms ease-out' }}
        >
          <div className="w-[75vw] max-w-5xl rounded-xl border border-zinc-700 overflow-hidden shadow-2xl shadow-black bg-zinc-950" style={{ height: '75vh', display: 'flex', flexDirection: 'column' }}>
            {/* Title bar */}
            <div className="bg-zinc-900 px-4 py-2.5 flex items-center gap-2 border-b border-zinc-800">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span className="w-3 h-3 rounded-full bg-yellow-400" />
              <span className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-2 text-xs text-zinc-500 font-mono">
                submission — #{shortRef(expanded.sub.id)}
              </span>
            </div>

            {/* Body */}
            <div className="p-7 font-mono text-sm overflow-y-auto space-y-3 flex-1 scrollbar-thin scrollbar-track-zinc-900 scrollbar-thumb-zinc-700">
              <div className="flex gap-3">
                <span className="text-zinc-600 text-xs w-14">ref id</span>
                <span className="text-zinc-300 text-xs">{expanded.sub.id.toUpperCase()}</span>
              </div>
              <div className="flex gap-3 items-center">
                <span className="text-zinc-600 text-xs w-14">type</span>
                <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                  expanded.sub.type === 'bug'
                    ? 'bg-red-900/50 text-red-300'
                    : 'bg-blue-900/50 text-blue-300'
                }`}>
                  {expanded.sub.type.toUpperCase()}
                </span>
              </div>
              <div className="flex gap-3">
                <span className="text-zinc-600 text-xs w-14">date</span>
                <span className="text-zinc-300 text-xs">{formatTimestamp(expanded.sub.created_at).date}</span>
              </div>
              <div className="flex gap-3">
                <span className="text-zinc-600 text-xs w-14">time</span>
                <span className="text-zinc-300 text-xs">{formatTimestamp(expanded.sub.created_at).time}</span>
              </div>

              <div className="border-t border-zinc-800 pt-3 mt-3">
                <p className="text-zinc-600 text-xs mb-2">&gt; content</p>
                <p className="text-green-300 text-sm whitespace-pre-wrap leading-relaxed">
                  {expanded.sub.content}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 px-5 py-3 bg-zinc-900 border-t border-zinc-800">
              <button
                onClick={() => setExpanded(null)}
                className="px-4 py-1.5 border border-zinc-600 text-zinc-400 text-xs hover:bg-zinc-800 rounded transition-colors font-mono"
              >
                &gt; [CLOSE]
              </button>
              <button
                onClick={handleNext}
                className="px-4 py-1.5 border border-green-700 text-green-400 text-xs hover:bg-green-950 rounded transition-colors font-mono"
              >
                &gt; [NEXT →]
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] bg-zinc-900 border border-green-700 text-green-400 text-xs px-4 py-2 rounded shadow-lg font-mono">
          {toast}
        </div>
      )}
    </div>
  );
}