// Application configuration
export const config = {
  // Set to true for real AI engine, false for demo/testing mode
  useRealAI: true,
} as const;

export type Config = typeof config;
