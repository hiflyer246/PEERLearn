import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { studentId, preferences } = await req.json();
    
    console.log("Matching tutors for student:", studentId, "Preferences:", preferences);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get student profile
    const { data: studentProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", studentId)
      .single();

    // Get all approved tutors with their details
    const { data: tutors } = await supabase
      .from("tutor_profiles")
      .select(`
        *,
        profiles:user_id (
          full_name,
          university,
          location,
          bio
        ),
        tutor_subjects (
          subjects (
            name,
            category
          )
        ),
        tutor_skills (
          skills (
            name
          )
        )
      `)
      .eq("is_approved", true);

    if (!tutors || tutors.length === 0) {
      return new Response(
        JSON.stringify({ matches: [], reasoning: "No approved tutors available" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use AI to match tutors
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    
    const prompt = `You are an intelligent tutor matching assistant. Based on the student's profile and preferences, recommend the top 3-5 tutors from the list.

Student Profile:
${JSON.stringify(studentProfile, null, 2)}

Student Preferences:
${JSON.stringify(preferences, null, 2)}

Available Tutors:
${JSON.stringify(tutors, null, 2)}

Please analyze and provide:
1. Top tutor recommendations (tutor IDs) in order of best match
2. Brief reasoning for each recommendation (2-3 sentences)

Return as JSON in this format:
{
  "recommendations": [
    {
      "tutorId": "uuid",
      "matchScore": 0-100,
      "reasoning": "why this tutor is a good match"
    }
  ]
}`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are an expert tutor matching AI. Analyze profiles and provide personalized tutor recommendations."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
      }),
    });

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices[0].message.content;
    
    console.log("AI Response:", aiContent);

    // Parse AI response
    let recommendations;
    try {
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        recommendations = JSON.parse(jsonMatch[0]);
      } else {
        recommendations = { recommendations: [] };
      }
    } catch (e) {
      console.error("Error parsing AI response:", e);
      recommendations = { recommendations: [] };
    }

    return new Response(
      JSON.stringify(recommendations),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in match-tutors function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
