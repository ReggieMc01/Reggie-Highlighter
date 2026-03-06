# AI Translator

Popup-only Chrome extension for translating pasted or typed text using OpenRouter.

## What It Does
- Saves your OpenRouter API key and model in `chrome.storage.local` so you set it once.
- Lets you pick a target language from a dropdown.
- Sends your source text directly to OpenRouter from the extension popup.
- Uses a strict translation instruction so the model returns only translated text.
- Provides one-click copy for the translation output.

## Load The Extension
1. Open Chrome and go to `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select this folder.
4. Open the extension popup.
5. Paste OpenRouter API key and set model name (`openrouter/auto` is default).
6. Paste or type text, then click **Translate**.
7. Click **Copy Translation** to copy the result.

## No-Install Setup (OpenRouter)
1. Create account: `https://openrouter.ai/`
2. Create API key: `https://openrouter.ai/keys`
3. In the extension popup, paste the key.
4. Use `openrouter/auto` or choose a free-tier model from OpenRouter.

## Files
- `manifest.json`: extension config and permissions
- `popup.html`: popup layout
- `popup.js`: direct OpenRouter call and UI behavior
- `styles.css`: popup styling
- `content.js`: intentionally unused (popup-only architecture)
- `icons/`: extension icons
