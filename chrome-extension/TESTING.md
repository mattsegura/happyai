# 🧪 Testing Guide - Hapi Study Notes Extension

## Pre-Testing Checklist

Before testing, ensure you have:
- [ ] Generated the three PNG icon files (16, 48, 128)
- [ ] Valid Firecrawl API key
- [ ] Valid AI API key (Anthropic or OpenAI)
- [ ] Chrome browser with Developer mode enabled
- [ ] Extension loaded in Chrome

## Installation Testing

### ✅ Test 1: Load Extension
1. Go to `chrome://extensions/`
2. Enable Developer mode
3. Click "Load unpacked"
4. Select the `chrome-extension` folder
5. **Expected**: Extension appears in list without errors

### ✅ Test 2: Extension Icon
1. Look for the extension icon in Chrome toolbar
2. **Expected**: Icon is visible (or default puzzle piece if PNGs not generated)

### ✅ Test 3: Popup Opens
1. Click the extension icon
2. **Expected**: Popup window opens with gradient background and UI

## Configuration Testing

### ✅ Test 4: Settings Panel
1. Open extension popup
2. Click "⚙️ Settings" button
3. **Expected**: Settings panel expands showing input fields

### ✅ Test 5: Save API Keys
1. Enter Firecrawl API key
2. Select AI provider (Anthropic or OpenAI)
3. Enter AI API key
4. Click "💾 Save Settings"
5. **Expected**: Success message appears
6. Close and reopen popup
7. Click Settings
8. **Expected**: API keys are still there (saved)

### ✅ Test 6: Missing API Keys Warning
1. Clear all API keys from settings
2. Click "🔍 Analyze Site" without saving keys
3. **Expected**: Error message asking to configure API keys
4. **Expected**: Settings panel automatically opens

## Functional Testing

### ✅ Test 7: URL Display
1. Navigate to any website
2. Open extension popup
3. **Expected**: Current page URL is displayed correctly

### ✅ Test 8: Basic Analysis - Wikipedia
1. Go to: https://en.wikipedia.org/wiki/Artificial_intelligence
2. Open extension popup
3. Ensure API keys are configured
4. Click "🔍 Analyze Site"
5. **Expected**: 
   - Loading spinner appears
   - Status text shows "Scraping website content..."
   - After 10-30 seconds, study notes appear
   - Notes include: Title, Key Concepts, Summary, Details, Questions

### ✅ Test 9: Analysis - Technical Documentation
1. Go to: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide
2. Open extension popup
3. Click "🔍 Analyze Site"
4. **Expected**: Study notes generated successfully

### ✅ Test 10: Analysis - Blog Post
1. Go to any educational blog post
2. Open extension popup
3. Click "🔍 Analyze Site"
4. **Expected**: Study notes generated successfully

### ✅ Test 11: Different AI Providers
1. Analyze a site with Anthropic (Claude)
2. Go to Settings, switch to OpenAI
3. Analyze the same site
4. **Expected**: Both providers generate study notes (may differ in style)

## Error Handling Testing

### ✅ Test 12: Invalid Firecrawl API Key
1. Enter an invalid Firecrawl API key
2. Try to analyze a site
3. **Expected**: Error message about Firecrawl API failure

### ✅ Test 13: Invalid AI API Key
1. Enter valid Firecrawl key but invalid AI key
2. Try to analyze a site
3. **Expected**: Error message about AI API failure

### ✅ Test 14: Protected Website
1. Try to analyze a site with bot protection (e.g., some news sites)
2. **Expected**: Error message about scraping failure

### ✅ Test 15: Very Long Content
1. Analyze a very long article (10,000+ words)
2. **Expected**: 
   - Processing takes longer
   - Study notes still generated (content truncated to 50,000 chars)

### ✅ Test 16: Non-Educational Content
1. Analyze a shopping site (e.g., Amazon product page)
2. **Expected**: AI explains what the site is about and extracts any useful info

## UI/UX Testing

### ✅ Test 17: Popup Responsiveness
1. Open popup on different screen sizes
2. **Expected**: UI remains readable and functional

