class RealAIEngine {
  constructor() {
    console.log("🤖 Real AI Engine initialized");
    this.baseUrl = this.getBaseUrl();
  }

  getBaseUrl() {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      const protocol = window.location.protocol;

      if (hostname.includes("shopify.com")) {
        return "https://shopify-ai-extension.vercel.app";
      }

      if (hostname === "localhost" || hostname === "127.0.0.1") {
        return `${protocol}//localhost:3000`;
      }
    }

    return "http://localhost:3000";
  }

  async generateProductFromImage(imageFile) {
    console.log("🎯 Real AI: called");

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("image", imageFile);

      const authToken = await this.getAuthToken();

      console.log("📤 Sending request to API endpoint...", {
        hasToken: !!authToken,
      });

      const response = await fetch(`${this.baseUrl}/api/external/generate`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
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

  async generateProductFromText(prompt) {
    console.log("📝 Real AI: called with prompt:", prompt);

    throw new Error(
      "Text-based generation not yet supported. Please use image-based generation."
    );
  }

  async checkRateLimit() {
    try {
      const response = await fetch(`${this.baseUrl}/api/external/generate`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${await this.getAuthToken()}`,
        },
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

  async getAuthToken() {
    return new Promise((resolve) => {
      chrome.storage.local.get(["auth_token"], (result) => {
        resolve(result.auth_token || "");
      });
    });
  }
}

window.RealAIEngine = RealAIEngine;

console.log("🚀 Real AI Engine loaded successfully");
