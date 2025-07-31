import { generateProductFromImage } from "@/lib/ai";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { configuration } from "@/configuration";

// Rate limiting configuration
const RATE_LIMIT_REQUESTS = configuration.rateLimitRequests; // Free trial limit
const RATE_LIMIT_WINDOW = configuration.rateLimitWindow; // 2 days in milliseconds

// Check user plan and usage limits
async function checkUserPlanLimits(
  userId: string,
  supabase: any
): Promise<{
  allowed: boolean;
  requestCount: number;
  remaining: number;
  planType: string;
  planStatus: string;
  error?: any;
}> {
  try {
    // Get user plan
    const { data: planData, error: planError } = await supabase
      .from("user_plans")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (planError) {
      console.error("External API Plan check error:", planError);
      return {
        allowed: false,
        requestCount: 0,
        remaining: 0,
        planType: 'unknown',
        planStatus: 'error',
        error: planError,
      };
    }

    const plan = planData;
    let allowed = false;
    let remaining = 0;

    // Check plan limits
    if (plan.plan_type === 'pro') {
      // Pro plan has unlimited usage
      allowed = true;
      remaining = 999999; // Represent unlimited
    } else if (plan.plan_type === 'usage' || plan.plan_type === 'free') {
      // Usage and free plans have credit limits
      const credits = plan.usage_credits || 0;
      allowed = credits > 0;
      remaining = credits;
    }

    // Get total request count for stats
    const { count: totalRequests } = await supabase
      .from("ai_requests")
      .select("*", { count: 'exact', head: true })
      .eq("user_id", userId);

    return {
      allowed,
      requestCount: totalRequests || 0,
      remaining,
      planType: plan.plan_type,
      planStatus: allowed ? 'active' : 'expired',
      error: null,
    };
  } catch (error) {
    console.error("External API Plan check failed:", error);
    return {
      allowed: false,
      requestCount: 0,
      remaining: 0,
      planType: 'unknown',
      planStatus: 'error',
      error,
    };
  }
}

// Get user's generation history
async function getUserHistory(userId: string, supabase: any): Promise<any[]> {
  try {
    const { data: history, error } = await supabase
      .from("ai_requests")
      .select("generated_content, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error("External API Failed to fetch user history:", error);
      return [];
    }

    return history || [];
  } catch (error) {
    console.error("External API History fetch failed:", error);
    return [];
  }
}

export async function POST(request: NextRequest) {
  const result: any = {
    endpoint: "external/generate",
    timestamp: new Date().toISOString(),
  };

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

    result.userId = user?.id;
    result.userEmail = user?.email;
    result.authError = authError;

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

    // Check user plan limits
    const planCheck = await checkUserPlanLimits(user.id, supabase);
    result.planCheck = planCheck;

    if (!planCheck.allowed) {
      const errorMessage = planCheck.planType === 'free' 
        ? `Free trial limit reached. You have ${planCheck.remaining} credits remaining. Please upgrade to continue.`
        : planCheck.planType === 'usage'
        ? `Usage credits exhausted. You have ${planCheck.remaining} credits remaining. Please purchase more credits.`
        : `Plan limit exceeded. Current plan: ${planCheck.planType}`;

      return NextResponse.json(
        {
          error: "Plan limit exceeded",
          message: errorMessage,
          planType: planCheck.planType,
          remaining: planCheck.remaining,
          planStatus: planCheck.planStatus,
        },
        {
          status: 429,
          headers: {
            "X-Plan-Type": planCheck.planType,
            "X-Plan-Remaining": planCheck.remaining.toString(),
            "X-Plan-Status": planCheck.planStatus,
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        }
      );
    }

    // Parse request body
    const formData = await request.formData();
    const imageFile = formData.get("image") as File;

    result.imageFile = !!imageFile;

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

    // Get user history for context
    const userHistory = await getUserHistory(user.id, supabase);
    result.userHistoryCount = userHistory.length;

    // Generate product content using OpenAI
    const productContent = await generateProductFromImage(
      base64Image,
      userHistory
    );
    result.productGenerated = !!productContent;

    // Log the request for tracking and history
    const requestLog = await supabase.from("ai_requests").insert({
      user_id: user.id,
      endpoint: "external/generate",
      generated_content: productContent,
      created_at: new Date().toISOString(),
    });
    result.requestLogged = !requestLog.error;

    if (requestLog.error) {
      console.error("External API Failed to log request:", requestLog.error);
    }

    // Deduct credits for non-pro plans
    if (planCheck.planType !== 'pro') {
      const { error: deductError } = await supabase
        .from("user_plans")
        .update({ 
          usage_credits: Math.max(0, (planCheck.remaining - 1)),
          updated_at: new Date().toISOString()
        })
        .eq("user_id", user.id);

      if (deductError) {
        console.error("External API Failed to deduct credit:", deductError);
      } else {
        result.creditDeducted = true;
      }
    }

    // Get updated plan info
    const updatedPlanCheck = await checkUserPlanLimits(user.id, supabase);
    result.updatedPlanCheck = updatedPlanCheck;

    return NextResponse.json(
      {
        success: true,
        data: productContent,
        meta: {
          endpoint: "external/generate",
          plan_type: updatedPlanCheck.planType,
          remaining_credits: updatedPlanCheck.remaining,
          plan_status: updatedPlanCheck.planStatus,
          user_history_count: userHistory.length,
        },
      },
      {
        status: 200,
        headers: {
          "X-Plan-Type": updatedPlanCheck.planType,
          "X-Plan-Remaining": updatedPlanCheck.remaining.toString(),
          "X-Plan-Status": updatedPlanCheck.planStatus,
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      }
    );
  } catch (error) {
    console.error("External API Generate Error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
        endpoint: "external/generate",
      },
      {
        status: 500,
      }
    );
  } finally {
    console.log(
      "External API Generate: Request processed",
      JSON.stringify(result)
    );
  }
}

// GET endpoint for checking rate limit status
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user via Bearer token (for extension usage)
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          error: "Authentication required",
          endpoint: "external/generate",
        },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    // Create Supabase client with the JWT token for authentication
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error: "Authentication required",
          endpoint: "external/generate",
        },
        {
          status: 401,
        }
      );
    }

    const planCheck = await checkUserPlanLimits(user.id, supabase);
    const userHistory = await getUserHistory(user.id, supabase);

    return NextResponse.json(
      {
        endpoint: "external/generate",
        plan: {
          type: planCheck.planType,
          remaining_credits: planCheck.remaining,
          status: planCheck.planStatus,
          allowed: planCheck.allowed,
        },
        history_count: userHistory.length,
        recent_generations: userHistory.slice(0, 3).map((h) => ({
          title: h.generated_content?.title || "Untitled",
          product_type: h.generated_content?.product_type || "Unknown",
          created_at: h.created_at,
        })),
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
    console.error("External API GET Error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        endpoint: "external/generate",
      },
      {
        status: 500,
      }
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
