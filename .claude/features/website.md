## 🛡️ Summary

This document outlines the main features of the **Shopify AI Website**

## 🎯 Goal

- Design system: Use the component from `components/ui` and use the system color of Shopify
- This website will allow users to sign up and login to the **Shopify AI Extension** system
- Users are able to test the **Shopify AI Extension** in the website after sign-in

  - When user signin, user are able to drag and drop product image to generate product details
  - After the extension process, a dialog will be displayed to show the generated product details
    - For testing purpose, an user account just can do it ONLY 5 TIMES as Free Trial.

- Users are able to select the **Shopify AI Extension** plan (./components/pricing/index.tsx)
  - Free trial plan
    - 5 AI actions included
    - All AI features included
    - No payment required
    - Email support
    - Usage analytics
  - Pay per use plan
    - Pay per use
    - All AI features included
    - No monthly commitment
    - Email support
    - Usage analytics
  - Unlimited Pro plan
    - Unlimited AI actions
    - All AI features included
    - Priority support
    - Advanced analytics
    - Custom AI training
    - API access
    - Cancel anytime
- Users are able to purchase the **Shopify AI Extension** (Future)

## ✅ Flow (Step-by-Step)

- User visit website
- User sign up/login
- Optional: User test the extension in website UI
- User select plan
- User purchase plan

## 🔐 Backend

- Handle authentication
- Handle authorization
- Handle payment
- Handle user plan
- Handle user usage
- Important: Ensure the request to server (especially the API requesting to OpenAI API) have to have valid authorization, rate limit control, and error handling, easy to tracking/tracing/monitoring by developer/sysadmin
