# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Shopify AI Extension project that combines a Next.js web application with a Chrome browser extension. The system allows users to drag and drop product images to automatically generate product
details using AI (OpenAI GPT-4 Vision) and fill Shopify product forms.

## Architecture

### Dual-Platform Structure

- **Next.js Web App** (`app/`, `components/`, `lib/`): Full-featured web application with Supabase authentication
- **Chrome Extension** (`extension/`): Browser extension that injects AI-powered product generation into Shopify admin pages

### Key Components

**Important**: All the documents are in the markdown files in `./.claude/features/`

- **Extension - Content Script** (`extension/content.js`): Injects CSS and JS resources
- **Extension - Drag UI** (`extension/drag.js`): Main functionality with drag/drop interface
- **Backend - Supabase Integration** (`lib/supabase/`): Authentication and data persistence
- **Backend - OpenAI integration** (`lib/api/generate/route.ts`, `lib/api/external/generate/route.ts`)
- **Website - Pricing** (`components/pricing/index.tsx`, `app/page.tsx`):
- **Website - Auth** (`app/auth/*`):
- Ignore the folder `.claude/backlog/*` - This is just temporary ideas, just ignore it

## Common Commands

### Development

```bash
npm run dev          # Start Next.js development server with Turbopack
npm run build        # Build Next.js application
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Testing

No specific test commands are configured. Use standard testing practices if adding tests.

## Environment Variables Required

### Next.js App

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase public key
- `VERCEL_URL`: Deployment URL (optional)

### AI Engine

- `OPENAI_API_KEY`: OpenAI API key for GPT-4 Vision

## Development

### Manifest Configuration

The Chrome extension (`extension/manifest.json`) targets:

- Shopify admin pages: https://admin.shopify.com/*
- Live Website: https://shopify-ai-extension.vercel.app
- Download Extension: https://github.com/quochuydev/shopify-ai-extension/releases/tag/v1.0.1

### Key Features

1. Extension

- Drag and drop image upload
- AI-powered product detail generation
- Automatic Shopify form population
- Category suggestions
- TinyMCE editor integration for descriptions

2. Website

- This website will allow users to sign up and login to the **Shopify AI Extension** system
- Users are able to test the **Shopify AI Extension** in the website after sign-in
- Users are able to select the **Shopify AI Extension** plan
- Users are able to purchase the **Shopify AI Extension** (Future)

## Code Patterns

### AI Integration

- Uses OpenAI GPT-4 Vision for image analysis
- Structured prompts for consistent product generation
- Base64 image encoding for API calls

### Form Manipulation

- React input value setting via property descriptors
- Event dispatching for React state updates

```ts
function setReactInputValue(input, value) {
  if (!input) return;
  const setter = Object.getOwnPropertyDescriptor(input.__proto__, "value")?.set;
  if (setter) setter.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}
```

- TinyMCE editor content injection

```ts
const trySetTinyMCE = (description) => {
  if (typeof tinymce !== "undefined" && tinymce.activeEditor) {
    tinymce.activeEditor.setContent(description);
    tinymce.activeEditor.fire("change");
    console.log("✅ Description filled via TinyMCE");
  }
};
```

- Comprehensive field mapping for Shopify forms

```ts
const titleInputSelector = 'input[name="title"]';
const titleInput = document.querySelector(titleInputSelector);
setReactInputValue(titleInput, content.title);
```

### Supabase Integration

- SSR-compatible client creation
- Separate client/server/middleware configurations
- Authentication flow with protected routes

## File Structure Notes

- `app/auth/`: Complete authentication flow (login, signup, password reset)
- `components/ui/`: Radix UI components with Tailwind styling
- `extension/`: Complete Chrome extension with manifest v3
- `lib/`: Shared utilities and integrations
- `public/images/`: Sample product images for testing

## Development Guidelines

### Testing

Load the `extension/` directory in Chrome's developer mode to test the browser extension functionality.

### Form Integration

Test extension on actual Shopify admin product pages to verify form field selectors remain accurate.

### Website and Backend

- Ensure the request to server (especially the API requesting to OpenAI API) have to have valid authorization, rate limit control, and error handling, easy to tracking/tracing/monitoring by developer/sysadmin
- Ensure the website is responsive and user-friendly
- Ensure the website is secure and protected against common web vulnerabilities
- The front end should be easy to maintain and debug UI code (Tailwind CSS, shadcn ui)
