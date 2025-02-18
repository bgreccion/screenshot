import html2canvas from 'html2canvas'

// Capture the visible viewport
export async function captureViewport() {
  try {
    const canvas = await html2canvas(document.documentElement, {
      windowWidth: document.documentElement.clientWidth,
      windowHeight: document.documentElement.clientHeight,
      x: window.scrollX,
      y: window.scrollY,
      width: window.innerWidth,
      height: window.innerHeight
    })
    return canvas.toDataURL()
  } catch (error) {
    console.error('Error capturing viewport:', error)
    throw error
  }
}

// Capture the full page
export async function captureFullPage() {
  try {
    const canvas = await html2canvas(document.documentElement, {
      windowWidth: document.documentElement.scrollWidth,
      windowHeight: document.documentElement.scrollHeight,
      width: document.documentElement.scrollWidth,
      height: document.documentElement.scrollHeight
    })
    return canvas.toDataURL()
  } catch (error) {
    console.error('Error capturing full page:', error)
    throw error
  }
}

// Capture a specific element
export async function captureElement(element) {
  try {
    const canvas = await html2canvas(element, {
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      width: element.scrollWidth,
      height: element.scrollHeight
    })
    return canvas.toDataURL()
  } catch (error) {
    console.error('Error capturing element:', error)
    throw error
  }
}

// Capture a selected area
export async function captureArea(startX, startY, width, height) {
  try {
    const canvas = await html2canvas(document.documentElement, {
      x: startX,
      y: startY,
      width: width,
      height: height,
      windowWidth: document.documentElement.clientWidth,
      windowHeight: document.documentElement.clientHeight
    })
    return canvas.toDataURL()
  } catch (error) {
    console.error('Error capturing area:', error)
    throw error
  }
}
