## 🛡️ Summary

This document outlines how users are able to test the **Shopify AI Extension** in the website after sign-in

## 🎯 Goal

- Users are able to test the **Shopify AI Extension** in the website after sign-in

## ✅ Flow (Step-by-Step)

- When user signin, user are able to drag and drop product image to generate product details
- After the extension process, a dialog will be displayed to show the generated product details
  - For testing purpose, an user account just can do it ONLY 5 TIMES as Free Trial.
- For the dialog UI (file: `components/product-preview.tsx`)
  - Use the component from `components/ui/dialog`
  - width and height 80%, z-index high
  - Data will be filled in the input, text area, markdown or display as tags
  - Example data response:

```json
{
  "title": "Organic Cotton T-Shirt - Sustainable Fashion",
  "description": "<p>Made from 100% <strong>organic cotton</strong>, this comfortable t-shirt is perfect for everyday wear. Eco-friendly and sustainably produced.</p>\n <ul style=\"list-style-type: none; padding-left: 0;\">\n <li>✓ 100% organic cotton material</li>\n <li>✓ Sustainable and eco-friendly production</li>\n <li>✓ Soft, breathable, and comfortable fit</li>\n <li>✓ Pre-shrunk and machine washable</li>\n </ul>\n <p>Available in multiple colors and sizes.</p>",
  "price": "24.99",
  "compare_at_price": "34.99",
  "sku": "ORGANIC-TEE-001",
  "weight": "0.15",
  "meta_title": "Organic Cotton T-Shirt - Sustainable Eco-Friendly Fashion",
  "meta_description": "100% organic cotton t-shirt made with sustainable practices. Soft, comfortable, and eco-friendly. Available in multiple colors and sizes.",
  "status": "published",
  "published_scope": "web",
  "product_type": "Clothing",
  "vendor": "EcoWear",
  "collections": ["Clothing", "T-Shirts", "Organic", "Sustainable", "Casual"],
  "tags": "T-Shirt, Organic Cotton, Sustainable, Eco-Friendly, Clothing"
}
```

## 🔐 Backend

- Handle authentication
- Handle authorization
- Handle user usage
