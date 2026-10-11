create extension if not exists "pgcrypto";

create type public.client_status as enum ('Active', 'Inactive', 'On Hold');
create type public.role_priority as enum ('Low', 'Medium', 'High', 'Urgent');
create type public.role_status as enum ('Open', 'In Progress', 'On Hold', 'Filled', 'Closed', 'Cancelled');
create type public.candidate_status as enum ('Pending', 'Selected', 'Rejected');
create type public.staff_role as enum ('admin', 'staff');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role public.staff_role not null default 'staff',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  onboarding_date date not null,
  contact_person text,
  contact_email text,
  contact_phone text,
  client_status public.client_status not null default 'Active',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  job_title text not null,
  role_received_date date not null,
  budget text,
  openings integer not null default 1 check (openings > 0),
  experience_required text,
  job_location text,
  priority public.role_priority not null default 'Medium',
  role_status public.role_status not null default 'Open',
  job_description text,
  internal_notes text,
  completion_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.candidate_submissions (
  id uuid primary key default gen_random_uuid(),
  role_id uuid not null references public.roles(id) on delete cascade,
  candidate_name text not null,
  date_shared date not null default current_date,
  status public.candidate_status not null default 'Pending',
  remarks text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index clients_status_idx on public.clients(client_status);
create index clients_onboarding_date_idx on public.clients(onboarding_date desc);
create index roles_client_id_idx on public.roles(client_id);
create index roles_status_idx on public.roles(role_status);
create index roles_received_date_idx on public.roles(role_received_date desc);
create index candidate_submissions_role_id_idx on public.candidate_submissions(role_id);
create index candidate_submissions_status_idx on public.candidate_submissions(status);
create index candidate_submissions_date_shared_idx on public.candidate_submissions(date_shared desc);

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
  if new.role_status in ('Filled', 'Closed', 'Cancelled') and (old.role_status is distinct from new.role_status) then
    new.completion_date = coalesce(new.completion_date, current_date);
  elsif new.role_status in ('Open', 'In Progress', 'On Hold') then
    new.completion_date = null;
  end if;
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

create trigger clients_updated_at before update on public.clients
for each row execute function public.set_updated_at();

create trigger roles_updated_at before update on public.roles
for each row execute function public.set_updated_at();

create trigger roles_completion_date before update on public.roles
for each row execute function public.maintain_role_completion_date();

create trigger candidate_submissions_updated_at before update on public.candidate_submissions
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.roles enable row level security;
alter table public.candidate_submissions enable row level security;

create policy "profiles can read own profile"
on public.profiles for select
to authenticated
using (id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "profiles can update own profile"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "authenticated staff can read clients"
on public.clients for select
to authenticated
using (true);

create policy "authenticated staff can insert clients"
on public.clients for insert
to authenticated
with check (true);

create policy "authenticated staff can update clients"
on public.clients for update
to authenticated
using (true)
with check (true);

create policy "authenticated staff can delete clients"
on public.clients for delete
to authenticated
using (true);

create policy "authenticated staff can read roles"
on public.roles for select
to authenticated
using (true);

create policy "authenticated staff can insert roles"
on public.roles for insert
to authenticated
with check (true);

create policy "authenticated staff can update roles"
on public.roles for update
to authenticated
using (true)
with check (true);

create policy "authenticated staff can delete roles"
on public.roles for delete
to authenticated
using (true);

create policy "authenticated staff can read candidate submissions"
on public.candidate_submissions for select
to authenticated
using (true);

create policy "authenticated staff can insert candidate submissions"
on public.candidate_submissions for insert
to authenticated
with check (true);

create policy "authenticated staff can update candidate submissions"
on public.candidate_submissions for update
to authenticated
using (true)
with check (true);

create policy "authenticated staff can delete candidate submissions"
on public.candidate_submissions for delete
to authenticated
using (true);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), 'staff')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
