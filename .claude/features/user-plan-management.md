# User Plan Management Feature

## Summary

Allow the system to manage user access levels via either:

- Pro plan
- Usage-based pay-as-you-go, tracked by API usage

## Goal

Identify each user's current plan: free, pro, or usage

Allow users to:

- View their plan and usage stats - A large popover UI when click in email in header
  - This will show the plan and usage stats
  - History product details generated, as a table, when clicked -> the product-preview components is showed
  - Create new React component to handle it
- Upgrade to Pro or purchase usage credits
  - Upgrade to Pro plan
    - Payment via MetaMask
  - Purchase usage credits
    - Payment via MetaMask
  - Create new React component to handle it

## Flow (Step-by-Step)

1. User logs in

   - Authenticated via Supabase or your auth provider

2. Fetch plan status

   - Check user_plans table

3. User upgrades

   - Via MetaMask → backend updates DB

## Frontend

- Components:

  - CurrentPlanCard: displays plan, status, usage bar
  - UpgradeModal: lets user choose Pro/credits and pay
  - BillingHistoryTable (optional): shows past payments/usage

- React Hooks:

  - useUserPlan() – fetches current plan info, handles MetaMask payment completed and send request update API

- As a developer, i would like to fake metamask step (very simple way, like a boolean variable)

## Backend

- Supabase Tables:

```ts
user_plans {
  id: uuid,
  user_id: string,
  plan_type: "free" | "pro" | "usage",
  usage_credits: number, // null for pro
  created_at: timestamp,
  updated_at: timestamp
}

ai_requests {
  user_id: string,
  endpoint: string,
  created_at: timestamp,
}
```

API Routes:

```
GET /api/plan/current: returns current user's plan info

POST /api/plan/upgrade: update after MetaMask payment completed
```
