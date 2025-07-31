"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Crown, Zap, Clock, TrendingUp } from "lucide-react";
import type { PlanInfo } from "@/types/database";

interface CurrentPlanCardProps {
  planInfo: PlanInfo;
}

export function CurrentPlanCard({ planInfo }: CurrentPlanCardProps) {
  const getPlanIcon = () => {
    switch (planInfo.plan_type) {
      case "pro":
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case "usage":
        return <Zap className="h-5 w-5 text-blue-500" />;
      case "free":
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPlanTitle = () => {
    switch (planInfo.plan_type) {
      case "pro":
        return "Pro Plan";
      case "usage":
        return "Usage Plan";
      case "free":
      default:
        return "Free Trial";
    }
  };

  const getPlanDescription = () => {
    switch (planInfo.plan_type) {
      case "pro":
        return "Unlimited AI actions";
      case "usage":
        return `${planInfo.usage_credits || 0} credits remaining`;
      case "free":
      default:
        return `${planInfo.usage_credits || 0} free credits remaining`;
    }
  };

  const getStatusBadge = () => {
    const statusConfig = {
      active: { text: "Active", className: "bg-green-100 text-green-800" },
      trial: { text: "Trial", className: "bg-blue-100 text-blue-800" },
      expired: { text: "Expired", className: "bg-red-100 text-red-800" },
    };

    const config = statusConfig[planInfo.plan_status];
    return <Badge className={config.className}>{config.text}</Badge>;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          {getPlanIcon()}
          {getPlanTitle()}
        </CardTitle>
        {getStatusBadge()}
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">{getPlanDescription()}</p>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="text-center">
            <div className="text-2xl font-bold text-shopify-green">
              {planInfo.total_requests}
            </div>
            <div className="text-xs text-gray-500">Total Requests</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 flex items-center justify-center gap-1">
              <TrendingUp className="h-4 w-4" />
              {planInfo.requests_this_month}
            </div>
            <div className="text-xs text-gray-500">This Month</div>
          </div>
        </div>

        {planInfo.plan_status === "expired" && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 font-medium">
              ⚠️ Your plan has expired. Upgrade to continue using AI features.
            </p>
          </div>
        )}

        {planInfo.plan_type === "free" &&
          (planInfo.usage_credits || 0) <= 2 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 font-medium">
                {`💡 You're running low on free credits. Consider upgrading for unlimited access.`}
              </p>
            </div>
          )}
      </CardContent>
    </Card>
  );
}
