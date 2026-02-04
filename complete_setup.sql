-- COMPLETE DATABASE SETUP
-- Run this script in Supabase SQL Editor to set up all tables and security.

-- 1. COURSES / CLASSES
CREATE TABLE IF NOT EXISTS classes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    level TEXT,
    form_teacher TEXT
);

-- 2. SUBJECTS
CREATE TABLE IF NOT EXISTS subjects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT, -- Junior/Senior
    department TEXT, -- Science/Art/etc
    teacher TEXT
);

-- 3. STUDENTS
CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    class_level TEXT,
    gender TEXT,
    parent_name TEXT,
    parent_phone TEXT,
    status TEXT DEFAULT 'Active',
    joined_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. STAFF
CREATE TABLE IF NOT EXISTS staff (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT,
    department TEXT,
    subject TEXT,
    email TEXT,
    phone TEXT
);

-- 5. RESULTS / SCORES
CREATE TABLE IF NOT EXISTS results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id TEXT REFERENCES students(id),
    term TEXT,
    subject TEXT,
    test1 NUMERIC DEFAULT 0,
    test2 NUMERIC DEFAULT 0,
    mid_term NUMERIC DEFAULT 0,
    exam NUMERIC DEFAULT 0,
    grade TEXT,
    remark TEXT,
    approval_status TEXT DEFAULT 'Pending'
);

-- 6. PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    student_id TEXT, -- Loose reference to allow keep history even if student deleted
    student_name TEXT,
    class_level TEXT,
    amount NUMERIC,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    method TEXT,
    status TEXT DEFAULT 'Pending',
    receipt_ref TEXT
);

-- 7. NOTICES (Ticker & Board)
CREATE TABLE IF NOT EXISTS notices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message TEXT NOT NULL,
    audience TEXT,
    show_on_ticker BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. ADMIN SETTINGS (Profile, Bank Details, etc)
CREATE TABLE IF NOT EXISTS admin_settings (
    key TEXT PRIMARY KEY,
    value JSONB
);

-- === SECURITY (ROW LEVEL SECURITY) ===

-- Enable RLS on all tables
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

-- DROP EXISTING POLICIES TO AVOID CONFLICTS (Safe Re-run)
DROP POLICY IF EXISTS "Public Read Notices" ON notices;
DROP POLICY IF EXISTS "Public Read Staff" ON staff;
DROP POLICY IF EXISTS "Public Read Classes" ON classes;
DROP POLICY IF EXISTS "Public Read Subjects" ON subjects;

DROP POLICY IF EXISTS "Admin All Access Settings" ON admin_settings;
DROP POLICY IF EXISTS "Admin All Access Classes" ON classes;
DROP POLICY IF EXISTS "Admin All Access Notices" ON notices;
DROP POLICY IF EXISTS "Admin All Access Payments" ON payments;
DROP POLICY IF EXISTS "Admin All Access Results" ON results;
DROP POLICY IF EXISTS "Admin All Access Staff" ON staff;
DROP POLICY IF EXISTS "Admin All Access Students" ON students;
DROP POLICY IF EXISTS "Admin All Access Subjects" ON subjects;


-- Create Policies for Public Read (Website Access)
CREATE POLICY "Public Read Notices" ON notices FOR SELECT USING (true);
CREATE POLICY "Public Read Staff" ON staff FOR SELECT USING (true);
CREATE POLICY "Public Read Classes" ON classes FOR SELECT USING (true);
CREATE POLICY "Public Read Subjects" ON subjects FOR SELECT USING (true);

-- Create Policies for Authenticated Admin (Dashboard Access)
CREATE POLICY "Admin All Access Settings" ON admin_settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All Access Classes" ON classes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All Access Notices" ON notices FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All Access Payments" ON payments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All Access Results" ON results FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All Access Staff" ON staff FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All Access Students" ON students FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All Access Subjects" ON subjects FOR ALL USING (auth.role() = 'authenticated');

