/**
 * Typed fetch helpers for the Express backend API.
 * All functions use NEXT_PUBLIC_API_URL from the environment.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface SubmissionEntry {
  type: 'bug' | 'debug';
  content: string;
}

export interface Submission {
  id: string;
  type: 'bug' | 'debug';
  content: string;
  reference_id: string;
  created_at: string;
}

export interface CreateSubmissionsResponse {
  referenceId: string;
  data: Submission[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ─── API Functions ────────────────────────────────────────────────────────────

/** POST /api/submissions — send all entries in one batch */
export function postSubmissions(
  entries: SubmissionEntry[]
): Promise<CreateSubmissionsResponse> {
  return apiFetch<CreateSubmissionsResponse>('/api/submissions', {
    method: 'POST',
    body: JSON.stringify({ entries }),
  });
}

/** GET /api/submissions — fetch all submissions newest-first */
export function getSubmissions(): Promise<Submission[]> {
  return apiFetch<Submission[]>('/api/submissions');
}

/** GET /api/submissions/count — fetch total count */
export function getCount(): Promise<{ count: number }> {
  return apiFetch<{ count: number }>('/api/submissions/count');
}
