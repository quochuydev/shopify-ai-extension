console.log("🚀 Shopify AI Extension loaded with Demo AI Engine");

// Demo content removed - now using dynamic DemoAI engine

function setReactInputValue(input, value) {
  if (!input) return;
  const setter = Object.getOwnPropertyDescriptor(input.__proto__, "value")?.set;
  if (setter) setter.call(input, value);
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
  console.log("🔄 Filling Shopify form with demo AI data:", content);

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

  console.log("📋 Form field mapping results:");
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

  console.log("✅ Demo AI form filling completed");
}

// Create enhanced UI elements
const extension = document.createElement("div");
extension.id = "extension";

// Extension header
const header = document.createElement("div");
header.className = "extension-header";

// Left side of header (logo + title)
const headerLeft = document.createElement("div");
headerLeft.className = "header-left";

const logo = document.createElement("div");
logo.className = "extension-logo";
logo.textContent = "🤖";

const title = document.createElement("h3");
title.className = "extension-title";
title.textContent = "AI Product Helper";

headerLeft.appendChild(logo);
headerLeft.appendChild(title);

// Right side of header (controls)
const headerControls = document.createElement("div");
headerControls.className = "header-controls";

const minimizeBtn = document.createElement("button");
minimizeBtn.className = "minimize-btn";
minimizeBtn.textContent = "−";
minimizeBtn.title = "Minimize";

headerControls.appendChild(minimizeBtn);

header.appendChild(headerLeft);
header.appendChild(headerControls);
extension.appendChild(header);

// Drag area with enhanced content
const dragger = document.createElement("div");
dragger.id = "ai-dragger";
dragger.innerHTML = `
  <div class="dragger-icon">📸</div>
  <div class="dragger-text">Drop product image here</div>
  <div class="dragger-subtext">Or click to select a file</div>
`;

// Hidden file input for click-to-upload
const fileInput = document.createElement("input");
fileInput.type = "file";
fileInput.accept = "image/*";
fileInput.style.display = "none";

// Generate button with loading state
const button = document.createElement("button");
button.id = "ai-button";
button.innerHTML = "Generate Product Details";

// Progress bar
const progressBar = document.createElement("div");
progressBar.className = "progress-bar";
progressBar.style.display = "none";
const progressFill = document.createElement("div");
progressFill.className = "progress-fill";
progressBar.appendChild(progressFill);

// Status message
const statusMessage = document.createElement("div");
statusMessage.className = "status-message";
statusMessage.style.display = "none";

// Category suggestions container
const suggestionsContainer = document.createElement("div");
suggestionsContainer.id = "category-suggestions";
suggestionsContainer.style.display = "none";

// Create generate section wrapper
const generateSection = document.createElement("div");
generateSection.className = "generate-section";
generateSection.appendChild(dragger);
generateSection.appendChild(fileInput);
generateSection.appendChild(button);
generateSection.appendChild(progressBar);
generateSection.appendChild(statusMessage);

// Assemble the extension
extension.appendChild(generateSection);
extension.appendChild(suggestionsContainer);

document.body.appendChild(extension);

// State management
let isProcessing = false;
let isMinimized = false;

button.addEventListener("click", async () => {
  if (isProcessing) return;

  try {
    setProcessingState(true, "Generating product details...");
    updateProgress(30);

    const aiEngine = new DemoAIEngine();

    const generatedContent = await aiEngine.generateProductFromText(
      "Generate a random product",
      { delay: 800 }
    );
    updateProgress(60);

    fillShopifyProductForm(generatedContent);
    updateProgress(80);

    await new Promise((resolve) => setTimeout(resolve, 300));

    showSuggestedCategories(generatedContent.collections);
    updateProgress(100);

    showStatus("Product details generated successfully!", "success");

    setTimeout(() => {
      setProcessingState(false);
      hideProgress();
    }, 1500);
  } catch (error) {
    console.error("🔴 AI Error:", error);
    showStatus("Failed to generate product details", "error");
    setProcessingState(false);
    hideProgress();
  }
});

