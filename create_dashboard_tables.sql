-- 1. Staff Leaves Table
CREATE TABLE IF NOT EXISTS staff_leaves (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    staff_id TEXT REFERENCES staff(id),
    name TEXT NOT NULL,
    department TEXT,
    start_date DATE,
    end_date DATE,
    reason TEXT,
    status TEXT DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    amount NUMERIC NOT NULL,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    description TEXT,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Staff To-Dos Table
CREATE TABLE IF NOT EXISTS staff_todos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    staff_id TEXT NOT NULL,
    text TEXT NOT NULL,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Add DOB to Students (if not exists)
ALTER TABLE students ADD COLUMN IF NOT EXISTS dob DATE;

-- Enable RLS
ALTER TABLE staff_leaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_todos ENABLE ROW LEVEL SECURITY;

-- Basic Policies (Adjust as needed for strictness)
CREATE POLICY "Public read staff_leaves" ON staff_leaves FOR SELECT USING (true);
CREATE POLICY "Admin all access staff_leaves" ON staff_leaves FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public read expenses" ON expenses FOR SELECT USING (true);
CREATE POLICY "Admin all access expenses" ON expenses FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public read staff_todos" ON staff_todos FOR SELECT USING (true);
CREATE POLICY "Authenticated all access staff_todos" ON staff_todos FOR ALL USING (auth.role() = 'authenticated');

-- Additional policy for anonymous/public to allow updates where appropriate (for local testing without strict auth)
CREATE POLICY "Public all access staff_todos" ON staff_todos FOR ALL USING (true);
CREATE POLICY "Public all access staff_leaves" ON staff_leaves FOR ALL USING (true);
CREATE POLICY "Public all access expenses" ON expenses FOR ALL USING (true);
