create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  full_name text,
  password_hash text not null,
  role text not null default 'staff' check (role in ('admin', 'staff')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  onboarding_date date not null,
  contact_person text,
  contact_email text,
  contact_phone text,
  client_status text not null default 'Active' check (client_status in ('Active', 'Inactive', 'On Hold')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  job_title text not null,
  role_received_date date not null,
  budget text,
  openings integer not null default 1 check (openings > 0),
  experience_required text,
  job_location text,
  priority text not null default 'Medium' check (priority in ('Low', 'Medium', 'High', 'Urgent')),
  role_status text not null default 'Open' check (role_status in ('Open', 'In Progress', 'On Hold', 'Filled', 'Closed', 'Cancelled')),
  job_description text,
  internal_notes text,
  completion_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.candidate_submissions (
  id uuid primary key default gen_random_uuid(),
  role_id uuid not null references public.roles(id) on delete cascade,
  candidate_name text not null,
  date_shared date not null default current_date,
  status text not null default 'Pending' check (status in ('Pending', 'Selected', 'Rejected')),
  remarks text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists profiles_email_lower_idx on public.profiles (lower(email));
create index if not exists clients_status_idx on public.clients(client_status);
create index if not exists clients_onboarding_date_idx on public.clients(onboarding_date desc);
create index if not exists roles_client_id_idx on public.roles(client_id);
create index if not exists roles_status_idx on public.roles(role_status);
create index if not exists roles_received_date_idx on public.roles(role_received_date desc);
create index if not exists candidate_submissions_role_id_idx on public.candidate_submissions(role_id);
create index if not exists candidate_submissions_status_idx on public.candidate_submissions(status);
create index if not exists candidate_submissions_date_shared_idx on public.candidate_submissions(date_shared desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.maintain_role_completion_date()
returns trigger
language plpgsql
as $$
begin
  if new.role_status in ('Filled', 'Closed', 'Cancelled') and new.completion_date is null then
    new.completion_date = current_date;
  elsif new.role_status in ('Open', 'In Progress', 'On Hold') then
    new.completion_date = null;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists clients_updated_at on public.clients;
create trigger clients_updated_at before update on public.clients
for each row execute function public.set_updated_at();

drop trigger if exists roles_updated_at on public.roles;
create trigger roles_updated_at before update on public.roles
for each row execute function public.set_updated_at();

drop trigger if exists roles_completion_date on public.roles;
create trigger roles_completion_date before insert or update on public.roles
for each row execute function public.maintain_role_completion_date();

drop trigger if exists candidate_submissions_updated_at on public.candidate_submissions;
create trigger candidate_submissions_updated_at before update on public.candidate_submissions
for each row execute function public.set_updated_at();

-- Create the first staff user after generating a hash:
-- node scripts/hash-password.mjs "your-password"
-- insert into public.profiles (email, full_name, password_hash, role)
-- values ('admin@closinggap.in', 'Closing Gap Admin', '<generated-hash>', 'admin');
