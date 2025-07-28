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
  collections: [
    "STEM Toys",
    "DIY Kits",
    "Robotics",
    "Educational Toys",
    "Engineering Kit",
  ],
  tags: "STEM, DIY Kit, Kids Robotics, Educational Toy, Engineering Kit",
};

function setReactInputValue(input, value) {
  if (!input) return;
  const setter = Object.getOwnPropertyDescriptor(input.__proto__, "value")?.set;
  setter && setter.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

const trySetTinyMCE = (description) => {
  if (typeof tinymce !== "undefined" && tinymce.activeEditor) {
    tinymce.activeEditor.setContent(description);
    tinymce.activeEditor.fire("change");
    console.log("✅ Description filled via TinyMCE");
  }
};

function fillShopifyProductForm(content) {
  // Title
  const titleInputSelector = 'input[name="title"]';
  const titleInput = document.querySelector(titleInputSelector);
  setReactInputValue(titleInput, content.title);

  // Description
  trySetTinyMCE(content.description);

  // Pricing
  const priceInputSelector = 'input[name="price"]';
  const priceInput = document.querySelector(priceInputSelector);
  setReactInputValue(priceInput, content.price);

  const compareAtPriceInputSelector = 'input[name="compareAtPrice"]';
  const compareAtPriceInput = document.querySelector(
    compareAtPriceInputSelector
  );
  setReactInputValue(compareAtPriceInput, content.compare_at_price);

  // Inventory
  const allowOutOfStockSelector = 'input[name="allowOutOfStockPurchases"]';
  const allowOutOfStockCheckbox = document.querySelector(
    allowOutOfStockSelector
  );
  // if (allowOutOfStockCheckbox && !allowOutOfStockCheckbox.checked) {
  //   allowOutOfStockCheckbox.click();
  // }

  // Shipping
  const weightInputSelector = 'input[name="variants[0].weight"]';
  const weightInput = document.querySelector(weightInputSelector);
  setReactInputValue(weightInput, content.weight);

  // Variant
  const variantPriceInputSelector = 'input[name="variants[0].price"]';
  const variantPriceInput = document.querySelector(variantPriceInputSelector);
  setReactInputValue(variantPriceInput, content.price);

  const variantCompareInputSelector =
    'input[name="variants[0].compare_at_price"]';
  const variantCompareInput = document.querySelector(
    variantCompareInputSelector
  );
  setReactInputValue(variantCompareInput, content.compare_at_price);

  // Search engine listing
  const metaTitleInputSelector =
    'input[name="metafields[global][title][value]"]';
  const metaTitleInput = document.querySelector(metaTitleInputSelector);
  setReactInputValue(metaTitleInput, content.meta_title);

  const metaDescriptionInputSelector =
    'input[name="metafields[global][description][value]"]';
  const metaDescriptionInput = document.querySelector(
    metaDescriptionInputSelector
  );
  setReactInputValue(metaDescriptionInput, content.meta_description);

  // Status
  const statusInputSelector = 'input[name="status"]';
  const statusInput = document.querySelector(statusInputSelector);
  setReactInputValue(statusInput, content.status);

  // Publishing
  const publishedScopeInputSelector = 'input[name="published_scope"]';
  const publishedScopeInput = document.querySelector(
    publishedScopeInputSelector
  );
  setReactInputValue(publishedScopeInput, content.published_scope);

  // Product organization
  const typeInputSelector = 'input[name="productType"]';
  const typeInput = document.querySelector(typeInputSelector);
  setReactInputValue(typeInput, content.product_type);

  const vendorInputSelector = 'input[name="vendor"]';
  const vendorInput = document.querySelector(vendorInputSelector);
  setReactInputValue(vendorInput, content.vendor);

  const tagsInputSelector = 'input[name="tags"]';
  const tagsInput = document.querySelector(tagsInputSelector);
  setReactInputValue(tagsInput, content.tags);

  if (tagsInput) {
    tagsInput.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true })
    );
  }

  console.log(`
    ${titleInputSelector}: ${!!titleInput ? "✅" : "⛔"}
    ${priceInputSelector}: ${!!priceInput ? "✅" : "⛔"}
    ${compareAtPriceInputSelector}: ${!!compareAtPriceInput ? "✅" : "⛔"}
    ${allowOutOfStockSelector}: ${!!allowOutOfStockCheckbox ? "✅" : "⛔"}
    ${weightInputSelector}: ${!!weightInput ? "✅" : "⛔"}
    ${variantPriceInputSelector}: ${!!variantPriceInput ? "✅" : "⛔"}
    ${variantCompareInputSelector}: ${!!variantCompareInput ? "✅" : "⛔"}
    ${metaTitleInputSelector}: ${!!metaTitleInput ? "✅" : "⛔"}
    ${metaDescriptionInputSelector}: ${!!metaDescriptionInput ? "✅" : "⛔"}
    ${statusInputSelector}: ${!!statusInput ? "✅" : "⛔"}
    ${publishedScopeInputSelector}: ${!!publishedScopeInput ? "✅" : "⛔"}
    ${typeInputSelector}: ${!!typeInput ? "✅" : "⛔"}
    ${vendorInputSelector}: ${!!vendorInput ? "✅" : "⛔"}
    ${tagsInputSelector}: ${!!tagsInput ? "✅" : "⛔"}
  `);
}

const button = document.createElement("button");
button.textContent = "Generate Product Details";
button.id = "ai-button";
document.body.appendChild(button);

button.addEventListener("click", () => {
  try {
    fillShopifyProductForm(content);
    showSuggestedCategories(content.collections);
    console.log("✅ Product details generated!");
  } catch (error) {
    console.log("Error:", error);
  }
});

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
      showSuggestedCategories(content.collections);
    }, 1000);
  } else {
    alert("Please drop an image file.");
  }
});

// Category suggestions
let container = document.getElementById("category-suggestions");
container = document.createElement("div");
container.id = "category-suggestions";

// Extension
const extension = document.createElement("div");
extension.id = "extension";
document.body.appendChild(extension);

if (extension && extension.parentNode) {
  extension.appendChild(button);
  extension.appendChild(dragger);
  extension.appendChild(container);
}

// Show suggested categories
function showSuggestedCategories(categories) {
  let container = document.getElementById("category-suggestions");

  container.innerHTML = "<strong>Suggested Categories:</strong><br>";

  categories.forEach((cat) => {
    const span = document.createElement("span");
    span.textContent = cat;
    container.appendChild(span);
    container.appendChild(document.createElement("br"));
  });
}

// Inject image to Shopify media section
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
