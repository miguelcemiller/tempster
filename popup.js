document.addEventListener("DOMContentLoaded", function () {
  const inputTemplateName = document.querySelector(".input-template-name");
  const textareaTemplateText = document.querySelector(".textarea-template-text");
  const templatesList = document.querySelector(".templates-list");
  const save = document.querySelector(".save");
  const back = document.querySelector(".back"); // Select the back button
  const alert = document.querySelector(".alert");
  const alertValue = document.querySelector(".alert-value");
  const closeAlert = document.querySelector(".close-alert");

  let isEditing = false;
  let currentEditingTemplateName = "";

  // Close alert
  closeAlert.addEventListener("click", () => {
    closeAlert.parentElement.style.display = "none";
  });

  // Function to close all alerts
  function closeAlerts() {
    document.querySelectorAll(".alert").forEach((alert) => {
      alert.style.display = "none";
    });
  }

  // Close all alerts on click anywhere on the body
  document.body.addEventListener("click", () => {
    closeAlerts();
  });

  // Close alerts on focus in input fields
  inputTemplateName.addEventListener("focus", () => {
    closeAlerts();
  });

  textareaTemplateText.addEventListener("focus", () => {
    closeAlerts();
  });

  // Adjust padding-right based on scrollbar presence
  function adjustPadding() {
    const hasScrollbar = templatesList.scrollHeight > templatesList.clientHeight;
    templatesList.style.paddingRight = hasScrollbar ? "15px" : "0";
  }

  // Load existing templates from storage
  chrome.storage.sync.get("templates", function (data) {
    const templates = data.templates || [];
    templates.forEach((template) => {
      addTemplateToList(template);
    });
  });

  textareaTemplateText.addEventListener("input", () => {
    textareaTemplateText.style.height = "82px";
    textareaTemplateText.style.height = `${textareaTemplateText.scrollHeight}px`;
    toggleSaveButton();
  });

  inputTemplateName.addEventListener("input", toggleSaveButton);

  // Back button event listener
  back.addEventListener("click", () => {
    closeAlerts();
    isEditing = false;
    currentEditingTemplateName = "";
    inputTemplateName.value = "";
    textareaTemplateText.value = "";
    textareaTemplateText.style.height = "82px";
    back.style.display = "none"; // Hide the back button
    save.disabled = true; // Disable the save button
  });

  // Toggle save button based on input fields
  function toggleSaveButton() {
    save.disabled = !(inputTemplateName.value.trim() && textareaTemplateText.value.trim());
  }

  // Function to add a template to the list
  function addTemplateToList(template) {
    const templateItem = document.createElement("div");
    templateItem.className = "template-item";

    templateItem.innerHTML = `
          <div>${template.name}</div>
          <img src="images/x.svg" alt="delete" class="delete" />
        `;

    templateItem.querySelector(".delete").addEventListener("click", function () {
      closeAlerts();
      deleteTemplate(template);
      templateItem.remove();
      adjustPadding(); // Adjust padding after deleting
    });

    templateItem.addEventListener("click", function () {
      closeAlerts();
      inputTemplateName.value = template.name;
      textareaTemplateText.value = template.content;
      textareaTemplateText.style.height = "82px";
      textareaTemplateText.style.height = `${textareaTemplateText.scrollHeight}px`;
      isEditing = true;
      toggleSaveButton();
      currentEditingTemplateName = template.name;
      back.style.display = "block";
    });

    templatesList.appendChild(templateItem);
    adjustPadding();
  }

  // Function to delete a template from storage
  function deleteTemplate(templateToDelete) {
    chrome.storage.sync.get("templates", function (data) {
      const templates = data.templates || [];
      const updatedTemplates = templates.filter((template) => template.name !== templateToDelete.name);
      chrome.storage.sync.set({ templates: updatedTemplates }, function () {
        // Reset editing state
        isEditing = false;
        currentEditingTemplateName = "";
        back.style.display = "none";

        toggleSaveButton();

        alertValue.textContent = `template '${templateToDelete.name}' deleted!`;
        alert.classList.remove("good-alert");
        alert.classList.add("bad-alert");
        closeAlert.style.fill = "#C93033";
        alert.style.display = "flex";

        inputTemplateName.value = "";
        textareaTemplateText.value = "";
      });
    });
  }

  // Save or update the template on button click
  save.addEventListener("click", () => {
    closeAlerts();
    const templateName = inputTemplateName.value.trim();
    const templateText = textareaTemplateText.value.trim();

    chrome.storage.sync.get("templates", function (data) {
      let templates = data.templates || [];

      if (isEditing) {
        // Update existing template
        templates = templates.map((template) => {
          if (template.name === currentEditingTemplateName) {
            return { name: templateName, content: templateText };
          }
          return template;
        });

        isEditing = false;
        currentEditingTemplateName = "";
        back.style.display = "none";
        alertValue.textContent = "template updated!";
      } else {
        // Check for duplicate template names
        if (templates.some((template) => template.name.toLowerCase() === templateName.toLowerCase())) {
          alertValue.textContent = "name already exists!";
          alert.classList.remove("good-alert");
          alert.classList.add("bad-alert");
          closeAlert.style.fill = "#C93033";
          alert.style.display = "flex";
          return;
        }

        // Save new template
        const newTemplate = { name: templateName, content: templateText };
        templates.push(newTemplate);
        addTemplateToList(newTemplate);
        alertValue.textContent = "template saved!";
      }

      chrome.storage.sync.set({ templates: templates }, function () {
        inputTemplateName.value = "";
        textareaTemplateText.value = "";
        textareaTemplateText.style.height = "82px";
        toggleSaveButton();
        alert.classList.remove("bad-alert");
        alert.classList.add("good-alert");
        closeAlert.style.fill = "#4b8965";
        alert.style.display = "flex";
        templatesList.innerHTML = "";
        templates.forEach((template) => addTemplateToList(template));
      });
    });
  });

  // Initial adjustment of padding when the page loads
  adjustPadding();
});
