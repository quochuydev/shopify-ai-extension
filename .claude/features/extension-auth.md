# 🛡️ Summary

This document outlines how the **Shopify AI Extension** will authenticate and authorize itself to the **Next.js app**.

---

## 🎯 Goal

- Allow the extension to securely identify which Shopify store/user is using it (./extension)
- Enable API requests from the extension to the server with authentication (./app/auth/login)
- Protect backend routes using a verifiable token: (./app/api/external/generate)

---

## ✅ Flow (Step-by-Step)

1. User signin in Extension UI before using extension
2. Store accessToken, userEmail in Extension (chrome.storage.local)
3. Use accessToken in Fetch Requests

```ts
const token = await getFromStorage();

fetch("https://shopify-ai-extension.vercel.app/api/external/generate", {
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ image }),
});
```

## 🔐 Backend

- Since we use Supabase Auth, every authenticated user already receives a valid accessToken via Bearer token.
- We can verify it and get the user identity using the Supabase client.
- Check user rate limit, if exceeded - show error message to user.
- Update user rate limit in Supabase after successful request to OpenAI API.
- Each process, collect stage log and finally use `console.log(JSON.stringify(log)`
