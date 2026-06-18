import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, MessageCircle, Shield, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const HelpCenter = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const helpCategories = [
    {
      icon: Users,
      title: "Getting Started",
      description: "Learn how to create an account and find your first tutor",
      articles: [
        "How to sign up for PeerLearn",
        "Finding the right tutor for you",
        "Booking your first session",
        "Setting up your profile",
      ],
    },
    {
      icon: BookOpen,
      title: "For Students",
      description: "Everything you need to know about learning on PeerLearn",
      articles: [
        "How to search for tutors",
        "Understanding tutor ratings",
        "Payment methods and pricing",
        "Cancellation and refund policy",
      ],
    },
    {
      icon: MessageCircle,
      title: "For Tutors",
      description: "Resources for tutors to succeed on our platform",
      articles: [
        "Becoming a verified tutor",
        "Setting your hourly rate",
        "Managing your schedule",
        "Best practices for online tutoring",
      ],
    },
    {
      icon: Shield,
      title: "Safety & Trust",
      description: "How we keep our community safe and secure",
      articles: [
        "Our verification process",
        "Community guidelines",
        "Reporting inappropriate behavior",
        "Data privacy and security",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar user={user} profile={profile} />
      
      <main className="flex-1">
        <section className="bg-gradient-hero text-primary-foreground py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Help Center</h1>
            <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
              Find answers to common questions and learn how to get the most out of PeerLearn
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {helpCategories.map((category, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-4 mb-2">
                      <div className="p-3 rounded-lg bg-accent/10">
                        <category.icon className="h-6 w-6 text-accent" />
                      </div>
                      <CardTitle>{category.title}</CardTitle>
                    </div>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {category.articles.map((article, articleIndex) => (
                        <li key={articleIndex}>
                          <a
                            href="#"
                            className="text-sm text-foreground hover:text-accent transition-colors flex items-center gap-2"
                          >
                            <span className="text-muted-foreground">→</span>
                            {article}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Still need help?</h2>
            <p className="text-muted-foreground mb-8">
              Our support team is here to assist you
            </p>
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 bg-cta text-cta-foreground rounded-lg hover:bg-cta/90 transition-colors"
            >
              Contact Support
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HelpCenter;
