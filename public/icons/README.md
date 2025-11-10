# PWA Icons

This directory contains the app icons for the HapiAI Progressive Web App.

## Required Icon Sizes

You need to create icons in the following sizes:

- `icon-72x72.png` - 72x72px (Android, favicon)
- `icon-96x96.png` - 96x96px (Android)
- `icon-128x128.png` - 128x128px (Android)
- `icon-144x144.png` - 144x144px (Android, Windows)
- `icon-152x152.png` - 152x152px (iOS)
- `icon-192x192.png` - 192x192px (Android, iOS)
- `icon-384x384.png` - 384x384px (Android)
- `icon-512x512.png` - 512x512px (Android, splash screen)

## Icon Design Guidelines

1. **Purpose**: Both "any" and "maskable" purpose
   - Maskable icons should have important content in the safe zone (80% center area)
   - Background should extend to edges for Android adaptive icons

2. **Format**: PNG with transparency

3. **Content**: Should feature the HapiAI logo/brand

4. **Colors**: Use brand colors:
   - Primary: #3b82f6 (blue)
   - Background: white or transparent
   - Consider dark mode variant

## Quick Icon Generation

You can use tools like:
- [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [Favicon.io](https://favicon.io/)

Or use the command:
```bash
npx pwa-asset-generator public/logo.png public/icons --icon-only
```

## Temporary Placeholder

Until you create actual icons, you can use a solid color placeholder:
```bash
# Install ImageMagick first: brew install imagemagick
convert -size 512x512 xc:#3b82f6 -gravity center -pointsize 200 -fill white -annotate +0+0 "H" icon-512x512.png
```
