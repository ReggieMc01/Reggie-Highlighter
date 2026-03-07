document.addEventListener('DOMContentLoaded', async () => {
  const apiKeyInput = document.getElementById('api-key-input');
  const toggleKeyBtn = document.getElementById('toggle-key-btn');
  const languageSelect = document.getElementById('language-select');
  const wordInput = document.getElementById('word-input');
  const translateBtn = document.getElementById('translate-btn');
  const resultBox = document.getElementById('result');
  const copyBtn = document.getElementById('copy-btn');
  const statusEl = document.getElementById('status');

  // Load saved API key and language
  const saved = await chrome.storage.local.get(['openrouterKey', 'targetLang']);
  apiKeyInput.value = saved.openrouterKey || '';
  if (saved.targetLang) languageSelect.value = saved.targetLang;

  apiKeyInput.addEventListener('input', () => {
    chrome.storage.local.set({ openrouterKey: apiKeyInput.value.trim() });
  });

  toggleKeyBtn.addEventListener('click', () => {
    const showKey = apiKeyInput.type === 'password';
    apiKeyInput.type = showKey ? 'text' : 'password';
    toggleKeyBtn.textContent = showKey ? 'Hide' : 'Show';
  });

  languageSelect.addEventListener('change', () => {
    chrome.storage.local.set({ targetLang: languageSelect.value });
  });

  translateBtn.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value.trim();
    const targetLang = languageSelect.value;
    const word = wordInput.value.trim();
    if (!apiKey) {
      setStatus('Enter your OpenRouter API key first.', true);
      return;
    }
    if (!word) {
      setStatus('Enter or select a word to translate.', true);
      return;
    }
    setLoading(true);
    setStatus('Translating...', false);
    try {
      const translated = await translateWord(word, targetLang, apiKey);
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

  async function translateWord(word, targetLang, apiKey) {
    const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://github.com',
        'X-Title': 'AI Translator Extension'
      },
      body: JSON.stringify({
        model: 'openrouter/auto',
        messages: [
          {
            role: 'system',
            content: 'You are a translation engine. Return only translated text with no notes or labels.'
          },
          {
            role: 'user',
            content: `Translate this word to ${targetLang}:\n\n${word}`
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
      throw new Error('Translation failed.');
    }

    const data = await response.json();
    const translated = data.choices?.[0]?.message?.content?.trim();
    if (!translated) throw new Error('Empty response from provider.');
    return translated;
  }

  // Listen for selected word from content script
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'WORD_SELECTED' && msg.word) {
      wordInput.value = msg.word;
      setStatus('Word loaded from page selection.', false);
    }
  });
});
