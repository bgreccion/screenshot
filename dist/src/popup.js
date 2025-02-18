/******/ (() => { // webpackBootstrap
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
// Store screenshots in memory (they will be cleared when popup is closed)
var screenshots = [];
var selectedScreenshots = new Set();

// Initialize UI
document.addEventListener('DOMContentLoaded', function () {
  // Attach click handlers to capture buttons
  document.getElementById('fullPage').addEventListener('click', captureFullPage);
  document.getElementById('viewport').addEventListener('click', captureViewport);
  document.getElementById('element').addEventListener('click', captureElement);
  document.getElementById('area').addEventListener('click', captureArea);
  document.getElementById('mergeSelected').addEventListener('click', mergeSelected);

  // Initialize screenshots list if any exist in storage
  updateScreenshotsList();
});

// Capture functions
function captureFullPage() {
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function (_ref) {
    var _ref2 = _slicedToArray(_ref, 1),
      tab = _ref2[0];
    chrome.tabs.sendMessage(tab.id, {
      action: 'CAPTURE_FULL_PAGE'
    }, handleScreenshot);
  });
}
function captureViewport() {
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function (_ref3) {
    var _ref4 = _slicedToArray(_ref3, 1),
      tab = _ref4[0];
    chrome.tabs.sendMessage(tab.id, {
      action: 'CAPTURE_VIEWPORT'
    }, handleScreenshot);
  });
}
function captureElement() {
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function (_ref5) {
    var _ref6 = _slicedToArray(_ref5, 1),
      tab = _ref6[0];
    chrome.tabs.sendMessage(tab.id, {
      action: 'START_ELEMENT_SELECT'
    }, handleScreenshot);
  });
}
function captureArea() {
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function (_ref7) {
    var _ref8 = _slicedToArray(_ref7, 1),
      tab = _ref8[0];
    chrome.tabs.sendMessage(tab.id, {
      action: 'START_AREA_SELECT'
    }, handleScreenshot);
  });
}

// Handle new screenshot
function handleScreenshot(dataUrl) {
  if (!dataUrl) return;
  var screenshot = {
    id: Date.now(),
    dataUrl: dataUrl,
    timestamp: new Date().toISOString()
  };
  screenshots.push(screenshot);
  updateScreenshotsList();
}

// Update screenshots list in UI
function updateScreenshotsList() {
  var container = document.getElementById('screenshotsList');
  container.innerHTML = '';
  screenshots.forEach(function (screenshot) {
    var item = document.createElement('div');
    item.className = 'screenshot-item';
    item.innerHTML = "\n      <input type=\"checkbox\" data-id=\"".concat(screenshot.id, "\" ").concat(selectedScreenshots.has(screenshot.id) ? 'checked' : '', ">\n      <img src=\"").concat(screenshot.dataUrl, "\" alt=\"Screenshot\">\n      <button class=\"download-btn\" data-id=\"").concat(screenshot.id, "\">\uD83D\uDCBE</button>\n    ");

    // Add event listeners
    var checkbox = item.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', function () {
      if (checkbox.checked) {
        selectedScreenshots.add(screenshot.id);
      } else {
        selectedScreenshots["delete"](screenshot.id);
      }
      updateMergeButton();
    });
    var downloadBtn = item.querySelector('.download-btn');
    downloadBtn.addEventListener('click', function () {
      saveScreenshot(screenshot.dataUrl);
    });
    container.appendChild(item);
  });
  updateMergeButton();
}

// Update merge button state
function updateMergeButton() {
  var mergeBtn = document.getElementById('mergeSelected');
  mergeBtn.disabled = selectedScreenshots.size < 2;
}

// Merge selected screenshots
function mergeSelected() {
  var selectedImages = screenshots.filter(function (s) {
    return selectedScreenshots.has(s.id);
  });
  if (selectedImages.length < 2) return;

  // Create canvas for merging
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');

  // Load all images first
  Promise.all(selectedImages.map(function (screenshot) {
    return new Promise(function (resolve) {
      var img = new Image();
      img.onload = function () {
        return resolve(img);
      };
      img.src = screenshot.dataUrl;
    });
  })).then(function (images) {
    // Calculate dimensions
    var maxWidth = Math.max.apply(Math, _toConsumableArray(images.map(function (img) {
      return img.width;
    })));
    var totalHeight = images.reduce(function (sum, img) {
      return sum + img.height;
    }, 0);

    // Set canvas size
    canvas.width = maxWidth;
    canvas.height = totalHeight;

    // Fill with white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw images
    var y = 0;
    images.forEach(function (img) {
      ctx.drawImage(img, 0, y);
      y += img.height;
    });

    // Save merged image
    saveScreenshot(canvas.toDataURL());
  });
}

// Save screenshot using background script
function saveScreenshot(dataUrl) {
  chrome.runtime.sendMessage({
    action: 'SAVE_SCREENSHOT',
    dataUrl: dataUrl
  });
}
/******/ })()
;
//# sourceMappingURL=popup.js.map