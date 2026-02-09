-- 1. Student Attendance
CREATE TABLE IF NOT EXISTS student_attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id TEXT NOT NULL, -- Links to students(id) (using Text ID)
  class_name TEXT NOT NULL,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, date) -- One record per student per day
);

-- 2. Assignment Submissions
CREATE TABLE IF NOT EXISTS assignment_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID, -- Links to assignments(id)
  student_id TEXT, -- Links to students(id)
  student_name TEXT,
  assignment_title TEXT,
  file_url TEXT,
  score NUMERIC DEFAULT NULL,
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Lesson Notes
CREATE TABLE IF NOT EXISTS lesson_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic TEXT NOT NULL,
  week TEXT NOT NULL,
  class_level TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT, -- Could be URL or text
  teacher_email TEXT,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Daily Adheeth
CREATE TABLE IF NOT EXISTS daily_adheeth (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  source TEXT, -- e.g., "Sahih Bukhari"
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Seed Initial Adheeth
INSERT INTO daily_adheeth (content, source) VALUES
('The best among you are those who learn the Quran and teach it.', 'Sahih Bukhari'),
('Modesty is a branch of Iman.', 'Sahih Muslim'),
('He who is not merciful to others, will not be treated with mercy.', 'Sahih Al-Bukhari');

-- 6. Enable RLS (Security)
ALTER TABLE student_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_adheeth ENABLE ROW LEVEL SECURITY;

-- 7. Basic Policies (Public Access for now to prevent 400 errors, refine later)
CREATE POLICY "Public read attendance" ON student_attendance FOR SELECT USING (true);
CREATE POLICY "Teachers insert attendance" ON student_attendance FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read submissions" ON assignment_submissions FOR SELECT USING (true);
CREATE POLICY "Students insert submissions" ON assignment_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read notes" ON lesson_notes FOR SELECT USING (true);
CREATE POLICY "Teachers insert notes" ON lesson_notes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read adheeth" ON daily_adheeth FOR SELECT USING (true);
