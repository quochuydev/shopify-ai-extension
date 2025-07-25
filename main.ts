import { EnhancedContext, getChatCompletion } from "./llm/aiEngine";

const ctx: EnhancedContext = {
  history: [
    {
      role: "user",
      content:
        "This is a toy robot kit image. Generate a Shopify product title and description.",
    },
  ],
  knowledgeBaseSnippet: `Our products are educational STEM kits for children ages 8+.
  We value safety, interactivity, and creativity. Description should emphasize learning, fun, and included tools.`,
  imagePath: "./public/images/copernicus-toys.webp",
};

getChatCompletion(ctx).then(console.log);
