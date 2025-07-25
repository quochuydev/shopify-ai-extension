const example = {
  product: {
    id: 8048322576584,
    title: "Americano (M)",
    body_html: "",
    vendor: "quochuy.dev",
    product_type: "",
    created_at: "2024-09-02T21:46:44+07:00",
    handle: "americano-m",
    updated_at: "2025-07-25T11:50:19+07:00",
    published_at: "2024-09-02T21:46:44+07:00",
    template_suffix: "",
    published_scope: "web",
    tags: "",
    variants: [
      {
        id: 44074781212872,
        product_id: 8048322576584,
        title: "Default Title",
        price: "1.80",
        sku: "",
        position: 2,
        compare_at_price: "",
        fulfillment_service: "manual",
        inventory_management: null,
        option1: "Default Title",
        option2: null,
        option3: null,
        created_at: "2024-09-02T21:46:45+07:00",
        updated_at: "2025-07-25T11:50:19+07:00",
        taxable: true,
        barcode: "",
        grams: 0,
        image_id: null,
        weight: 0,
        weight_unit: "kg",
        requires_shipping: false,
        quantity_rule: {
          min: 1,
          max: null,
          increment: 1,
        },
        price_currency: "USD",
        compare_at_price_currency: "",
        quantity_price_breaks: [],
      },
    ],
    options: [
      {
        id: 10154863231176,
        product_id: 8048322576584,
        name: "Title",
        position: 1,
        values: ["Default Title"],
      },
    ],
    images: [
      {
        id: 36305382637768,
        product_id: 8048322576584,
        position: 1,
        created_at: "2024-09-07T16:30:25+07:00",
        updated_at: "2024-09-07T16:30:27+07:00",
        alt: null,
        width: 1170,
        height: 1168,
        src: "https://cdn.shopify.com/s/files/1/0583/7973/1144/files/IMG_5466_48c2372e-0f09-4b37-a6f2-af68142b7ead.jpg?v=1725701427",
        variant_ids: [],
      },
    ],
    image: {
      id: 36305382637768,
      product_id: 8048322576584,
      position: 1,
      created_at: "2024-09-07T16:30:25+07:00",
      updated_at: "2024-09-07T16:30:27+07:00",
      alt: null,
      width: 1170,
      height: 1168,
      src: "https://cdn.shopify.com/s/files/1/0583/7973/1144/files/IMG_5466_48c2372e-0f09-4b37-a6f2-af68142b7ead.jpg?v=1725701427",
      variant_ids: [],
    },
  },
};

const content = {
  // Left
  title: "Flinger Bot DIY Kit for Curious Engineers (Ages 8+)",
  description: `<p>Unleash your child's inner engineer with the <strong>Copernicus Toys Flinger Bot Kit</strong>. This hands-on STEM toy teaches the basics of mechanics and motion with easy-to-follow instructions. Ideal for ages 8+, it's the perfect introduction to robotics, curiosity, and creativity.</p>
    <ul style="list-style-type: none; padding-left: 0;">
      <li>✓ Build your own mini flinger robot</li>
      <li>✓ Includes all required parts and tools</li>
      <li>✓ Promotes STEM learning and problem solving</li>
    </ul>
    <p>Great for classrooms, birthdays, or rainy-day fun.</p>`,

  // Pricing
  price: "18.95",
  compare_at_price: "22.95",

  // Inventory
  tags: "STEM, DIY Kit, Kids Robotics, Educational Toy, Engineering Kit",
  sku: "FLINGER-KIT-001",
  weight: "0.35",

  // Variants
  variants: [
    {
      price: "18.95",
      compare_at_price: "22.95",
      sku: "FLINGER-KIT-001",
      weight: "0.35",
    },
  ],

  // Search engine listing
  meta_title: "Flinger Bot DIY Kit for Curious Engineers (Ages 8+)",
  meta_description:
    "Unleash your child's inner engineer with the Copernicus Toys Flinger Bot Kit. This hands-on STEM toy teaches the basics of mechanics and motion with easy-to-follow instructions. Ideal for ages 8+, it's the perfect introduction to robotics, curiosity, and creativity.",

  // Status
  status: "published",

  // Publishing
  published_scope: "web",

  // Product organization
  product_type: "STEM Kit",
  vendor: "Copernicus Toys",
};

