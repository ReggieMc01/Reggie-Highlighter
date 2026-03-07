// Listen for double-click to select a word and send it to the popup
document.addEventListener('dblclick', () => {
	const selection = window.getSelection();
	const word = selection ? selection.toString().trim() : '';
	if (word) {
		chrome.runtime.sendMessage({ type: 'WORD_SELECTED', word });
	}
});