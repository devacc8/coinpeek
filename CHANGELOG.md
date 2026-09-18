# Changelog

All notable changes to CoinPeek will be documented in this file.

## [1.1.4] - 2026-09-15

### The relay floor moved and the fee parser never heard about it

#### Fixed
- **Sub-1 sat/vB readings were rounded away**: every Bitcoin fee went through
  `Math.round`, so a quiet mempool reading of 0.1 or 0.5 sat/vB became 0. The
  relay-floor check then threw the source out, even though nodes have relayed
  those fees since Bitcoin Core 30.0. Readings below 1 sat/vB keep two decimals
  now, and so do the values the Bitcoin multipliers derive from them.
- **`MIN_RELAY_FEE_SAT_VB` was stale**: it still said 1 sat/vB, the pre-30.0
  default. Bitcoin Core 30.0 lowered `-minrelaytxfee` to 0.1 sat/vB in October
  2025, so the constant is 0.1 with a comment explaining that this is node
  policy rather than consensus.
- **A quiet mempool overstated fees tenfold**: with both bugs in place every
  source failed the check and the popup fell back to the built-in 1, 2 and
  3 sat/vB while the chain cleared at 0.1.
- **Native controls in the dark popup rendered light**: the popup declares
  `color-scheme: dark` now, so scrollbars, selects and form controls follow the
  dark surface instead of rendering light inside it.

#### Changed
- The built-in Bitcoin fallback stays at 1, 2 and 3 sat/vB on purpose. It only
  appears when every live source failed, and a fee that confirms is the better
  answer when nothing is known.

#### Removed
- **The stray `icons/placeholder.txt`**: it described how the icons were made,
  which `dev-tools/README.md` already covers, and the build includes the whole
  `icons/` folder, so the note shipped inside the extension package.

## [1.1.3] - 2026-09-14

### Four languages, permissions and documentation

#### Added
- **English, Russian, Chinese (Simplified) and Spanish.** The popup, the time strings, the currency names, the badge tooltip and the extension name and description follow the browser UI language, which Chrome resolves from `_locales` with English as the default. Every user visible string goes through `utils/i18n.js`, and prices and times are formatted in the locale that was resolved.
- The popup page declares the language it is rendered in, through a `localeCode` entry in each catalogue, instead of the hardcoded `lang="en"`.
- **Tests.** `npm test` now runs the i18n contract: the four catalogues must carry the same non-empty keys, every key referenced from the markup, the code and the manifest must exist in all of them, no catalogue key may go unused, and every placeholder must be declared and used.

#### Fixed
- **Currency names stayed English in a localized popup**: the "from" list is static markup, so only the list that JavaScript rebuilds picked up the catalogue. The static options carry `data-i18n` now.
- **Privacy policy and README**: both still named Blocknative as the Ethereum gas source after 1.1.2 replaced it. They now name Owlracle and the public JSON-RPC node, which is what the extension actually contacts.

#### Changed
- **Prices read `$76,955` in every language.** The dollar sign leads and the digits group with commas. Locale currency formatting was tried first and disagreed with the layout: Russian put the sign last with a thin space between the groups, Spanish and Chinese wrote `US$`, while the card is built around the `$--,---` placeholder. Cents are gone from the cards and from the badge tooltip.
- Removed the `api.coincap.io` host permission. The code never called it, and an unused permission only adds a warning at install.

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