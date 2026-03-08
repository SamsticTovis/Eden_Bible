import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { difficulty, count = 10, mode = "single", usedQuestions = [] } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const categories = [
      "Bible Characters", "Bible Events", "Bible Geography", "Bible Miracles",
      "Bible Parables", "Bible Teachings", "Bible Quotes"
    ];

    const formats = [
      "Multiple Choice", "True or False", "Verse Completion", "Guess the Bible Character"
    ];

    const difficultyGuide: Record<string, string> = {
      easy: "Simple, well-known Bible facts suitable for beginners. Focus on famous stories like Noah's Ark, David and Goliath, the birth of Jesus.",
      medium: "Moderate difficulty requiring good Bible knowledge. Include lesser-known details about major stories and characters.",
      hard: "Challenging questions requiring deep Bible study. Include specific chapter/verse details, minor characters, and theological concepts.",
      expert: "Expert-level questions for Bible scholars. Include original language references, historical context, cross-references between books, and obscure details.",
      mixed: "Vary difficulty across the set: include 2 easy, 3 medium, 3 hard, and 2 expert questions."
    };

    const avoidList = usedQuestions.length > 0
      ? `\n\nIMPORTANT: Do NOT generate questions about these topics/verses/characters that were already used: ${usedQuestions.join(", ")}`
      : "";

    const systemPrompt = `You are a Bible quiz question generator. Generate exactly ${count} quiz questions.

DIFFICULTY: ${difficulty} - ${difficultyGuide[difficulty] || difficultyGuide.medium}

CATEGORIES: Rotate evenly between these categories: ${categories.join(", ")}

FORMATS: Mix these question formats: ${formats.join(", ")}
- For "True or False": option_a = "True", option_b = "False", option_c = "", option_d = ""
- For "Verse Completion": Present a partial verse with a blank, options are possible completions
- For "Guess the Bible Character": Give clues about a character, options are character names
- For "Multiple Choice": Standard 4-option question

RULES:
- Each question MUST have unique content — no repeated stories, characters, or verses
- Questions must be biblically accurate
- Correct answers must be definitively correct
- Wrong options must be plausible but clearly incorrect
- For True/False, roughly half should be True and half False${avoidList}`;

    const userPrompt = `Generate ${count} Bible quiz questions as a JSON array. Each object must have exactly these fields:
{
  "question": "the question text",
  "option_a": "first option",
  "option_b": "second option",  
  "option_c": "third option (empty string for True/False)",
  "option_d": "fourth option (empty string for True/False)",
  "correct_option": "A" or "B" or "C" or "D",
  "difficulty": "easy" or "medium" or "hard" or "expert",
  "category": "one of the 7 categories",
  "format": "Multiple Choice" or "True or False" or "Verse Completion" or "Guess the Bible Character"
}

Return ONLY the JSON array, no markdown, no explanation.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.9,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      const text = await response.text();
      console.error("AI gateway error:", status, text);
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${status}`);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || "[]";
    
    // Parse JSON from the response, handling possible markdown wrapping
    let questions;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      questions = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse quiz questions");
    }

    return new Response(JSON.stringify({ questions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-quiz error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
