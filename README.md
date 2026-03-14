# Faith: Hack 🐛

> A CLI-aesthetic web application for submitting Bug Reports and Debug Logs.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui |
| Backend | Node.js, Express, TypeScript |
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
│   │   ├── CliPrompt.tsx
│   │   ├── TypewriterText.tsx
│   │   └── SubmissionCard.tsx
│   └── lib/
│       ├── api.ts     ← Typed fetch helpers
│       └── supabaseClient.ts
├── backend/           ← Express API (port 3001)
│   └── src/
│       ├── server.ts
│       ├── routes/submissions.ts
│       ├── controllers/submissionsController.ts
│       └── supabase/client.ts
└── package.json       ← Monorepo root
```

---

## Setup

### 1. Supabase — Run this SQL in your project's SQL editor

```sql
create table if not exists public.submissions (
  id           uuid primary key default gen_random_uuid(),
  type         text not null check (type in ('bug', 'debug')),
  content      text not null,
  reference_id uuid not null,
  created_at   timestamptz not null default now()
);

alter table public.submissions enable row level security;

create policy "Allow anon select" on public.submissions
  for select using (true);
```

### 2. Configure environment variables

**`backend/.env`**
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
PORT=3001
FRONTEND_URL=http://localhost:3000
```

**`frontend/.env.local`**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

> **Where to find your keys:**  
> Supabase Dashboard → Project Settings → API  
> - `service_role` key → `SUPABASE_SERVICE_KEY` (backend only, never expose)  
> - `anon` / `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY` (frontend Realtime only)

### 3. Install dependencies

```bash
npm install
```

### 4. Run in development

```bash
npm run dev
```

This starts both servers concurrently:
- **Frontend**: http://localhost:3000/home
- **Backend**: http://localhost:3001/health

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/submissions` | Submit an array of entries |
| `GET` | `/api/submissions` | Fetch all submissions (newest first) |
| `GET` | `/api/submissions/count` | Fetch total submission count |

**Example POST body:**
```json
{
  "entries": [
    { "type": "bug", "content": "Button does not submit on mobile." },
    { "type": "debug", "content": "Traced issue to missing onClick handler." }
  ]
}
```

---

## Pages

| Route | Description |
|---|---|
| `/home` | CLI-style multi-step submission form |
| `/admin` | Realtime admin dashboard (open, no auth) |
