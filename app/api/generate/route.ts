import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { v4 as uuid } from "uuid";
import { ProductContent } from "@/types";
import { generateProductFromImage } from "@/lib/ai";

// Rate limiting configuration
const RATE_LIMIT_REQUESTS = 3;
const RATE_LIMIT_WINDOW = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const user = {
  id: uuid(),
};

// Rate limiting helper
async function checkRateLimit(
  userId: string,
  supabase: any
): Promise<{ allowed: boolean; remaining: number }> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - RATE_LIMIT_WINDOW);

  try {
    await supabase.from("ai_requests").insert({
      user_id: userId,
      image_data: "",
      generated_content: {},
      created_at: now.toISOString(),
    });
  } catch (error) {
    console.log(`debug:error`, error);
  }

  try {
    const { data: requests, error } = await supabase
      .from("ai_requests")
      .select("*")
      .eq("user_id", userId)
      .gte("created_at", windowStart.toISOString())
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Rate limit check error:", error);
      return { allowed: true, remaining: RATE_LIMIT_REQUESTS - 1 };
    }

    const requestCount = requests?.length || 0;
    const remaining = Math.max(0, RATE_LIMIT_REQUESTS - requestCount);

    return {
      allowed: requestCount < RATE_LIMIT_REQUESTS,
      remaining,
    };
  } catch (error) {
    console.error("Rate limit check failed:", error);
    return { allowed: true, remaining: RATE_LIMIT_REQUESTS - 1 };
  }
}

// Log request for rate limiting and history
async function logRequest(
  userId: string,
  imageData: string,
  result: ProductContent,
  supabase: any
) {
  try {
    const { error } = await supabase.from("ai_requests").insert({
      user_id: userId,
      image_data: imageData.substring(0, 100) + "...", // Store truncated for history
      generated_content: result,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Failed to log request:", error);
    }
  } catch (error) {
    console.error("Request logging failed:", error);
  }
}

// Get user's generation history (for future enhancement)
async function getUserHistory(userId: string, supabase: any): Promise<any[]> {
  try {
    const { data: history, error } = await supabase
      .from("ai_requests")
      .select("generated_content, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Failed to fetch user history:", error);
      return [];
    }

    return history || [];
  } catch (error) {
    console.error("History fetch failed:", error);
    return [];
  }
}

export async function POST(request: NextRequest) {
  const result: any = {};

  try {
    // Get authenticated user
    const supabase = await createClient();

    // Check rate limit
    const rateLimitCheck = await checkRateLimit(user.id, supabase);
    result.rateLimitCheck = rateLimitCheck;

    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: `You have reached your limit of ${RATE_LIMIT_REQUESTS} requests per day. Please try again tomorrow.`,
          remaining: rateLimitCheck.remaining,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": RATE_LIMIT_REQUESTS.toString(),
            "X-RateLimit-Remaining": rateLimitCheck.remaining.toString(),
            "X-RateLimit-Reset": new Date(
              Date.now() + RATE_LIMIT_WINDOW
            ).toISOString(),
          },
        }
      );
    }

    // Parse request body
    const formData = await request.formData();
    const imageFile = formData.get("image") as File;
    const hints = formData.get("hints") as string; // Optional product hints

    result.imageFile = imageFile;
    result.hints = hints;

    if (!imageFile) {
      return NextResponse.json(
        {
          error: "No image provided",
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
          error: "Invalid file type. Please upload an image.",
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

    // Get user history for context (future enhancement)
    const userHistory = await getUserHistory(user.id, supabase);
    result.userHistory = userHistory;

    // Generate product content
    const productContent = await generateProductFromImage(
      base64Image,
      userHistory
    );
    result.productContent = productContent;

    // Log the request for rate limiting and history
    await logRequest(user.id, base64Image, productContent, supabase);
    result.logRequest = true;

    // Update rate limit headers
    const updatedRateLimit = await checkRateLimit(user.id, supabase);
    result.updatedRateLimit = updatedRateLimit;

    return NextResponse.json(
      {
        success: true,
        data: productContent,
        meta: {
          remaining_requests: updatedRateLimit.remaining,
          hints_used: !!hints,
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
          "Access-Control-Allow-Origin": "https://admin.shopify.com",
        },
      }
    );
  } catch (error) {
    console.error("API Generate Error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      {
        status: 500,
      }
    );
  } finally {
    console.log("API Generate: Request started", JSON.stringify(result));
  }
}

// GET endpoint for checking rate limit status
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const rateLimitCheck = await checkRateLimit(user.id, supabase);
    const userHistory = await getUserHistory(user.id, supabase);

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error("GET API Error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
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
      "Access-Control-Allow-Origin": "https://admin.shopify.com",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}
