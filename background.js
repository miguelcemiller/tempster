// Function to create context menu items based on templates
function createContextMenu() {
  // Remove all existing context menu items
  chrome.contextMenus.removeAll(() => {
    // Create the main context menu item
    chrome.contextMenus.create({
      id: "tempster",
      title: "Copy Template",
      contexts: ["editable"],
    });

    // Fetch templates and create submenu items
    chrome.storage.sync.get("templates", function (data) {
      const templates = data.templates || [];

      templates.forEach((template, index) => {
        // Create a submenu item for each template
        chrome.contextMenus.create({
          id: `template-${index}`,
          parentId: "tempster",
          title: template.name,
          contexts: ["editable"],
        });
      });
    });
  });
}

// Inject content script when the extension is installed or updated
chrome.runtime.onInstalled.addListener(createContextMenu);

// Update context menu when the storage is updated
chrome.storage.onChanged.addListener((changes) => {
  if (changes.templates) {
    createContextMenu();
  }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId.startsWith("template-")) {
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
