import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Star, MapPin, DollarSign, Clock, Award, MessageCircle, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const TutorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [tutor, setTutor] = useState<any>(null);
  const [ratings, setRatings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newRating, setNewRating] = useState(5);
  const [newReview, setNewReview] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

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
    if (id) {
      fetchTutor();
      fetchRatings();
    }
  }, [id]);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    setProfile(data);
  };

  const fetchTutor = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("tutor_profiles")
      .select(`
        *,
        profiles!tutor_profiles_user_id_fkey(
          full_name,
          avatar_url,
          university,
          location,
          bio
        ),
        tutor_skills(
          skills(name)
        )
      `)
      .eq("id", id)
      .single();

    if (!error && data) {
      setTutor(data);
    }
    setIsLoading(false);
  };

  const fetchRatings = async () => {
    const { data } = await supabase
      .from("ratings")
      .select(`
        *,
        profiles!ratings_student_id_fkey(
          full_name,
          avatar_url
        )
      `)
      .eq("tutor_id", id)
      .order("created_at", { ascending: false });

    setRatings(data || []);
  };

  const handleSubmitReview = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to leave a review.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setIsSubmittingReview(true);
    const { error } = await supabase.from("ratings").upsert({
      tutor_id: id,
      student_id: user.id,
      rating: newRating,
      review: newReview,
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Review submitted!",
        description: "Thank you for your feedback.",
      });
      setNewReview("");
      setNewRating(5);
      fetchRatings();
      fetchTutor();
    }
    setIsSubmittingReview(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar user={user} profile={profile} />
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <Card>
            <CardContent className="p-8">
              <div className="flex items-start gap-6">
                <Skeleton className="h-32 w-32 rounded-full" />
                <div className="flex-1 space-y-4">
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar user={user} profile={profile} />
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <Card className="p-12 text-center">
            <p className="text-lg text-muted-foreground">Tutor not found.</p>
            <Button onClick={() => navigate("/discover")} className="mt-4">
              Back to Discovery
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} profile={profile} />

      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
        {/* Profile Header */}
        <Card className="bg-gradient-card">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <Avatar className="h-32 w-32 border-4 border-accent">
                <AvatarImage src={tutor.profiles.avatar_url} alt={tutor.profiles.full_name} />
                <AvatarFallback className="bg-accent text-accent-foreground text-3xl">
                  {tutor.profiles.full_name.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold">{tutor.profiles.full_name}</h1>
                    <Badge className="bg-success text-success-foreground">
                      <Award className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                  {tutor.profiles.university && (
                    <p className="text-lg text-muted-foreground">{tutor.profiles.university}</p>
                  )}
                </div>

                <div className="flex flex-wrap gap-4 text-sm">
                  {tutor.profiles.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{tutor.profiles.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{tutor.experience_years} years experience</span>
                  </div>
                  <div className="flex items-center gap-1 bg-accent/10 px-3 py-1 rounded-full">
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    <span className="font-semibold">
                      {tutor.average_rating.toFixed(1)} ({ratings.length} reviews)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-2xl font-bold">
                    <DollarSign className="h-6 w-6 text-success" />
                    <span>${tutor.hourly_rate}/hr</span>
                  </div>
                  {user && user.id !== tutor.user_id && (
                    <Button className="bg-gradient-accent">
                      <Calendar className="h-4 w-4 mr-2" />
                      Request Session
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* About */}
        {tutor.profiles.bio && (
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{tutor.profiles.bio}</p>
            </CardContent>
          </Card>
        )}

        {/* Skills */}
        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tutor.tutor_skills.length > 0 && (
              <div>
                <div className="flex flex-wrap gap-2">
                  {tutor.tutor_skills.map((ts: any, idx: number) => (
                    <Badge key={idx} variant="secondary" className="text-sm">
                      {ts.skills.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="font-semibold mb-2">Languages</h3>
              <div className="flex flex-wrap gap-2">
                {tutor.languages.map((lang: string, idx: number) => (
                  <Badge key={idx} variant="outline" className="text-sm">
                    {lang}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reviews */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Reviews ({ratings.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Leave Review */}
            {user && user.id !== tutor.user_id && (
              <div className="space-y-4 p-4 bg-secondary/30 rounded-lg">
                <h3 className="font-semibold">Leave a Review</h3>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setNewRating(star)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            star <= newRating
                              ? "fill-accent text-accent"
                              : "text-muted-foreground"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <Textarea
                  placeholder="Share your experience with this tutor..."
                  value={newReview}
                  onChange={(e) => setNewReview(e.target.value)}
                  rows={4}
                />
                <Button
                  onClick={handleSubmitReview}
                  disabled={isSubmittingReview}
                  className="bg-gradient-accent"
                >
                  Submit Review
                </Button>
              </div>
            )}

            <Separator />

            {/* Existing Reviews */}
            {ratings.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No reviews yet. Be the first to review this tutor!
              </p>
            ) : (
              <div className="space-y-4">
                {ratings.map((rating) => (
                  <div key={rating.id} className="space-y-2 p-4 bg-secondary/20 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={rating.profiles.avatar_url}
                            alt={rating.profiles.full_name}
                          />
                          <AvatarFallback className="bg-accent text-accent-foreground">
                            {rating.profiles.full_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{rating.profiles.full_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(rating.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, idx) => (
                          <Star
                            key={idx}
                            className={`h-4 w-4 ${
                              idx < rating.rating
                                ? "fill-accent text-accent"
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {rating.review && <p className="text-sm">{rating.review}</p>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TutorProfile;
