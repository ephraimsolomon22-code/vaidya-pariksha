-- TrialOps schema for Supabase (Postgres)
-- Run this in Supabase → SQL Editor (or via `supabase db push`).

create extension if not exists "pgcrypto";

-- ---------- roles / profiles ----------
create type role_type as enum ('Admin', 'Investigator', 'Coordinator', 'Data Manager', 'Safety', 'Regulatory');

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  role role_type not null default 'Coordinator'
);

-- ---------- core trial structure ----------
create table trials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phase text,
  status text not null default 'Draft' check (status in ('Draft', 'Active', 'Closed')),
  pi_name text,
  protocol_summary jsonb,
  created_at timestamptz not null default now()
);

create table trial_sites (
  id uuid primary key default gen_random_uuid(),
  trial_id uuid references trials (id) on delete cascade,
  name text not null,
  pi_name text,
  target_enrollment int not null default 0,
  enrolled_count int not null default 0
);

create table investigators (
  id uuid primary key default gen_random_uuid(),
  trial_id uuid references trials (id) on delete cascade,
  site_id uuid references trial_sites (id) on delete set null,
  full_name text not null,
  email text
);

create table ethics_reviews (
  id uuid primary key default gen_random_uuid(),
  trial_id uuid references trials (id) on delete cascade,
  approval_status text not null default 'Pending' check (approval_status in ('Pending', 'Approved', 'Rejected')),
  ctri_number text,
  responsible_user text,
  approved_at date
);

create table regulatory_records (
  id uuid primary key default gen_random_uuid(),
  trial_id uuid references trials (id) on delete cascade,
  record_type text not null,
  status text,
  due_date date
);

-- ---------- participants ----------
create table participants (
  id uuid primary key default gen_random_uuid(),
  trial_id uuid references trials (id) on delete cascade,
  site_id uuid references trial_sites (id) on delete set null,
  code text not null unique,
  stage text not null default 'Screening'
    check (stage in ('Screening', 'Eligible', 'Consented', 'Enrolled', 'Randomized')),
  -- Ayurveda research module fields
  prakriti text,
  vikriti text,
  dosha text,
  agni text,
  koshtha text,
  created_at timestamptz not null default now()
);

create table screening (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid references participants (id) on delete cascade,
  eligible boolean,
  notes text,
  screened_at timestamptz default now()
);

create table consents (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid references participants (id) on delete cascade,
  document_id uuid,
  signed_at timestamptz,
  version text
);

create table randomization (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid references participants (id) on delete cascade,
  arm text,
  randomized_at timestamptz default now()
);

-- ---------- visits & clinical data ----------
create table visits (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid references participants (id) on delete cascade,
  visit_label text not null,
  scheduled_date date not null,
  status text not null default 'Scheduled' check (status in ('Scheduled', 'Completed', 'Missed', 'Overdue')),
  adherence text,
  notes text
);

create table clinical_observations (
  id uuid primary key default gen_random_uuid(),
  visit_id uuid references visits (id) on delete cascade,
  field_name text not null,
  field_value text,
  recorded_at timestamptz default now()
);

-- ---------- safety ----------
create table adverse_events (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid references participants (id) on delete cascade,
  description text not null,
  severity text not null check (severity in ('Mild', 'Moderate', 'Severe')),
  event_date date not null,
  outcome text not null default 'Ongoing'
);

create table protocol_deviations (
  id uuid primary key default gen_random_uuid(),
  trial_id uuid references trials (id) on delete cascade,
  participant_id uuid references participants (id) on delete set null,
  description text,
  reported_at timestamptz default now()
);

-- ---------- data quality, risk, alerts, audit ----------
create table data_quality_issues (
  id uuid primary key default gen_random_uuid(),
  issue text not null,
  affected_record text not null,
  issue_type text not null check (issue_type in ('Missing', 'Duplicate', 'Inconsistent', 'Overdue')),
  severity text not null check (severity in ('High', 'Medium')),
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);

create table risk_flags (
  id uuid primary key default gen_random_uuid(),
  trial_id uuid references trials (id) on delete cascade,
  message text not null,
  severity text not null check (severity in ('Critical', 'High', 'Medium')),
  created_at timestamptz not null default now()
);

