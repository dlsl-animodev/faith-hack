'use server';

import { timingSafeEqual } from 'crypto';

// ─── Server Action ────────────────────────────────────────────────────────────

/**
 * Verifies the submitted password against the ADMIN_PASSWORD env variable.
 * Uses crypto.timingSafeEqual to prevent timing-based side-channel attacks.
 * Never leaks the actual password or any env variable value.
 */
export async function verifyAdminPassword(
  password: string
): Promise<{ success: boolean }> {
  const stored = process.env.ADMIN_PASSWORD ?? '';

  // Buffers must be same length for timingSafeEqual — check length first
  // to avoid throwing. If lengths differ, it's definitely wrong.
  const inputBuf = Buffer.from(password);
  const storedBuf = Buffer.from(stored);

  if (inputBuf.length === 0 || inputBuf.length !== storedBuf.length) {
    return { success: false };
  }

  const match = timingSafeEqual(inputBuf, storedBuf);
  return { success: match };
}
