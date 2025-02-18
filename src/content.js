import { captureArea, captureElement, captureFullPage, captureViewport } from './utils/capture'

let isSelecting = false
let startX, startY
let overlay = null
let selectionBox = null

// Handle messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'CAPTURE_VIEWPORT':
      captureViewport().then(sendResponse)
      return true

    case 'CAPTURE_FULL_PAGE':
      captureFullPage().then(sendResponse)
      return true

    case 'START_ELEMENT_SELECT':
      startElementSelection(sendResponse)
      return true

    case 'START_AREA_SELECT':
      startAreaSelection(sendResponse)
      return true
  }
})

// Element selection functionality
function startElementSelection(callback) {
  const overlay = document.createElement('div')
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10000;
    cursor: crosshair;
  `

  let highlightedElement = null

  function handleMouseOver(e) {
    e.stopPropagation()
    if (highlightedElement) {
      highlightedElement.style.outline = ''
    }
    highlightedElement = e.target
    highlightedElement.style.outline = '2px solid #4CAF50'
  }

  function handleMouseOut(e) {
    if (highlightedElement) {
      highlightedElement.style.outline = ''
      highlightedElement = null
    }
  }

  function handleClick(e) {
    e.preventDefault()
    e.stopPropagation()

    if (highlightedElement) {
      highlightedElement.style.outline = ''
      captureElement(highlightedElement).then(callback)
    }

    cleanup()
  }

  function cleanup() {
    overlay.removeEventListener('mouseover', handleMouseOver)
    overlay.removeEventListener('mouseout', handleMouseOut)
    overlay.removeEventListener('click', handleClick)
    document.body.removeChild(overlay)
  }

  overlay.addEventListener('mouseover', handleMouseOver)
  overlay.addEventListener('mouseout', handleMouseOut)
  overlay.addEventListener('click', handleClick)

  document.body.appendChild(overlay)
}

// Area selection functionality
function startAreaSelection(callback) {
  if (isSelecting) return
  isSelecting = true

  // Create overlay
  overlay = document.createElement('div')
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.2);
    z-index: 10000;
    cursor: crosshair;
  `

  // Create selection box
  selectionBox = document.createElement('div')
  selectionBox.style.cssText = `
    position: fixed;
    border: 2px solid #4CAF50;
    background: rgba(76, 175, 80, 0.1);
    z-index: 10001;
    display: none;
  `

  document.body.appendChild(overlay)
  document.body.appendChild(selectionBox)

  function handleMouseDown(e) {
    startX = e.clientX
    startY = e.clientY
    selectionBox.style.display = 'block'
    selectionBox.style.left = startX + 'px'
    selectionBox.style.top = startY + 'px'
  }

  function handleMouseMove(e) {
    if (!startX || !startY) return

    const currentX = e.clientX
    const currentY = e.clientY

    const width = Math.abs(currentX - startX)
    const height = Math.abs(currentY - startY)

    selectionBox.style.width = width + 'px'
    selectionBox.style.height = height + 'px'
    selectionBox.style.left = (currentX > startX ? startX : currentX) + 'px'
    selectionBox.style.top = (currentY > startY ? startY : currentY) + 'px'
  }

  function handleMouseUp(e) {
    const width = Math.abs(e.clientX - startX)
    const height = Math.abs(e.clientY - startY)
    const x = Math.min(startX, e.clientX)
    const y = Math.min(startY, e.clientY)

    if (width > 10 && height > 10) {
      captureArea(x, y, width, height).then(callback)
    }

    cleanup()
  }

  function cleanup() {
    isSelecting = false
    startX = startY = null
    document.body.removeChild(overlay)
    document.body.removeChild(selectionBox)
    overlay.removeEventListener('mousedown', handleMouseDown)
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  overlay.addEventListener('mousedown', handleMouseDown)
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}
