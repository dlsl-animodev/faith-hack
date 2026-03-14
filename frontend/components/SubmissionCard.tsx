'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Submission } from '@/lib/api';

interface SubmissionCardProps {
  submission: Submission;
}

/** Formats an ISO timestamp to a human-readable local date/time string. */
function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Expandable submission card for the admin dashboard.
 * Shows type badge, timestamp, truncated preview, and full content on expand.
 */
export default function SubmissionCard({ submission }: SubmissionCardProps) {
  const [expanded, setExpanded] = useState(false);

  const { type, content, created_at, reference_id } = submission;
  const preview = content.length > 120 ? content.slice(0, 120) + '…' : content;

  return (
    <Card
      className="bg-zinc-900 border-zinc-700 hover:border-green-600 transition-colors cursor-pointer"
      onClick={() => setExpanded((prev) => !prev)}
    >
      <CardHeader className="pb-2 flex flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant="outline"
            className={
              type === 'bug'
                ? 'border-red-500 text-red-400'
                : 'border-blue-500 text-blue-400'
            }
          >
            {type === 'bug' ? '🐛 Bug' : '🔍 Debug'}
          </Badge>
          <span className="text-zinc-500 text-xs">{formatTimestamp(created_at)}</span>
        </div>
        <span className="text-zinc-600 text-xs font-mono truncate max-w-35">
          ref: {reference_id.slice(0, 8)}
        </span>
      </CardHeader>

      <CardContent className="text-green-300 text-sm leading-relaxed">
        <p className="whitespace-pre-wrap wrap-break-words">
          {expanded ? content : preview}
        </p>
        <p className="text-zinc-600 text-xs mt-2">
          {expanded ? '▲ Click to collapse' : '▼ Click to expand'}
        </p>
      </CardContent>
    </Card>
  );
}
