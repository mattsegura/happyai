// Popup script for Hapi Study Notes Chrome Extension

document.addEventListener('DOMContentLoaded', async () => {
  const analyzeBtn = document.getElementById('analyzeBtn');
  const settingsBtn = document.getElementById('settingsBtn');
  const saveBtn = document.getElementById('saveBtn');
  const settingsPanel = document.getElementById('settingsPanel');
  const currentUrlEl = document.getElementById('currentUrl');
  const statusEl = document.getElementById('status');
  const statusTextEl = document.getElementById('statusText');
  const resultEl = document.getElementById('result');
  const resultContentEl = document.getElementById('resultContent');
  const errorEl = document.getElementById('error');

  // Get current tab URL
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  currentUrlEl.textContent = tab.url;

  // Load saved settings
  const settings = await chrome.storage.local.get(['firecrawlKey', 'aiProvider', 'aiKey']);
  if (settings.firecrawlKey) {
    document.getElementById('firecrawlKey').value = settings.firecrawlKey;
  }
  if (settings.aiProvider) {
    document.getElementById('aiProvider').value = settings.aiProvider;
  }
  if (settings.aiKey) {
    document.getElementById('aiKey').value = settings.aiKey;
  }

  // Toggle settings panel
  settingsBtn.addEventListener('click', () => {
    settingsPanel.classList.toggle('show');
  });

  // Save settings
  saveBtn.addEventListener('click', async () => {
    const firecrawlKey = document.getElementById('firecrawlKey').value;
    const aiProvider = document.getElementById('aiProvider').value;
    const aiKey = document.getElementById('aiKey').value;

    await chrome.storage.local.set({
      firecrawlKey,
      aiProvider,
      aiKey
    });

    showError('✅ Settings saved successfully!', false);
    setTimeout(() => {
      errorEl.classList.remove('show');
    }, 2000);
  });

  // Analyze button click
  analyzeBtn.addEventListener('click', async () => {
    // Check if API keys are set
    const settings = await chrome.storage.local.get(['firecrawlKey', 'aiKey']);
    if (!settings.firecrawlKey || !settings.aiKey) {
      showError('⚠️ Please configure your API keys in Settings first!');
      settingsPanel.classList.add('show');
      return;
    }

    // Hide previous results/errors
    resultEl.classList.remove('show');
    errorEl.classList.remove('show');

    // Show loading status
    statusEl.classList.add('show');
    statusTextEl.textContent = 'Scraping website content...';
    analyzeBtn.disabled = true;

    try {
      // Send message to background script
      const response = await chrome.runtime.sendMessage({
        action: 'analyzeSite',
        url: tab.url
      });

      if (response.success) {
        // Show result
        statusEl.classList.remove('show');
        resultEl.classList.add('show');
        resultContentEl.textContent = response.studyNotes;
      } else {
        throw new Error(response.error || 'Failed to analyze site');
      }
    } catch (error) {
      console.error('Error analyzing site:', error);
      statusEl.classList.remove('show');
      showError(`❌ Error: ${error.message}`);
    } finally {
      analyzeBtn.disabled = false;
    }
  });

  function showError(message, isError = true) {
    errorEl.textContent = message;
    errorEl.classList.add('show');
    if (!isError) {
      errorEl.style.background = 'rgba(34, 197, 94, 0.2)';
      errorEl.style.borderColor = 'rgba(34, 197, 94, 0.4)';
    } else {
      errorEl.style.background = 'rgba(239, 68, 68, 0.2)';
      errorEl.style.borderColor = 'rgba(239, 68, 68, 0.4)';
    }
  }
});
