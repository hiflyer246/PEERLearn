import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface AITutorMatcherProps {
  userId: string;
}

export const AITutorMatcher = ({ userId }: AITutorMatcherProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isMatching, setIsMatching] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);
  const [preferences, setPreferences] = useState({
    skill: "",
    budget: "",
    learningGoals: "",
  });

  const handleFindMatches = async () => {
    if (!preferences.skill) {
      toast({
        title: "Missing Information",
        description: "Please specify at least the skill you want to learn",
        variant: "destructive",
      });
      return;
    }

    setIsMatching(true);
    try {
      const { data, error } = await supabase.functions.invoke("match-tutors", {
        body: {
          studentId: userId,
          preferences: preferences,
        },
      });

      if (error) throw error;

      console.log("AI Matches:", data);
      setMatches(data.recommendations || []);

      if (data.recommendations && data.recommendations.length > 0) {
        toast({
          title: "Matches Found! 🎯",
          description: `Found ${data.recommendations.length} recommended tutors for you`,
        });
      } else {
        toast({
          title: "No Matches",
          description: "Try adjusting your preferences or check back later",
        });
      }
    } catch (error: any) {
      console.error("Error matching tutors:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to find tutor matches",
        variant: "destructive",
      });
    } finally {
      setIsMatching(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            AI Tutor Matching
          </CardTitle>
          <CardDescription>
            Tell us what you want to learn and we'll find the perfect tutor for you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="skill">Skill</Label>
            <Input
              id="skill"
              placeholder="e.g., Python Programming, Calculus, Chemistry"
              value={preferences.skill}
              onChange={(e) =>
                setPreferences({ ...preferences, skill: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget">Budget (₹/hour)</Label>
            <Input
              id="budget"
              type="number"
              placeholder="e.g., 500"
              value={preferences.budget}
              onChange={(e) =>
                setPreferences({ ...preferences, budget: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goals">Learning Goals</Label>
            <Textarea
              id="goals"
              placeholder="Describe what you want to achieve..."
              rows={3}
              value={preferences.learningGoals}
              onChange={(e) =>
                setPreferences({ ...preferences, learningGoals: e.target.value })
              }
            />
          </div>

          <Button
            onClick={handleFindMatches}
            disabled={isMatching}
            className="w-full bg-gradient-accent"
          >
            {isMatching ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Finding Matches...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Find My Perfect Tutor
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {matches.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Recommended Tutors</h3>
          {matches.map((match, idx) => (
            <Card key={idx} className="overflow-hidden hover:shadow-lg transition-all">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <Badge variant="secondary" className="mb-2">
                      {match.matchScore}% Match
                    </Badge>
                    <p className="text-sm text-muted-foreground">{match.reasoning}</p>
                  </div>
                </div>
                <Button
                  onClick={() => navigate(`/tutor/${match.tutorId}`)}
                  variant="outline"
                  className="w-full mt-3"
                >
                  View Profile
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
