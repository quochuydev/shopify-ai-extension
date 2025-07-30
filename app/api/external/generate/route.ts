import { generateProductFromImage } from "@/lib/ai";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// Rate limiting configuration for external API (extension usage)
const RATE_LIMIT_REQUESTS = 3; // Lower limit for external usage
const RATE_LIMIT_WINDOW = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Rate limiting helper
async function checkRateLimit(
  userId: string,
  supabase: any
): Promise<{ allowed: boolean; remaining: number }> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - RATE_LIMIT_WINDOW);

  try {
    // Get user's requests in the current window
    const { data: requests, error } = await supabase
      .from("ai_requests")
      .select("*")
      .eq("user_id", userId)
      .gte("created_at", windowStart.toISOString())
      .order("created_at", { ascending: false });

    if (error) {
      console.error("External API Rate limit check error:", error);
      // On error, allow the request but log it
      return { allowed: true, remaining: RATE_LIMIT_REQUESTS - 1 };
    }

    const requestCount = requests?.length || 0;
    const remaining = Math.max(0, RATE_LIMIT_REQUESTS - requestCount);

    return {
      allowed: requestCount < RATE_LIMIT_REQUESTS,
      remaining,
    };
  } catch (error) {
    console.error("External API Rate limit check failed:", error);
    return { allowed: true, remaining: RATE_LIMIT_REQUESTS - 1 };
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
    const supabase = await createClient();

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

    result.userId = user.id;
    result.userEmail = user.email;

    // Check rate limit
    const rateLimitCheck = await checkRateLimit(user.id, supabase);
    result.rateLimitCheck = rateLimitCheck;

    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: `Extension usage limit reached: ${RATE_LIMIT_REQUESTS} requests per day. Please try again tomorrow.`,
          remaining: rateLimitCheck.remaining,
          resetTime: new Date(Date.now() + RATE_LIMIT_WINDOW).toISOString(),
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": RATE_LIMIT_REQUESTS.toString(),
            "X-RateLimit-Remaining": rateLimitCheck.remaining.toString(),
            "X-RateLimit-Reset": new Date(
              Date.now() + RATE_LIMIT_WINDOW
            ).toISOString(),
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
    const hints = formData.get("hints") as string; // Optional product hints

    result.imageFile = !!imageFile;
    result.hints = !!hints;

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

    // Log the request for rate limiting and history
    const requestLog = await supabase.from("ai_requests").insert({
      user_id: user.id,
      image_data: base64Image.substring(0, 100) + "...", // Store truncated for history
      generated_content: productContent,
      created_at: new Date().toISOString(),
      endpoint: "external/generate",
      hints: hints || null,
    });
    result.requestLogged = !requestLog.error;

    if (requestLog.error) {
      console.error("External API Failed to log request:", requestLog.error);
    }

    // Update rate limit headers
    const updatedRateLimit = await checkRateLimit(user.id, supabase);
    result.updatedRateLimit = updatedRateLimit;

    return NextResponse.json(
      {
        success: true,
        data: productContent,
        meta: {
          endpoint: "external/generate",
          remaining_requests: updatedRateLimit.remaining,
          hints_used: !!hints,
          user_history_count: userHistory.length,
        },
      },
      {
        status: 200,
        headers: {
          "X-RateLimit-Limit": RATE_LIMIT_REQUESTS.toString(),
          "X-RateLimit-Remaining": updatedRateLimit.remaining.toString(),
          "X-RateLimit-Reset": new Date(
            Date.now() + RATE_LIMIT_WINDOW
          ).toISOString(),
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
    console.log("External API Generate: Request processed", JSON.stringify(result));
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
          endpoint: "external/generate"
        },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { 
          error: "Authentication required",
          endpoint: "external/generate"
        },
        { status: 401 }
      );
    }

    const rateLimitCheck = await checkRateLimit(user.id, supabase);
    const userHistory = await getUserHistory(user.id, supabase);

    return NextResponse.json({
      endpoint: "external/generate",
      rate_limit: {
        limit: RATE_LIMIT_REQUESTS,
        remaining: rateLimitCheck.remaining,
        reset_time: new Date(Date.now() + RATE_LIMIT_WINDOW).toISOString(),
      },
      history_count: userHistory.length,
      recent_generations: userHistory.slice(0, 3).map((h) => ({
        title: h.generated_content?.title || "Untitled",
        product_type: h.generated_content?.product_type || "Unknown",
        created_at: h.created_at,
      })),
    }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
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
