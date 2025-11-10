// Content script for Hapi Study Notes Chrome Extension
// This script runs in the context of web pages

// Listen for messages from popup or background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getPageInfo') {
    // Get page information
    const pageInfo = {
      url: window.location.href,
      title: document.title,
      description: getMetaDescription(),
      mainContent: getMainContent()
    };
    sendResponse(pageInfo);
  }
  return true;
});

// Get meta description from page
function getMetaDescription() {
  const metaDescription = document.querySelector('meta[name="description"]');
  return metaDescription ? metaDescription.content : '';
}

// Get main content from page (simplified extraction)
function getMainContent() {
  // Try to find main content area
  const mainSelectors = [
    'main',
    'article',
    '[role="main"]',
    '.main-content',
    '#main-content',
    '.content',
    '#content'
  ];

  for (const selector of mainSelectors) {
    const element = document.querySelector(selector);
    if (element) {
      return element.innerText.slice(0, 5000); // Limit to 5000 chars
    }
  }

  // Fallback to body text
  return document.body.innerText.slice(0, 5000);
}

// Inject a subtle indicator that the extension is active (optional)
function showExtensionIndicator() {
  const indicator = document.createElement('div');
  indicator.id = 'hapi-study-notes-indicator';
  indicator.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 12px 20px;
    border-radius: 25px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 600;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    z-index: 999999;
    cursor: pointer;
    transition: all 0.3s ease;
    opacity: 0;
    animation: fadeIn 0.5s ease forwards;
  `;
  indicator.innerHTML = '📚 Hapi Study Notes Active';
  
  // Add fade in animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
  
  // Click to open popup
  indicator.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'openPopup' });
  });
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    indicator.style.opacity = '0';
    setTimeout(() => indicator.remove(), 300);
  }, 3000);
  
  document.body.appendChild(indicator);
}

// Show indicator when page loads (optional - can be removed if too intrusive)
// showExtensionIndicator();

console.log('Hapi Study Notes content script loaded');
