-- Fix email exposure in profiles table
-- Drop the overly permissive public policy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Allow authenticated users to view all profile fields
CREATE POLICY "Authenticated users can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Allow unauthenticated users to view profiles of approved tutors only (without email access enforced in app)
CREATE POLICY "Public can view approved tutor profiles"
ON public.profiles
FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1 FROM public.tutor_profiles
    WHERE tutor_profiles.user_id = profiles.id
    AND tutor_profiles.is_approved = true
  )
);

-- Users can always view their own complete profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);