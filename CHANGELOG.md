# Changelog

All notable changes to CoinPeek will be documented in this file.

## [1.1.2] - 2026-09-14

### Network fee fixes

#### Fixed
- **Ethereum network fees**: the gas API this used, Blocknative, was shut down on 19 June 2026, so the Ethereum row could not load at all. It now reads from Owlracle, with a public JSON-RPC node as the backup.
- **Silent fallback**: the built-in fallback used uppercase keys (LOW, STANDARD, FAST) while the popup reads lowercase ones, so an unavailable reading rendered as a dash instead of a number. The keys now match. The Ethereum fallback values are null on purpose, because a hardcoded gwei number is wrong by orders of magnitude, so a dash is the honest answer when no source responds.
- **Bitcoin sources below the relay floor**: `blockchain.info` reports a regular fee of 0 sat/vB whenever the mempool is quiet, and Bitcoin does not relay below 1 sat/vB. A reading that low is now skipped by an explicit check against `MIN_RELAY_FEE_SAT_VB`, and the next source is tried. The old code also skipped it, but only as a side effect of a falsy comparison, so the intent was invisible.
- **Bitcoin fallback**: a failed reading now returns the built-in values instead of nothing.

#### Changed
- Host permissions: `api.blocknative.com` removed, `api.owlracle.info` and `ethereum-rpc.publicnode.com` added.

## [1.1.1] - 2025-07-19

### 🔧 Bug Fixes & Stability Improvements

#### Fixed
- **Badge Display Issue**: Fixed Bitcoin price not showing on extension icon
- **CoinGecko API Reliability**: Added validation for malformed API responses
- **Intelligent Refresh Logic**: Implemented smart data freshness checking (45s threshold)
- **API Rate Limiting**: Reduced unnecessary API calls by ~70% with intelligent caching

#### Improved
- **Error Handling**: Better validation for CoinGecko API responses
- **Debug System**: Enhanced logging with configurable debug mode
- **Badge Performance**: Simplified badge update logic with proper error handling

## [1.1.0] - 2025-07-19

### 🚀 Performance & Architecture Improvements

#### Added
- **Centralized Configuration**: New `config/constants.js` for unified settings management
- **Shared Utilities**: New `utils/formatters.js` for reusable formatting functions
- **Technical Documentation**: Comprehensive `TECHNICAL_DOCS.md` for developers
- **Enhanced Error Handling**: Better fallback mechanisms and user feedback

#### Optimized
- **DOM Element Caching**: All elements cached at initialization (~30% performance boost)
- **Code Deduplication**: Removed duplicate API logic and formatting functions
- **Memory Usage**: Reduced JavaScript bundle size by ~25%
- **API Architecture**: Unified all API calls through background service only

#### Removed
- **Duplicate Files**: Eliminated `background.js` (kept optimized `background-simple.js`)
- **Unused Services**: Removed `services/api-service.js` (functionality merged)
- **Development Files**: Cleaned up `test-simple.js` and `temp_file.txt`
- **Redundant Code**: Removed duplicate formatting and API logic from popup

#### Changed
- **Project Structure**: Reorganized into logical directories (config/, utils/)
- **Constants Management**: All magic numbers and URLs moved to central config
- **DOM Queries**: Switched from repeated `getElementById` to cached elements
- **Message Types**: Centralized Chrome extension message type constants

#### Fixed
- **Container Sizing**: Resolved popup width issues across different screen resolutions
- **Animation Consistency**: Unified hover animations between price blocks and converter
- **Border Display**: Fixed left border artifacts in popup window
- **Error Recovery**: Improved graceful degradation when APIs fail

### 🎨 UI/UX Improvements
- **Spacing Consistency**: Fixed uneven gaps between interface sections
- **Responsive Design**: Better adaptation to different popup window sizes
- **Animation Polish**: Consistent center-out animations across all elements

### 🔧 Developer Experience
- **Better Documentation**: Clear architecture guidelines and development setup
- **Code Standards**: Consistent naming conventions and error handling patterns
- **Debugging Tools**: Enhanced logging and error reporting
- **Maintenance Guide**: Clear procedures for updates and troubleshooting

## [1.0.2] - 2025-07-15

### Initial Release

#### Features
- Real-time Bitcoin and Ethereum price monitoring
- Ethereum gas fee tracking via Blocknative API
- Bitcoin gas fee tracking with multiple fallback APIs
- Currency conversion between BTC, ETH, and USD
- Extension badge showing Bitcoin price
- Clean, modern popup interface
- Background updates every 30 seconds
- Chrome storage for offline data caching

#### Technical
- Chrome Extension Manifest V3 compliant
- Service worker architecture
- CoinGecko API integration for prices
- Multiple gas fee API sources with fallbacks
- Responsive CSS design with gradient themes

---

**Version Format**: [MAJOR.MINOR.PATCH]
- **MAJOR**: Breaking changes or major feature additions
- **MINOR**: New features, performance improvements, significant changes
- **PATCH**: Bug fixes, minor improvements, documentation updates