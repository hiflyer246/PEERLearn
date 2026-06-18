import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ApplicationNotificationRequest {
  tutorEmail: string;
  tutorName: string;
  adminEmail: string;
  skills: string[];
  hourlyRate: number;
  experienceYears: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tutorEmail, tutorName, adminEmail, skills, hourlyRate, experienceYears }: ApplicationNotificationRequest = await req.json();

    console.log("Sending application notifications to:", tutorEmail, "and admin:", adminEmail);

    // Send confirmation email to tutor
    const tutorEmailResponse = await resend.emails.send({
      from: "Peer Learning <onboarding@resend.dev>",
      to: [tutorEmail],
      subject: "Application Received - Peer Learning Platform",
      html: `
        <h1>Thank you for applying, ${tutorName}! 🎓</h1>
        <p>We have received your tutor application and it is now under review.</p>
        <h2>Application Details:</h2>
        <ul>
          <li><strong>Skills:</strong> ${skills.join(", ")}</li>
          <li><strong>Hourly Rate:</strong> $${hourlyRate}</li>
          <li><strong>Experience:</strong> ${experienceYears} years</li>
        </ul>
        <p>You will receive another email once your application has been reviewed by our admin team.</p>
        <p>This usually takes 1-2 business days.</p>
        <p>Best regards,<br>The Peer Learning Team</p>
      `,
    });

    console.log("Tutor confirmation email sent:", tutorEmailResponse);

    // Send notification email to admin
    const adminEmailResponse = await resend.emails.send({
      from: "Peer Learning <onboarding@resend.dev>",
      to: [adminEmail],
      subject: "New Tutor Application - Action Required",
      html: `
        <h1>New Tutor Application Received</h1>
        <p>A new tutor has applied to join the platform. Please review and approve/reject the application.</p>
        <h2>Applicant Details:</h2>
        <ul>
          <li><strong>Name:</strong> ${tutorName}</li>
          <li><strong>Email:</strong> ${tutorEmail}</li>
          <li><strong>Skills:</strong> ${skills.join(", ")}</li>
          <li><strong>Hourly Rate:</strong> $${hourlyRate}</li>
          <li><strong>Experience:</strong> ${experienceYears} years</li>
        </ul>
        <p>Please log in to the admin dashboard to review this application.</p>
        <p>Best regards,<br>The Peer Learning System</p>
      `,
    });

    console.log("Admin notification email sent:", adminEmailResponse);

    return new Response(JSON.stringify({ 
      tutorEmail: tutorEmailResponse,
      adminEmail: adminEmailResponse 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in notify-new-application function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
