import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ApprovalEmailRequest {
  email: string;
  name: string;
  status: "approved" | "rejected";
  reason?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, status, reason }: ApprovalEmailRequest = await req.json();

    console.log("Sending approval email to:", email, "Status:", status);

    const subject = status === "approved"
      ? "Your Tutor Application Has Been Approved! 🎉"
      : "Update on Your Tutor Application";

    const html = status === "approved"
      ? `
        <h1>Congratulations ${name}! 🎉</h1>
        <p>Your tutor application has been <strong>approved</strong>!</p>
        <p>You can now start accepting students and scheduling sessions.</p>
        <p>Log in to your dashboard to get started.</p>
        <p>Best regards,<br>The Peer Learning Team</p>
      `
      : `
        <h1>Hi ${name},</h1>
        <p>Thank you for your interest in becoming a tutor on our platform.</p>
        <p>After careful review, we regret to inform you that your application has not been approved at this time.</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
        <p>We encourage you to reapply in the future after addressing any concerns.</p>
        <p>Best regards,<br>The Peer Learning Team</p>
      `;

    const emailResponse = await resend.emails.send({
      from: "Peer Learning <onboarding@resend.dev>",
      to: [email],
      subject: subject,
      html: html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-approval-email function:", error);
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
