# 📚 Hapi Study Notes - Chrome Extension

Convert any website into comprehensive study notes using AI and Firecrawl.

## Features

- 🔍 **One-Click Analysis**: Click "Analyze Site" to convert any webpage into study notes
- 🤖 **AI-Powered**: Uses Claude (Anthropic) or GPT (OpenAI) to generate structured study notes
- 📄 **Firecrawl Integration**: Accurately scrapes and converts web content to markdown
- 💾 **Secure Storage**: API keys stored locally in Chrome storage
- 🎨 **Beautiful UI**: Modern, gradient-based interface

## Installation

### 1. Get API Keys

You'll need two API keys:

1. **Firecrawl API Key**
   - Sign up at [firecrawl.dev](https://firecrawl.dev)
   - Get your API key from the dashboard

2. **AI API Key** (choose one):
   - **Anthropic (Claude)**: Sign up at [console.anthropic.com](https://console.anthropic.com)
   - **OpenAI (GPT)**: Sign up at [platform.openai.com](https://platform.openai.com)

### 2. Load Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `chrome-extension` folder from this project
5. The extension icon should appear in your toolbar

### 3. Configure API Keys

1. Click the extension icon in your toolbar
2. Click "⚙️ Settings"
3. Enter your Firecrawl API key
4. Select your AI provider (Anthropic or OpenAI)
5. Enter your AI API key
6. Click "💾 Save Settings"

## Usage

1. Navigate to any website you want to study
2. Click the Hapi Study Notes extension icon
3. Click "🔍 Analyze Site"
4. Wait for the analysis to complete (usually 10-30 seconds)
5. View your generated study notes!

## Study Notes Format

The AI generates study notes with the following structure:

- **Main Topic/Title**: Clear title for the content
- **Key Concepts**: 5-10 most important ideas
- **Summary**: 2-3 paragraph overview
- **Important Details**: Crucial facts, dates, definitions
- **Study Questions**: 3-5 questions for review
- **Additional Resources**: Related topics to explore

## Technical Details

### Architecture

- **Manifest V3**: Latest Chrome extension standard
- **Popup UI**: HTML/CSS/JS interface
- **Background Service Worker**: Handles API calls
- **Content Script**: Runs on web pages (minimal footprint)

### API Integrations

1. **Firecrawl API**: Scrapes website content and converts to markdown
   - Endpoint: `https://api.firecrawl.dev/v1/scrape`
   - Features: Main content extraction, markdown conversion

2. **Anthropic API**: Generates study notes with Claude
   - Model: `claude-3-5-sonnet-20241022`
   - Max tokens: 4096

3. **OpenAI API**: Alternative AI provider
   - Model: `gpt-4o`
   - Max tokens: 4096

### File Structure

```
chrome-extension/
├── manifest.json           # Extension configuration
├── popup.html             # Popup UI
├── scripts/
│   ├── popup.js          # Popup logic
│   ├── background.js     # Service worker (API calls)
│   └── content.js        # Content script
├── icons/                # Extension icons (16, 48, 128px)
└── README.md            # This file
```

## Privacy & Security

- ✅ API keys stored locally in Chrome storage (never sent to external servers except the respective APIs)
- ✅ No data collection or tracking
- ✅ Content only processed when you click "Analyze Site"
- ✅ All API calls made directly from your browser

## Troubleshooting

### "Please configure your API keys" error
- Make sure you've entered both Firecrawl and AI API keys in Settings
- Click "Save Settings" after entering keys

### "Failed to scrape website" error
- Some websites block scraping (e.g., sites with strict bot protection)
- Try a different website or check your Firecrawl API key

### "Failed to generate study notes" error
- Check your AI API key is valid
- Ensure you have API credits/quota remaining
- Try switching AI providers (Anthropic ↔ OpenAI)

### Extension not appearing
- Make sure Developer mode is enabled in `chrome://extensions/`
- Try reloading the extension
- Check browser console for errors

## Development

### Testing Locally

1. Make changes to extension files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the Hapi Study Notes extension
4. Test your changes

### Debugging

- **Popup**: Right-click extension icon → "Inspect popup"
- **Background**: Go to `chrome://extensions/` → Click "service worker"
- **Content Script**: Open DevTools on any webpage, check console

## Future Enhancements

- [ ] Save study notes to Hapi Academics app
- [ ] Export notes as PDF/Markdown
- [ ] Batch processing multiple pages
- [ ] Custom prompt templates
- [ ] Flashcard generation
- [ ] Integration with Supabase for cloud storage

## License

Private project - Part of Hapi Academics platform

## Support

For issues or questions, contact the Hapi Academics team.
