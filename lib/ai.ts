import { ProductContent } from "@/types";
import { OpenAI } from "openai";

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateProductFromImage(
  imageBase64: string,
  userHistory?: any[]
): Promise<ProductContent> {
  const systemPrompt = `You are a Shopify product assistant. Generate comprehensive product details from the uploaded image.

${
  userHistory && userHistory.length > 0
    ? `User's previous products context (use for consistency in style/vendor if relevant):
${userHistory
  .slice(0, 3)
  .map(
    (h) =>
      `- ${h.generated_content?.title || "Product"} (${
        h.generated_content?.product_type || "N/A"
      })`
  )
  .join("\n")}`
    : ""
}

Return a JSON object with the following structure:
{
  "title": "SEO-optimized product title (60 chars max)",
  "description": "HTML formatted description with benefits and features",
  "price": "suggested price as string",
  "compare_at_price": "optional higher price for discount",
  "sku": "generated SKU code",
  "weight": "estimated weight in kg as string",
  "variants": [{"price": "", "compare_at_price": "", "sku": "", "weight": ""}],
  "meta_title": "SEO title",
  "meta_description": "SEO description (160 chars max)",
  "status": "published",
  "published_scope": "web",
  "product_type": "product category",
  "vendor": "suggested brand/vendor name",
  "collections": ["category1", "category2", "category3"],
  "tags": "comma-separated tags"
}

Make it compelling, accurate, and ready for e-commerce.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Generate complete product details for this image:",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      max_tokens: 1500,
      temperature: 0.7,
    });

    const content = response.choices[0].message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    // Extract JSON from response (handle potential markdown formatting)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in response");
    }

    const productData = JSON.parse(jsonMatch[0]);

    // Validate required fields
    const requiredFields = ["title", "description", "price", "product_type"];
    for (const field of requiredFields) {
      if (!productData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    return productData as ProductContent;
  } catch (error) {
    console.error("OpenAI generation error:", error);
    throw new Error(
      `Failed to generate product content: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
