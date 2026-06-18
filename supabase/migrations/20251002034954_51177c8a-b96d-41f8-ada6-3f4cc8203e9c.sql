-- Create enum types
CREATE TYPE user_role AS ENUM ('student', 'tutor', 'admin');
CREATE TYPE application_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE session_status AS ENUM ('requested', 'confirmed', 'completed', 'cancelled');

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  university TEXT,
  location TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User roles table (separate for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Subjects table
CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tutor profiles
CREATE TABLE public.tutor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  hourly_rate DECIMAL(10,2) NOT NULL,
  languages TEXT[] NOT NULL DEFAULT ARRAY['English'],
  experience_years INTEGER DEFAULT 0,
  is_approved BOOLEAN DEFAULT FALSE,
  approval_status application_status DEFAULT 'pending',
  rejection_reason TEXT,
  total_sessions INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tutor subjects (many-to-many)
CREATE TABLE public.tutor_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID REFERENCES public.tutor_profiles(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(tutor_id, subject_id)
);

-- Skills/Tags for tutors
CREATE TABLE public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tutor skills (many-to-many)
CREATE TABLE public.tutor_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID REFERENCES public.tutor_profiles(id) ON DELETE CASCADE NOT NULL,
  skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(tutor_id, skill_id)
);

-- Ratings and reviews
CREATE TABLE public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID REFERENCES public.tutor_profiles(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tutor_id, student_id)
);

-- Sessions
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID REFERENCES public.tutor_profiles(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  status session_status DEFAULT 'requested',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "User roles viewable by everyone" ON public.user_roles
  FOR SELECT USING (true);

CREATE POLICY "Only users can insert their own roles" ON public.user_roles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for subjects (public read, admin write)
CREATE POLICY "Subjects viewable by everyone" ON public.subjects
  FOR SELECT USING (true);

-- RLS Policies for tutor_profiles
CREATE POLICY "Approved tutor profiles viewable by everyone" ON public.tutor_profiles
  FOR SELECT USING (is_approved = true OR user_id = auth.uid());

CREATE POLICY "Users can insert own tutor profile" ON public.tutor_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Tutors can update own profile" ON public.tutor_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for tutor_subjects
CREATE POLICY "Tutor subjects viewable by everyone" ON public.tutor_subjects
  FOR SELECT USING (true);

CREATE POLICY "Tutors can manage their subjects" ON public.tutor_subjects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.tutor_profiles
      WHERE id = tutor_subjects.tutor_id AND user_id = auth.uid()
    )
  );

-- RLS Policies for skills
CREATE POLICY "Skills viewable by everyone" ON public.skills
  FOR SELECT USING (true);

-- RLS Policies for tutor_skills
CREATE POLICY "Tutor skills viewable by everyone" ON public.tutor_skills
  FOR SELECT USING (true);

CREATE POLICY "Tutors can manage their skills" ON public.tutor_skills
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.tutor_profiles
      WHERE id = tutor_skills.tutor_id AND user_id = auth.uid()
    )
  );

-- RLS Policies for ratings
CREATE POLICY "Ratings viewable by everyone" ON public.ratings
  FOR SELECT USING (true);

CREATE POLICY "Students can create ratings" ON public.ratings
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update own ratings" ON public.ratings
  FOR UPDATE USING (auth.uid() = student_id);

-- RLS Policies for sessions
CREATE POLICY "Users can view their own sessions" ON public.sessions
  FOR SELECT USING (
    auth.uid() = student_id OR 
    EXISTS (
      SELECT 1 FROM public.tutor_profiles
      WHERE id = sessions.tutor_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Students can request sessions" ON public.sessions
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Participants can update sessions" ON public.sessions
  FOR UPDATE USING (
    auth.uid() = student_id OR 
    EXISTS (
      SELECT 1 FROM public.tutor_profiles
      WHERE id = sessions.tutor_id AND user_id = auth.uid()
    )
  );

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User')
  );
  
  -- Assign student role by default
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update tutor average rating
CREATE OR REPLACE FUNCTION public.update_tutor_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.tutor_profiles
  SET average_rating = (
    SELECT COALESCE(AVG(rating), 0)
    FROM public.ratings
    WHERE tutor_id = COALESCE(NEW.tutor_id, OLD.tutor_id)
  )
  WHERE id = COALESCE(NEW.tutor_id, OLD.tutor_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for rating updates
CREATE TRIGGER on_rating_change
  AFTER INSERT OR UPDATE OR DELETE ON public.ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_tutor_rating();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_tutor_profiles_updated_at
  BEFORE UPDATE ON public.tutor_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_ratings_updated_at
  BEFORE UPDATE ON public.ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Security definer function to check admin role
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = is_admin.user_id
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Insert default subjects
INSERT INTO public.subjects (name, category) VALUES
  ('Mathematics', 'STEM'),
  ('Physics', 'STEM'),
  ('Chemistry', 'STEM'),
  ('Biology', 'STEM'),
  ('Computer Science', 'STEM'),
  ('English Literature', 'Humanities'),
  ('History', 'Humanities'),
  ('Psychology', 'Social Sciences'),
  ('Economics', 'Social Sciences'),
  ('Business', 'Business');

-- Insert common skills
INSERT INTO public.skills (name) VALUES
  ('Python'),
  ('JavaScript'),
  ('Calculus'),
  ('Algebra'),
  ('Essay Writing'),
  ('Public Speaking'),
  ('Data Analysis'),
  ('Web Development'),
  ('Statistics'),
  ('Research Methods');