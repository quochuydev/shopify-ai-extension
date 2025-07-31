## 🛡️ Summary

This document outlines the the process of the generation image to product details.

## 🎯 Goal

- Drag and drop product images to automatically generate product details
- AI-powered content generation using OpenAI GPT-4 Vision
- Automatic form filling for Shopify product pages
- Category suggestions and TinyMCE editor integration

## ✅ Flow (Step-by-Step)

- User install extension
- Go to own Shopify admin product management page
- User signin in Extension UI before using extension
- Drag and drop product image to generate product details
- The extension will send the image to the backend
- The backend will call OpenAI GPT-4 Vision to generate product details
- The product details will be filled in the Shopify form

## 🔐 Backend

- Request validation
- Rate limiting
- OpenAI API call
- Product content generation
- Response validation
- Shopify form population

```ts
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

const response = await openai.chat.completions.create({
  model: "gpt-4o-mini",
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
```
