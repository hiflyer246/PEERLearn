-- Allow admins to view all tutor profiles
CREATE POLICY "Admins can view all tutor profiles"
ON tutor_profiles
FOR SELECT
USING (is_admin(auth.uid()));

-- Drop the old subjects-based tables and foreign keys
DROP TABLE IF EXISTS tutor_subjects CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;

-- Update sessions table to use skills instead of subjects
ALTER TABLE sessions 
DROP COLUMN IF EXISTS subject_id,
ADD COLUMN IF NOT EXISTS skill_id uuid REFERENCES skills(id);

-- Update tutor_skills table to be the primary skills relationship
-- (already exists, so just ensure it's set up correctly)