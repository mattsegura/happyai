# 🚀 Quick Setup Guide - Hapi Study Notes Extension

## Prerequisites

Before you start, you'll need:
- Google Chrome browser
- Firecrawl API key
- AI API key (Anthropic Claude or OpenAI GPT)

## Step 1: Get Your API Keys

### Firecrawl API Key
1. Go to [firecrawl.dev](https://firecrawl.dev)
2. Sign up for a free account
3. Navigate to your dashboard
4. Copy your API key

### AI API Key (Choose One)

**Option A: Anthropic Claude (Recommended)**
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up and verify your account
3. Go to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-ant-`)

**Option B: OpenAI GPT**
1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up and add payment method
3. Go to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-`)

## Step 2: Generate Extension Icons

1. Open `icons/generate-icons.html` in your browser
2. Click "Download All Icons"
3. Save the three PNG files in the `icons/` folder:
   - `icon16.png`
   - `icon48.png`
   - `icon128.png`

**Alternative:** See `icons/README.md` for other methods to generate icons.

## Step 3: Load Extension in Chrome

1. Open Chrome and navigate to: `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **"Load unpacked"**
4. Select the `chrome-extension` folder from this project
5. The extension should now appear in your extensions list

## Step 4: Configure API Keys

1. Click the Hapi Study Notes extension icon in your Chrome toolbar
2. Click **"⚙️ Settings"** button
3. Enter your **Firecrawl API key**
4. Select your **AI provider** (Anthropic or OpenAI)
5. Enter your **AI API key**
6. Click **"💾 Save Settings"**

## Step 5: Test the Extension

1. Navigate to any educational website (e.g., Wikipedia article, blog post, documentation)
2. Click the extension icon
3. Click **"🔍 Analyze Site"**
4. Wait 10-30 seconds for processing
5. View your generated study notes!

## Recommended Test Sites

Try these sites to test the extension:
- Wikipedia articles: https://en.wikipedia.org/wiki/Artificial_intelligence
- MDN Web Docs: https://developer.mozilla.org/en-US/docs/Web/JavaScript
- Khan Academy: https://www.khanacademy.org/
- Any educational blog or article

## Troubleshooting

### Extension not showing up
- Make sure Developer mode is enabled
- Try reloading the extension
- Check for errors in `chrome://extensions/`

### "Please configure your API keys" error
- Open Settings in the extension popup
- Make sure both API keys are entered
- Click "Save Settings"

### "Failed to scrape website" error
- Some sites block scraping (e.g., sites with bot protection)
- Try a different website
- Check your Firecrawl API key is valid

### "Failed to generate study notes" error
- Verify your AI API key is correct
- Check you have API credits remaining
- Try switching AI providers

### Icons not showing
- Generate the PNG icons using the HTML tool
- Make sure they're named correctly (icon16.png, icon48.png, icon128.png)
- Reload the extension

## Usage Tips

### Best Sites to Analyze
✅ Educational articles and blog posts
✅ Documentation pages
✅ Wikipedia articles
✅ Tutorial websites
✅ Academic papers (if publicly accessible)

### Sites That May Not Work Well
❌ Sites with heavy JavaScript (SPAs)
❌ Sites with bot protection (Cloudflare, etc.)
❌ Paywalled content
❌ Sites requiring login

### Getting Better Results
- Use on text-heavy educational content
- Avoid analyzing homepages or navigation pages
- Focus on article/content pages
- The AI works best with structured, educational content

## API Costs

### Firecrawl
- Free tier: 500 credits/month
- Each scrape uses 1 credit
- Paid plans available for more usage

### Anthropic Claude
- Pay-as-you-go pricing
- ~$0.01-0.03 per analysis (depending on content length)
- Claude 3.5 Sonnet used by default

### OpenAI GPT
- Pay-as-you-go pricing
- ~$0.01-0.02 per analysis
- GPT-4o used by default

## Security & Privacy

- ✅ All API keys stored locally in Chrome storage
- ✅ No data sent to Hapi servers
- ✅ Direct API calls from your browser
- ✅ No tracking or analytics
- ✅ Open source - inspect the code yourself

## Next Steps

Once you have the extension working:
1. Try analyzing different types of content
2. Experiment with both AI providers to see which you prefer
3. Save useful study notes for later review
4. Consider integrating with the main Hapi Academics app (future feature)

## Support

For issues or questions:
- Check the main README.md for detailed documentation
- Review the troubleshooting section above
- Contact the Hapi Academics team

---

**Happy studying! 📚✨**
