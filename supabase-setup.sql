-- Run this in the Supabase SQL Editor. Admin access is restricted to
-- mrmadileng07@gmail.com, which must also be the configured Supabase Auth user.

create table if not exists public.road_requests (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  name text not null,
  phone text not null,
  service text not null,
  area text not null,
  landmark text not null,
  details text not null,
  photo text,
  gps jsonb,
  status text not null default 'Received (demo)',
  created_at timestamptz not null default now()
);

alter table public.road_requests enable row level security;
grant insert on public.road_requests to anon, authenticated;
grant select, update, delete on public.road_requests to authenticated;

drop policy if exists "Public can submit roadside requests" on public.road_requests;
create policy "Public can submit roadside requests"
on public.road_requests for insert to anon, authenticated
with check (
  char_length(name) between 1 and 80
  and char_length(phone) between 1 and 20
  and char_length(area) between 1 and 100
  and char_length(landmark) between 1 and 180
  and char_length(details) between 1 and 1000
  and (photo is null or (left(photo, 23) = 'data:image/jpeg;base64,' and char_length(photo) < 1400000))
  and status = 'Received (demo)'
);

drop policy if exists "Admin can read roadside requests" on public.road_requests;
create policy "Admin can read roadside requests"
on public.road_requests for select to authenticated
using ((auth.jwt() ->> 'email') = 'mrmadileng07@gmail.com');

drop policy if exists "Admin can update roadside requests" on public.road_requests;
create policy "Admin can update roadside requests"
on public.road_requests for update to authenticated
using ((auth.jwt() ->> 'email') = 'mrmadileng07@gmail.com')
with check ((auth.jwt() ->> 'email') = 'mrmadileng07@gmail.com');

drop policy if exists "Admin can delete roadside requests" on public.road_requests;
create policy "Admin can delete roadside requests"
on public.road_requests for delete to authenticated
using ((auth.jwt() ->> 'email') = 'mrmadileng07@gmail.com');

-- Allow anyone with a request reference to see basic status only.
-- Contact details, incident descriptions, photos and GPS stay protected.
create or replace function public.track_road_request(p_reference text)
returns table (
  reference text,
  service text,
  area text,
  landmark text,
  status text,
  created_at timestamptz
)
language sql
security definer
set search_path = ''
as $$
  select r.reference, r.service, r.area, r.landmark, r.status, r.created_at
  from public.road_requests as r
  where r.reference = p_reference
  limit 1
$$;

revoke all on function public.track_road_request(text) from public;
grant execute on function public.track_road_request(text) to anon, authenticated;
