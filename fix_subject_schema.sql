-- Create Subjects Table
CREATE TABLE IF NOT EXISTS subjects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'Junior' or 'Senior'
  department TEXT NOT NULL, -- 'General', 'Science', 'Arts', 'Commercial'
  teacher TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Public read subjects" ON subjects;
CREATE POLICY "Public read subjects" ON subjects FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert subjects" ON subjects;
CREATE POLICY "Public insert subjects" ON subjects FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public update subjects" ON subjects;
CREATE POLICY "Public update subjects" ON subjects FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public delete subjects" ON subjects;
CREATE POLICY "Public delete subjects" ON subjects FOR DELETE USING (true);
