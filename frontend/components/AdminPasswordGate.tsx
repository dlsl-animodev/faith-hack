'use client';

import { useState, useEffect, useRef } from 'react';
import { verifyAdminPassword } from '@/actions/auth';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminPasswordGateProps {
  onUnlock: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SESSION_KEY = 'admin_unlocked';
const MAX_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 60;

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Fullscreen terminal-styled password gate for /admin.
 * - Checks sessionStorage on mount to skip if already unlocked.
 * - Verifies password via Server Action (timingSafeEqual, never client-side).
 * - Locks input for 60 s after 5 failed attempts.
 * - Cannot be dismissed by clicking outside or pressing Escape.
 */
export default function AdminPasswordGate({ onUnlock }: AdminPasswordGateProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── On mount: check sessionStorage ────────────────────────────────────────

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (sessionStorage.getItem(SESSION_KEY) === 'true') {
        onUnlock();
      }
    }
    // Focus input on mount
    inputRef.current?.focus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Countdown timer while locked ──────────────────────────────────────────

  useEffect(() => {
    if (lockedUntil === null) return;

    const interval = setInterval(() => {
      const remaining = Math.ceil((lockedUntil - Date.now()) / 1000);
      if (remaining <= 0) {
        setLockedUntil(null);
        setAttempts(0);
        setCountdown(0);
        setError('');
        inputRef.current?.focus();
      } else {
        setCountdown(remaining);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [lockedUntil]);

  // ── Prevent Escape from dismissing ────────────────────────────────────────

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') e.preventDefault();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ── Submit handler ────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (loading || lockedUntil !== null) return;
    if (!password.trim()) return;

    setLoading(true);
    setError('');

    try {
      const result = await verifyAdminPassword(password);

      if (result.success) {
        sessionStorage.setItem(SESSION_KEY, 'true');
        onUnlock();
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        setPassword('');

        // Trigger shake
        setShaking(true);
        setTimeout(() => setShaking(false), 400);

        if (newAttempts >= MAX_ATTEMPTS) {
          const until = Date.now() + LOCKOUT_SECONDS * 1000;
          setLockedUntil(until);
          setCountdown(LOCKOUT_SECONDS);
          setError(`> Too many attempts. Locked for ${LOCKOUT_SECONDS} seconds.`);
        } else {
          setError('> Access denied. Try again.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const isLocked = lockedUntil !== null;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    // Fixed overlay — prevents any interaction with the page behind
    <div className="fixed inset-0 z-[9999] bg-zinc-950/95 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Terminal window */}
        <div className="rounded-lg border border-zinc-700 overflow-hidden shadow-2xl shadow-black">

          {/* Title bar */}
          <div className="bg-zinc-800 px-4 py-2 flex items-center gap-2 border-b border-zinc-700">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="w-3 h-3 rounded-full bg-green-500" />
            <span className="ml-3 text-xs text-zinc-400">faith-hack — restricted</span>
          </div>

          {/* Body */}
          <div className="bg-zinc-950 p-6 space-y-4">
            {/* Header text */}
            <div className="space-y-1 text-green-400 text-sm">
              <p className="text-green-300 font-bold">&gt; RESTRICTED ACCESS</p>
              <p className="text-zinc-600">&gt; ──────────────────</p>
              <p>&gt; Enter admin password to continue:</p>
            </div>

            {/* Input row */}
            <div className={`flex items-center gap-2 ${shaking ? 'animate-shake' : ''}`}>
              <span className="text-green-400 text-sm select-none">&gt;</span>
              <input
                ref={inputRef}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading || isLocked}
                placeholder={isLocked ? `Locked — ${countdown}s remaining` : ''}
                className="flex-1 bg-transparent border-b border-zinc-700 focus:border-green-500 outline-none text-green-300 text-sm py-1 placeholder-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                autoComplete="current-password"
              />
            </div>

            {/* Error message */}
            {error && (
              <p className="text-red-400 text-xs">
                {isLocked ? `> Too many attempts. Retry in ${countdown}s.` : error}
              </p>
            )}

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={loading || isLocked || !password.trim()}
              className="mt-2 px-4 py-2 border border-green-700 text-green-400 text-xs hover:bg-green-950 hover:border-green-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed rounded"
            >
              {loading ? '> Verifying...' : '> [ENTER]'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
