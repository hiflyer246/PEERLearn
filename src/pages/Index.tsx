import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, TrendingUp, Award, Users } from "lucide-react";
import { BookOpen, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    setProfile(data);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/discover?q=${encodeURIComponent(searchQuery)}`);
  };

    const testimonials = [
    {
      name: "Ananya",
      role: "CS Undergrad",
      quote: "Peer learning gave me the confidence to ask questions I’d hesitate to ask in class.",
      rating: 5,
      avatar: "/avatars/ananya.png",
    },
    {
      name: "Agasthya",
      role: "AI Enthusiast",
      quote: "Explaining concepts to my peers helped me master them faster than studying alone.",
      rating: 5,
      avatar: "/avatars/agasthya.png",
    },
    {
      name: "Dhanya",
      role: "Data Science Learner",
      quote: "I built my first real project through peer collaboration — and it was fun!",
      rating: 4,
      avatar: "/avatars/dhanya.png",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} profile={profile} />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero text-primary-foreground">
        {/* Decorative blobs */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-indigo-500/20 rounded-full blur-3xl animate-bounce" />

        <div className="container relative mx-auto px-4 py-24 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            
            {/* Left side - Text */}
            <div className="space-y-8 text-center md:text-left">
              <h1 className="text-5xl md:text-5xl font-extrabold leading-tight animate-fade-in">
                Learn from Your{" "}
                <span className="bg-gradient-accent bg-clip-text text-transparent">
                  Peers
                </span>
              
                <br />
                <span className="text-primary-foreground text-2xl md:text-3xl">Where Students Become Mentors</span>
              </h1>
              <p
                className="text-lg md:text-xl text-primary-foreground/80 animate-fade-in"
                style={{ animationDelay: "0.1s" }}
              >
                Affordable, flexible, and personalized peer-to-peer learning
              </p>

              {/* Search Bar */}
              <form
                onSubmit={handleSearch}
                className="flex gap-2 max-w-xl mx-auto md:mx-0 animate-fade-in"
                style={{ animationDelay: "0.2s" }}
              >
                <Input
                  type="text"
                  placeholder="Search skills or universities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 h-12 rounded-full bg-background/10 backdrop-blur border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60"
                />
                <Button
                  type="submit"
                  size="lg"
                  className="rounded-full bg-cta hover:bg-cta/90 focus:ring-2 focus:ring-cta focus:outline-none"
                >
                  <Search className="h-5 w-5 mr-2" />
                  Search
                </Button>
              </form>

              {/* CTAs */}
              <div
                className="flex flex-wrap justify-center md:justify-start gap-4 pt-6 animate-fade-in"
                style={{ animationDelay: "0.3s" }}
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full bg-background/10 backdrop-blur border-primary-foreground/20 text-primary-foreground hover:bg-background/20 hover:scale-105 hover:shadow-lg transition-all duration-200 focus:ring-2 focus:ring-cta focus:outline-none"
                  onClick={() => navigate("/discover")}
                >
                  Browse All Tutors
                </Button>
                {!user && (
                  <Button
                    size="lg"
                    className="rounded-full bg-gradient-accent hover:brightness-110 hover:scale-105 hover:shadow-lg transition-all duration-200 focus:ring-2 focus:ring-cta focus:outline-none"
                    onClick={() => navigate("/auth?mode=signup")}
                  >
                    Become a Tutor
                  </Button>
                )}
              </div>

              {/* Hero Stats Cards */}
              <div className="flex flex-wrap justify-center md:justify-start gap-6 pt-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🎓</span>
                  <div>
                    <div className="text-xl font-bold text-primary-foreground">60+</div>
                    <div className="text-sm text-primary-foreground/70">Tutors</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">💡</span>
                  <div>
                    <div className="text-xl font-bold text-primary-foreground">200+</div>
                    <div className="text-sm text-primary-foreground/70">Skills Learned</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🌍</span>
                  <div>
                    <div className="text-xl font-bold text-primary-foreground">10</div>
                    <div className="text-sm text-primary-foreground/70">Universities</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Illustration */}

            <div className="relative animate-float">
              <motion.img
                src="/Peer-Hero-Section.png"
                alt="Peer Learning Illustration"
                className="w-full max-w-lg mx-auto drop-shadow-2xl"
                whileHover={{ scale: 1.05, rotate: 2 }}
                transition={{ type: "spring", stiffness: 200 }}
              />

              {/* Floating icons */}
              <div className="absolute top-10 left-6 animate-bounce-slow">
                <Users className="w-10 h-10 text-pink-400" />
              </div>
              <div className="absolute bottom-12 right-10 animate-bounce-slower">
                <BookOpen className="w-10 h-10 text-yellow-400" />
              </div>
              <div className="absolute top-1/2 -left-6 animate-bounce">
                <Sparkles className="w-8 h-8 text-cyan-300" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why Choose PeerLearn?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center space-y-4 p-6 rounded-lg bg-card hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10">
                <Users className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">Student Tutors</h3>
              <p className="text-muted-foreground">
                Learn from fellow students who recently mastered the material and understand your challenges.
              </p>
            </div>

            <div className="text-center space-y-4 p-6 rounded-lg bg-card hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10">
                <TrendingUp className="h-8 w-8 text-success" />
              </div>
              <h3 className="text-xl font-semibold">Affordable Rates</h3>
              <p className="text-muted-foreground">
                Get quality tutoring at student-friendly prices. Most sessions start at just $15/hour.
              </p>
            </div>

            <div className="text-center space-y-4 p-6 rounded-lg bg-card hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cta/10">
                <Award className="h-8 w-8 text-cta" />
              </div>
              <h3 className="text-xl font-semibold">Verified Quality</h3>
              <p className="text-muted-foreground">
                All tutors are approved by administrators and rated by students for your peace of mind.
              </p>
            </div>
          </div>
        </div>
      </section>

  {/* Testimonials Section */}
  <section className="py-20 bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            What Our Learners Say
          </h2>

          <div className="relative max-w-3xl mx-auto">
            {/* Slider */}
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="p-8 bg-background/20 rounded-2xl shadow-lg text-center space-y-4 border border-primary-foreground/10"
            >
              <div className="flex justify-center text-yellow-400 text-xl">
                {"★".repeat(testimonials[currentIndex].rating)}
              </div>
              <p className="text-lg text-primary-foreground/90 italic">
                "{testimonials[currentIndex].quote}"
              </p>
              <div className="flex flex-col items-center pt-4">
                {testimonials[currentIndex].avatar ? (
                  <img
                    src={testimonials[currentIndex].avatar}
                    alt={testimonials[currentIndex].name}
                    className="w-14 h-14 rounded-full object-cover mb-2 border-2 border-accent bg-gradient-accent text-white flex items-center justify-center"
                    onError={e => { 
                      e.currentTarget.onerror = null; 
                      e.currentTarget.style.display = 'none'; 
                      const sibling = e.currentTarget.nextSibling as HTMLElement | null;
                      if (sibling && sibling.style) {
                        sibling.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <span
                  className="w-14 h-14 rounded-full mb-2 border-2 border-accent bg-gradient-accent text-white flex items-center justify-center text-xl font-bold select-none"
                  style={{ display: testimonials[currentIndex].avatar ? 'none' : 'flex' }}
                >
                  {testimonials[currentIndex].name.charAt(0)}
                </span>
                <span className="font-semibold">
                  {testimonials[currentIndex].name}
                </span>
                <span className="text-sm text-primary-foreground/70">
                  {testimonials[currentIndex].role}
                </span>
              </div>
            </motion.div>

            {/* Controls */}
            <div className="flex justify-center gap-3 mt-6">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i === currentIndex ? "bg-accent" : "bg-muted"
                  }`}
                  onClick={() => setCurrentIndex(i)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
      

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6 bg-gradient-card p-12 rounded-2xl shadow-xl">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to start learning?
            </h2>
            <p className="text-lg text-muted-foreground">
              Join thousands of students improving their grades with peer tutoring.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Button
                size="lg"
                className="bg-gradient-accent focus:ring-2 focus:ring-cta focus:outline-none"
                onClick={() => navigate("/discover")}
              >
                Find a Tutor
              </Button>
              {!user && (
                <Button
                  size="lg"
                  variant="outline"
                  className="focus:ring-2 focus:ring-cta focus:outline-none"
                  onClick={() => navigate("/auth?mode=signup")}
                >
                  Sign Up Free
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
