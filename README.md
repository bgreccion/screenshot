# SmartMerge Screenshot Extension

A Chrome extension for capturing and merging screenshots with various capture modes.

## Features

- Multiple capture modes:
  - Full page screenshots
  - Viewport screenshots
  - Element selection
  - Area selection
- Screenshot management
- Merge multiple screenshots
- Download individual or merged screenshots

## Development Setup

1. Install dependencies:
```bash
npm install
```

2. Build the extension:
```bash
npm run build
```

3. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked" and select the `dist` directory

## Usage

1. Click the extension icon to open the popup
2. Choose a capture mode:
   - Full Page: Captures the entire webpage
   - Viewport: Captures the visible area
   - Select Element: Click on any element to capture it
   - Select Area: Draw a rectangle to capture a specific area
3. Manage your screenshots:
   - Select multiple screenshots using checkboxes
   - Click "Merge Selected" to combine them
   - Use the download button to save individual or merged screenshots

## Development

- `src/`: Source files
  - `popup/`: Popup UI files
  - `utils/`: Utility functions
  - `background.js`: Background script
  - `content.js`: Content script for webpage interaction
- `assets/`: Extension icons and images
- `dist/`: Built extension files (created after build)

## Building

The extension uses Webpack for building:

- Development build: `npm run dev`
- Production build: `npm run build`

## License

MIT
