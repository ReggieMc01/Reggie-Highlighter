document.addEventListener('DOMContentLoaded', async () => {
  const analyzeBtn = document.getElementById('analyze-btn');
  const clearBtn = document.getElementById('clear-btn');
  const statusEl = document.getElementById('status');
  const resultsSection = document.getElementById('results-section');
  const resultsList = document.getElementById('results-list');
  const modeSelect = document.getElementById('mode-select');
  const setupSection = document.getElementById('setup-section');
  const saveKeyBtn = document.getElementById('save-key-btn');
  const apiKeyInput = document.getElementById('api-key-input');
  const settingsToggle = document.getElementById('settings-toggle');

  // Check for saved API key
  const { apiKey } = await chrome.storage.local.get('apiKey');
  if (!apiKey) {
    setupSection.classList.remove('hidden');
  }

  // Toggle settings
  settingsToggle.addEventListener('click', () => {
    setupSection.classList.toggle('hidden');
  });

  // Save API key
  saveKeyBtn.addEventListener('click', async () => {
    const key = apiKeyInput.value.trim();
    if (!key) return;
    await chrome.storage.local.set({ apiKey: key });
    apiKeyInput.value = '';
    showStatus('API key saved!', 'success');
    setTimeout(() => {
      setupSection.classList.add('hidden');
      hideStatus();
    }, 1500);
  });

  // Analyze button
  analyzeBtn.addEventListener('click', async () => {
    const { apiKey: savedKey } = await chrome.storage.local.get('apiKey');
    if (!savedKey) {
      setupSection.classList.remove('hidden');
      showStatus('Please set your OpenAI API key first.', 'error');
      return;
    }

    const mode = modeSelect.value;
    analyzeBtn.disabled = true;
    showStatus('⏳ Analyzing text...', 'loading');
    resultsSection.classList.add('hidden');

    try {
      // Get the active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      // Get text from the page
      const [{ result: text }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (mode) => {
          if (mode === 'selection') {
            const sel = window.getSelection().toString().trim();
            if (sel) return sel;
          }
          // Fallback to page body text
          return document.body.innerText.substring(0, 8000);
        },
        args: [mode]
      });

      if (!text || text.length < 10) {
        showStatus('Not enough text found. Select some text or switch to "Entire Page".', 'error');
        analyzeBtn.disabled = false;
        return;
      }

      // Send to background for AI analysis
      const response = await chrome.runtime.sendMessage({
        action: 'analyze',
        text: text.substring(0, 8000),
        apiKey: savedKey
      });

      if (response.error) {
        showStatus(`Error: ${response.error}`, 'error');
        analyzeBtn.disabled = false;
        return;
      }

      // Display results in popup
      displayResults(response.data);

      // Send highlights to content script
      await chrome.tabs.sendMessage(tab.id, {
        action: 'highlight',
        highlights: response.data.highlights
      });

      showStatus(`Found ${response.data.highlights.length} key concepts!`, 'success');
    } catch (err) {
      showStatus(`Error: ${err.message}`, 'error');
    }

    analyzeBtn.disabled = false;
  });

  // Clear highlights
  clearBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.tabs.sendMessage(tab.id, { action: 'clearHighlights' });
    resultsSection.classList.add('hidden');
    hideStatus();
  });

  function displayResults(data) {
    resultsList.innerHTML = '';
    if (!data.highlights || data.highlights.length === 0) return;

    data.highlights.forEach(item => {
      const li = document.createElement('li');

      const scoreClass = item.score >= 0.7 ? 'score-high' : item.score >= 0.4 ? 'score-mid' : 'score-low';
      const explanation = data.explanations?.[item.text] || '';

      li.innerHTML = `
        <span class="score-badge ${scoreClass}">${item.score.toFixed(1)}</span>
        <div>
          <div class="result-text">${escapeHtml(item.text)}</div>
          ${explanation ? `<div class="result-explanation">${escapeHtml(explanation)}</div>` : ''}
        </div>
      `;
      resultsList.appendChild(li);
    });

    resultsSection.classList.remove('hidden');
  }

  function showStatus(msg, type) {
    statusEl.textContent = msg;
    statusEl.className = `status ${type}`;
    statusEl.classList.remove('hidden');
  }

  function hideStatus() {
    statusEl.classList.add('hidden');
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
});
