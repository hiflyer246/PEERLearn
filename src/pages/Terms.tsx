import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const Terms = () => {
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
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
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
                  <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    By accessing and using PeerLearn, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our services.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">2. Description of Service</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    PeerLearn is a peer-to-peer tutoring platform that connects students with peer tutors. We provide the technology platform but do not directly provide tutoring services. Tutors are independent users of our platform.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">3. User Accounts</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    To use certain features of our service, you must register for an account. You agree to:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Provide accurate, current, and complete information</li>
                    <li>Maintain and update your information</li>
                    <li>Keep your password secure and confidential</li>
                    <li>Notify us immediately of any unauthorized use</li>
                    <li>Be responsible for all activities under your account</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">4. User Conduct</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    You agree not to:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Use the service for any illegal purpose</li>
                    <li>Harass, abuse, or harm another person</li>
                    <li>Impersonate any person or entity</li>
                    <li>Interfere with or disrupt the service</li>
                    <li>Post false, misleading, or fraudulent content</li>
                    <li>Violate any applicable laws or regulations</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">5. Tutor Responsibilities</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    If you register as a tutor, you additionally agree to:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Provide accurate information about your qualifications</li>
                    <li>Conduct sessions professionally and respectfully</li>
                    <li>Honor your commitments to students</li>
                    <li>Comply with cancellation policies</li>
                    <li>Report any issues or concerns promptly</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">6. Payment Terms</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Students agree to pay the rates set by tutors. Payments are processed through our secure payment system. Refunds are subject to the tutor's cancellation policy and our refund policy.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">7. Intellectual Property</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    The service and its original content, features, and functionality are owned by PeerLearn and are protected by international copyright, trademark, and other intellectual property laws.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">8. Limitation of Liability</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    PeerLearn shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">9. Termination</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We may terminate or suspend your account and access to the service immediately, without prior notice, for conduct that we believe violates these Terms of Service or is harmful to other users, us, or third parties.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">10. Changes to Terms</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through the service.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">11. Contact Information</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    For any questions about these Terms of Service, please contact us at legal@peerlearn.com.
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

export default Terms;
