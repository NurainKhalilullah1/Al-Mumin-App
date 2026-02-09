-- Fix missing columns in students table causing 400 Bad Request
-- This adds the columns required for the Student Fee and Department features

ALTER TABLE students ADD COLUMN IF NOT EXISTS class_level TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS assigned_fee NUMERIC DEFAULT 0;
ALTER TABLE students ADD COLUMN IF NOT EXISTS department TEXT;

-- Verify
-- SELECT * FROM students LIMIT 1;
