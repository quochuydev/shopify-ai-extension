# 🛍️ Shopify AI Extension

Use AI to generate compelling product content directly inside Shopify’s product editor. Drop an image — get optimized title, description, tags, and metadata instantly.

🔗 **Live Website**: [shopify-ai-extension.vercel.app](https://shopify-ai-extension.vercel.app/)  
📦 **Download Extension**: [v1.0.1 on GitHub](https://github.com/quochuydev/shopify-ai-extension/releases/tag/v1.0.1)

---

## ✨ Features

- 🧠 AI-generated product content from image
- 📄 Auto-fill title, description, tags, vendor, price, etc.
- ⚡ Instant UI integration into Shopify’s product form
- 🧲 Drag-and-drop interface
- 🔐 Authentication and usage control via Supabase
- 📊 Admin Website for subscription and usage management

---

## 💰 Pricing

You can manage your plan at:  
🔗 [shopify-ai-extension.vercel.app](https://shopify-ai-extension.vercel.app/)

---

## 🧩 Installation

1. [Download the latest `.zip` file](https://github.com/quochuydev/shopify-ai-extension/releases/tag/v1.0.1)
2. Go to `chrome://extensions/`
3. Enable **Developer Mode**
4. Click **Load unpacked**
5. Select the extracted extension folder

---

## 🛠️ Usage

1. Open your Shopify admin
2. Go to **Products** → **Add product**
3. Use the **"Drop image here"** panel to drag in a product photo
4. Wait for AI to generate content
5. Fields will be auto-filled. Edit if needed, then click **Save**

---

## 🔐 Auth & Subscription

- Users authenticate via the Website
- Subscription status and usage are synced to the extension
- Backed by **Supabase** (auth, db, and edge functions)

---

## 📚 Tech Stack

- Chrome Extension (Manifest v3)
- Shopify DOM integration
- Next.js (for Website)
- Supabase (auth + DB)
- OpenAI API

---

## 📦 Repositories

- Extension: [`/shopify-ai-extension`](https://github.com/quochuydev/shopify-ai-extension)
- Website & API: included in mono-repo (`/Website`, `/ai-server`)

---

## 🤝 Support

For bug reports or questions, open an [issue here](https://github.com/quochuydev/shopify-ai-extension/issues).

---

> Made with ❤️ by [@quochuydev](https://github.com/quochuydev)
