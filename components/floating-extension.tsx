"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Upload, Image, Loader2, Minimize2, Maximize2, X } from "lucide-react";

interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset_time: string;
}

export function FloatingExtension() {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo | null>(null);
  const [progress, setProgress] = useState(0);

  const fetchRateLimitStatus = async () => {
    try {
      const response = await fetch("/api/external/generate");
      if (response.ok) {
        const data = await response.json();
        setRateLimitInfo(data.rate_limit);
      }
    } catch (error) {
      console.error("Failed to fetch rate limit status:", error);
    }
  };

  // Fetch rate limit status on component mount
  useEffect(() => {
    fetchRateLimitStatus();
  }, []);

  const handleImageUpload = useCallback(
    async (file: File) => {
      if (isProcessing) return;

      // Check rate limit before processing
      if (rateLimitInfo && rateLimitInfo.remaining <= 0) {
        toast.error(
          "You have reached your daily limit. Please try again tomorrow."
        );
        return;
      }

      setIsProcessing(true);
      setProgress(0);

      try {
        // Show progress updates
        const progressInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 200);

        const formData = new FormData();
        formData.append("image", file);

        const response = await fetch("/api/external/generate", {
          method: "POST",
          body: formData,
        });

        clearInterval(progressInterval);

        if (!response.ok) {
          const errorData = await response.json();

          if (response.status === 429) {
            toast.error(errorData.message || "Rate limit exceeded");
          } else if (response.status === 401) {
            toast.error("Authentication required. Please login again.");
          } else {
            toast.error(
              errorData.message || "Failed to generate product details"
            );
          }
          return;
        }

        const result = await response.json();
        setProgress(100);

        // Update rate limit info
        const newRemaining = result.meta?.remaining_requests;
        if (typeof newRemaining === "number") {
          setRateLimitInfo((prev) =>
            prev ? { ...prev, remaining: newRemaining } : null
          );
        }

        // Post message to show the product preview dialog
        window.postMessage(
          {
            type: "GENERATED_CONTENT",
            content: result.data,
          },
          "*"
        );

        toast.success("Product details generated successfully!");
      } catch (error) {
        console.error("Error generating product:", error);
        toast.error("Failed to generate product details");
      } finally {
        setIsProcessing(false);
        setTimeout(() => setProgress(0), 1000);
      }
    },
    [isProcessing, rateLimitInfo]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      const imageFile = files.find((file) => file.type.startsWith("image/"));

      if (imageFile) {
        handleImageUpload(imageFile);
      } else {
        toast.error("Please drop an image file");
      }
    },
    [handleImageUpload]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type.startsWith("image/")) {
        handleImageUpload(file);
      }
    },
    [handleImageUpload]
  );

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 w-80">
      <Card className="shadow-lg border-2 border-blue-200">
        {/* Header */}
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
              🤖
            </div>
            <div>
              <h3 className="font-semibold text-sm">AI Product Generator</h3>
              {rateLimitInfo && (
                <Badge
                  variant={rateLimitInfo.remaining > 0 ? "default" : "destructive"}
                  className="text-xs"
                >
                  {rateLimitInfo.remaining}/{rateLimitInfo.limit} left
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-6 w-6 p-0"
            >
              {isMinimized ? (
                <Maximize2 className="h-3 w-3" />
              ) : (
                <Minimize2 className="h-3 w-3" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Content */}
        {!isMinimized && (
          <CardContent className="p-4">
            {/* Rate limit warning */}
            {rateLimitInfo && rateLimitInfo.remaining <= 0 && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800">
                  ⚠️ Daily limit reached. Resets at{" "}
                  {new Date(rateLimitInfo.reset_time).toLocaleString()}
                </p>
              </div>
            )}

            {/* Drag and Drop Area */}
            <div
              className={`
                relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200
                ${
                  isDragging
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                }
                ${
                  isProcessing
                    ? "opacity-50 pointer-events-none"
                    : "cursor-pointer"
                }
              `}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById("floating-file-input")?.click()}
            >
              <input
                id="floating-file-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
                disabled={isProcessing}
              />

              {isProcessing ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Processing...</p>
                    <div className="w-48 bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">{progress}%</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-center">
                    {isDragging ? (
                      <Upload className="h-8 w-8 text-blue-500" />
                    ) : (
                      <Image
                        className="h-8 w-8 text-gray-400"
                        aria-label="Upload image"
                      />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {isDragging ? "Drop here!" : "Drop product image"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Or click to select • JPG, PNG, GIF
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="mt-4 text-xs text-gray-600 space-y-1">
              <p>• AI analyzes your image</p>
              <p>• Generates product details</p>
              <p>• View results in popup dialog</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}