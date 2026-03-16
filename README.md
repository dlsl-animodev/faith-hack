# Faith: Hack 🐛

> A CLI-aesthetic web application for submitting Bug Reports and Debug Logs.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui |
| Backend | Supabase + Next.js server actions (no separate Express API) |
| Database | Supabase (PostgreSQL + Realtime) |

---

## Project Structure

```
faith-hack/
├── frontend/          ← Next.js app (port 3000)
│   ├── app/
│   │   ├── home/      ← CLI-style submission form
│   │   └── admin/     ← Realtime admin dashboard
│   ├── components/
│   │   ├── AdminDashboard.tsx
│   │   ├── CliPrompt.tsx
│   │   ├── CliTerminal.tsx
│   │   ├── StackedSubmissions.tsx
│   │   └── TypewriterText.tsx
│   ├── actions/
│   │   └── submissions.ts
│   └── lib/
│       ├── supabase/client.ts
│       └── supabase/server.ts
└── package.json       ← Monorepo root (frontend-only if backend folder is missing)
```

---

## Setup

### 1. Supabase — Run this SQL in your project's SQL editor

```sql
create table if not exists public.submissions (
  id           uuid primary key default gen_random_uuid(),
  type         text not null check (type in ('bug', 'debug')),
  content      text not null,
  created_at   timestamptz not null default now()
);

alter table public.submissions enable row level security;

create policy "Allow anon select" on public.submissions
  for select using (true);
```

### 2. Configure environment variables

**`frontend/.env.local`**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
ADMIN_PASSWORD=faith
```

> **Where to find your keys:**  
> Supabase Dashboard → Project Settings → API  
- `service_role` key → `SUPABASE_SERVICE_KEY` (server-side only, never expose)  
> - `anon` / `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY` (frontend Realtime only)

### 3. Install dependencies

```bash
npm install
cd frontend
npm install
```

### 4. Run in development

```bash
cd frontend
npm run dev
```

This starts the frontend app:
- **Frontend**: http://localhost:3000/home

---

## Supabase data model

The frontend uses server actions to write/read Supabase directly from `frontend/actions/submissions.ts`:
- `submitEntries(entries: NewEntry[])` inserts to `submissions`
- `getSubmissions()` selects all rows ordered newest first
- `getSubmissionCount()` returns table count

---

## Pages

| Route | Description |
|---|---|
| `/home` | CLI-style multi-step submission form |
| `/admin` | Realtime admin dashboard (password-gated; updated CLI viewport height for 6 submissions) |

### Admin notes
- Access with `ADMIN_PASSWORD` in `frontend/.env.local` (default `faith`).
- The CLI-themed admin terminal now has an increased min-height so 6 submissions fit comfortably on screen.

