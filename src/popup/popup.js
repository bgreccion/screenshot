// Store screenshots in memory (they will be cleared when popup is closed)
let screenshots = []
let selectedScreenshots = new Set()

// Initialize UI
document.addEventListener('DOMContentLoaded', () => {
  // Attach click handlers to capture buttons
  document.getElementById('fullPage').addEventListener('click', captureFullPage)
  document.getElementById('viewport').addEventListener('click', captureViewport)
  document.getElementById('element').addEventListener('click', captureElement)
  document.getElementById('area').addEventListener('click', captureArea)
  document.getElementById('mergeSelected').addEventListener('click', mergeSelected)

  // Initialize screenshots list if any exist in storage
  updateScreenshotsList()
})

// Capture functions
function captureFullPage() {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    chrome.tabs.sendMessage(tab.id, { action: 'CAPTURE_FULL_PAGE' }, handleScreenshot)
  })
}

function captureViewport() {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    chrome.tabs.sendMessage(tab.id, { action: 'CAPTURE_VIEWPORT' }, handleScreenshot)
  })
}

function captureElement() {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    chrome.tabs.sendMessage(tab.id, { action: 'START_ELEMENT_SELECT' }, handleScreenshot)
  })
}

function captureArea() {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    chrome.tabs.sendMessage(tab.id, { action: 'START_AREA_SELECT' }, handleScreenshot)
  })
}

// Handle new screenshot
function handleScreenshot(dataUrl) {
  if (!dataUrl) return

  const screenshot = {
    id: Date.now(),
    dataUrl: dataUrl,
    timestamp: new Date().toISOString()
  }

  screenshots.push(screenshot)
  updateScreenshotsList()
}

// Update screenshots list in UI
function updateScreenshotsList() {
  const container = document.getElementById('screenshotsList')
  container.innerHTML = ''

  screenshots.forEach(screenshot => {
    const item = document.createElement('div')
    item.className = 'screenshot-item'
    item.innerHTML = `
      <input type="checkbox" data-id="${screenshot.id}" ${selectedScreenshots.has(screenshot.id) ? 'checked' : ''}>
      <img src="${screenshot.dataUrl}" alt="Screenshot">
      <button class="download-btn" data-id="${screenshot.id}">💾</button>
    `

    // Add event listeners
    const checkbox = item.querySelector('input[type="checkbox"]')
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        selectedScreenshots.add(screenshot.id)
      } else {
        selectedScreenshots.delete(screenshot.id)
      }
      updateMergeButton()
    })

    const downloadBtn = item.querySelector('.download-btn')
    downloadBtn.addEventListener('click', () => {
      saveScreenshot(screenshot.dataUrl)
    })

    container.appendChild(item)
  })

  updateMergeButton()
}

// Update merge button state
function updateMergeButton() {
  const mergeBtn = document.getElementById('mergeSelected')
  mergeBtn.disabled = selectedScreenshots.size < 2
}

// Merge selected screenshots
function mergeSelected() {
  const selectedImages = screenshots.filter(s => selectedScreenshots.has(s.id))
  if (selectedImages.length < 2) return

  // Create canvas for merging
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  // Load all images first
  Promise.all(selectedImages.map(screenshot => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.src = screenshot.dataUrl
    })
  })).then(images => {
    // Calculate dimensions
    const maxWidth = Math.max(...images.map(img => img.width))
    const totalHeight = images.reduce((sum, img) => sum + img.height, 0)

    // Set canvas size
    canvas.width = maxWidth
    canvas.height = totalHeight

    // Fill with white background
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw images
    let y = 0
    images.forEach(img => {
      ctx.drawImage(img, 0, y)
      y += img.height
    })

    // Save merged image
    saveScreenshot(canvas.toDataURL())
  })
}

// Save screenshot using background script
function saveScreenshot(dataUrl) {
  chrome.runtime.sendMessage({
    action: 'SAVE_SCREENSHOT',
    dataUrl: dataUrl
  })
}
