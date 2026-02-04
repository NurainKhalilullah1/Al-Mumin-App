
-- Enable RLS on all tables
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

-- Create Policies for Public Read (Website Access)
-- We allow anyone (anon) to read basic info needed for the website
CREATE POLICY "Public Read Notices" ON notices FOR SELECT USING (true);
CREATE POLICY "Public Read Staff" ON staff FOR SELECT USING (true);
CREATE POLICY "Public Read Classes" ON classes FOR SELECT USING (true);
CREATE POLICY "Public Read Subjects" ON subjects FOR SELECT USING (true);

-- Create Policies for Authenticated Admin (Dashboard Access)
-- Admins can do everything
CREATE POLICY "Admin All Access Settings" ON admin_settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All Access Classes" ON classes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All Access Notices" ON notices FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All Access Payments" ON payments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All Access Results" ON results FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All Access Staff" ON staff FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All Access Students" ON students FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All Access Subjects" ON subjects FOR ALL USING (auth.role() = 'authenticated');
