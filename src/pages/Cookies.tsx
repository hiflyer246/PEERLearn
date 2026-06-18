import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const Cookies = () => {
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
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Cookie Policy</h1>
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
                  <h2 className="text-2xl font-bold mb-4">1. What Are Cookies</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">2. How We Use Cookies</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    We use cookies for the following purposes:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li><strong>Authentication:</strong> To remember your login status and keep you signed in</li>
                    <li><strong>Preferences:</strong> To remember your settings and preferences</li>
                    <li><strong>Security:</strong> To protect your account and detect fraudulent activity</li>
                    <li><strong>Analytics:</strong> To understand how you use our website and improve our services</li>
                    <li><strong>Performance:</strong> To ensure our website works properly and efficiently</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">3. Types of Cookies We Use</h2>
                  
                  <div className="space-y-4 mb-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Essential Cookies</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        These cookies are necessary for the website to function properly. They enable basic functions like page navigation and access to secure areas. The website cannot function properly without these cookies.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-2">Functional Cookies</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        These cookies enable enhanced functionality and personalization, such as remembering your preferences and choices.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-2">Analytics Cookies</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve our website.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-2">Advertising Cookies</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        These cookies may be set through our site by our advertising partners to build a profile of your interests and show you relevant ads on other sites.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">4. Third-Party Cookies</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We may also use third-party cookies from trusted partners for analytics and advertising purposes. These third parties have their own privacy policies and cookie policies.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">5. Managing Cookies</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    You can control and manage cookies in various ways:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li><strong>Browser Settings:</strong> Most browsers allow you to refuse or accept cookies through their settings</li>
                    <li><strong>Delete Cookies:</strong> You can delete cookies that have already been set</li>
                    <li><strong>Third-Party Tools:</strong> You can use third-party tools to manage cookies</li>
                  </ul>
                  <p className="text-muted-foreground leading-relaxed mt-4">
                    Please note that blocking or deleting cookies may impact your experience on our website, and some features may not work properly.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">6. Cookie Duration</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Some cookies are deleted when you close your browser (session cookies), while others remain on your device for a specified period or until you delete them (persistent cookies).
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">7. Updates to This Policy</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We encourage you to review this policy periodically.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">8. Contact Us</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    If you have any questions about our use of cookies, please contact us at privacy@peerlearn.com.
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

export default Cookies;
