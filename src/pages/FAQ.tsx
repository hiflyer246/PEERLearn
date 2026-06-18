import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const FAQ = () => {
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

  const faqs = [
    {
      question: "How does PeerLearn work?",
      answer:
        "PeerLearn connects students with peer tutors who have mastered the subjects you're studying. Simply search for a tutor, book a session, and start learning at affordable rates.",
    },
    {
      question: "How much does tutoring cost?",
      answer:
        "Tutoring rates vary by subject and tutor experience, but most sessions start at $15/hour. Each tutor sets their own rates, which are clearly displayed on their profile.",
    },
    {
      question: "How do I become a tutor?",
      answer:
        "To become a tutor, sign up for an account and complete your profile with your skills, experience, and hourly rate. Our admin team will review your application and approve qualified tutors.",
    },
    {
      question: "Are tutors verified?",
      answer:
        "Yes! All tutors go through a verification process by our admin team. We verify their student status, academic background, and expertise in their listed subjects.",
    },
    {
      question: "What subjects can I get help with?",
      answer:
        "We offer tutoring in a wide range of subjects including mathematics, computer science, physics, chemistry, biology, languages, and more. Use our search feature to find tutors for specific topics.",
    },
    {
      question: "Can I cancel or reschedule a session?",
      answer:
        "Yes, you can cancel or reschedule sessions according to the tutor's cancellation policy. Most tutors require at least 24 hours notice for cancellations to receive a full refund.",
    },
    {
      question: "How are sessions conducted?",
      answer:
        "Sessions are conducted online through video calls. Tutors and students can communicate through our platform to arrange the best time and method for their sessions.",
    },
    {
      question: "What if I'm not satisfied with a session?",
      answer:
        "We strive for quality tutoring experiences. If you're not satisfied, please contact our support team within 24 hours of your session, and we'll work to resolve the issue.",
    },
    {
      question: "How do I pay for sessions?",
      answer:
        "We accept all major credit cards and digital payment methods. Payments are processed securely through our platform, and you'll receive a receipt for each transaction.",
    },
    {
      question: "Is my personal information safe?",
      answer:
        "Absolutely. We take data privacy seriously and use industry-standard encryption to protect your personal information. See our Privacy Policy for more details.",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar user={user} profile={profile} />
      
      <main className="flex-1">
        <section className="bg-gradient-hero text-primary-foreground py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
              Find quick answers to common questions about PeerLearn
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                {faqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="bg-card border rounded-lg px-6"
                  >
                    <AccordionTrigger className="text-left hover:no-underline">
                      <span className="font-semibold">{faq.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              <div className="mt-12 text-center p-8 bg-secondary/30 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">
                  Still have questions?
                </h3>
                <p className="text-muted-foreground mb-4">
                  Can't find the answer you're looking for? Please contact our
                  support team.
                </p>
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center px-6 py-3 bg-cta text-cta-foreground rounded-lg hover:bg-cta/90 transition-colors"
                >
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default FAQ;
