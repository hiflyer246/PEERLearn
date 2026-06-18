import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  GraduationCap,
  LogOut,
  User,
  Settings,
  Search,
  Code,
  Brain,
  Database,
  PenTool,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface NavbarProps {
  user?: any;
  profile?: any;
}

export const Navbar = ({ user, profile }: NavbarProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate("/auth");
      toast({ title: "Signed out successfully" });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/discover?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/70 backdrop-blur-md border-b border-border/40 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left Section - Logo + Explore */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <GraduationCap className="h-6 w-6 text-accent" />
            <span className="bg-gradient-accent bg-clip-text text-transparent">
              PeerLearn
            </span>
          </Link>

          {/* Explore Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-gradient-accent text-white rounded-full hover:opacity-90">Explore</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Popular Categories
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/discover?category=ai-ml")}>
                <Brain className="mr-2 h-4 w-4 text-purple-500" /> AI & Machine Learning
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/discover?category=web-dev")}>
                <Code className="mr-2 h-4 w-4 text-blue-500" /> Web Development
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/discover?category=data-science")}>
                <Database className="mr-2 h-4 w-4 text-green-500" /> Data Science
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/discover?category=design")}>
                <PenTool className="mr-2 h-4 w-4 text-pink-500" /> Design & UI/UX
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Center: Search Bar */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex items-center w-[40%] border border-border/50 rounded-full overflow-hidden shadow-sm hover:shadow-md transition"
        >
          <Input
            type="text"
            placeholder="Search for skills, tutors, or subjects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 border-0 bg-transparent px-4 py-2 text-sm focus-visible:ring-0 focus:outline-none"
          />
          <Button
            type="submit"
            size="icon"
            className="rounded-none rounded-r-full bg-accent hover:bg-accent/90"
          >
            <Search className="h-4 w-4 text-white" />
          </Button>
        </form>

        {/* Right: Auth / Profile */}
        <div className="flex items-center gap-3">
          <Link to="/discover">
            <Button variant="ghost" className="font-medium">
              Find Tutors
            </Button>
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                    <AvatarFallback className="bg-accent text-accent-foreground">
                      {profile?.full_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <div className="flex items-center gap-2 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                    <AvatarFallback className="bg-accent text-accent-foreground text-sm">
                      {profile?.full_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="text-sm font-medium">{profile?.full_name}</p>
                    <p className="text-xs text-muted-foreground">{profile?.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                  <User className="mr-2 h-4 w-4" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="outline" className="rounded-full">
                  Log in
                </Button>
              </Link>
              <Link to="/auth?mode=signup">
                <Button className="rounded-full bg-gradient-accent text-white hover:opacity-90">
                  Sign up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
