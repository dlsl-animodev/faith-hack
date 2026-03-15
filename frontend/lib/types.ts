// ─── Shared TypeScript Types ─────────────────────────────────────────────────

export type SubmissionType = 'bug' | 'debug';

export interface Submission {
  id: string;
  type: SubmissionType;
  content: string;
  created_at: string;
}

export interface NewEntry {
  type: SubmissionType;
  content: string;
}
