## Summary

This document describe the generate API, where to implement it correctly

## Goal

- Create external API for generating product details using in the extension
  - Use the OpenAI API to generate product details from image
  - Important: Check the rate limit, usage limitation for the API by user ID, logs are stored in the supabase database
  - Important: Require authorization via Bearer token from Supabase auth
  - Main component: `./app/api/external/generate`
  - Using for the website: `./app/`
- Create API for generating product details using in website for testing the extension
  - Use the OpenAI API to generate product details from image
  - Important: Check the rate limit, usage limitation for the API by user ID, logs are stored in the supabase database
  - Important: Require authorization via Supabase auth - Currently cookie
  - Main component: `./app/api/generate`
  - Using for the extension: `./extension/`
