document.addEventListener('DOMContentLoaded', async () => {
  const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
  const DEFAULT_MODEL = 'openrouter/auto';

  const apiKeyInput = document.getElementById('apiKey');
  const modelInput = document.getElementById('model');
  const langSelect = document.getElementById('language');
  const sourceInput = document.getElementById('sourceText');
  const resultBox = document.getElementById('result');
  const translateBtn = document.getElementById('translateBtn');
  const toggleKeyBtn = document.getElementById('toggleKeyBtn');
  const copyBtn = document.getElementById('copyBtn');
  const statusEl = document.getElementById('status');

  const saved = await chrome.storage.local.get(['openrouterKey', 'modelName', 'targetLang']);
  apiKeyInput.value = saved.openrouterKey || '';
  modelInput.value = saved.modelName || DEFAULT_MODEL;
  if (saved.targetLang) langSelect.value = saved.targetLang;

  apiKeyInput.addEventListener('input', () => {
    chrome.storage.local.set({ openrouterKey: normalizeApiKey(apiKeyInput.value) });
  });

  toggleKeyBtn.addEventListener('click', () => {
    const showKey = apiKeyInput.type === 'password';
    apiKeyInput.type = showKey ? 'text' : 'password';
    toggleKeyBtn.textContent = showKey ? 'Hide' : 'Show';
  });

  modelInput.addEventListener('input', () => {
    chrome.storage.local.set({ modelName: modelInput.value.trim() });
  });

  langSelect.addEventListener('change', () => {
    chrome.storage.local.set({ targetLang: langSelect.value });
  });

  translateBtn.addEventListener('click', async () => {
    const apiKey = normalizeApiKey(apiKeyInput.value);
    const modelName = modelInput.value.trim();
    const targetLang = langSelect.value;
    const sourceText = sourceInput.value.trim();

    if (!apiKey) {
      setStatus('Enter your OpenRouter API key first.', true);
      return;
    }
    if (!modelName) {
      setStatus('Enter an Ollama model name first.', true);
      return;
    }
    if (!sourceText) {
      setStatus('Enter text to translate first.', true);
      return;
    }

    await chrome.storage.local.set({ openrouterKey: apiKey, modelName, targetLang });
    apiKeyInput.value = apiKey;
    setLoading(true);
    setStatus('Translating...', false);

    try {
      const translated = await translateText(sourceText, targetLang, apiKey, modelName);
      resultBox.value = translated;
      copyBtn.disabled = translated.length === 0;
      setStatus('Translation complete.', false);
    } catch (error) {
      resultBox.value = '';
      copyBtn.disabled = true;
      setStatus(error.message || 'Translation failed.', true);
    } finally {
      setLoading(false);
    }
  });

  copyBtn.addEventListener('click', async () => {
    if (!resultBox.value.trim()) return;
    try {
      await navigator.clipboard.writeText(resultBox.value);
      setStatus('Copied to clipboard.', false);
    } catch {
      setStatus('Copy failed. Select and copy manually.', true);
    }
  });

  function setLoading(isLoading) {
    translateBtn.disabled = isLoading;
    translateBtn.textContent = isLoading ? 'Translating...' : 'Translate';
  }

  function setStatus(message, isError) {
    statusEl.textContent = message;
    statusEl.style.color = isError ? '#fca5a5' : '#93c5fd';
  }

  async function translateText(text, targetLang, apiKey, modelName) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://github.com',
        'X-Title': 'AI Translator Extension'
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          {
            role: 'system',
            content: 'You are a translation engine. Return only translated text with no notes or labels.'
          },
          {
            role: 'user',
            content: `Translate this text to ${targetLang}:\n\n${text}`
          }
        ],
        temperature: 0.1
      })
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid OpenRouter API key. Create one at openrouter.ai/keys.');
      }
      if (response.status === 402) {
        throw new Error('OpenRouter credits are required for this model. Pick a free model in your OpenRouter dashboard.');
      }
      const errorMessage = await readProviderError(response);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    const translated = readMessageText(data)?.trim();
    if (!translated) throw new Error('Empty response from provider.');
    return translated;
  }

  function readMessageText(data) {
    const messageContent = data?.choices?.[0]?.message?.content;
    if (typeof messageContent === 'string') return messageContent;
    if (Array.isArray(messageContent)) {
      return messageContent
        .map(part => (typeof part?.text === 'string' ? part.text : ''))
        .join('');
    }
    return '';
  }

  async function readProviderError(response) {
    try {
      const data = await response.json();
      const message = data?.error?.message || data?.message || data?.error;
      if (message) return message;
    } catch {
      // Ignore JSON parse failures and return generic status.
    }
    return `Provider error (${response.status}).`;
  }

  function normalizeApiKey(value) {
    return value
      .trim()
      .replace(/^['\"]+|['\"]+$/g, '')
      .replace(/\s+/g, '');
  }
});