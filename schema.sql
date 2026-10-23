-- Chạy toàn bộ file này trong Supabase > SQL Editor
create table admins (uid uuid primary key references auth.users(id) on delete cascade);
create table games  (code text primary key, data jsonb not null, created_at timestamptz default now());
create table tests  (code text primary key, data jsonb not null, created_at timestamptz default now());
create table roster (id int primary key check (id = 1), names jsonb not null default '[]');
create table results(id text primary key, code text not null, uid uuid not null default auth.uid(),
  data jsonb not null check (pg_column_size(data) < 100000), created_at timestamptz default now());
create index on results(code);

create function is_admin() returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from admins where uid = auth.uid()) $$;

alter table admins  enable row level security;
alter table games   enable row level security;
alter table tests   enable row level security;
alter table roster  enable row level security;
alter table results enable row level security;

create policy "xem quyen cua minh" on admins for select to authenticated using (uid = auth.uid());

create policy "doc" on games  for select to authenticated using (true);
create policy "admin ghi" on games  for all to authenticated using (is_admin()) with check (is_admin());
create policy "doc" on tests  for select to authenticated using (true);
create policy "admin ghi" on tests  for all to authenticated using (is_admin()) with check (is_admin());
create policy "doc" on roster for select to authenticated using (true);
create policy "admin ghi" on roster for all to authenticated using (is_admin()) with check (is_admin());

-- Học sinh chỉ được NỘP (insert) một lần, không sửa/xóa; admin được xóa để làm lại
create policy "doc" on results for select to authenticated using (true);
create policy "hs nop" on results for insert to authenticated with check (uid = auth.uid());
create policy "admin xoa" on results for delete to authenticated using (is_admin());

-- Sau khi tạo tài khoản giáo viên ở Authentication > Users, chạy (thay email):
-- insert into admins select id from auth.users where email = 'giaovien@example.com';
