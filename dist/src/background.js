/******/ (() => { // webpackBootstrap
// Handle messages from popup
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
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
  fetch(dataUrl).then(function (res) {
    return res.blob();
  }).then(function (blob) {
    var url = URL.createObjectURL(blob);
    chrome.downloads.download({
      url: url,
      filename: filename || "screenshot_".concat(new Date().toISOString(), ".png"),
      saveAs: true
    }, function () {
      URL.revokeObjectURL(url);
    });
  })["catch"](function (error) {
    console.error('Error saving screenshot:', error);
  });
}
/******/ })()
;
//# sourceMappingURL=background.js.map