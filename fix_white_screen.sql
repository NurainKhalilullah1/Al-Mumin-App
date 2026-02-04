-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. NOTICES TABLE (Fixes NewsTicker 500 Error)
create table if not exists notices (
  id uuid default uuid_generate_v4() primary key,
  message text not null,
  audience text,
  show_on_ticker boolean default false,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS for notices
alter table notices enable row level security;
-- Allow read access to everyone (public) for ticker
create policy "Public notices are viewable by everyone" on notices for select using (true);
-- Allow all access to authenticated users (admin) - adjust as needed
create policy "Admins can manage notices" on notices for all using (auth.role() = 'authenticated');

-- Insert default ticker message if empty
insert into notices (message, show_on_ticker, active)
select 'Welcome to Al-Mumin Schools Portal', true, true
where not exists (select 1 from notices);


-- 2. CLASSES TABLE
create table if not exists classes (
  id text primary key, -- Using text ID as per db.js (CLS-...)
  name text not null,
  level text,
  form_teacher text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table classes enable row level security;
create policy "Public classes view" on classes for select using (true);
create policy "Admin manage classes" on classes for all using (auth.role() = 'authenticated');


-- 3. STUDENTS TABLE
create table if not exists students (
  id text primary key, -- AMS/2026/...
  name text not null,
  class_level text,
  gender text,
  parent_name text,
  parent_phone text,
  status text default 'Active',
  joined_date timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table students enable row level security;
create policy "Public students view" on students for select using (true); 
create policy "Admin manage students" on students for all using (auth.role() = 'authenticated');


-- 4. RESULTS TABLE
create table if not exists results (
  id uuid default uuid_generate_v4() primary key,
  student_id text references students(id),
  term text,
  subject text,
  test1 integer default 0,
  test2 integer default 0,
  mid_term integer default 0,
  exam integer default 0,
  grade text,
  remark text,
  approval_status text default 'Pending',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table results enable row level security;
create policy "Public results view" on results for select using (true); -- meaningful restriction later
create policy "Admin manage results" on results for all using (auth.role() = 'authenticated');


-- 5. PAYMENTS TABLE
create table if not exists payments (
  id text primary key,
  student_id text references students(id),
  student_name text,
  class_level text,
  amount numeric,
  date timestamp with time zone,
  method text,
  status text default 'Pending',
  receipt_ref text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table payments enable row level security;
create policy "Admin manage payments" on payments for all using (auth.role() = 'authenticated');


-- 6. ADMIN SETTINGS (Profile, Bank Details)
create table if not exists admin_settings (
  key text primary key,
  value jsonb
);

alter table admin_settings enable row level security;
create policy "Public settings view" on admin_settings for select using (true);
create policy "Admin manage settings" on admin_settings for all using (auth.role() = 'authenticated');

-- 7. SUBJECTS TABLE
create table if not exists subjects (
  id text primary key,
  name text,
  type text,
  department text,
  teacher text
);
alter table subjects enable row level security;
create policy "Public subjects view" on subjects for select using (true);
create policy "Admin manage subjects" on subjects for all using (auth.role() = 'authenticated');

-- 8. STAFF TABLE
create table if not exists staff (
  id text primary key,
  name text,
  role text,
  department text,
  subject text,
  email text,
  phone text
);
alter table staff enable row level security;
create policy "Public staff view" on staff for select using (true);
create policy "Admin manage staff" on staff for all using (auth.role() = 'authenticated');
