'use client';

import { useState, useCallback, KeyboardEvent } from 'react';
import CliPrompt from '@/components/CliPrompt';
import TypewriterText from '@/components/TypewriterText';
import { postSubmissions, type SubmissionEntry } from '@/lib/api';

// ─── Types ─────────────────────────────────────────────────────────────────

type Step = 'explain' | 'choose' | 'input' | 'confirm';
type SubmissionType = 'bug' | 'debug';

interface Entry {
  type: SubmissionType;
  content: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function labelFor(type: SubmissionType) {
  return type === 'bug' ? 'Describe the bug:' : 'Describe your debug process:';
}

function typeLabel(type: SubmissionType) {
  return type === 'bug' ? '🐛 Bug' : '🔍 Debug';
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function HomePage() {
  const [step, setStep] = useState<Step>('explain');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [currentType, setCurrentType] = useState<SubmissionType>('bug');
  const [currentContent, setCurrentContent] = useState('');
  const [addMore, setAddMore] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // ── Step handlers ────────────────────────────────────────────────────────

  const handleChoose = useCallback((choice: '1' | '2') => {
    setCurrentType(choice === '1' ? 'bug' : 'debug');
    setCurrentContent('');
    setAddMore('');
    setStep('input');
  }, []);

  const handleAddMoreKey = useCallback(
    async (e: KeyboardEvent<HTMLInputElement>) => {
      const val = e.currentTarget.value.trim().toLowerCase();
      if (!['1', '2', 'n'].includes(val)) return;

      if (val === '1' || val === '2') {
        // Push current entry and start a new one
        if (currentContent.trim()) {
          setEntries((prev) => [...prev, { type: currentType, content: currentContent.trim() }]);
        }
        setCurrentType(val === '1' ? 'bug' : 'debug');
        setCurrentContent('');
        setAddMore('');
      } else {
        // N = finalize
        const allEntries: Entry[] = currentContent.trim()
          ? [...entries, { type: currentType, content: currentContent.trim() }]
          : entries;

        if (allEntries.length === 0) {
          setError('No entries to submit. Please write something first.');
          return;
        }

        setIsLoading(true);
        setError('');

        try {
          const res = await postSubmissions(allEntries as SubmissionEntry[]);
          setReferenceId(res.referenceId);
          setStep('confirm');
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Submission failed.');
        } finally {
          setIsLoading(false);
        }
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
    setReferenceId('');
    setError('');
  }, []);

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">

        {/* Terminal window chrome */}
        <div className="rounded-lg border border-zinc-700 overflow-hidden shadow-2xl shadow-black">

          {/* Title bar */}
          <div className="bg-zinc-800 px-4 py-2 flex items-center gap-2 border-b border-zinc-700">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="w-3 h-3 rounded-full bg-green-500" />
            <span className="ml-3 text-xs text-zinc-400">faith-hack — bash</span>
          </div>

          {/* Terminal body */}
          <div className="bg-zinc-950 p-6 space-y-4 min-h-[400px]">

            {/* Header always visible */}
            <CliPrompt prefix="$">
              <span className="text-zinc-300">./faith-hack</span>
            </CliPrompt>

            {/* ── Step: Explain ────────────────────────────────────────── */}
            {(step === 'explain' || step === 'choose' || step === 'input') && (
              <div className="space-y-1 border-l-2 border-zinc-700 pl-4 ml-1">
                <p className="text-amber-400 font-bold">Bug vs Debug: What&apos;s the difference?</p>
                <CliPrompt prefix="  [1]">
                  <span className="text-zinc-300">
                    <span className="text-red-400 font-semibold">Bug</span> — An unexpected error or
                    unintended behavior in the code.
                  </span>
                </CliPrompt>
                <CliPrompt prefix="  [2]">
                  <span className="text-zinc-300">
                    <span className="text-blue-400 font-semibold">Debug</span> — The process of
                    finding and resolving those bugs.
                  </span>
                </CliPrompt>
              </div>
            )}

            {/* ── Step: Choose ─────────────────────────────────────────── */}
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
                    className="px-4 py-2 border border-blue-600 text-blue-400 hover:bg-blue-950 rounded text-sm transition-colors"
                  >
                    [2] Debug
                  </button>
                </div>
              </div>
            )}

            {/* ── Step: Choose (alternative — keyboard hint) ───────────── */}
            {step === 'choose' && (
              <div className="space-y-2 pt-2">
                <CliPrompt prefix=">">
                  Choose your submission type: [1] Bug &nbsp;[2] Debug
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
                    className="px-4 py-2 border border-blue-600 text-blue-400 hover:bg-blue-950 rounded text-sm transition-colors"
                  >
                    [2] Debug
                  </button>
                </div>
              </div>
            )}

            {/* ── Step: Input ──────────────────────────────────────────── */}
            {step === 'input' && (
              <div className="space-y-4">

                {/* Stacked previous entries */}
                {entries.map((entry, i) => (
                  <div key={i} className="border border-zinc-700 rounded p-3 space-y-1 bg-zinc-900">
                    <span className={`text-xs font-bold ${entry.type === 'bug' ? 'text-red-400' : 'text-blue-400'}`}>
                      {typeLabel(entry.type)}
                    </span>
                    <p className="text-zinc-300 text-sm whitespace-pre-wrap">{entry.content}</p>
                  </div>
                ))}

                {/* Current entry textarea */}
                <div className="space-y-2">
                  <CliPrompt prefix=">">
                    <span className={currentType === 'bug' ? 'text-red-400' : 'text-blue-400'}>
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

                {/* Add more / submit toggle */}
                <div className="space-y-2">
                  <CliPrompt prefix=">">
                    Add another entry?
                    <span className="text-red-400 ml-1">[1] Bug</span>
                    <span className="text-blue-400 ml-1">[2] Debug</span>
                    <span className="text-zinc-400 ml-1">[N] No, submit</span>
                  </CliPrompt>
                  <input
                    type="text"
                    maxLength={1}
                    value={addMore}
                    onChange={(e) => setAddMore(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddMoreKey(e as unknown as KeyboardEvent<HTMLInputElement>);
                    }}
                    placeholder="1 / 2 / N  then press Enter"
                    className="w-full bg-zinc-900 border border-zinc-700 focus:border-green-600 outline-none rounded p-2 text-green-300 placeholder-zinc-600 text-sm transition-colors"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        // Simulates pressing '1' + Enter
                        const e = { currentTarget: { value: '1' } } as unknown as KeyboardEvent<HTMLInputElement>;
                        e.currentTarget.value = '1';
                        handleAddMoreKey(e);
                      }}
                      className="px-3 py-1.5 border border-red-600 text-red-400 hover:bg-red-950 rounded text-xs transition-colors"
                    >
                      [1] Bug
                    </button>
                    <button
                      onClick={() => {
                        const e = { currentTarget: { value: '2' } } as unknown as KeyboardEvent<HTMLInputElement>;
                        handleAddMoreKey(e);
                      }}
                      className="px-3 py-1.5 border border-blue-600 text-blue-400 hover:bg-blue-950 rounded text-xs transition-colors"
                    >
                      [2] Debug
                    </button>
                    <button
                      onClick={() => {
                        const e = { currentTarget: { value: 'n' } } as unknown as KeyboardEvent<HTMLInputElement>;
                        handleAddMoreKey(e);
                      }}
                      disabled={isLoading}
                      className="px-3 py-1.5 border border-green-600 text-green-400 hover:bg-green-950 rounded text-xs transition-colors disabled:opacity-50"
                    >
                      {isLoading ? '⏳ Submitting…' : '[N] Submit'}
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

            {/* ── Step: Confirm ─────────────────────────────────────────── */}
            {step === 'confirm' && (
              <div className="space-y-4 pt-2">
                <TypewriterText
                  text={`> Submission received.\n> Reference ID: ${referenceId}`}
                  speed={30}
                  className="text-green-400 font-bold text-lg"
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

          </div>
        </div>
      </div>
    </main>
  );
}
