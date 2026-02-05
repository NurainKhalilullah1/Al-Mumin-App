-- Add password column to students
ALTER TABLE students ADD COLUMN IF NOT EXISTS password TEXT;

-- Add password and assigned_class column to staff
ALTER TABLE staff ADD COLUMN IF NOT EXISTS password TEXT;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS assigned_class TEXT;

-- Create applicants table (replacing local storage mock)
CREATE TABLE IF NOT EXISTS applicants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER,
  class_level TEXT,
  parent_name TEXT,
  parent_phone TEXT,
  status TEXT DEFAULT 'Pending', -- Pending, Admitted, Rejected
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for applicants
ALTER TABLE applicants ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid errors
DROP POLICY IF EXISTS "Allow anon insert applicants" ON applicants;
DROP POLICY IF EXISTS "Allow public read applicants" ON applicants;
DROP POLICY IF EXISTS "Allow all update applicants" ON applicants;

CREATE POLICY "Allow anon insert applicants" ON applicants FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read applicants" ON applicants FOR SELECT USING (true);
CREATE POLICY "Allow all update applicants" ON applicants FOR UPDATE USING (true); 

-- Admin Settings (Key-Value store for flexible config like Bank Details)
CREATE TABLE IF NOT EXISTS admin_settings (
  key TEXT PRIMARY KEY,
  value JSONB
);

-- Enable RLS for admin_settings
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read admin_settings" ON admin_settings;
DROP POLICY IF EXISTS "Allow all update admin_settings" ON admin_settings;
DROP POLICY IF EXISTS "Allow all insert admin_settings" ON admin_settings;

CREATE POLICY "Allow public read admin_settings" ON admin_settings FOR SELECT USING (true);
CREATE POLICY "Allow all update admin_settings" ON admin_settings FOR UPDATE USING (true);
CREATE POLICY "Allow all insert admin_settings" ON admin_settings FOR INSERT WITH CHECK (true);