// Click to upload functionality
dragger.addEventListener("click", () => {
  if (!isProcessing) {
    fileInput.click();
  }
});

fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file && file.type.startsWith("image/")) {
    handleImageUpload(file);
  }
});

// Minimize functionality
minimizeBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  toggleMinimize();
});

extension.addEventListener("click", () => {
  if (isMinimized) {
    toggleMinimize();
  }
});

function toggleMinimize() {
  isMinimized = !isMinimized;
  extension.classList.toggle("minimized", isMinimized);
  minimizeBtn.textContent = isMinimized ? "+" : "−";
  minimizeBtn.title = isMinimized ? "Expand" : "Minimize";
}

function setProcessingState(processing, message = "") {
  isProcessing = processing;
  button.disabled = processing;

  if (processing) {
    button.innerHTML = '<span class="loading-spinner"></span>Processing...';
    if (message) showStatus(message, "info");
  } else {
    button.innerHTML = "Generate Product Details";
  }
}

function updateProgress(percentage) {
  progressBar.style.display = "block";
  progressFill.style.width = percentage + "%";
}

function hideProgress() {
  setTimeout(() => {
    progressBar.style.display = "none";
    progressFill.style.width = "0%";
  }, 500);
}

function showStatus(message, type = "info") {
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${
    type === "error" ? "error-state" : type === "success" ? "success-state" : ""
  }`;
  statusMessage.style.display = "block";

  if (type === "success" || type === "error") {
    setTimeout(() => {
      statusMessage.style.display = "none";
    }, 3000);
  }
}

async function handleImageUpload(file) {
  if (isProcessing) return;

  try {
    setProcessingState(true, "Analyzing image...");
    updateProgress(20);

    // Show skeleton placeholders
    showSkeletonPlaceholders();
    updateProgress(40);

    // Inject image to Shopify media section
    injectImageToShopifyMedia(file);
    updateProgress(60);

    const aiEngine = window.ExtensionConfig.useRealAI
      ? new RealAIEngine()
      : new DemoAIEngine();
    const generatedContent = await aiEngine.generateProductFromImage(file, {
      delay: 1200,
    });
    updateProgress(90);

    // Fill form with AI-generated content
    fillShopifyProductForm(generatedContent);
    showSuggestedCategories(generatedContent.collections);
    updateProgress(100);

    showStatus("Product generated from image!", "success");

    setTimeout(() => {
      setProcessingState(false);
      hideProgress();
    }, 1500);
  } catch (error) {
    console.error("🔴 Error processing image:", error);
    showStatus("Failed to process image", "error");
    setProcessingState(false);
    hideProgress();
  }
}

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
    handleImageUpload(file);
  } else {
    alert("Please drop an image file.");
  }
});

// Enhanced show suggested categories function
function showSuggestedCategories(categories) {
  const container = document.getElementById("category-suggestions");

  if (!categories || categories.length === 0) {
    container.style.display = "none";
    return;
  }

  container.innerHTML = `
    <div class="suggestions-title">Suggested Categories</div>
  `;

  categories.forEach((category) => {
    const tag = document.createElement("span");
    tag.className = "category-tag";
    tag.textContent = category;
    tag.title = `Click to copy "${category}" to clipboard`;

    // Add click functionality to copy category to clipboard
    tag.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(category);

        // Visual feedback
        tag.style.opacity = "0.6";
        tag.style.transform = "scale(0.95)";
        setTimeout(() => {
          tag.style.opacity = "1";
          tag.style.transform = "scale(1)";
        }, 200);

        showStatus(`Copied "${category}" to clipboard`, "success");
      } catch {
        // Fallback for older browsers or when clipboard API fails
        const textArea = document.createElement("textarea");
        textArea.value = category;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);

        showStatus(`Copied "${category}" to clipboard`, "success");
      }
    });

    container.appendChild(tag);
  });

  container.style.display = "block";
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

// Removed sendImage function - now using AI engine

function showSkeletonPlaceholders() {
  const titleInput = document.querySelector('input[name="title"]');
  setReactInputValue(titleInput, "Generating title...");
  trySetTinyMCE("Generating description...");
}
