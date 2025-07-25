import { OpenAI } from "openai";
import "dotenv/config";
import fs from "node:fs";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

// Step 1: Basic Types
interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface EnhancedContext {
  history: Message[];
  knowledgeBaseSnippet: string; // Enhanced context
}

// Step 2: Enhance the Prompt
function buildPrompt(ctx: EnhancedContext): ChatCompletionMessageParam[] {
  const { history, knowledgeBaseSnippet } = ctx;

  const systemPrompt: ChatCompletionMessageParam = {
    role: "system",
    content: `You are a helpful AI assistant. Use the following knowledge if relevant:\n\n${knowledgeBaseSnippet}`,
  };

  return [systemPrompt, ...history];
}

//Step 3: Call OpenAI with Enhanced Context
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function getChatCompletion(ctx: EnhancedContext) {
  const messages = buildPrompt(ctx);

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
    });

    return response.choices[0].message?.content;
  } catch (err) {
    console.error("OpenAI API error:", err);
    return "Sorry, something went wrong.";
  }
}

// Step 4: Sample Usage
const context: EnhancedContext = {
  history: [
    {
      role: "user",
      content: "How can I reset my password?",
    },
  ],
  knowledgeBaseSnippet:
    "To reset your password, go to Settings > Account > Reset Password.",
};

getChatCompletion(context).then(console.log);

//
