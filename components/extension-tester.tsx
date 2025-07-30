"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Upload, Image, Loader2 } from "lucide-react";

interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset_time: string;
}

export function ExtensionTester() {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo | null>(null);
  const [progress, setProgress] = useState(0);

  // Fetch rate limit status on component mount
  useState(() => {
    fetchRateLimitStatus();
  });

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

  const handleImageUpload = useCallback(async (file: File) => {
    if (isProcessing) return;

    // Check rate limit before processing
    if (rateLimitInfo && rateLimitInfo.remaining <= 0) {
      toast.error("You have reached your daily limit. Please try again tomorrow.");
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
          toast.error(errorData.message || "Failed to generate product details");
        }
        return;
      }

      const result = await response.json();
      setProgress(100);

      // Update rate limit info
      const newRemaining = result.meta?.remaining_requests;
      if (typeof newRemaining === "number") {
        setRateLimitInfo(prev => prev ? { ...prev, remaining: newRemaining } : null);
      }

      // Post message to show the product preview dialog
      window.postMessage({
        type: "GENERATED_CONTENT",
        content: result.data,
      }, "*");

      toast.success("Product details generated successfully!");

    } catch (error) {
      console.error("Error generating product:", error);
      toast.error("Failed to generate product details");
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 1000);
    }
  }, [isProcessing, rateLimitInfo]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find((file) => file.type.startsWith("image/"));

    if (imageFile) {
      handleImageUpload(imageFile);
    } else {
      toast.error("Please drop an image file");
    }
  }, [handleImageUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleImageUpload(file);
    }
  }, [handleImageUpload]);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Rate Limit Status */}
      {rateLimitInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between">
              Usage Status
              <Badge variant={rateLimitInfo.remaining > 0 ? "default" : "destructive"}>
                {rateLimitInfo.remaining} / {rateLimitInfo.limit} remaining
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(rateLimitInfo.remaining / rateLimitInfo.limit) * 100}%`,
                }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Free trial: {rateLimitInfo.limit} AI generations per day
            </p>
          </CardContent>
        </Card>
      )}

      {/* Drag and Drop Area */}
      <Card>
        <CardHeader>
          <CardTitle>Test AI Product Generator</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`
              relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
              ${isDragging 
                ? "border-blue-500 bg-blue-50" 
                : "border-gray-300 hover:border-gray-400"
              }
              ${isProcessing ? "opacity-50 pointer-events-none" : "cursor-pointer"}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById("file-input")?.click()}
          >
            <input
              id="file-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
              disabled={isProcessing}
            />

            {isProcessing ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
                <div className="space-y-2">
                  <p className="text-lg font-medium">Generating product details...</p>
                  <div className="w-64 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500">{progress}% complete</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-center">
                  {isDragging ? (
                    <Upload className="h-12 w-12 text-blue-500" />
                  ) : (
                    <Image className="h-12 w-12 text-gray-400" aria-label="Upload image" />
                  )}
                </div>
                <div>
                  <p className="text-lg font-medium">
                    {isDragging ? "Drop your image here" : "Drag & drop a product image"}
                  </p>
                  <p className="text-sm text-gray-500">
                    Or click to select a file • JPG, PNG, GIF up to 10MB
                  </p>
                </div>
                <Button variant="outline" className="mt-4">
                  Choose File
                </Button>
              </div>
            )}
          </div>

          {rateLimitInfo && rateLimitInfo.remaining <= 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ You have reached your daily limit of {rateLimitInfo.limit} generations. 
                Resets at {new Date(rateLimitInfo.reset_time).toLocaleString()}.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How it works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <p>1. Upload or drag & drop a product image</p>
          <p>2. Our AI analyzes the image using GPT-4 Vision</p>
          <p>3. Generated product details will appear in a preview dialog</p>
          <p>4. You can copy the details to use in your Shopify store</p>
        </CardContent>
      </Card>
    </div>
  );
}