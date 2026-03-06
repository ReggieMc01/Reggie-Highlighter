# ✨ Reggie Highlighter

A Chrome extension that uses AI to extract and highlight the most important words and phrases on any webpage.

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-blue?logo=googlechrome)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-green)

## Features


## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/ReggieMc01/Reggie-Highlighter.git
   ```
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** (top-right toggle)
4. Click **Load unpacked** and select the cloned folder
5. Click the extension icon and enter your [OpenAI API key](https://platform.openai.com/api-keys)

## Usage

1. Navigate to any webpage with text content
2. Click the **Reggie Highlighter** icon in the toolbar
3. Choose a mode:
   - **Selected Text** – First select/highlight text on the page, then click Analyze
   - **Entire Page** – Analyzes the full page content (up to 8,000 characters)
4. Click **🔍 Analyze & Highlight**
5. Key concepts are highlighted directly on the page and listed in the popup

### Highlight Colors

| Color | Importance | Score Range |
|-------|-----------|-------------|
| 🔵 Cyan | High | 0.7 – 1.0 |
| 🟡 Yellow | Medium | 0.4 – 0.69 |
| ⚪ Gray | Low | 0 – 0.39 |

## Project Structure

```
Reggie-Highlighter/
├── manifest.json           # Extension manifest (V3)
├── background/
│   └── background.js       # Service worker – handles OpenAI API calls
├── content/
│   ├── content.js          # Content script – applies highlights to pages
│   └── highlight.css       # Highlight and tooltip styles
├── popup/
│   ├── popup.html          # Extension popup UI
│   ├── popup.css           # Popup styles
│   └── popup.js            # Popup logic
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

## How It Works

1. **Text Extraction** – The popup grabs selected text (or full page text) via `chrome.scripting`
2. **AI Analysis** – Text is sent to OpenAI GPT-4o-mini with a structured prompt
3. **JSON Response** – The AI returns key concepts with importance scores (0–1) and explanations
4. **Highlighting** – The content script walks the DOM and wraps matching phrases in styled `<span>` elements
5. **Tooltips** – Hovering a highlight shows importance details

## API Key

This extension requires an [OpenAI API key](https://platform.openai.com/api-keys). The key is:

## License

MIT
>>>>>>> eaee833303917e4af8604747398e044c2a1bf1ef
