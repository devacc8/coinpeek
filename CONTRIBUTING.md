# Contributing to CoinPeek

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## How to Contribute

### Reporting Bugs

1. Check existing [GitHub Issues](../../issues) to avoid duplicates
2. Create a new issue with:
   - Clear, descriptive title
   - Steps to reproduce the bug
   - Expected vs actual behavior
   - Browser version and OS
   - Screenshots if applicable

### Suggesting Features

1. Open a [GitHub Issue](../../issues/new) with the "feature request" label
2. Describe the feature and its use case
3. Explain why it would benefit users

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Test thoroughly (see Testing section below)
5. Commit with clear messages
6. Push to your fork
7. Open a Pull Request

## Development Setup

### Prerequisites
- Google Chrome browser
- Text editor (VS Code recommended)
- Node.js 14+ (for build tools only)

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/devacc8/coinpeek.git
   cd coinpeek
   ```

2. Load the extension in Chrome:
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the project folder

3. Make changes and reload:
   - Edit files in your editor
   - Click the reload button in `chrome://extensions/`
   - Test changes in the popup

### Testing

Before submitting a PR, verify:
- [ ] Price display updates correctly
- [ ] Gas fees display (handle API failures gracefully)
- [ ] Currency converter works
- [ ] Badge shows Bitcoin price
- [ ] Refresh button functions
- [ ] No console errors

## Code Style

### General Guidelines
- Use vanilla JavaScript (ES6+)
- No external frameworks or libraries in popup
- Keep code simple and readable

### Architecture
- **Configuration**: Use `CONFIG` constants from `config/constants.js`
- **Formatting**: Use `Formatters` utilities from `utils/formatters.js`
- **DOM Access**: Cache DOM elements in constructor (`this.elements`)
- **API Calls**: Only in `background-simple.js`, popup uses messaging

### Naming Conventions
- camelCase for variables and functions
- UPPER_CASE for constants
- Descriptive, meaningful names

### Example

```javascript
// Good
const priceElement = this.elements.btcPrice;
const formattedPrice = Formatters.formatPrice(price);

// Avoid
const el = document.getElementById('btc-price');
const p = '$' + price.toFixed(2);
```

## Project Structure

```
coinpeek/
├── manifest.json           # Extension configuration
├── background-simple.js    # Service worker (API calls)
├── popup/                  # UI components
│   ├── popup.html
│   ├── popup.js
│   └── popup.css
├── config/constants.js     # Centralized configuration
└── utils/formatters.js     # Shared utilities
```

## Questions?

Feel free to open an issue for any questions about contributing.

Thank you for helping improve CoinPeek!
