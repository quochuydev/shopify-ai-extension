// Inject the drag UI and CSS
const style = document.createElement("link");
style.rel = "stylesheet";
style.href = chrome.runtime.getURL("drag_ui.css");
document.head.appendChild(style);

// Inject configuration first
const configScript = document.createElement("script");
configScript.src = chrome.runtime.getURL("configuration.js");
document.body.appendChild(configScript);

// Inject demo AI engine
const demoAIScript = document.createElement("script");
demoAIScript.src = chrome.runtime.getURL("demoAI.js");
document.body.appendChild(demoAIScript);

// Inject real AI engine
const realAIScript = document.createElement("script");
realAIScript.src = chrome.runtime.getURL("realAI.js");
document.body.appendChild(realAIScript);

// Then inject the main drag UI script
const script = document.createElement("script");
script.src = chrome.runtime.getURL("drag_ui.js");
document.body.appendChild(script);
