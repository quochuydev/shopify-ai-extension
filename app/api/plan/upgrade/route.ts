import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    console.log(`debug:user`, user);

    if (userError || !user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const { plan_type, usage_credits, transaction_hash, payment_amount } = body;

    // Validate plan_type
    if (!["pro", "usage"].includes(plan_type)) {
      return NextResponse.json(
        {
          error: "Invalid plan type",
        },
        {
          status: 400,
        }
      );
    }

    // Create or update user plan (upsert)
    const planData = {
      user_id: user.id,
      plan_type,
      usage_credits: plan_type === "pro" ? null : usage_credits,
      updated_at: new Date().toISOString(),
    };

    const { data: updatedPlan, error: updateError } = await supabase
      .from("user_plans")
      .upsert(planData)
      .eq("user_id", user.id)
      .select()
      .single();
    console.log(`debug:updateError`, updateError, updatedPlan);

    if (updateError) {
      console.error("Plan update error:", updateError);

      return NextResponse.json(
        {
          error: "Failed to update plan",
        },
        {
          status: 500,
        }
      );
    }

    // Log the upgrade for audit trail (optional)
    console.log(`User ${user.id} upgraded to ${plan_type} plan`, {
      transaction_hash,
      payment_amount,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      data: updatedPlan,
      message: `Successfully upgraded to ${plan_type} plan`,
    });
  } catch (error) {
    console.error("API Error:", error);

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
