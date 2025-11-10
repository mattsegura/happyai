// Background service worker for Hapi Study Notes Chrome Extension

// System prompt for converting markdown to study notes
const STUDY_NOTES_PROMPT = `You are an expert educational content analyzer. Your task is to convert website content into comprehensive, well-structured study notes.

Given the markdown content from a website, create study notes that include:

1. **Main Topic/Title**: A clear, concise title for the content
2. **Key Concepts**: List the 5-10 most important concepts or ideas
3. **Summary**: A 2-3 paragraph summary of the main content
4. **Important Details**: Bullet points of crucial facts, dates, definitions, or formulas
5. **Study Questions**: 3-5 questions that would help someone study this material
6. **Additional Resources**: If mentioned, list any related topics or resources to explore

Format the output in a clear, readable way with proper headings and bullet points. Make it suitable for studying and review.

Focus on educational value and clarity. If the content is not educational (e.g., a shopping site), explain what the site is about and extract any useful information that could be learned from it.`;

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyzeSite') {
    handleAnalyzeSite(request.url)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep message channel open for async response
  }
});

async function handleAnalyzeSite(url) {
  try {
    // Get API keys from storage
    const settings = await chrome.storage.local.get(['firecrawlKey', 'aiProvider', 'aiKey']);
    
    if (!settings.firecrawlKey) {
      throw new Error('Firecrawl API key not configured');
    }
    if (!settings.aiKey) {
      throw new Error('AI API key not configured');
    }

    // Step 1: Scrape website with Firecrawl
    console.log('Scraping website:', url);
    const markdown = await scrapeWithFirecrawl(url, settings.firecrawlKey);
    
    // Step 2: Generate study notes with AI
    console.log('Generating study notes...');
    const studyNotes = await generateStudyNotes(
      markdown, 
      settings.aiProvider || 'anthropic',
      settings.aiKey
    );

    return {
      success: true,
      studyNotes,
      markdown // Include original markdown for reference
    };
  } catch (error) {
    console.error('Error in handleAnalyzeSite:', error);
    throw error;
  }
}

// Utility function to add timeout to fetch requests
async function fetchWithTimeout(url, options, timeoutMs = 90000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out after ' + (timeoutMs / 1000) + ' seconds');
    }
    throw error;
  }
}

// Utility function to sleep for retry logic
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function scrapeWithFirecrawl(url, apiKey, retries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Scraping attempt ${attempt}/${retries} for: ${url}`);
      
      const response = await fetchWithTimeout('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          url: url,
          formats: ['markdown'],
          onlyMainContent: true,
          waitFor: 5000, // Wait 5 seconds for page to load
          timeout: 60000 // Allow Firecrawl 60 seconds to complete the scrape
        })
      }, 90000); // 90 second timeout for the entire request

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `Firecrawl API error: ${response.status}`;
        
        // Check if it's a timeout error that we should retry
        if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
          lastError = new Error(errorMessage);
          if (attempt < retries) {
            const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
            console.log(`Timeout error, retrying in ${backoffMs}ms...`);
            await sleep(backoffMs);
            continue;
          }
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (!data.success || !data.data?.markdown) {
        throw new Error('Failed to extract markdown from website');
      }

      console.log(`Successfully scraped website on attempt ${attempt}`);
      return data.data.markdown;
      
    } catch (error) {
      console.error(`Firecrawl error (attempt ${attempt}/${retries}):`, error);
      lastError = error;
      
      // Check if it's a retryable error
      const isRetryable = error.message.includes('timeout') || 
                          error.message.includes('timed out') ||
                          error.message.includes('network') ||
                          error.message.includes('fetch');
      
      if (isRetryable && attempt < retries) {
        const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        console.log(`Retrying in ${backoffMs}ms...`);
        await sleep(backoffMs);
        continue;
      }
      
      // If not retryable or out of retries, throw
      break;
    }
  }
  
  // If we get here, all retries failed
  const errorMessage = lastError?.message || 'Unknown error';
  if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
    throw new Error(`Website took too long to load. This can happen with slow or complex websites. Please try again or try a different page.`);
  }
  throw new Error(`Failed to scrape website: ${errorMessage}`);
}

async function generateStudyNotes(markdown, provider, apiKey) {
  if (provider === 'anthropic') {
    return generateWithAnthropic(markdown, apiKey);
  } else if (provider === 'openai') {
    return generateWithOpenAI(markdown, apiKey);
  } else if (provider === 'gemini') {
    return generateWithGemini(markdown, apiKey);
  } else {
    throw new Error(`Unsupported AI provider: ${provider}`);
  }
}

async function generateWithAnthropic(markdown, apiKey) {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: `${STUDY_NOTES_PROMPT}\n\n---\n\nWebsite Content (Markdown):\n\n${markdown.slice(0, 50000)}`
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.content || !data.content[0]?.text) {
      throw new Error('Invalid response from Anthropic API');
    }

    return data.content[0].text;
  } catch (error) {
    console.error('Anthropic error:', error);
    throw new Error(`Failed to generate study notes with Claude: ${error.message}`);
  }
}

async function generateWithOpenAI(markdown, apiKey) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: STUDY_NOTES_PROMPT
          },
          {
            role: 'user',
            content: `Website Content (Markdown):\n\n${markdown.slice(0, 50000)}`
          }
        ],
        max_tokens: 4096,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI API');
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI error:', error);
    throw new Error(`Failed to generate study notes with GPT: ${error.message}`);
  }
}

async function generateWithGemini(markdown, apiKey) {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${STUDY_NOTES_PROMPT}\n\n---\n\nWebsite Content (Markdown):\n\n${markdown.slice(0, 100000)}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response from Gemini API');
    }

    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini error:', error);
    throw new Error(`Failed to generate study notes with Gemini: ${error.message}`);
  }
}

// Log when service worker starts
console.log('Hapi Study Notes background service worker started');
