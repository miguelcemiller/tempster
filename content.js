window.addEventListener("message", (event) => {
  if (event.data.action === "copyToClipboard") {
    const content = event.data.content;
    navigator.clipboard
      .writeText(content)
      .then(() => {
        console.log("Content copied to clipboard");
      })
      .catch((err) => {
        console.error("Failed to copy content: ", err);
      });
  }
});
