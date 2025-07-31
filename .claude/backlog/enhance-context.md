# Step 1: Enhance Context (RAG-style enrichment)

This step focuses on extracting meaningful context from user input (like an image) and enhancing it using AI, tabular data, or query rewriting before generation.

### Checklist

- 🧩 Capture input Image drag/drop, optional product, user text ✅
- 🧠 Extract image context Use GPT-4 Vision, Gemini, or custom vision model ⏳
- 📄 Tabular data enrichment Optionally enrich from CSV, Shopify past products, vendors 🔲
- ✏️ Query rewriting Rewrite product name or prompt to improve generation 🔲
- 💡 Pass structured context to LLM Format prompt with extracted keywords, product type, etc. 🔲
- 🧪 Fallback prompt or skeleton UI Show loading placeholders ✅
- 🧠 Generate product content Send prompt to LLM (title, desc, tags, category, etc.) ✅
- 📤 Auto-fill Shopify UI Inject result back into form ✅