const button = document.createElement("button");
button.textContent = "Generate Product Details";
button.id = "ai-button";
document.body.appendChild(button);

button.addEventListener("click", () => {
  fillShopifyProductForm(content);
});

function setReactInputValue(input, value) {
  const setter = Object.getOwnPropertyDescriptor(input.__proto__, "value")?.set;
  setter?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

const trySetTinyMCE = (description) => {
  if (typeof tinymce !== "undefined" && tinymce.activeEditor) {
    tinymce.activeEditor.setContent(description);
    tinymce.activeEditor.fire("change");
    console.log("✅ Description filled via TinyMCE");
  } else {
    setTimeout(trySetTinyMCE, 300); // retry
  }
};

function fillShopifyProductForm(content) {
  // Title
  const titleInput = document.querySelector('input[name="title"]');
  if (titleInput) setReactInputValue(titleInput, content.title);

  // Description
  trySetTinyMCE(content.description);

  // Tags
  const tagsInput = document.querySelector(
    'input[placeholder="Vintage, cotton, summer"]'
  );
  if (tagsInput) setReactInputValue(tagsInput, content.tags);

  // Vendor
  const vendorInput = document.querySelector('input[name="vendor"]');
  if (vendorInput) setReactInputValue(vendorInput, content.vendor);

  // Product Type
  const typeInput = document.querySelector('input[name="productType"]');
  if (typeInput) setReactInputValue(typeInput, content.product_type);

  // Price
  const priceInput = document.querySelector('input[name="variants[0].price"]');
  if (priceInput) setReactInputValue(priceInput, content.price);

  // Compare at price
  const compareInput = document.querySelector(
    'input[name="variants[0].compare_at_price"]'
  );
  if (compareInput) setReactInputValue(compareInput, content.compare_at_price);

  // SKU
  const skuInput = document.querySelector('input[name="variants[0].sku"]');
  if (skuInput) setReactInputValue(skuInput, content.sku);

  // Weight
  const weightInput = document.querySelector(
    'input[name="variants[0].weight"]'
  );
  if (weightInput) setReactInputValue(weightInput, content.weight);
}

const dragger = document.createElement("div");
dragger.id = "ai-dragger";
dragger.textContent = "Drop image here";

document.body.appendChild(dragger);

// Drag styling
dragger.addEventListener("dragover", (e) => {
  e.preventDefault();
  dragger.classList.add("dragover");
});

dragger.addEventListener("dragleave", () => {
  dragger.classList.remove("dragover");
});

dragger.addEventListener("drop", (e) => {
  e.preventDefault();
  dragger.classList.remove("dragover");

  const file = e.dataTransfer.files[0];

  if (file && file.type.startsWith("image/")) {
    showSkeletonPlaceholders();

    // sendImage(file);
    injectImageToShopifyMedia(file);

    setTimeout(() => {
      fillShopifyProductForm(content);
    }, 1000);
  } else {
    alert("Please drop an image file.");
  }
});

function injectImageToShopifyMedia(file) {
  const input = document.querySelector('input[type="file"][accept*="image"]');

  if (!input) {
    console.warn("⛔ Cannot find Shopify media upload input");
    return;
  }

  // Create a DataTransfer to simulate file upload
  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(file);

  input.files = dataTransfer.files;

  // Trigger change event so Shopify reacts
  input.dispatchEvent(new Event("change", { bubbles: true }));

  console.log("✅ Image injected into Shopify media section");
}

function sendImage(file) {
  const formData = new FormData();
  formData.append("image", file);

  fetch("https://your-backend.com/api/generate", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("AI Response:", data);
      alert("Product details generated!");
      // Optionally auto-fill Shopify form fields using DOM selectors
    })
    .catch((err) => {
      console.error("Error:", err);
      alert("Failed to process image.");
    });
}

function showSkeletonPlaceholders() {
  const titleInput = document.querySelector('input[name="title"]');
  setReactInputValue(titleInput, "Generating title...");
  trySetTinyMCE("Generating description...");
}
