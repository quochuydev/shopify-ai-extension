// src/llm/aiEngine.ts
import { OpenAI } from "openai";
import "dotenv/config";
import fs from "fs";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

// Step 1: Types
type Role = "user" | "assistant" | "system";

interface Message {
  role: Role;
  content: string;
}

export interface EnhancedContext {
  history: Message[];
  knowledgeBaseSnippet?: string; // Optional additional context
  imagePath?: string; // Optional image for GPT-4 Vision
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Step 2: Build Prompt
function buildPrompt(ctx: EnhancedContext): ChatCompletionMessageParam[] {
  const messages: ChatCompletionMessageParam[] = [];

  if (ctx.knowledgeBaseSnippet) {
    messages.push({
      role: "system",
      content: `You are a helpful assistant. Use the following background knowledge when relevant:\n\n${ctx.knowledgeBaseSnippet}`,
    });
  }

  for (const msg of ctx.history) {
    messages.push({
      role: msg.role,
      content: msg.content,
    });
  }

  return messages;
}

// Step 3: Call LLM (GPT-4 / GPT-4-Vision / GPT-3.5)
export async function getChatCompletion(ctx: EnhancedContext): Promise<string> {
  const messages = buildPrompt(ctx);

  try {
    const isVision = Boolean(ctx.imagePath);

    if (isVision && fs.existsSync(ctx.imagePath!)) {
      const imageBase64 = fs.readFileSync(ctx.imagePath!, {
        encoding: "base64",
      });

      const visionMessages: ChatCompletionMessageParam[] = [
        {
          role: "system",
          content: `You are a Shopify product assistant. Use the knowledge below to enrich product content if needed:\n\n${ctx.knowledgeBaseSnippet}`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Generate a product title, description, tags, and category based on this image.",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
              },
            },
          ],
        },
      ];

      const result = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: visionMessages,
        max_tokens: 1000,
      });

      return result.choices[0].message?.content ?? "(No response)";
    }

    // Text-only fallback (e.g., GPT-3.5)
    const result = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      max_tokens: 1000,
    });

    return result.choices[0].message?.content ?? "(No response)";
  } catch (error: any) {
    console.error("🔴 OpenAI API error:", error.message || error);
    return "⚠️ AI request failed.";
  }
}
