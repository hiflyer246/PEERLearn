import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const Privacy = () => {
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar user={user} profile={profile} />
      
      <main className="flex-1">
        <section className="bg-gradient-hero text-primary-foreground py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-lg text-primary-foreground/80">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto prose prose-slate dark:prose-invert">
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Welcome to PeerLearn. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and tell you about your privacy rights.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">2. Information We Collect</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    We may collect, use, store and transfer different kinds of personal data about you:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Identity Data: name, username, student ID</li>
                    <li>Contact Data: email address, phone number</li>
                    <li>Profile Data: university, major, skills, profile picture</li>
                    <li>Technical Data: IP address, browser type, time zone</li>
                    <li>Usage Data: information about how you use our website and services</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">3. How We Use Your Information</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    We use your personal data for the following purposes:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>To register you as a new user and create your account</li>
                    <li>To connect students with tutors</li>
                    <li>To process and facilitate tutoring sessions</li>
                    <li>To send you important updates about our services</li>
                    <li>To improve our website and services</li>
                    <li>To ensure the security of our platform</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">4. Data Security</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We have implemented appropriate security measures to prevent your personal data from being accidentally lost, used, accessed, altered, or disclosed in an unauthorized way. We limit access to your personal data to those employees and partners who have a business need to know.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">5. Data Retention</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We will only retain your personal data for as long as necessary to fulfill the purposes we collected it for, including for the purposes of satisfying any legal, accounting, or reporting requirements.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">6. Your Legal Rights</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Under certain circumstances, you have rights under data protection laws in relation to your personal data:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Request access to your personal data</li>
                    <li>Request correction of your personal data</li>
                    <li>Request erasure of your personal data</li>
                    <li>Object to processing of your personal data</li>
                    <li>Request restriction of processing your personal data</li>
                    <li>Request transfer of your personal data</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">7. Third-Party Links</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Our website may include links to third-party websites. We do not control these websites and are not responsible for their privacy practices. We encourage you to read the privacy policy of every website you visit.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">8. Contact Us</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    If you have any questions about this privacy policy or our privacy practices, please contact us at privacy@peerlearn.com.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;
