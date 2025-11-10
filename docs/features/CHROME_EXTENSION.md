# Chrome Extension - Study Notes Generator

## Overview

The Hapi Study Notes Chrome Extension allows users to convert any website into comprehensive, AI-generated study notes with a single click.

## Features

### Core Functionality
- **One-Click Analysis**: Convert any webpage to study notes
- **Firecrawl Integration**: Accurate web scraping and markdown conversion
- **AI-Powered**: Uses Claude (Anthropic) or GPT (OpenAI) for intelligent note generation
- **Secure Storage**: API keys stored locally in Chrome
- **Beautiful UI**: Modern gradient-based popup interface

### Study Notes Format
Generated notes include:
1. **Main Topic/Title**: Clear, concise title
2. **Key Concepts**: 5-10 most important ideas
3. **Summary**: 2-3 paragraph overview
4. **Important Details**: Facts, dates, definitions, formulas
5. **Study Questions**: 3-5 review questions
6. **Additional Resources**: Related topics to explore

## Technical Architecture

### Manifest V3 Structure
```
chrome-extension/
├── manifest.json          # Extension configuration
├── popup.html            # Popup UI
├── scripts/
│   ├── popup.js         # Popup logic & UI interactions
│   ├── background.js    # Service worker (API calls)
│   └── content.js       # Content script (page context)
├── icons/               # Extension icons (16, 48, 128px)
├── README.md           # User documentation
├── SETUP.md            # Setup instructions
└── TESTING.md          # Testing guide
```

### Data Flow
1. User clicks "Analyze Site" button
2. Popup sends message to background service worker
3. Background worker calls Firecrawl API to scrape page
4. Firecrawl returns markdown content
5. Background worker sends markdown + prompt to AI API
6. AI generates structured study notes
7. Results displayed in popup

### API Integrations

#### Firecrawl API
- **Endpoint**: `https://api.firecrawl.dev/v1/scrape`
- **Purpose**: Web scraping and HTML to markdown conversion
- **Features**: Main content extraction, clean markdown output
- **Rate Limits**: 500 credits/month (free tier)

#### Anthropic API (Claude)
- **Endpoint**: `https://api.anthropic.com/v1/messages`
- **Model**: `claude-3-5-sonnet-20241022`
- **Max Tokens**: 4096
- **Purpose**: Study notes generation

#### OpenAI API (GPT)
- **Endpoint**: `https://api.openai.com/v1/chat/completions`
- **Model**: `gpt-4o`
- **Max Tokens**: 4096
- **Purpose**: Alternative AI provider

## System Prompt

The extension uses a specialized prompt to convert markdown to study notes:

```
You are an expert educational content analyzer. Your task is to convert 
website content into comprehensive, well-structured study notes.

Given the markdown content from a website, create study notes that include:
1. Main Topic/Title
2. Key Concepts (5-10 most important)
3. Summary (2-3 paragraphs)
4. Important Details (bullet points)
5. Study Questions (3-5 questions)
6. Additional Resources

Format the output in a clear, readable way with proper headings and 
bullet points. Make it suitable for studying and review.
```

## Installation

