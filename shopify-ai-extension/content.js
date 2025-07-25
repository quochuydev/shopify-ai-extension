// Inject the drag UI and CSS
const style = document.createElement("link");
style.rel = "stylesheet";
style.href = chrome.runtime.getURL("drag_ui.css");
document.head.appendChild(style);

const script = document.createElement("script");
script.src = chrome.runtime.getURL("drag_ui.js");
document.body.appendChild(script);
