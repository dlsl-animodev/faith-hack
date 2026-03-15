'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Submission, NewEntry } from '@/lib/types';

// ─── submitEntries ───────────────────────────────────────────────────────────

/**
 * Inserts a batch of entries into the submissions table.
 * Returns the generated UUIDs for each inserted row.
 */
export async function submitEntries(
  entries: NewEntry[]
): Promise<{ ids: string[] }> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from('submissions')
    .insert(entries)
    .select('id');

  if (error) {
    throw new Error(`Failed to submit entries: ${error.message}`);
  }

  return { ids: (data ?? []).map((row) => row.id as string) };
}

// ─── getSubmissions ──────────────────────────────────────────────────────────

/**
 * Returns all submissions ordered by creation date, newest first.
 */
export async function getSubmissions(): Promise<Submission[]> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch submissions: ${error.message}`);
  }

  return (data ?? []) as Submission[];
}

// ─── getSubmissionCount ──────────────────────────────────────────────────────

/**
 * Returns the total number of submissions using a COUNT query.
 */
export async function getSubmissionCount(): Promise<number> {
  const supabase = createSupabaseServerClient();

  const { count, error } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true });

  if (error) {
    throw new Error(`Failed to fetch submission count: ${error.message}`);
  }

  return count ?? 0;
}
