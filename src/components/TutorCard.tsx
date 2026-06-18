import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TutorCardProps {
  tutor: {
    id: string;
    user_id: string;
    hourly_rate: number;
    average_rating: number;
    experience_years: number;
    languages: string[];
    profiles: {
      full_name: string;
      avatar_url?: string;
      university?: string;
      location?: string;
    };
    tutor_skills: Array<{
      skills: {
        name: string;
      };
    }>;
  };
}

export const TutorCard = ({ tutor }: TutorCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-gradient-card">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 border-2 border-accent">
            <AvatarImage src={tutor.profiles.avatar_url} alt={tutor.profiles.full_name} />
            <AvatarFallback className="bg-accent text-accent-foreground text-lg">
              {tutor.profiles.full_name.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">{tutor.profiles.full_name}</h3>
                {tutor.profiles.university && (
                  <p className="text-sm text-muted-foreground">{tutor.profiles.university}</p>
                )}
              </div>
              <div className="flex items-center gap-1 bg-accent/10 px-2 py-1 rounded-full">
                <Star className="h-4 w-4 fill-accent text-accent" />
                <span className="font-semibold text-sm">
                  {tutor.average_rating.toFixed(1)}
                </span>
              </div>
            </div>

            {tutor.profiles.location && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{tutor.profiles.location}</span>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {tutor.tutor_skills.slice(0, 4).map((ts, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {ts.skills.name}
                </Badge>
              ))}
              {tutor.tutor_skills.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{tutor.tutor_skills.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="px-6 py-4 bg-secondary/30 flex items-center justify-between">
        <div className="flex items-center gap-1 font-semibold">
          <DollarSign className="h-4 w-4 text-success" />
          <span className="text-lg">₹{tutor.hourly_rate}/hr</span>
        </div>
        <Button
          onClick={() => navigate(`/tutor/${tutor.id}`)}
          className="bg-gradient-accent"
        >
          View Profile
        </Button>
      </CardFooter>
    </Card>
  );
};