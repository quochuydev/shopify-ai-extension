import { generateProductFromImage } from "@/lib/ai";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest) {
  try {
    // Get authenticated user via Bearer token (for extension usage)
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          error: "Authentication required",
          message: "Please provide a valid Bearer token for extension access",
        },
        {
          status: 401,
        }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    // Create Supabase client and set the session with the JWT token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Set the session using the JWT token
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        {
          error: "Authentication required",
          message: "Invalid or expired Bearer token",
        },
        {
          status: 401,
        }
      );
    }

    // Simple plan check - just get plan type for pro users
    const { data: plan } = await supabase
      .from("user_plans")
      .select("plan_type, usage_credits")
      .eq("user_id", user.id)
      .single();

    const isPro = plan?.plan_type === 'pro';
    const credits = plan?.usage_credits || 0;

    // Block if not pro and no credits
    if (!isPro && credits <= 0) {
      return NextResponse.json(
        { error: "No credits remaining", message: "Please upgrade your plan to continue." },
        { status: 429 }
      );
    }

    // Parse request body
    const formData = await request.formData();
    const imageFile = formData.get("image") as File;

    if (!imageFile) {
      return NextResponse.json(
        {
          error: "No image provided",
          message: "Please upload an image file for product generation",
        },
        {
          status: 400,
        }
      );
    }

    // Validate image
    if (!imageFile.type.startsWith("image/")) {
      return NextResponse.json(
        {
          error: "Invalid file type",
          message: "Please upload a valid image file (JPG, PNG, GIF)",
        },
        {
          status: 400,
        }
      );
    }

    // Convert image to base64
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");

    // Generate product content using OpenAI
    const productContent = await generateProductFromImage(base64Image);

    // Log the request
    await supabase.from("ai_requests").insert({
      user_id: user.id,
      endpoint: "external/generate",
      generated_content: productContent,
    });

    // Deduct credit for non-pro users
    if (!isPro) {
      await supabase.from("user_plans")
        .update({ usage_credits: Math.max(0, credits - 1) })
        .eq("user_id", user.id);
    }

    return NextResponse.json(
      { success: true, data: productContent },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      }
    );
  } catch (error) {
    console.error("Generate Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET endpoint for checking rate limit status
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get plan info
    const { data: plan } = await supabase
      .from("user_plans")
      .select("plan_type, usage_credits")
      .eq("user_id", user.id)
      .single();

    // Get recent requests
    const { data: history } = await supabase
      .from("ai_requests")
      .select("generated_content, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    const isPro = plan?.plan_type === 'pro';
    const credits = plan?.usage_credits || 0;

    return NextResponse.json({
      plan: {
        type: plan?.plan_type || 'free',
        remaining_credits: isPro ? null : credits,
        allowed: isPro || credits > 0,
      },
      history_count: history?.length || 0,
      recent_generations: (history || []).slice(0, 3).map((h) => ({
        title: h.generated_content?.title || "Untitled",
        product_type: h.generated_content?.product_type || "Unknown",
        created_at: h.created_at,
      })),
    });
  } catch (error) {
    console.error("External API GET Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Handle CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}
