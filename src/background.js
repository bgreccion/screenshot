// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'SAVE_SCREENSHOT':
      saveScreenshot(request.dataUrl, request.filename);
      break;
  }
  return true;
});

// Save screenshot to downloads
function saveScreenshot(dataUrl, filename) {
  // Convert base64 to blob
  fetch(dataUrl)
    .then(res => res.blob())
    .then(blob => {
      const url = URL.createObjectURL(blob);
      chrome.downloads.download({
        url: url,
        filename: filename || `screenshot_${new Date().toISOString()}.png`,
        saveAs: true
      }, () => {
        URL.revokeObjectURL(url);
      });
    })
    .catch(error => {
      console.error('Error saving screenshot:', error);
    });
}
