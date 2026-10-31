create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  session_code text not null unique,
  topics jsonb not null default '[]'::jsonb,
  material text,
  question_variants integer not null default 2 check (question_variants >= 2),
  tutor_settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.learning_events (
  id bigint generated always as identity primary key,
  session_code text not null,
  event_type text not null,
  alias text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists learning_events_session_code_idx on public.learning_events (session_code);
create index if not exists learning_events_event_type_idx on public.learning_events (event_type);

alter table public.courses enable row level security;
alter table public.learning_events enable row level security;
