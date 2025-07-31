const demoProductResponses = [
  {
    title: "Premium Wireless Bluetooth Headphones",
    description: `<p>Experience crystal-clear audio with these <strong>Premium Wireless Bluetooth Headphones</strong>. Featuring advanced noise cancellation and up to 30 hours of battery life.</p>
    <ul style="list-style-type: none; padding-left: 0;">
      <li>✓ Active noise cancellation technology</li>
      <li>✓ 30-hour battery life with quick charge</li>
      <li>✓ Premium comfort with memory foam ear cups</li>
      <li>✓ High-fidelity audio drivers</li>
    </ul>
    <p>Perfect for music lovers, commuters, and professionals.</p>`,
    price: "89.99",
    compare_at_price: "129.99",
    sku: "BT-HEADPHONES-001",
    weight: "0.25",
    meta_title: "Premium Wireless Bluetooth Headphones - High Quality Audio",
    meta_description:
      "Premium wireless Bluetooth headphones with active noise cancellation, 30-hour battery life, and superior audio quality. Perfect for music and calls.",
    status: "published",
    published_scope: "web",
    product_type: "Electronics",
    vendor: "TechAudio",
    collections: ["Electronics", "Audio", "Headphones", "Wireless", "Premium"],
    tags: "Bluetooth, Wireless, Headphones, Audio, Electronics, Premium",
  },
  {
    title: "Organic Cotton T-Shirt - Sustainable Fashion",
    description: `<p>Made from 100% <strong>organic cotton</strong>, this comfortable t-shirt is perfect for everyday wear. Eco-friendly and sustainably produced.</p>
    <ul style="list-style-type: none; padding-left: 0;">
      <li>✓ 100% organic cotton material</li>
      <li>✓ Sustainable and eco-friendly production</li>
      <li>✓ Soft, breathable, and comfortable fit</li>
      <li>✓ Pre-shrunk and machine washable</li>
    </ul>
    <p>Available in multiple colors and sizes.</p>`,
    price: "24.99",
    compare_at_price: "34.99",
    sku: "ORGANIC-TEE-001",
    weight: "0.15",
    meta_title: "Organic Cotton T-Shirt - Sustainable Eco-Friendly Fashion",
    meta_description:
      "100% organic cotton t-shirt made with sustainable practices. Soft, comfortable, and eco-friendly. Available in multiple colors and sizes.",
    status: "published",
    published_scope: "web",
    product_type: "Clothing",
    vendor: "EcoWear",
    collections: ["Clothing", "T-Shirts", "Organic", "Sustainable", "Casual"],
    tags: "T-Shirt, Organic Cotton, Sustainable, Eco-Friendly, Clothing",
  },
  {
    title: "Smart Fitness Tracker Watch",
    description: `<p>Track your health and fitness goals with this <strong>Smart Fitness Tracker Watch</strong>. Monitor heart rate, steps, sleep, and receive notifications.</p>
    <ul style="list-style-type: none; padding-left: 0;">
      <li>✓ 24/7 heart rate monitoring</li>
      <li>✓ Sleep and activity tracking</li>
      <li>✓ 7-day battery life</li>
      <li>✓ Water-resistant design</li>
      <li>✓ Smart notifications</li>
    </ul>
    <p>Compatible with iOS and Android devices.</p>`,
    price: "79.95",
    compare_at_price: "99.95",
    sku: "FITNESS-WATCH-001",
    weight: "0.08",
    meta_title: "Smart Fitness Tracker Watch - Health & Activity Monitor",
    meta_description:
      "Advanced fitness tracker with heart rate monitoring, sleep tracking, and smart notifications. 7-day battery life and water-resistant design.",
    status: "published",
    published_scope: "web",
    product_type: "Wearables",
    vendor: "FitTech",
    collections: [
      "Wearables",
      "Fitness",
      "Smart Watch",
      "Health",
      "Technology",
    ],
    tags: "Fitness Tracker, Smart Watch, Health Monitor, Wearable, Technology",
  },
  {
    title: "Artisan Coffee Beans - Dark Roast Blend",
    description: `<p>Discover the rich, bold flavor of our <strong>Artisan Dark Roast Coffee Beans</strong>. Carefully selected and roasted to perfection for coffee enthusiasts.</p>
    <ul style="list-style-type: none; padding-left: 0;">
      <li>✓ 100% Arabica beans from premium farms</li>
      <li>✓ Dark roast with notes of chocolate and caramel</li>
      <li>✓ Freshly roasted and sealed for freshness</li>
      <li>✓ Fair trade and ethically sourced</li>
    </ul>
    <p>Perfect for espresso, drip coffee, or French press.</p>`,
    price: "16.99",
    compare_at_price: "21.99",
    sku: "COFFEE-DARK-001",
    weight: "0.45",
    meta_title: "Artisan Dark Roast Coffee Beans - Premium Arabica Blend",
    meta_description:
      "Premium artisan dark roast coffee beans with rich chocolate and caramel notes. 100% Arabica, fair trade, and freshly roasted.",
    status: "published",
    published_scope: "web",
    product_type: "Food & Beverage",
    vendor: "Artisan Roasters",
    collections: ["Coffee", "Dark Roast", "Artisan", "Fair Trade", "Premium"],
    tags: "Coffee, Dark Roast, Arabica, Artisan, Fair Trade, Premium",
  },
];

// Demo function to simulate AI response based on image
function getDemoProductData(imageFile = null) {
  console.log("🔄 Demo AI: Generating fake product data...");

  // Log the image file info for testing
  if (imageFile) {
    console.log("📸 Demo AI: Processing image:", {
      name: imageFile.name,
      size: imageFile.size,
      type: imageFile.type,
    });
  }

  // Return a random demo product
  const randomIndex = Math.floor(Math.random() * demoProductResponses.length);
  const demoProduct = demoProductResponses[randomIndex];

  console.log("✅ Demo AI: Generated product data:", demoProduct);

  return demoProduct;
}

// Demo function to simulate API delay
async function simulateAIProcessing(imageFile = null, delay = 1500) {
  console.log("⏳ Demo AI: Simulating API processing delay...");

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, delay));

  // Return demo data
  return getDemoProductData(imageFile);
}

// Demo AI Engine class to replace real OpenAI integration
class DemoAIEngine {
  constructor() {
    console.log("🤖 Demo AI Engine initialized for testing");
  }

  async generateProductFromImage(imageFile, options = {}) {
    const { delay = 1500, simulateError = false, errorRate = 0 } = options;

    console.log("🎯 Demo AI: generateProductFromImage called");

    // Simulate random errors for testing
    if (simulateError || Math.random() < errorRate) {
      console.error("🔴 Demo AI: Simulated API error");
      throw new Error("Demo API error: Service temporarily unavailable");
    }

    try {
      const productData = await simulateAIProcessing(imageFile, delay);
      return productData;
    } catch (error) {
      console.error("🔴 Demo AI: Error processing image:", error);
      throw error;
    }
  }
}

// Export for use in extension
window.DemoAIEngine = DemoAIEngine;

console.log("🚀 Demo AI Engine loaded successfully");
