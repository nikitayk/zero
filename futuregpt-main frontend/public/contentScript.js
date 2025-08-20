// Minimal content script: collect page HTML for parsing within the side panel when user explicitly requests
// No automatic exfiltration: we only respond to explicit request messages from the extension

(() => {
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg?.type === 'ZT_GET_PAGE') {
      // Respond with minimal DOM snapshot
      const html = document.documentElement.outerHTML;
      sendResponse({ success: true, url: location.href, html });
      return true;
    }
  });
})();


