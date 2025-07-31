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

    const credits = plan?.usage_credits || 0;
    const planType = plan?.plan_type || "free";

    let remainingCredits = null;
    let allowed = true;

    if (planType === "free") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: todayRequests } = await supabase
        .from("ai_requests")
        .select("id")
        .eq("user_id", user.id)
        .eq("endpoint", "external/generate")
        .gte("created_at", today.toISOString());

      const dailyUsage = todayRequests?.length || 0;
      remainingCredits = Math.max(0, 2 - dailyUsage);
      allowed = dailyUsage < 2;
    }

    if (planType === "usage") {
      remainingCredits = credits;
      allowed = credits > 0;
    }

    if (planType === "pro") {
      remainingCredits = null;
      allowed = true;
    }

    if (!allowed) {
      return NextResponse.json(
        {
          error: "No credits remaining",
          message: "Please upgrade your plan to continue.",
        },
        {
          status: 429,
        }
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
      image_data: base64Image,
      generated_content: productContent,
    });

    // Deduct credit for non-pro users
    if (planType === "usage") {
      await supabase
        .from("user_plans")
        .update({ usage_credits: Math.max(0, credits - 1) })
        .eq("user_id", user.id);
    }

    return NextResponse.json(
      {
        success: true,
        data: productContent,
      },
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
