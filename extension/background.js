chrome.runtime.onInstalled.addListener((params) => {
  console.log("[service_worker.js] Shopify AI Extension Installed", params);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "PING") {
    sendResponse({ type: "PONG", sender, time: Date.now() });
  }
});
