# User Plan Management Feature

## Summary

Allow the system to manage user access levels via either:

- Pro plan (monthly or yearly subscription)
- Usage-based pay-as-you-go, tracked by API usage or action volume
  Supports UI for current plan display, upgrade/purchase, and backend enforcement.

## Goal

Identify each user's current plan: free, pro, or usage

Allow users to:

- View their plan and usage stats
- Upgrade to Pro or purchase usage credits

Enforce limits based on plan:

- Free: e.g., 20 generations/month
- Pro: unlimited
- Usage: 1 credit = 1 image or generation

## Flow (Step-by-Step)

1. User logs in

   - Authenticated via Supabase or your auth provider

2. Fetch plan status

   - Check user_plans table: plan type, remaining credits, renewal date

3. Enforce feature access

   - Gate AI calls or generation logic by plan limits

4. User upgrades

   - Via Stripe or QR crypto → triggers webhook → backend updates DB

5. Optional: Show alert when usage is near limit or expired

## Frontend

- Components:

  - CurrentPlanCard: displays plan, status, usage bar
  - UpgradeModal: lets user choose Pro/credits and pay
  - BillingHistoryTable (optional): shows past payments/usage

- React Hooks:

  - useUserPlan() – fetches current plan info
  - useUpgrade() – handles payment redirect / crypto QR
  - useUsageTracker() – optional for inline tracking

## Backend

- Supabase Tables:

```ts
user_plans {
  id: uuid,
  user_id: uuid (FK to auth.users),
  plan_type: "free" | "pro" | "usage",
  usage_credits: number, // null for pro
  renew_at: timestamp, // for subscription
  updated_at: timestamp
}

ai_requests {
  user_id,
  endpoint,
  created_at,
  cost: number
}
```

API Routes:

```
GET /api/plan: returns current plan info

POST /api/upgrade: initiates Stripe/crypto upgrade

POST /api/webhook/payment: receives payment success → update user_plans
```