### ✅ Test 18: Loading States
1. Click "Analyze Site"
2. Observe loading animation
3. **Expected**: 
   - Spinner animates smoothly
   - Status text is visible
   - Button is disabled during processing

### ✅ Test 19: Result Display
1. Generate study notes
2. **Expected**:
   - Results appear in white box
   - Text is readable
   - Scrollable if content is long

### ✅ Test 20: Error Display
1. Trigger an error (invalid API key)
2. **Expected**:
   - Error message appears in red box
   - Error is clear and actionable

## Performance Testing

### ✅ Test 21: Processing Time
1. Analyze 5 different sites
2. Record processing times
3. **Expected**: 
   - Most sites: 10-30 seconds
   - Very long content: up to 60 seconds

### ✅ Test 22: Multiple Analyses
1. Analyze 5 sites in a row
2. **Expected**: 
   - Each analysis completes successfully
   - No memory leaks or slowdowns

### ✅ Test 23: Background Worker
1. Open `chrome://extensions/`
2. Click "service worker" under the extension
3. Analyze a site
4. **Expected**: Console logs show processing steps without errors

## Browser Compatibility

### ✅ Test 24: Chrome Versions
Test on:
- [ ] Chrome Stable (latest)
- [ ] Chrome Beta (if available)
- **Expected**: Works on all versions

### ✅ Test 25: Different Operating Systems
Test on:
- [ ] macOS
- [ ] Windows
- [ ] Linux
- **Expected**: Works on all platforms

## Security Testing

### ✅ Test 26: API Key Storage
1. Save API keys
2. Open Chrome DevTools
3. Go to Application > Storage > Local Storage
4. Look for chrome-extension://[extension-id]
5. **Expected**: API keys are stored (visible in storage, but not sent anywhere except respective APIs)

### ✅ Test 27: Network Requests
1. Open Chrome DevTools Network tab
2. Analyze a site
3. **Expected**: 
   - Request to firecrawl.dev
   - Request to anthropic.com or openai.com
   - No requests to unknown domains

## Content Script Testing

### ✅ Test 28: Content Script Injection
1. Navigate to any website
2. Open DevTools Console
3. **Expected**: See "Hapi Study Notes content script loaded" message

### ✅ Test 29: No Page Interference
1. Navigate to various websites
2. **Expected**: 
   - Extension doesn't break page functionality
   - No visible changes to pages
   - No console errors from content script

## Edge Cases

### ✅ Test 30: Empty Page
1. Navigate to `about:blank`
2. Try to analyze
3. **Expected**: Graceful error or minimal content message

### ✅ Test 31: Local File
1. Open a local HTML file (file://)
2. Try to analyze
3. **Expected**: Works or shows appropriate error

### ✅ Test 32: HTTPS vs HTTP
1. Test on both HTTP and HTTPS sites
2. **Expected**: Both work correctly

### ✅ Test 33: Special Characters in URL
1. Test on URLs with special characters, query params
2. **Expected**: URL handled correctly

## Regression Testing

After any code changes, re-run:
- [ ] Test 5: Save API Keys
- [ ] Test 8: Basic Analysis
- [ ] Test 11: Different AI Providers
- [ ] Test 18: Loading States

## Known Limitations

Document any known issues:
- Sites with heavy bot protection may fail
- Very large pages (>50,000 chars) are truncated
- Some JavaScript-heavy SPAs may not scrape well
- Rate limits apply based on API tier

## Bug Report Template

If you find a bug, document:
```
**Bug**: [Brief description]
**Steps to Reproduce**:
1. 
2. 
3. 

**Expected**: [What should happen]
**Actual**: [What actually happened]
**Browser**: Chrome [version]
**OS**: [macOS/Windows/Linux]
**Console Errors**: [Any errors from DevTools]
```

## Success Criteria

Extension is ready for use when:
- ✅ All installation tests pass
- ✅ All functional tests pass
- ✅ At least 3 different websites analyzed successfully
- ✅ Both AI providers work
- ✅ Error handling works correctly
- ✅ No console errors during normal operation

---

**Testing completed on**: [Date]
**Tested by**: [Name]
**Result**: [Pass/Fail]
