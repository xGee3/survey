# PWA Icons Setup

You need to generate and add PWA icons for the app to work as a Progressive Web App.

## Required Icons

1. **icon-192.png** (192x192 pixels)
2. **icon-512.png** (512x512 pixels)
3. **favicon.ico** (in the `app` directory)

## How to Generate Icons

### Option 1: Use Online Tools

1. **Favicon Generator**: https://favicon.io/
   - Upload your logo or create a text-based favicon
   - Download the generated files
   - Place `favicon.ico` in the `app/` directory

2. **PWA Icon Generator**: https://www.pwabuilder.com/imageGenerator
   - Upload a square logo (at least 512x512)
   - Download the generated icons
   - Place `icon-192.png` and `icon-512.png` in the `public/` directory

### Option 2: Create Manually

Use any graphic design tool (Photoshop, Figma, Canva, etc.) to create:

1. A 192x192 pixel PNG with:
   - Red (#dc2626) background
   - White parking icon or "P" symbol
   - Save as `icon-192.png`

2. A 512x512 pixel PNG with the same design
   - Save as `icon-512.png`

3. Convert one to ICO format for favicon.ico

### Option 3: Simple Placeholder

For testing, you can use a simple solid color icon:

```bash
# Install ImageMagick (macOS)
brew install imagemagick

# Generate placeholder icons
convert -size 192x192 xc:#dc2626 public/icon-192.png
convert -size 512x512 xc:#dc2626 public/icon-512.png
```

## Design Recommendations

- **Background**: Red (#dc2626) to match the app theme
- **Icon**: White parking symbol or "P"
- **Style**: Simple, bold, recognizable at small sizes
- **Format**: PNG with transparency for the icon shapes

## Verification

After adding icons:

1. Run `npm run dev`
2. Open Chrome DevTools
3. Go to Application tab
4. Check Manifest section
5. Verify icons are loaded correctly

## Current Status

The manifest.json is configured to reference these icons, but the actual image files need to be created and added to the `public/` directory.
