-- Create Classes Table
CREATE TABLE IF NOT EXISTS classes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  level TEXT NOT NULL, -- JSS 1, SS 3, etc.
  form_teacher TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Public read classes" ON classes;
CREATE POLICY "Public read classes" ON classes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert classes" ON classes;
CREATE POLICY "Public insert classes" ON classes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public update classes" ON classes;
CREATE POLICY "Public update classes" ON classes FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public delete classes" ON classes;
CREATE POLICY "Public delete classes" ON classes FOR DELETE USING (true);
