# Extension Icons

## Quick Setup

To generate the required PNG icons:

### Option 1: Use the HTML Generator (Recommended)
1. Open `generate-icons.html` in your browser
2. Click "Download All Icons"
3. Save the files as `icon16.png`, `icon48.png`, and `icon128.png` in this folder

### Option 2: Use Online Tool
1. Go to https://www.favicon-generator.org/
2. Upload the `icon.svg` file
3. Generate icons for sizes: 16x16, 48x48, 128x128
4. Download and rename them to `icon16.png`, `icon48.png`, `icon128.png`

### Option 3: Use ImageMagick (Command Line)
If you have ImageMagick installed:

```bash
convert icon.svg -resize 16x16 icon16.png
convert icon.svg -resize 48x48 icon48.png
convert icon.svg -resize 128x128 icon128.png
```

## Required Files

The extension needs these three PNG files:
- `icon16.png` - Toolbar icon
- `icon48.png` - Extension management page
- `icon128.png` - Chrome Web Store

## Temporary Workaround

If you want to test the extension immediately without icons, you can:
1. Create simple colored squares as placeholders
2. Or comment out the icon references in `manifest.json`

The extension will work without icons, but Chrome will show a default puzzle piece icon.
