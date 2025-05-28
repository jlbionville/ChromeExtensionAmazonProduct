
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "scrapeAmazonProduct",
    title: "📄 Scraper ce produit Amazon",
    contexts: ["page"],
    documentUrlPatterns: ["*://*.amazon.com/*"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "scrapeAmazonProduct") {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"]
    });
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command === "scrape-amazon") {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"]
    });
  }
});

chrome.action.onClicked.addListener(async (tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["content.js"]
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "download") {
    chrome.downloads.download({
      url: request.url,
      filename: request.filename,
      saveAs: false
    });
  }
});
