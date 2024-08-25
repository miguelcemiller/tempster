// Inject content script when the extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  // Create the main context menu item
  chrome.contextMenus.create({
    id: "v",
    title: "V",
    contexts: ["editable"],
  });

  // Fetch templates and create submenu items
  chrome.storage.sync.get("templates", function (data) {
    const templates = data.templates || [];

    templates.forEach((template, index) => {
      // Create a submenu item for each template
      chrome.contextMenus.create({
        id: `template-${index}`,
        parentId: "v", // Set as a child of the main menu item
        title: template.name,
        contexts: ["editable"],
      });
    });
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId.startsWith("template-")) {
    console.log("submenu clicked");
    chrome.storage.sync.get("templates", function (data) {
      const templates = data.templates || [];
      const index = parseInt(info.menuItemId.replace("template-", ""), 10);
      const selectedTemplate = templates[index];

      if (selectedTemplate) {
        // Send a message to the content script to copy the content
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: function (content) {
            window.postMessage({ action: "copyToClipboard", content: content }, "*");
          },
          args: [selectedTemplate.content],
        });
      }
    });
  }
});
