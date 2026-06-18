import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { TutorCard } from "@/components/TutorCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const Discover = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [tutors, setTutors] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get("q") || "",
    skill: "",
    minPrice: 0,
    maxPrice: 100,
    minRating: 0,
    location: "",
    university: "",
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

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

  useEffect(() => {
    fetchSkills();
    fetchTutors();

    // Subscribe to realtime changes for approved tutors
    const channel = supabase
      .channel('approved-tutors-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tutor_profiles',
          filter: 'is_approved=eq.true'
        },
        (payload) => {
          console.log('Tutor approved:', payload);
          fetchTutors();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filters]);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    setProfile(data);
  };

  const fetchSkills = async () => {
    const { data } = await supabase
      .from("skills")
      .select("*")
      .order("name");
    setSkills(data || []);
  };

  const fetchTutors = async () => {
    setIsLoading(true);
    let query = supabase
      .from("tutor_profiles")
      .select(`
        *,
        profiles!tutor_profiles_user_id_fkey(
          full_name,
          avatar_url,
          university,
          location
        ),
        tutor_skills(
          skills(name)
        )
      `)
      .eq("is_approved", true);

    // Apply filters
    if (filters.search) {
      // Search in profile names and subjects - we'll do this client-side
    }

    if (filters.minPrice > 0) {
      query = query.gte("hourly_rate", filters.minPrice);
    }

    if (filters.maxPrice < 100) {
      query = query.lte("hourly_rate", filters.maxPrice);
    }

    if (filters.minRating > 0) {
      query = query.gte("average_rating", filters.minRating);
    }

    const { data, error } = await query;

    if (!error && data) {
      let filteredData = data;

      // Client-side filtering for search and other fields
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredData = filteredData.filter((tutor) => {
          const nameMatch = tutor.profiles?.full_name?.toLowerCase().includes(searchLower);
          const skillMatch = tutor.tutor_skills?.some((ts: any) =>
            ts.skills?.name?.toLowerCase().includes(searchLower)
          );
          return nameMatch || skillMatch;
        });
      }

      if (filters.skill) {
        filteredData = filteredData.filter((tutor) =>
          tutor.tutor_skills?.some((ts: any) => ts.skills?.name === filters.skill)
        );
      }

      if (filters.location) {
        filteredData = filteredData.filter((tutor) =>
          tutor.profiles?.location?.toLowerCase().includes(filters.location.toLowerCase())
        );
      }

      if (filters.university) {
        filteredData = filteredData.filter((tutor) =>
          tutor.profiles?.university?.toLowerCase().includes(filters.university.toLowerCase())
        );
      }

      setTutors(filteredData);
    }

    setIsLoading(false);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      skill: "",
      minPrice: 0,
      maxPrice: 100,
      minRating: 0,
      location: "",
      university: "",
    });
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} profile={profile} />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className="md:hidden">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="w-full"
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              {showFilters ? "Hide" : "Show"} Filters
            </Button>
          </div>

          <aside className={`md:block ${showFilters ? "block" : "hidden"} md:w-80 space-y-4`}>
            <Card className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Filters</h3>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Name, subject, or skill..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Skill</Label>
                <select
                  className="w-full border rounded-md p-2"
                  value={filters.skill}
                  onChange={(e) => setFilters({ ...filters, skill: e.target.value })}
                >
                  <option value="">All Skills</option>
                  {skills.map((skill) => (
                    <option key={skill.id} value={skill.name}>
                      {skill.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>University</Label>
                <Input
                  placeholder="e.g., MIT, Stanford..."
                  value={filters.university}
                  onChange={(e) => setFilters({ ...filters, university: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  placeholder="e.g., Boston, Remote..."
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Price Range: ${filters.minPrice} - ${filters.maxPrice}/hr
                </Label>
                <div className="space-y-4">
                  <Slider
                    value={[filters.minPrice]}
                    onValueChange={([value]) => setFilters({ ...filters, minPrice: value })}
                    max={100}
                    step={5}
                  />
                  <Slider
                    value={[filters.maxPrice]}
                    onValueChange={([value]) => setFilters({ ...filters, maxPrice: value })}
                    max={100}
                    step={5}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Minimum Rating: {filters.minRating}★</Label>
                <Slider
                  value={[filters.minRating]}
                  onValueChange={([value]) => setFilters({ ...filters, minRating: value })}
                  max={5}
                  step={0.5}
                />
              </div>
            </Card>
          </aside>

          {/* Tutors Grid */}
          <div className="flex-1">
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">Discover Tutors</h1>
              <p className="text-muted-foreground">
                {tutors.length} {tutors.length === 1 ? "tutor" : "tutors"} available
              </p>
            </div>

            {isLoading ? (
              <div className="grid gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="p-6">
                    <div className="flex items-start gap-4">
                      <Skeleton className="h-16 w-16 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : tutors.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-lg text-muted-foreground">
                  No tutors found matching your criteria. Try adjusting your filters.
                </p>
              </Card>
            ) : (
              <div className="grid gap-6">
                {tutors.map((tutor) => (
                  <TutorCard key={tutor.id} tutor={tutor} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Discover;
