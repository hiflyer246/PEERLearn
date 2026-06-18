import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { GraduationCap, User, Award, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AITutorMatcher } from "@/components/AITutorMatcher";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [roles, setRoles] = useState<any[]>([]);
  const [tutorProfile, setTutorProfile] = useState<any>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [profileForm, setProfileForm] = useState({
    full_name: "",
    university: "",
    location: "",
    bio: "",
  });

  const [tutorForm, setTutorForm] = useState({
    hourly_rate: 20,
    experience_years: 0,
    languages: ["English"],
    skills: [] as string[],
  });

  const [skillInput, setSkillInput] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchUserData(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchUserData(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchUserData = async (userId: string) => {
    setIsLoading(true);

    // Fetch profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileData) {
      setProfile(profileData);
      setProfileForm({
        full_name: profileData.full_name || "",
        university: profileData.university || "",
        location: profileData.location || "",
        bio: profileData.bio || "",
      });
    }

    // Fetch roles
    const { data: rolesData } = await supabase
      .from("user_roles")
      .select("*")
      .eq("user_id", userId);

    setRoles(rolesData || []);

    // Fetch tutor profile if exists
    const { data: tutorData } = await supabase
      .from("tutor_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (tutorData) {
      setTutorProfile(tutorData);
      
      // Fetch tutor skills
      const { data: tutorSkillsData } = await supabase
        .from("tutor_skills")
        .select("skill_id, skills(name)")
        .eq("tutor_id", tutorData.id);
      
      const tutorSkillNames = tutorSkillsData?.map((ts: any) => ts.skills.name) || [];
      
      setTutorForm({
        hourly_rate: tutorData.hourly_rate,
        experience_years: tutorData.experience_years,
        languages: tutorData.languages,
        skills: tutorSkillNames,
      });
    }

    setIsLoading(false);
  };

  const fetchSkills = async () => {
    const { data } = await supabase.from("skills").select("*").order("name");
    setSkills(data || []);
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update(profileForm)
      .eq("id", user.id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profile updated!",
        description: "Your profile has been successfully updated.",
      });
      fetchUserData(user.id);
    }
  };

  const handleBecomeTutor = async () => {
    if (!user) return;

    // First, add tutor role
    const { error: roleError } = await supabase
      .from("user_roles")
      .insert({ user_id: user.id, role: "tutor" });

    if (roleError && !roleError.message.includes("duplicate")) {
      toast({
        title: "Error",
        description: roleError.message,
        variant: "destructive",
      });
      return;
    }

    // Then create tutor profile
    const { data: tutorData, error } = await supabase
      .from("tutor_profiles")
      .insert({
        user_id: user.id,
        hourly_rate: tutorForm.hourly_rate,
        experience_years: tutorForm.experience_years,
        languages: tutorForm.languages,
        is_approved: false,
        approval_status: "pending",
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    // Add skills to database and link to tutor
    if (tutorData && tutorForm.skills.length > 0) {
      for (const skillName of tutorForm.skills) {
        // Check if skill exists, if not create it
        const { data: existingSkill } = await supabase
          .from("skills")
          .select("id")
          .eq("name", skillName)
          .maybeSingle();

        let skillId = existingSkill?.id;

        if (!skillId) {
          // Create new skill
          const { data: newSkill, error: skillError } = await supabase
            .from("skills")
            .insert({ name: skillName })
            .select()
            .single();

          if (skillError) {
            console.error("Error creating skill:", skillError);
            continue;
          }
          skillId = newSkill.id;
        }

        // Link skill to tutor
        await supabase.from("tutor_skills").insert({
          tutor_id: tutorData.id,
          skill_id: skillId,
        });
      }
    }

    // Send notification emails to tutor and admin
    try {
      // Fetch admin email
      const { data: adminData } = await supabase
        .from("user_roles")
        .select("user_id, profiles!inner(email)")
        .eq("role", "admin")
        .limit(1)
        .single();

      const adminEmail = adminData?.profiles?.email || "admin@peerlearn.com";

      await supabase.functions.invoke("notify-new-application", {
        body: {
          tutorEmail: profile?.email,
          tutorName: profile?.full_name,
          adminEmail: adminEmail,
          skills: tutorForm.skills,
          hourlyRate: tutorForm.hourly_rate,
          experienceYears: tutorForm.experience_years,
        },
      });
      console.log("Notification emails sent successfully");
    } catch (emailError) {
      console.error("Error sending notification emails:", emailError);
      // Don't block the application process if email fails
    }

    toast({
      title: "Application submitted!",
      description: "Your tutor application is pending admin approval. You will receive a confirmation email shortly.",
    });
    fetchUserData(user.id);
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !tutorForm.skills.includes(skillInput.trim())) {
      setTutorForm({
        ...tutorForm,
        skills: [...tutorForm.skills, skillInput.trim()],
      });
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setTutorForm({
      ...tutorForm,
      skills: tutorForm.skills.filter((s) => s !== skillToRemove),
    });
  };

  const handleUpdateTutorProfile = async () => {
    if (!user || !tutorProfile) return;

    const { error } = await supabase
      .from("tutor_profiles")
      .update({
        hourly_rate: tutorForm.hourly_rate,
        experience_years: tutorForm.experience_years,
        languages: tutorForm.languages,
      })
      .eq("user_id", user.id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Tutor profile updated!",
        description: "Your tutor profile has been successfully updated.",
      });
      fetchUserData(user.id);
    }
  };

  const isTutor = roles.some((r) => r.role === "tutor");
  const isAdmin = roles.some((r) => r.role === "admin");

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} profile={profile} />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your profile and tutor settings
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="tutor">
              <GraduationCap className="h-4 w-4 mr-2" />
              Tutor
            </TabsTrigger>
            <TabsTrigger value="sessions">
              <Calendar className="h-4 w-4 mr-2" />
              Sessions
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="admin">
                <Award className="h-4 w-4 mr-2" />
                Admin
              </TabsTrigger>
            )}
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your profile information visible to others
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={profileForm.full_name}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, full_name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="university">University</Label>
                  <Input
                    id="university"
                    placeholder="e.g., Massachusetts Institute of Technology"
                    value={profileForm.university}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, university: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Boston, MA"
                    value={profileForm.location}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, location: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself..."
                    rows={4}
                    value={profileForm.bio}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, bio: e.target.value })
                    }
                  />
                </div>

                <Button onClick={handleUpdateProfile} className="bg-gradient-accent">
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tutor Tab */}
          <TabsContent value="tutor">
            {!isTutor ? (
              <Card>
                <CardHeader>
                  <CardTitle>Become a Tutor</CardTitle>
                  <CardDescription>
                    Share your knowledge and earn money by tutoring other students
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="hourly_rate">Hourly Rate (₹)</Label>
                    <Input
                      id="hourly_rate"
                      type="number"
                      min="100"
                      value={tutorForm.hourly_rate}
                      onChange={(e) =>
                        setTutorForm({
                          ...tutorForm,
                          hourly_rate: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Input
                      id="experience"
                      type="number"
                      min="0"
                      value={tutorForm.experience_years}
                      onChange={(e) =>
                        setTutorForm({
                          ...tutorForm,
                          experience_years: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="skills">Skills</Label>
                    <div className="flex gap-2">
                      <Input
                        id="skills"
                        placeholder="e.g., Calculus, AI, Physics"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddSkill();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={handleAddSkill}
                        variant="outline"
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tutorForm.skills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => handleRemoveSkill(skill)}
                        >
                          {skill} ×
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button onClick={handleBecomeTutor} className="bg-gradient-accent">
                    Submit Tutor Application
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Tutor Profile</span>
                    <Badge
                      variant={
                        tutorProfile?.approval_status === "approved"
                          ? "default"
                          : tutorProfile?.approval_status === "rejected"
                          ? "destructive"
                          : "secondary"
                      }
                      className={
                        tutorProfile?.approval_status === "approved"
                          ? "bg-success"
                          : ""
                      }
                    >
                      {tutorProfile?.approval_status || "pending"}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {tutorProfile?.approval_status === "pending"
                      ? "Your application is pending admin approval"
                      : tutorProfile?.approval_status === "rejected"
                      ? "Your application was rejected. Please contact support."
                      : "Manage your tutor profile settings"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tutor_rate">Hourly Rate (₹)</Label>
                    <Input
                      id="tutor_rate"
                      type="number"
                      min="100"
                      value={tutorForm.hourly_rate}
                      onChange={(e) =>
                        setTutorForm({
                          ...tutorForm,
                          hourly_rate: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tutor_experience">Years of Experience</Label>
                    <Input
                      id="tutor_experience"
                      type="number"
                      min="0"
                      value={tutorForm.experience_years}
                      onChange={(e) =>
                        setTutorForm({
                          ...tutorForm,
                          experience_years: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Skills</Label>
                    <div className="flex flex-wrap gap-2">
                      {tutorForm.skills.length > 0 ? (
                        tutorForm.skills.map((skill) => (
                          <Badge key={skill} variant="secondary">
                            {skill}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No skills added yet
                        </p>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={handleUpdateTutorProfile}
                    className="bg-gradient-accent"
                    disabled={tutorProfile?.approval_status !== "approved"}
                  >
                    Update Tutor Profile
                  </Button>

                  {tutorProfile?.is_approved && (
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/tutor/${tutorProfile.id}`)}
                    >
                      View Public Profile
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions">
            <Card>
              <CardHeader>
                <CardTitle>Find Your Perfect Tutor</CardTitle>
                <CardDescription>
                  Use AI to match with tutors that fit your learning needs
                </CardDescription>
              </CardHeader>
              <CardContent>
                {user && <AITutorMatcher userId={user.id} />}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin Tab */}
          {isAdmin && (
            <TabsContent value="admin">
              <Card>
                <CardHeader>
                  <CardTitle>Admin Dashboard</CardTitle>
                  <CardDescription>
                    Manage tutor applications and platform settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => navigate("/admin")}>
                    Go to Admin Panel
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
