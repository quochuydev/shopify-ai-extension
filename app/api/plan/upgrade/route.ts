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

    // Get current plan to handle credit accumulation
    const { data: currentPlan } = await supabase
      .from("user_plans")
      .select("*")
      .eq("user_id", user.id)
      .single();

    // Calculate credits based on plan type and current credits
    let finalCredits: number | null = null;

    if (plan_type === "pro") {
      // Pro plan gets unlimited usage (null credits)
      finalCredits = null;
    } else if (plan_type === "usage") {
      // For usage plans, accumulate credits with existing credits
      const currentCredits = currentPlan?.usage_credits || 0;
      const newCredits = usage_credits || 0;
      finalCredits = currentCredits + newCredits;

      console.log(
        `debug:credits`,
        JSON.stringify({ currentCredits, newCredits, finalCredits })
      );
    }

    // Create or update user plan (upsert)
    const planData: any = {
      user_id: user.id,
      plan_type,
      usage_credits: finalCredits,
      updated_at: new Date().toISOString(),
    };

    if (currentPlan?.id) {
      planData.id = currentPlan.id;
    }

    const { data: updatedPlan, error: updateError } = await supabase
      .from("user_plans")
      .upsert(planData, { onConflict: "id" })
      .select()
      .single();

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
