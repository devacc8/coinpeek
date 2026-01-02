# Development Tools

This folder contains tools and utilities for development and maintenance of CoinPeek.

## 🎨 Icon Generator

### `create-icons.html`
Interactive tool for generating extension icons with consistent branding.

**Features:**
- Bitcoin symbol (₿) with gradient background
- Three sizes: 16x16, 48x48, 128x128 pixels
- Matches extension UI colors (#667eea → #764ba2)
- Canvas-based generation with download

**Usage:**
1. Open `create-icons.html` in any modern browser
2. Preview icons in different sizes
3. Click "Download" buttons to save PNG files
4. Place generated files in `/icons/` folder

**When to use:**
- Rebranding or color scheme changes
- Icon design updates
- New team members need to recreate icons

## 🚀 Production Build

When preparing for production, this folder can be excluded from the final package as it contains only development utilities.

**Files in this folder are NOT required for extension functionality.**