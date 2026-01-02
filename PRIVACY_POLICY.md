# Privacy Policy

**CoinPeek**
*Last updated: January 2025*

## Overview

CoinPeek is a browser extension that displays real-time cryptocurrency prices and gas fees. We are committed to protecting your privacy.

## Data Collection

**We do not collect any personal data.**

This extension:
- Does NOT collect personal information
- Does NOT track your browsing activity
- Does NOT require user accounts or registration
- Does NOT share any data with third parties
- Does NOT use analytics or tracking tools

## Data Storage

All data is stored **locally on your device** using Chrome's Storage API:
- Cached cryptocurrency prices (for offline viewing)
- User preferences (if any)

This data never leaves your browser and is not transmitted to any server we control.

## Third-Party APIs

The extension fetches public data from the following APIs:

| Service | Purpose | Data Sent |
|---------|---------|-----------|
| [CoinGecko](https://www.coingecko.com/) | Cryptocurrency prices | None (public API) |
| [Blocknative](https://www.blocknative.com/) | Ethereum gas fees | None (public API) |
| [mempool.space](https://mempool.space/) | Bitcoin fees | None (public API) |
| [blockchain.info](https://www.blockchain.com/) | Bitcoin fees (fallback) | None (public API) |
| [Blockchair](https://blockchair.com/) | Bitcoin fees (fallback) | None (public API) |

These are public APIs that do not require authentication. No personal data is sent to these services.

## Permissions Explained

| Permission | Purpose |
|------------|---------|
| `storage` | Save cached prices locally for faster loading |
| `alarms` | Schedule background price updates every minute |

We only request permissions that are strictly necessary for the extension to function.

## Changes to This Policy

If we make changes to this privacy policy, we will update the "Last updated" date above.

## Contact

For questions about this privacy policy, please open an issue on our [GitHub repository](https://github.com/devacc8/coinpeek/issues).

## Open Source

This extension is open source. You can review the complete source code on [GitHub](https://github.com/devacc8/coinpeek).
