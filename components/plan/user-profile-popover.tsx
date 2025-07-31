"use client";

import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, Calendar, Eye, Clock, ChevronDown, Loader2 } from "lucide-react";
import { useUserPlan } from "@/hooks/useUserPlan";
import { CurrentPlanCard } from "./current-plan-card";
import type { AIRequest } from "@/types/database";

interface UserProfilePopoverProps {
  userEmail: string;
  onProductPreview?: (content: any) => void;
}

export function UserProfilePopover({
  userEmail,
  onProductPreview,
}: UserProfilePopoverProps) {
  const [open, setOpen] = useState(false);
  const { planInfo, loading } = useUserPlan();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleProductClick = (request: AIRequest) => {
    if (onProductPreview && request.generated_content) {
      onProductPreview(request.generated_content);
    }
  };

  const getEndpointDisplayName = (endpoint: string) => {
    if (endpoint.includes("/generate")) {
      return "Product Generation";
    }
    return endpoint.replace("/api/", "").replace("/", " ");
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center gap-2 hover:bg-gray-100"
          >
            <User className="h-4 w-4" />
            <span className="text-sm">{userEmail}</span>
            <ChevronDown className="h-3 w-3" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[400px] p-0" align="end" sideOffset={5}>
          <div className="p-4">
            {/* User Info Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 bg-shopify-green rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm">{userEmail}</p>
                <p className="text-xs text-gray-500">Account Settings</p>
              </div>
            </div>

            <Separator className="mb-4" />

            {/* Plan Information */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : planInfo ? (
              <div className="mb-4">
                <CurrentPlanCard planInfo={planInfo} />
              </div>
            ) : (
              <div className="text-center py-4 text-sm text-gray-500">
                Unable to load plan information
              </div>
            )}

            <Separator className="mb-4" />

            {/* Recent Activity */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Recent AI Requests</h3>
                <Badge variant="outline" className="text-xs">
                  {planInfo?.recent_requests?.length || 0}
                </Badge>
              </div>

              {planInfo?.recent_requests &&
              planInfo.recent_requests.length > 0 ? (
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {planInfo.recent_requests.map((request) => (
                      <div
                        key={request.id}
                        className={`p-3 border rounded-lg text-sm transition-colors ${
                          request.generated_content
                            ? "hover:bg-gray-50 cursor-pointer"
                            : "opacity-60"
                        }`}
                        onClick={() =>
                          request.generated_content &&
                          handleProductClick(request)
                        }
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">
                            {request.generated_content.title}
                          </span>
                          {request.generated_content && (
                            <Eye className="h-3 w-3 text-gray-400" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          {formatDate(request.created_at)}
                        </div>
                        {request.generated_content?.title && (
                          <p className="text-xs text-gray-600 mt-1 truncate">
                            {new Date(request.created_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-6 text-sm text-gray-500">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>No AI requests yet</p>
                  <p className="text-xs">Your activity will appear here</p>
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}
