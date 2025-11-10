# Changelog - Hapi Study Notes Extension

All notable changes to this Chrome extension will be documented in this file.

## [1.0.0] - 2025-11-06

### 🎉 Initial Release

#### Added
- **Core Functionality**
  - One-click website analysis
  - AI-powered study notes generation
  - Firecrawl web scraping integration
  - Support for Anthropic Claude and OpenAI GPT

- **User Interface**
  - Beautiful gradient-based popup design
  - Settings panel for API key configuration
  - Loading states with animated spinner
  - Error handling with clear messages
  - Responsive layout

- **Features**
  - Current page URL display
  - AI provider selection (Anthropic/OpenAI)
  - Secure local storage for API keys
  - Study notes with structured format:
    - Main Topic/Title
    - Key Concepts (5-10 items)
    - Summary (2-3 paragraphs)
    - Important Details
    - Study Questions (3-5)
    - Additional Resources

- **Technical**
  - Manifest V3 compliance
  - Background service worker for API calls
  - Content script for page context
  - Message passing between components
  - Error handling and retry logic
  - Content truncation (50,000 chars)

- **Documentation**
  - Comprehensive README
  - Quick Start guide
  - Detailed Setup instructions
  - Testing guide with 33 test cases
  - Icon generation tools
  - Feature documentation

#### Technical Details
- **Manifest Version**: 3
- **Permissions**: activeTab, storage, scripting
- **APIs**: Firecrawl v1, Anthropic Messages API, OpenAI Chat Completions
- **Models**: Claude 3.5 Sonnet, GPT-4o
- **Max Tokens**: 4096

#### Known Limitations
- Sites with bot protection may fail to scrape
- Content truncated at 50,000 characters
- JavaScript-heavy SPAs may not scrape well
- Rate limits based on API tier

---

## Future Releases

### [1.1.0] - Planned
- [ ] Save notes to Hapi Academics app
- [ ] Export notes as PDF
- [ ] Export notes as Markdown
- [ ] Copy notes to clipboard
- [ ] Note history/cache

### [1.2.0] - Planned
- [ ] Custom prompt templates
- [ ] Batch processing multiple pages
- [ ] Browser action badge with status
- [ ] Keyboard shortcuts
- [ ] Dark mode support

### [1.3.0] - Planned
- [ ] Flashcard generation
- [ ] Highlight key terms on page
- [ ] Audio summary generation
- [ ] Integration with Supabase
- [ ] Sync notes across devices

### [2.0.0] - Future
- [ ] Full Hapi Academics integration
- [ ] Share notes with classmates
- [ ] Collaborative study groups
- [ ] AI-powered review scheduling
- [ ] Progress tracking
- [ ] Mobile companion app

---

## Version History Format

```
## [Version] - YYYY-MM-DD

### Added
- New features

### Changed
- Changes to existing features

### Fixed
- Bug fixes

### Removed
- Removed features

### Security
- Security improvements
```

---

**Last Updated**: November 6, 2025
