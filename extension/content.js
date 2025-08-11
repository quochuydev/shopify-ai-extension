// Inject the drag UI and CSS
const style = document.createElement("link");
style.rel = "stylesheet";
style.href = chrome.runtime.getURL("drag.css");
document.head.appendChild(style);

// Then inject the main drag UI script
const script = document.createElement("script");
script.src = chrome.runtime.getURL("drag.js");
document.body.appendChild(script);

// Auth
window.addEventListener("message", async (event) => {
  if (event.source !== window) return;

  if (event.data?.type === "CHECK_AUTH_STATUS") {
    chrome.storage.local.get(["accessToken", "userEmail"], (result) => {
      window.postMessage(
        {
          type: "AUTH_STATUS_RESPONSE",
          accessToken: result.accessToken,
          userEmail: result.userEmail,
        },
        "*"
      );
    });
  }

  if (event.data.type === "SAVE_AUTH_TOKEN") {
    const accessToken = event.data.accessToken;
    const userEmail = event.data.userEmail;

    if (accessToken) {
      chrome.storage.local.set({ accessToken, userEmail }, () => {
        console.log("✅ Auth token saved");

        window.postMessage(
          {
            type: "AUTH_STATUS_RESPONSE",
            accessToken,
            userEmail,
          },
          "*"
        );
      });
    }
  }

  if (event.data.type === "CLEAR_AUTH_TOKEN") {
    chrome.storage.local.remove(["accessToken", "userEmail"], () => {
      console.log("🚪 Auth token cleared");

      window.postMessage(
        {
          type: "AUTH_STATUS_RESPONSE",
          accessToken: null,
          userEmail: null,
        },
        "*"
      );
    });
  }
});
