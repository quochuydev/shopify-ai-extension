# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Shopify AI Extension project that combines a Next.js web application with a Chrome browser extension. The system allows users to drag and drop product images to automatically generate product
details using AI (OpenAI GPT-4 Vision) and fill Shopify product forms.

## Architecture

### Dual-Platform Structure

- **Next.js Web App** (`app/`, `components/`, `lib/`): Full-featured web application with Supabase authentication
- **Chrome Extension** (`extension/`): Browser extension that injects AI-powered product generation into Shopify admin pages
- **Shared AI Engine** (`lib/aiEngine.ts`): OpenAI integration for product content generation from images

### Key Components

- **AI Engine** (`lib/aiEngine.ts`): Handles OpenAI API calls with GPT-4 Vision for image-to-product conversion
- **Extension Content Script** (`extension/content.js`): Injects drag UI into Shopify pages
- **Drag UI** (`extension/drag_ui.js`): Main extension logic for form filling and AI integration
- **Supabase Integration** (`lib/supabase/`): Authentication and data persistence

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

## Extension Development

### Manifest Configuration

The Chrome extension (`extension/manifest.json`) targets:

- Shopify admin pages (`https://*.shopify.com/*`)
- GitHub pages for testing (`https://github.com/*`)

### Extension Architecture

1. **Content Script** (`content.js`): Injects CSS and JS resources
2. **Drag UI** (`drag_ui.js`): Main functionality with drag/drop interface
3. **Form Filling**: Automatically populates Shopify product fields using DOM manipulation

### Key Extension Features

- Drag and drop image upload
- AI-powered product detail generation
- Automatic Shopify form population
- Category suggestions
- TinyMCE editor integration for descriptions

## Code Patterns

### AI Integration

- Uses OpenAI GPT-4 Vision for image analysis
- Fallback to GPT-3.5 for text-only requests
- Structured prompts for consistent product generation
- Base64 image encoding for API calls

### Form Manipulation

- React input value setting via property descriptors
- Event dispatching for React state updates
- TinyMCE editor content injection
- Comprehensive field mapping for Shopify forms

### Supabase Integration

- SSR-compatible client creation
- Separate client/server/middleware configurations
- Authentication flow with protected routes

## File Structure Notes

- `app/auth/`: Complete authentication flow (login, signup, password reset)
- `app/protected/`: Authenticated user pages
- `components/ui/`: Radix UI components with Tailwind styling
- `extension/`: Complete Chrome extension with manifest v3
- `lib/`: Shared utilities and integrations
- `images/`: Sample product images for testing

## Development Guidelines

### Extension Testing

Load the `extension/` directory in Chrome's developer mode to test the browser extension functionality.

### AI Engine Testing

Ensure OpenAI API key is configured and test with sample images in the `images/` directory.

### Form Integration

Test extension on actual Shopify admin product pages to verify form field selectors remain accurate.
