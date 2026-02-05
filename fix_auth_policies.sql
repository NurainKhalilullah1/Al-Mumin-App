-- Enable RLS on users tables to be safe, but allow access api-side for this MVP
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- Drop constraints if they are causing issues (optional, but good for cleanup)
-- ALTER TABLE staff DROP CONSTRAINT IF EXISTS staff_email_key;

-- Policies for Students
DROP POLICY IF EXISTS "Public read students" ON students;
CREATE POLICY "Public read students" ON students FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert students" ON students;
CREATE POLICY "Public insert students" ON students FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public update students" ON students;
CREATE POLICY "Public update students" ON students FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public delete students" ON students;
CREATE POLICY "Public delete students" ON students FOR DELETE USING (true);


-- Policies for Staff
DROP POLICY IF EXISTS "Public read staff" ON staff;
CREATE POLICY "Public read staff" ON staff FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert staff" ON staff;
CREATE POLICY "Public insert staff" ON staff FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public update staff" ON staff;
CREATE POLICY "Public update staff" ON staff FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public delete staff" ON staff;
CREATE POLICY "Public delete staff" ON staff FOR DELETE USING (true);


-- OPTIONAL: Clean up duplicates (Keep latest) - Advanced
-- This is just a permission fix script. 
