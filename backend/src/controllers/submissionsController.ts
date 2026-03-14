import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import supabase from '../supabase/client';

// ─── Types ─────────────────────────────────────────────────────────────────

interface SubmissionEntry {
  type: 'bug' | 'debug';
  content: string;
}

interface CreateSubmissionsBody {
  entries: SubmissionEntry[];
}

// ─── POST /api/submissions ──────────────────────────────────────────────────

/**
 * Accepts an array of { type, content } entries, attaches a shared
 * reference ID, inserts all rows to Supabase, and returns the inserted data.
 */
export const createSubmissions = async (
  req: Request<{}, {}, CreateSubmissionsBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { entries } = req.body;

    if (!Array.isArray(entries) || entries.length === 0) {
      res.status(400).json({ error: 'entries must be a non-empty array.' });
      return;
    }

    // Validate each entry
    for (const entry of entries) {
      if (!['bug', 'debug'].includes(entry.type)) {
        res.status(400).json({ error: `Invalid type: "${entry.type}". Must be "bug" or "debug".` });
        return;
      }
      if (!entry.content || typeof entry.content !== 'string' || entry.content.trim() === '') {
        res.status(400).json({ error: 'Each entry must have a non-empty content string.' });
        return;
      }
    }

    // One shared reference ID for the whole submission session
    const referenceId = uuidv4();

    const rows = entries.map((entry) => ({
      type: entry.type,
      content: entry.content.trim(),
      reference_id: referenceId,
    }));

    const { data, error } = await supabase
      .from('submissions')
      .insert(rows)
      .select();

    if (error) throw error;

    res.status(201).json({ referenceId, data });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/submissions ───────────────────────────────────────────────────

/**
 * Returns all submission rows ordered newest-first.
 */
export const getSubmissions = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/submissions/count ─────────────────────────────────────────────

/**
 * Returns the total row count in the submissions table.
 */
export const getCount = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { count, error } = await supabase
      .from('submissions')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    res.json({ count: count ?? 0 });
  } catch (err) {
    next(err);
  }
};
