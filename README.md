# VaidyaPariksha

AI-assisted clinical trial management system for AIIA (SIH26046), formerly prototyped as "TrialOps". React + TypeScript + Vite frontend on Supabase
(Postgres + Auth + Storage + Realtime), with Gemini-powered protocol extraction and an AI Trial Copilot running as
Supabase Edge Functions.

## 1. Open in VS Code

```bash
cd trialops
npm install
cp .env.example .env
```

## 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In **Project Settings → API**, copy the Project URL and anon public key into `.env`:
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```
3. Open **SQL Editor** and run `supabase/schema.sql` (creates all tables, RLS policies, the auto-alert trigger,
   and enables Realtime on `alerts`). Optionally run `supabase/seed.sql` for demo data.
4. In **Storage**, create a bucket named `documents` (used for protocol PDFs).
5. In **Authentication → Users**, create a user for each demo login, then insert a matching row into `profiles`
   with their `role` (Admin / Investigator / Coordinator / Data Manager / Safety / Regulatory):
   ```sql
   insert into profiles (id, full_name, role)
   values ('<auth-user-uuid>', 'Dr. R. Menon', 'Investigator');
   ```

## 3. Gemini setup (Edge Functions)

The Gemini API key is never exposed to the browser — it's used only inside Supabase Edge Functions.

```bash
npm install -g supabase
supabase login
supabase link --project-ref YOUR-PROJECT-REF
supabase secrets set GEMINI_API_KEY=your-gemini-api-key
supabase functions deploy extract-protocol
supabase functions deploy ai-copilot
```

- `extract-protocol`: downloads the uploaded PDF from Storage, sends it to Gemini, returns structured trial fields.
- `ai-copilot`: pulls a live snapshot of trials/sites/participants/visits/adverse events and asks Gemini to answer
  questions grounded in that data.

## 4. Run it

```bash
npm run dev
```

## 5. Deploy

Push to GitHub and import the repo into [Vercel](https://vercel.com); add the two `VITE_*` env vars in the Vercel
project settings. Edge Functions live on Supabase, not Vercel, so no extra config is needed for those.

## Project layout

```
src/
  lib/            Supabase client, FHIR mapping helper, realtime alerts hook
  contexts/       Auth context (Supabase Auth + role from profiles table)
  components/     Layout/sidebar (role-gated nav) + shared UI primitives
  pages/          One page per workflow stage (Protocol Setup, Trials, Ethics,
                   Sites, Participants, Visits, Safety, Data Quality, AI & Risk,
                   Analytics, Export, Audit)
supabase/
  schema.sql      Tables, RLS policies, alert trigger, weekly_enrollment view
  seed.sql        Optional demo data
  functions/      extract-protocol and ai-copilot Edge Functions (Deno)
```

## Notes / where to extend

- **UI kit**: pages use small hand-rolled primitives (`src/components/ui/Primitives.tsx`) in the spec's color
  palette. To use real shadcn/ui components instead, run `npx shadcn@latest init` and swap them in per-component.
- **Data Quality Guardian / Risk engine**: currently read from `data_quality_issues` / `risk_flags` tables. Populate
  them with a scheduled Edge Function (Supabase supports cron via `pg_cron` or external schedulers) that scans for
  missing fields, duplicates, and overdue visits.
- **Charts**: Recharts is wired up for bar/line charts. For the risk heatmap mentioned in the spec, add ECharts
  (`npm install echarts echarts-for-react`) since Recharts has no built-in heatmap.
- **FHIR/CDISC export**: `src/lib/fhir.ts` has one minimal resource mapping as a starting point — this is a
  demonstration, not a certified export. Do not present it as production-ready or fully compliant.
- **Compliance**: use synthetic/de-identified data only. This prototype demonstrates workflow and architecture; a
  production deployment needs real security, validation, privacy and regulatory review.