### Prerequisites
- Chrome browser
- Firecrawl API key ([firecrawl.dev](https://firecrawl.dev))
- AI API key (Anthropic or OpenAI)

### Steps
1. Generate extension icons (see `icons/README.md`)
2. Load unpacked extension in Chrome (`chrome://extensions/`)
3. Configure API keys in extension settings
4. Start analyzing websites!

See `SETUP.md` for detailed instructions.

## Usage

### Basic Workflow
1. Navigate to any educational website
2. Click extension icon in toolbar
3. Click "🔍 Analyze Site" button
4. Wait 10-30 seconds for processing
5. View generated study notes

### Best Practices
- Use on text-heavy educational content
- Avoid homepages or navigation pages
- Focus on article/content pages
- Works best with structured educational content

### Recommended Sites
- Wikipedia articles
- MDN Web Docs
- Khan Academy
- Educational blogs
- Tutorial websites
- Academic papers (publicly accessible)

## Configuration

### Settings Panel
Access via "⚙️ Settings" button in popup:
- **Firecrawl API Key**: Required for web scraping
- **AI Provider**: Choose Anthropic or OpenAI
- **AI API Key**: Required for study notes generation

### Storage
- API keys stored in Chrome local storage
- Settings persist across browser sessions
- No data sent to external servers (except APIs)

## Error Handling

### Common Errors
1. **"Please configure your API keys"**
   - Solution: Enter API keys in Settings

2. **"Failed to scrape website"**
   - Cause: Bot protection, invalid URL, or API issue
   - Solution: Try different site or check API key

3. **"Failed to generate study notes"**
   - Cause: Invalid AI API key or quota exceeded
   - Solution: Verify API key, check credits, try other provider

## Performance

### Processing Time
- Typical: 10-30 seconds
- Long content: up to 60 seconds
- Factors: Page size, API response time, network speed

### Content Limits
- Markdown truncated to 50,000 characters
- Prevents API token limits
- Still captures main content for most pages

## Security & Privacy

### Data Handling
- ✅ API keys stored locally (Chrome storage)
- ✅ No data collection or tracking
- ✅ Direct API calls from browser
- ✅ No intermediary servers
- ✅ Open source code

### Permissions
- `activeTab`: Access current tab URL
- `storage`: Store API keys locally
- `scripting`: Inject content script
- `host_permissions`: Access websites for scraping

## Future Enhancements

### Planned Features
- [ ] Save notes to Hapi Academics app
- [ ] Export notes as PDF/Markdown
- [ ] Batch process multiple pages
- [ ] Custom prompt templates
- [ ] Flashcard generation from notes
- [ ] Supabase integration for cloud storage
- [ ] Share notes with classmates
- [ ] Highlight key terms on page
- [ ] Audio summary generation

### Integration with Main App
Future versions will integrate with the main Hapi Academics platform:
- Save notes to user's study library
- Sync across devices via Supabase
- Link notes to courses and assignments
- Track study progress
- AI-powered review scheduling

## Development

### Testing
See `TESTING.md` for comprehensive testing guide.

### Debugging
- **Popup**: Right-click icon → "Inspect popup"
- **Background**: `chrome://extensions/` → "service worker"
- **Content Script**: DevTools on any webpage

### Building
No build step required - extension runs directly from source.

### Deployment
For Chrome Web Store:
1. Generate production icons
2. Create promotional images
3. Write store description
4. Submit for review

## API Costs

### Firecrawl
- Free: 500 credits/month
- Pro: $20/month (5,000 credits)
- Each scrape = 1 credit

### Anthropic Claude
- Pay-as-you-go
- ~$0.01-0.03 per analysis
- Claude 3.5 Sonnet pricing

### OpenAI GPT
- Pay-as-you-go
- ~$0.01-0.02 per analysis
- GPT-4o pricing

## Limitations

### Technical Limitations
- Sites with heavy bot protection may fail
- JavaScript-heavy SPAs may not scrape well
- Content truncated at 50,000 characters
- Rate limits based on API tier

### Content Limitations
- Works best with educational content
- May struggle with highly technical content
- Non-text content (videos, images) not analyzed
- Paywalled content not accessible

## Support

### Documentation
- `README.md`: User guide
- `SETUP.md`: Installation instructions
- `TESTING.md`: Testing procedures
- `icons/README.md`: Icon generation guide

### Troubleshooting
See README.md troubleshooting section for common issues.

### Contact
For issues or questions, contact the Hapi Academics team.

## License

Private project - Part of Hapi Academics platform

## Version History

### v1.0.0 (Current)
- Initial release
- Firecrawl integration
- Anthropic & OpenAI support
- Study notes generation
- Settings management
- Error handling

---

**Built with ❤️ for Hapi Academics**
