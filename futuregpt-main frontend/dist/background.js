// Background script for zeroTrace extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('zeroTrace extension installed');
  // Ensure side panel opens when the user clicks the action icon
  if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((error) => {
      console.error('Error setting panel behavior:', error);
    });
  }
});

// Also ensure behavior is set on browser startup
chrome.runtime.onStartup?.addListener(() => {
  if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((error) => {
      console.error('Error setting panel behavior on startup:', error);
    });
  }
});

// Handle API requests to bypass CORS
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'CAPTURE_SCREEN') {
    chrome.tabs.captureVisibleTab({ format: 'png' }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
      } else {
        sendResponse({ success: true, dataUrl });
      }
    });
    return true;
  }
  if (request.type === 'API_REQUEST') {
    fetch(request.url, request.options)
      .then(response => {
        if (request.stream) {
          // Handle streaming response
          const reader = response.body.getReader();
          const stream = new ReadableStream({
            start(controller) {
              function pump() {
                return reader.read().then(({ done, value }) => {
                  if (done) {
                    controller.close();
                    return;
                  }
                  controller.enqueue(value);
                  return pump();
                });
              }
              return pump();
            }
          });
          
          return new Response(stream).text();
        } else {
          return response.json();
        }
      })
      .then(data => sendResponse({ success: true, data }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    
    return true; // Keep message channel open for async response
  }
});