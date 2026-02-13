-- Fix Payments Table
ALTER TABLE payments ADD COLUMN IF NOT EXISTS proof_url TEXT;

-- Fix Notifications Table (Allow 'admin' string as ID)
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT, 
    message TEXT,
    type TEXT,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Attempt to alter column type if it exists and is not text (might fail if casting issues, but usually fine for UUID->TEXT)
DO $$ 
BEGIN 
    ALTER TABLE notifications ALTER COLUMN user_id TYPE TEXT; 
EXCEPTION 
    WHEN OTHERS THEN NULL; -- Ignore if it fails or already text
END $$;

-- Enable RLS for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policies for Notifications
DROP POLICY IF EXISTS "Public insert notifications" ON notifications;
CREATE POLICY "Public insert notifications" ON notifications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public read notifications" ON notifications;
CREATE POLICY "Public read notifications" ON notifications FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public update notifications" ON notifications;
CREATE POLICY "Public update notifications" ON notifications FOR UPDATE USING (true);


-- Storage Bucket for Payment Proofs
INSERT INTO storage.buckets (id, name, public) 
VALUES ('payment-proofs', 'payment-proofs', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
-- We need to ensure we don't duplicate policies.
DROP POLICY IF EXISTS "Public Access Payment Proofs" ON storage.objects;
DROP POLICY IF EXISTS "Student Upload Payment Proofs" ON storage.objects;

CREATE POLICY "Public Access Payment Proofs" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'payment-proofs' );

CREATE POLICY "Student Upload Payment Proofs" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'payment-proofs' );
