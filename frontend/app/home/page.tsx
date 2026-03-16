'use client';

import { useState, useCallback, KeyboardEvent } from 'react';
import CliPrompt from '@/components/CliPrompt';
import CliTerminal from '@/components/CliTerminal';
import TypewriterText from '@/components/TypewriterText';
import { submitEntries } from '@/actions/submissions';
import type { SubmissionType, NewEntry } from '@/lib/types';

// ─── Types ───────────────────────────────────────────────────────────────────

type Step = 'explain' | 'choose' | 'input' | 'confirm';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function labelFor(type: SubmissionType) {
  return type === 'bug' ? 'Describe the bug:' : 'Describe your debug process:';
}

function typeLabel(type: SubmissionType) {
  return type === 'bug' ? '🐛 Bug' : '🔍 Debug';
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function HomePage() {
  const [step, setStep] = useState<Step>('explain');
  const [entries, setEntries] = useState<NewEntry[]>([]);
  const [currentType, setCurrentType] = useState<SubmissionType>('bug');
  const [currentContent, setCurrentContent] = useState('');
  const [addMore, setAddMore] = useState('');
  const [refId, setRefId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ── Step handlers ─────────────────────────────────────────────────────────

  const handleChoose = useCallback((choice: '1' | '2') => {
    setCurrentType(choice === '1' ? 'bug' : 'debug');
    setCurrentContent('');
    setAddMore('');
    setStep('input');
  }, []);

  const handleAddMore = useCallback(
    async (val: string) => {
      const v = val.trim().toLowerCase();
      if (!['1', '2', 'n'].includes(v)) return;

      if (v === '1' || v === '2') {
        if (currentContent.trim()) {
          setEntries((prev) => [
            ...prev,
            { type: currentType, content: currentContent.trim() },
          ]);
        }
        setCurrentType(v === '1' ? 'bug' : 'debug');
        setCurrentContent('');
        setAddMore('');
        return;
      }

      // N = finalize and submit
      const allEntries: NewEntry[] = currentContent.trim()
        ? [...entries, { type: currentType, content: currentContent.trim() }]
        : entries;

      if (allEntries.length === 0) {
        setError('No entries to submit. Please write something first.');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const res = await submitEntries(allEntries);
        setRefId(res.ids[0]);
        setStep('confirm');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Submission failed.');
      } finally {
        setLoading(false);
      }
    },
    [currentContent, currentType, entries]
  );

  const handleReset = useCallback(() => {
    setStep('explain');
    setEntries([]);
    setCurrentContent('');
    setCurrentType('bug');
    setAddMore('');
    setRefId('');
    setError('');
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-6xl">
        <CliTerminal>

          {/* Header — always visible */}
          <CliPrompt prefix="$">
            <span className="text-zinc-300">./faith-hack</span>
          </CliPrompt>

          {/* ── Explain panel (visible on explain/choose/input) ─────────── */}
          {(step === 'explain' || step === 'choose' || step === 'input') && (
            <div className="space-y-1 border-l-2 border-zinc-700 pl-4 ml-1">
              <p className="text-amber-400 font-bold">Bug vs Debug: What&apos;s the difference?</p>
              <CliPrompt prefix="  [1]">
                <span className="text-zinc-300">
                  <span className="text-red-400 font-semibold">Bug</span> — An unexpected
                  error or unintended behavior in the code.
                </span>
              </CliPrompt>
              <CliPrompt prefix="  [2]">
                <span className="text-zinc-300">
                  <span className="text-green-400 font-semibold">Debug</span> — The process of
                  finding and resolving those bugs.
                </span>
              </CliPrompt>
            </div>
          )}

          {/* ── Step: Explain → choose prompt ───────────────────────────── */}
          {step === 'explain' && (
            <div className="space-y-3 pt-2">
              <CliPrompt prefix=">" showCursor>
                <span>Choose your submission type:</span>
              </CliPrompt>
              <div className="flex gap-3 pl-4">
                <button
                  onClick={() => handleChoose('1')}
                  className="px-4 py-2 border border-red-600 text-red-400 hover:bg-red-950 rounded text-sm transition-colors"
                >
                  [1] Bug
                </button>
                <button
                  onClick={() => handleChoose('2')}
                  className="px-4 py-2 border border-green-600 text-green-400 hover:bg-green-950 rounded text-sm transition-colors"
                >
                  [2] Debug
                </button>
              </div>
            </div>
          )}

          {/* ── Step: Input ──────────────────────────────────────────────── */}
          {step === 'input' && (
            <div className="space-y-4">

              {/* Previously committed entries */}
              {entries.map((entry, i) => (
                <div key={i} className="border border-zinc-700 rounded p-3 space-y-1 bg-zinc-900">
                  <span className={`text-xs font-bold ${entry.type === 'bug' ? 'text-red-400' : 'text-green-400'}`}>
                    {typeLabel(entry.type)}
                  </span>
                  <p className="text-zinc-300 text-sm whitespace-pre-wrap">{entry.content}</p>
                </div>
              ))}

              {/* Current textarea */}
              <div className="space-y-2">
                <CliPrompt prefix=">">
                  <span className={currentType === 'bug' ? 'text-red-400' : 'text-green-400'}>
                    {labelFor(currentType)}
                  </span>
                </CliPrompt>
                <textarea
                  autoFocus
                  value={currentContent}
                  onChange={(e) => setCurrentContent(e.target.value)}
                  rows={4}
                  placeholder="Type your entry here..."
                  className="w-full bg-zinc-900 border border-zinc-700 focus:border-green-600 outline-none rounded p-3 text-green-300 placeholder-zinc-600 text-sm resize-none transition-colors"
                />
              </div>

              {/* Add more / submit controls */}
              <div className="space-y-2">
                <CliPrompt prefix=">">
                  Add another entry?
                  <span className="text-red-400 ml-1">[1] Bug</span>
                  <span className="text-green-400 ml-1">[2] Debug</span>
                  <span className="text-zinc-400 ml-1">[N] No, submit</span>
                </CliPrompt>
                <input
                  type="text"
                  maxLength={1}
                  value={addMore}
                  onChange={(e) => setAddMore(e.target.value)}
                  onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === 'Enter') handleAddMore(e.currentTarget.value);
                  }}
                  placeholder="1 / 2 / N  then press Enter"
                  className="w-full bg-zinc-900 border border-zinc-700 focus:border-green-600 outline-none rounded p-2 text-green-300 placeholder-zinc-600 text-sm transition-colors"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddMore('1')}
                    className="px-3 py-1.5 border border-red-600 text-red-400 hover:bg-red-950 rounded text-xs transition-colors"
                  >
                    [1] Bug
                  </button>
                  <button
                    onClick={() => handleAddMore('2')}
                    className="px-3 py-1.5 border border-green-600 text-green-400 hover:bg-green-950 rounded text-xs transition-colors"
                  >
                    [2] Debug
                  </button>
                  <button
                    onClick={() => handleAddMore('n')}
                    disabled={loading}
                    className="px-3 py-1.5 border border-zinc-500 text-zinc-400 hover:bg-zinc-800 rounded text-xs transition-colors disabled:opacity-50"
                  >
                    {loading ? '⏳ Submitting…' : '[N] Submit'}
                  </button>
                </div>
              </div>

              {error && (
                <CliPrompt prefix="!">
                  <span className="text-red-400">{error}</span>
                </CliPrompt>
              )}
            </div>
          )}
          {step === 'confirm' && (
            <div className="space-y-4 pt-2">
              <TypewriterText
                lines={[
                  '> Submission received.',
                  `> Reference ID: ${refId}`,
                  '> Thank you.',
                ]}
                speed={40}
              />
              <div className="pt-4">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 border border-zinc-600 text-zinc-400 hover:border-green-600 hover:text-green-400 rounded text-sm transition-colors"
                >
                  [R] Submit another
                </button>
              </div>
            </div>
          )}

        </CliTerminal>
      </div>
    </main>
  );
}