create table alerts (
  id uuid primary key default gen_random_uuid(),
  trial_id uuid references trials (id) on delete cascade,
  severity text not null check (severity in ('Critical', 'High', 'Medium')),
  message text not null,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_name text not null,
  action text not null,
  created_at timestamptz not null default now()
);

create table documents (
  id uuid primary key default gen_random_uuid(),
  trial_id uuid references trials (id) on delete cascade,
  storage_path text not null,
  doc_type text,
  uploaded_at timestamptz not null default now()
);

-- ---------- analytics view ----------
create or replace view weekly_enrollment as
select
  to_char(date_trunc('week', created_at), 'Mon DD') as week_label,
  count(*) over (order by date_trunc('week', created_at)) as cumulative
from participants
order by date_trunc('week', created_at);

-- ---------- trigger: auto-create a profile row on sign-up ----------
-- The app's sign-up form passes full_name and role as user metadata; this
-- trigger reads that metadata and creates the matching profiles row so no
-- manual SQL insert is needed after someone creates an account.
create or replace function public.handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'New user'),
    coalesce((new.raw_user_meta_data->>'role')::role_type, 'Coordinator')
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- trigger: auto-raise an alert on a Severe adverse event ----------
create or replace function raise_ae_alert() returns trigger as $$
begin
  if new.severity = 'Severe' then
    insert into alerts (trial_id, severity, message)
    select p.trial_id, 'Critical', 'Severe adverse event logged for participant ' || p.code
    from participants p where p.id = new.participant_id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_ae_alert
  after insert on adverse_events
  for each row execute function raise_ae_alert();

-- ---------- row-level security ----------
alter table profiles enable row level security;
alter table trials enable row level security;
alter table trial_sites enable row level security;
alter table participants enable row level security;
alter table visits enable row level security;
alter table adverse_events enable row level security;
alter table data_quality_issues enable row level security;
alter table alerts enable row level security;
alter table audit_logs enable row level security;
alter table ethics_reviews enable row level security;
alter table documents enable row level security;

-- Every authenticated user can see their own profile.
create policy "read own profile" on profiles for select using (auth.uid() = id);

-- Simple pattern used throughout: any authenticated user can read; only
-- specific roles can write. Tighten per-table as your real access rules require.
create policy "authenticated read trials" on trials for select using (auth.role() = 'authenticated');
create policy "admin investigator write trials" on trials for insert with check (
  exists (select 1 from profiles where id = auth.uid() and role in ('Admin', 'Investigator'))
);
create policy "admin investigator update trials" on trials for update using (
  exists (select 1 from profiles where id = auth.uid() and role in ('Admin', 'Investigator'))
);

create policy "authenticated read sites" on trial_sites for select using (auth.role() = 'authenticated');
create policy "authenticated read participants" on participants for select using (auth.role() = 'authenticated');
create policy "coordinator write participants" on participants for insert with check (
  exists (select 1 from profiles where id = auth.uid() and role in ('Admin', 'Coordinator', 'Investigator'))
);

create policy "authenticated read visits" on visits for select using (auth.role() = 'authenticated');
create policy "coordinator write visits" on visits for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('Admin', 'Coordinator', 'Investigator'))
);

create policy "authenticated read ae" on adverse_events for select using (auth.role() = 'authenticated');
create policy "safety write ae" on adverse_events for insert with check (
  exists (select 1 from profiles where id = auth.uid() and role in ('Admin', 'Safety', 'Investigator'))
);

create policy "authenticated read dq" on data_quality_issues for select using (auth.role() = 'authenticated');
create policy "authenticated read alerts" on alerts for select using (auth.role() = 'authenticated');
create policy "authenticated read audit" on audit_logs for select using (auth.role() = 'authenticated');
create policy "authenticated read ethics" on ethics_reviews for select using (auth.role() = 'authenticated');
create policy "authenticated read documents" on documents for select using (auth.role() = 'authenticated');
create policy "authenticated insert documents" on documents for insert with check (auth.role() = 'authenticated');

-- Enable Realtime on the alerts table (Database → Replication in the dashboard
-- does this too; this is the SQL equivalent).
alter publication supabase_realtime add table alerts;
