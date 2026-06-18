import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, Clock, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [pendingTutors, setPendingTutors] = useState<any[]>([]);
  const [applicationHistory, setApplicationHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [rejectionReasons, setRejectionReasons] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        checkAdminAccess(session.user.id);
      }
    });

    // Subscribe to realtime changes
    const channel = supabase
      .channel('tutor-profiles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tutor_profiles'
        },
        (payload) => {
          console.log('Realtime update:', payload);
          fetchPendingTutors();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate]);

  const checkAdminAccess = async (userId: string) => {
    const { data: rolesData } = await supabase
      .from("user_roles")
      .select("*")
      .eq("user_id", userId)
      .eq("role", "admin");

    if (!rolesData || rolesData.length === 0) {
      toast({
        title: "Access Denied",
        description: "You don't have admin permissions",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    setProfile(profileData);
    fetchPendingTutors();
    fetchApplicationHistory();
  };

  const fetchPendingTutors = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("tutor_profiles")
      .select(`
        *,
        profiles:user_id (
          full_name,
          email,
          avatar_url,
          university,
          location,
          bio
        )
      `)
      .eq("approval_status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setPendingTutors(data || []);
    }
    setIsLoading(false);
  };

  const fetchApplicationHistory = async () => {
    const { data, error } = await supabase
      .from("tutor_application_history")
      .select(`
        *,
        tutor_profiles:tutor_profile_id (
          profiles:user_id (
            full_name,
            email,
            avatar_url
          )
        )
      `)
      .order("reviewed_at", { ascending: false });

    if (error) {
      console.error("Error fetching history:", error);
    } else {
      setApplicationHistory(data || []);
    }
  };

  const handleApproval = async (tutorId: string, status: "approved" | "rejected") => {
    console.log(`Updating tutor ${tutorId} to status: ${status}`);
    
    const { data, error } = await supabase
      .from("tutor_profiles")
      .update({
        approval_status: status,
        is_approved: status === "approved",
        rejection_reason: status === "rejected" ? rejectionReasons[tutorId] : null,
      })
      .eq("id", tutorId)
      .select();

    if (error) {
      console.error("Approval error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    console.log("Update successful:", data);

    // Remove from local state immediately
    setPendingTutors(prev => prev.filter(t => t.id !== tutorId));

    // Send email notification
    const tutor = pendingTutors.find(t => t.id === tutorId);
    if (tutor) {
      try {
        await supabase.functions.invoke("send-approval-email", {
          body: {
            email: tutor.profiles.email,
            name: tutor.profiles.full_name,
            status: status,
            reason: status === "rejected" ? rejectionReasons[tutorId] : null,
          },
        });
      } catch (err) {
        console.error("Error sending email:", err);
      }
    }

    toast({
      title: "Success",
      description: `Tutor ${status === "approved" ? "approved" : "rejected"} successfully`,
    });

    // Refresh the lists
    await fetchPendingTutors();
    await fetchApplicationHistory();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} profile={profile} />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Review and approve tutor applications</p>
          </div>
          <Button
            variant={showHistory ? "default" : "outline"}
            onClick={() => setShowHistory(!showHistory)}
          >
            {showHistory ? "Show Pending" : "Show History"}
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading applications...</p>
          </div>
        ) : showHistory ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Application History</h2>
            {applicationHistory.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-lg font-medium">No history yet</p>
                  <p className="text-muted-foreground">Approved/rejected applications will appear here</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {applicationHistory.map((record) => (
                  <Card key={record.id} className="overflow-hidden">
                    <CardHeader className={record.approval_status === "approved" ? "bg-success/10" : "bg-destructive/10"}>
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={record.tutor_profiles?.profiles?.avatar_url} />
                          <AvatarFallback>
                            {record.tutor_profiles?.profiles?.full_name?.charAt(0) || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <CardTitle className="flex items-center justify-between">
                            <span>{record.tutor_profiles?.profiles?.full_name || "Unknown"}</span>
                            <Badge variant={record.approval_status === "approved" ? "default" : "destructive"}>
                              {record.approval_status === "approved" ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                              {record.approval_status}
                            </Badge>
                          </CardTitle>
                          <CardDescription>
                            {record.tutor_profiles?.profiles?.email || "No email"}
                          </CardDescription>
                          <p className="text-xs text-muted-foreground mt-1">
                            Reviewed: {new Date(record.reviewed_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    {record.rejection_reason && (
                      <CardContent className="pt-4">
                        <p className="text-sm"><strong>Rejection Reason:</strong> {record.rejection_reason}</p>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : pendingTutors.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-success" />
              <p className="text-lg font-medium">All caught up!</p>
              <p className="text-muted-foreground">No pending tutor applications</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {pendingTutors.map((tutor) => (
              <Card key={tutor.id} className="overflow-hidden">
                <CardHeader className="bg-secondary/30">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 border-2 border-accent">
                      <AvatarImage src={tutor.profiles.avatar_url} />
                      <AvatarFallback className="bg-accent text-accent-foreground">
                        {tutor.profiles.full_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="flex items-center justify-between">
                        <span>{tutor.profiles.full_name}</span>
                        <Badge variant="secondary">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {tutor.profiles.email}
                      </CardDescription>
                      {tutor.profiles.university && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {tutor.profiles.university}
                        </p>
                      )}
                      {tutor.profiles.location && (
                        <p className="text-sm text-muted-foreground">
                          {tutor.profiles.location}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-6">
                  {tutor.profiles.bio && (
                    <div>
                      <h4 className="font-medium mb-2">Bio</h4>
                      <p className="text-sm text-muted-foreground">{tutor.profiles.bio}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-4 py-4 border-t border-b">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Hourly Rate</p>
                      <p className="font-semibold text-success">₹{tutor.hourly_rate}/hr</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Experience</p>
                      <p className="font-semibold">{tutor.experience_years} years</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Languages</p>
                      <p className="font-semibold">{tutor.languages.join(", ")}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`reason-${tutor.id}`}>Rejection Reason (if rejecting)</Label>
                    <Textarea
                      id={`reason-${tutor.id}`}
                      placeholder="Provide a reason for rejection..."
                      value={rejectionReasons[tutor.id] || ""}
                      onChange={(e) =>
                        setRejectionReasons({
                          ...rejectionReasons,
                          [tutor.id]: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleApproval(tutor.id, "approved")}
                      className="flex-1 bg-success hover:bg-success/90"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleApproval(tutor.id, "rejected")}
                      variant="destructive"
                      className="flex-1"
                      disabled={!rejectionReasons[tutor.id]}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
