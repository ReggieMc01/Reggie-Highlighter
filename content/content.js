// Reggie Highlighter – Content Script
(() => {
  const HIGHLIGHT_CLASS = 'reggie-highlight';
  const TOOLTIP_CLASS = 'reggie-tooltip';

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'highlight') {
      clearHighlights();
      applyHighlights(message.highlights);
      sendResponse({ success: true });
    } else if (message.action === 'clearHighlights') {
      clearHighlights();
      sendResponse({ success: true });
    }
  });

  function applyHighlights(highlights) {
    if (!highlights || highlights.length === 0) return;

    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          // Skip script, style, and already-highlighted nodes
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          const tag = parent.tagName;
          if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT' || tag === 'TEXTAREA' || tag === 'INPUT') {
            return NodeFilter.FILTER_REJECT;
          }
          if (parent.closest(`.${HIGHLIGHT_CLASS}`)) {
            return NodeFilter.FILTER_REJECT;
          }
          if (node.textContent.trim().length === 0) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    // Collect all text nodes first to avoid mutation issues
    const textNodes = [];
    while (walker.nextNode()) {
      textNodes.push(walker.currentNode);
    }

    // Sort highlights by text length descending to match longer phrases first
    const sorted = [...highlights].sort((a, b) => b.text.length - a.text.length);

    for (const node of textNodes) {
      highlightInNode(node, sorted);
    }
  }

  function highlightInNode(textNode, highlights) {
    const text = textNode.textContent;
    const ranges = [];

    for (const item of highlights) {
      const regex = new RegExp(`\\b(${escapeRegex(item.text)})\\b`, 'gi');
      let match;
      while ((match = regex.exec(text)) !== null) {
        // Check no overlap with existing ranges
        const start = match.index;
        const end = start + match[0].length;
        const overlaps = ranges.some(r => start < r.end && end > r.start);
        if (!overlaps) {
          ranges.push({ start, end, score: item.score, text: item.text, matched: match[0] });
        }
      }
    }

    if (ranges.length === 0) return;

    // Sort by position
    ranges.sort((a, b) => a.start - b.start);

    const fragment = document.createDocumentFragment();
    let lastIndex = 0;

    for (const range of ranges) {
      // Text before this highlight
      if (range.start > lastIndex) {
        fragment.appendChild(document.createTextNode(text.substring(lastIndex, range.start)));
      }

      // The highlight span
      const span = document.createElement('span');
      span.className = HIGHLIGHT_CLASS;
      span.textContent = range.matched;
      span.dataset.score = range.score;
      span.dataset.phrase = range.text;

      // Color based on score
      if (range.score >= 0.7) {
        span.classList.add('reggie-high');
      } else if (range.score >= 0.4) {
        span.classList.add('reggie-mid');
      } else {
        span.classList.add('reggie-low');
      }

      // Tooltip
      span.addEventListener('mouseenter', showTooltip);
      span.addEventListener('mouseleave', hideTooltip);

      fragment.appendChild(span);
      lastIndex = range.end;
    }

    // Remaining text
    if (lastIndex < text.length) {
      fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
    }

    textNode.parentNode.replaceChild(fragment, textNode);
  }

  function showTooltip(e) {
    hideTooltip(); // remove any existing

    const span = e.target;
    const phrase = span.dataset.phrase;
    const score = parseFloat(span.dataset.score);

    const tooltip = document.createElement('div');
    tooltip.className = TOOLTIP_CLASS;
    tooltip.innerHTML = `<strong>${escapeHtml(phrase)}</strong><br>Importance: ${(score * 100).toFixed(0)}%`;

    document.body.appendChild(tooltip);

    const rect = span.getBoundingClientRect();
    tooltip.style.left = `${rect.left + window.scrollX}px`;
    tooltip.style.top = `${rect.bottom + window.scrollY + 6}px`;
  }

  function hideTooltip() {
    document.querySelectorAll(`.${TOOLTIP_CLASS}`).forEach(el => el.remove());
  }

  function clearHighlights() {
    hideTooltip();
    const highlights = document.querySelectorAll(`.${HIGHLIGHT_CLASS}`);
    highlights.forEach(span => {
      const textNode = document.createTextNode(span.textContent);
      span.parentNode.replaceChild(textNode, span);
    });
    // Merge adjacent text nodes
    document.body.normalize();
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
})();
