const SYSTEM_PROMPT = `You are a precise text analysis engine. Given a paragraph, extract the most important words and multi-word phrases (2–4 words).

Rules:
- Return 3–7 highlights unless the text is extremely short.
- Order by importance (most important first).
- Scores reflect importance: 1 = critical concept, 0 = minor concept.
- Include a 1-sentence explanation for each highlight.
- Do NOT rewrite or summarize the paragraph; only extract key concepts.
- Output valid JSON only, no markdown fences.

Output format:
{
  "highlights": [
    {"text": "important word or phrase", "score": 0.95},
    {"text": "another phrase", "score": 0.7}
  ],
  "explanations": {
    "important word or phrase": "1-sentence explanation",
    "another phrase": "1-sentence explanation"
  }
}`;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'analyze') {
    analyzeText(message.text, message.apiKey)
      .then(data => sendResponse({ data }))
      .catch(err => sendResponse({ error: err.message }));
    return true; // keep channel open for async response
  }
});

async function analyzeText(text, apiKey) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      max_tokens: 1024,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Analyze this text and extract key concepts:\n\n"${text}"` }
      ]
    })
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error?.message || `OpenAI API error: ${response.status}`);
  }

  const result = await response.json();
  const content = result.choices[0].message.content.trim();

  // Strip any markdown fences if present
  const cleaned = content.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '');

  const data = JSON.parse(cleaned);

  // Validate structure
  if (!data.highlights || !Array.isArray(data.highlights)) {
    throw new Error('Invalid response structure from AI');
  }

  return data;
}
