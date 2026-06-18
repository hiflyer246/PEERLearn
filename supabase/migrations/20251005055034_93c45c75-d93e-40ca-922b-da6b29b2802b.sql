-- Add RLS policy to allow admins to update tutor profiles
CREATE POLICY "Admins can update all tutor profiles"
ON public.tutor_profiles
FOR UPDATE
USING (is_admin(auth.uid()));

-- Create tutor application history table
CREATE TABLE public.tutor_application_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tutor_profile_id UUID NOT NULL REFERENCES public.tutor_profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  approval_status application_status NOT NULL,
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  hourly_rate NUMERIC NOT NULL,
  experience_years INTEGER,
  languages TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on history table
ALTER TABLE public.tutor_application_history ENABLE ROW LEVEL SECURITY;

-- Allow admins to view all history
CREATE POLICY "Admins can view all application history"
ON public.tutor_application_history
FOR SELECT
USING (is_admin(auth.uid()));

-- Allow users to view their own application history
CREATE POLICY "Users can view own application history"
ON public.tutor_application_history
FOR SELECT
USING (auth.uid() = user_id);

-- Create function to log application status changes
CREATE OR REPLACE FUNCTION public.log_tutor_application_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log when approval_status changes to approved or rejected
  IF NEW.approval_status IN ('approved', 'rejected') AND 
     (OLD.approval_status IS DISTINCT FROM NEW.approval_status) THEN
    INSERT INTO public.tutor_application_history (
      tutor_profile_id,
      user_id,
      approval_status,
      rejection_reason,
      reviewed_by,
      hourly_rate,
      experience_years,
      languages
    ) VALUES (
      NEW.id,
      NEW.user_id,
      NEW.approval_status,
      NEW.rejection_reason,
      auth.uid(),
      NEW.hourly_rate,
      NEW.experience_years,
      NEW.languages
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to automatically log changes
CREATE TRIGGER log_tutor_status_change
AFTER UPDATE ON public.tutor_profiles
FOR EACH ROW
EXECUTE FUNCTION public.log_tutor_application_change();