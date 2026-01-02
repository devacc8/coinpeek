# CoinPeek - Bitcoin Price Badge & Gas Tracker

## Claude Context

## Project Overview
Chrome extension for real-time cryptocurrency monitoring (Bitcoin & Ethereum prices, gas fees, conversion tools).

**Version**: 1.1.1 (Stable)
**Architecture**: Manifest V3, Service Worker, Vanilla JS
**Repository**: github.com/devacc8/coinpeek

## Quick Start
- **Test**: Load unpacked in `chrome://extensions/`
- **Debug Popup**: Right-click extension → "Inspect"
- **Debug Background**: Extensions page → "Service Worker" link
- **Reload**: Extensions page → Reload button

## Current Architecture

### Core Files
- `background-simple.js` - Main service worker (API calls, caching, badge)
- `popup/popup.js` - UI logic with optimized DOM caching
- `popup/popup.css` - Responsive styling with gradients
- `config/constants.js` - Centralized configuration
- `utils/formatters.js` - Shared formatting utilities

### Key Patterns
- **DOM Caching**: All elements cached in `this.elements` object
- **Constants**: All URLs, intervals, messages in CONFIG object
- **Formatters**: Use `Formatters.formatPrice()` instead of custom logic
- **API**: Only background service calls APIs, popup uses messages

## Common Tasks

### Adding New Cryptocurrency
1. Update `CONFIG.CURRENCIES` in constants.js
2. Add API endpoint to background-simple.js
3. Update popup UI elements and caching

### UI Changes
- **Popup**: Edit `popup/` files
- **Styling**: All styles in popup.css (CSS custom properties)
- **DOM**: Use cached elements (`this.elements.elementName`)

### Performance Optimization
- Cache DOM elements in constructor
- Use CONFIG constants instead of hardcoded values
- Centralize repeated logic in utils/formatters.js

### API Integration
- Add to background-simple.js only
- Include fallback mechanisms
- Update manifest.json host_permissions
- Test with network failures

## Project Structure
```
coinpeek/
├── manifest.json           # Extension config
├── background-simple.js    # Service worker
├── popup/                  # UI components
├── config/constants.js     # All configuration
└── utils/formatters.js     # Shared utilities
```

## Recent Optimizations (v1.1.1)
- ✅ Fixed badge display issue with improved API validation
- ✅ Intelligent API refresh (only when data is >45s old)
- ✅ Reduced API calls by ~70% with smart caching
- ✅ Enhanced CoinGecko API error handling
- ✅ Optimized DOM element caching
- ✅ Centralized configuration and constants
- ✅ Debug logging system with CONFIG.DEBUG toggle

## Known Patterns
- **Message Types**: Use `CONFIG.MESSAGE_TYPES.FETCH_CRYPTO_DATA`
- **Storage Keys**: Use `CONFIG.STORAGE_KEYS.CRYPTO_DATA`
- **Element Access**: Use `this.elements.elementName` (camelCase)
- **Formatting**: Use `Formatters.formatPrice()`, `Formatters.formatPercentChange()`
- **API Validation**: Always validate CoinGecko response format before use

## Development Notes
- No build process (vanilla JS)
- Chrome storage for data persistence
- 1-minute background updates via alarms
- Multiple gas fee APIs with automatic fallbacks
- Intelligent refresh: popup only calls API if data >45s old
- Manual refresh button always forces API call
- Debug logging controlled by CONFIG.DEBUG.ENABLED

## Common Issues & Solutions

### Badge Not Showing
- **Problem**: CoinGecko sometimes returns `{status: {...}}` instead of price data
- **Solution**: Added API response validation in `fetchPrices()`
- **Debug**: Check Service Worker console for "Invalid API response" errors

### Excessive API Calls
- **Problem**: Popup was calling API on every open
- **Solution**: Smart refresh only when data >45s old (`isDataStale()`)
- **Result**: ~70% reduction in API calls

### Debug Mode
- **Enable**: Set `CONFIG.DEBUG.ENABLED = true` in constants.js
- **Logs**: View in popup console and Service Worker console
- **Disable**: Set to `false` for production

## Testing Checklist
- [ ] Price display updates
- [ ] Gas fee display (handle API failures)  
- [ ] Currency conversion works
- [ ] Badge shows Bitcoin price (check Service Worker console)
- [ ] Refresh button functions
- [ ] Converter swap button works
- [ ] Smart refresh logic (open popup multiple times quickly)

## Debugging
- Console errors show in popup inspector
- Background service logs in service worker console
- Storage data visible in Chrome DevTools → Application → Storage

---
*Keep this file updated when making structural changes*