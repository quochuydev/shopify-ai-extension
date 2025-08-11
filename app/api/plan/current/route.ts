import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { PlanInfo } from "@/types/database";

export async function GET() {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user plan
    const { data: userPlans } = await supabase
      .from("user_plans")
      .select("*")
      .eq("user_id", user.id);

    const planData = (userPlans || [])[0];

    // Get total AI requests count
    const { count: totalRequests } = await supabase
      .from("ai_requests")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    // Get requests this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: requestsThisMonth } = await supabase
      .from("ai_requests")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", startOfMonth.toISOString());

    // Get recent requests (last 10)
    const { data: recentRequests } = await supabase
      .from("ai_requests")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    // Determine plan status
    let planStatus: "active" | "expired" | "trial" = "active";

    if (planData?.plan_type === "free") {
      planStatus = "trial";
    }

    if (planData?.plan_type === "usage" && (planData.usage_credits || 0) <= 0) {
      planStatus = "expired";
    }

    const planInfo: PlanInfo = {
      plan_type: planData?.plan_type || "free",
      usage_credits: planData?.usage_credits || 0,
      total_requests: totalRequests || 0,
      requests_this_month: requestsThisMonth || 0,
      plan_status: planStatus,
      recent_requests: recentRequests || [],
    };

    return NextResponse.json({
      success: true,
      data: planInfo,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
