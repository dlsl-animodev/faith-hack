import { getSubmissions, getSubmissionCount } from '@/actions/submissions';
import AdminDashboard from '@/components/AdminDashboard';
import CliTerminal from '@/components/CliTerminal';

// Force dynamic rendering — Supabase calls happen at request time, not build time.
export const dynamic = 'force-dynamic';

/**
 * Server Component — fetches initial data at request time (no loading spinner).
 * Passes SSR-seeded data to the AdminDashboard client component for Realtime.
 */
export default async function AdminPage() {
  const [submissions, count] = await Promise.all([
    getSubmissions(),
    getSubmissionCount(),
  ]);

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <CliTerminal title="faith-hack — admin">
          <AdminDashboard
            initialSubmissions={submissions}
            initialCount={count}
          />
        </CliTerminal>
      </div>
    </main>
  );
}
