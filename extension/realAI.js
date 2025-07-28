// Real AI Engine for production use
// Integrates with the Next.js API endpoint for OpenAI processing

class RealAIEngine {
  constructor() {
    console.log("🤖 Real AI Engine initialized");
    this.baseUrl = this.getBaseUrl();
  }

  getBaseUrl() {
    // Try to detect the base URL from current domain or use localhost for development
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      const protocol = window.location.protocol;

      // If we're on a Shopify domain, we need to use the deployed app URL
      if (hostname.includes("shopify.com")) {
        // Use the deployed Vercel URL or configured base URL
        return "https://shopify-ai-extension.vercel.app"; // Replace with actual deployment URL
      }

      // For local development
      if (hostname === "localhost" || hostname === "127.0.0.1") {
        return `${protocol}//localhost:3000`;
      }
    }

    // Fallback
    return "http://localhost:3001";
  }

  async generateProductFromImage(imageFile, options = {}) {
    console.log("🎯 Real AI: generateProductFromImage called");

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("image", imageFile);

      // Add hints if provided in options
      if (options.hints) {
        formData.append("hints", options.hints);
      }

      console.log("📤 Sending request to API endpoint...");

      // Make API call to Next.js endpoint
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: "POST",
        body: formData,
        credentials: "include", // Include cookies for authentication
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("❌ API Error:", result);

        // Handle specific error cases
        if (response.status === 401) {
          throw new Error(
            "Authentication required. Please log in to use AI generation."
          );
        } else if (response.status === 429) {
          throw new Error(
            result.message || "Rate limit exceeded. Please try again later."
          );
        } else {
          throw new Error(
            result.message ||
              result.error ||
              "Failed to generate product content"
          );
        }
      }

      console.log("✅ Product generated successfully:", result.data);

      // Return the generated product data
      return result.data;
    } catch (error) {
      console.error("🔥 Real AI Engine Error:", error);

      // Re-throw with more context
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        throw new Error(
          "Network error: Unable to connect to AI service. Please check your internet connection."
        );
      }

      throw error;
    }
  }

  async generateProductFromText(prompt, options = {}) {
    console.log(
      "📝 Real AI: generateProductFromText called with prompt:",
      prompt
    );

    // For text-based generation, we can create a simple image with the text
    // or modify the API to accept text prompts directly
    // For now, we'll throw an error as this method needs API endpoint support
    throw new Error(
      "Text-based generation not yet supported. Please use image-based generation."
    );
  }

  async checkRateLimit() {
    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        return data.rate_limit;
      }

      return null;
    } catch (error) {
      console.error("Failed to check rate limit:", error);
      return null;
    }
  }
}

// Export for use in extension
window.RealAIEngine = RealAIEngine;

console.log("🚀 Real AI Engine loaded successfully");
