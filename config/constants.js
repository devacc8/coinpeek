// Configuration constants for Crypto Extension

const CONFIG = {
    // API URLs
    API_URLS: {
        COINGECKO: 'https://api.coingecko.com/api/v3',
        OWLCRACLE: 'https://api.owlracle.info/v4',
        ETH_RPC: 'https://ethereum-rpc.publicnode.com',
        MEMPOOL: 'https://mempool.space/api/v1',
        BLOCKCHAIN_INFO: 'https://api.blockchain.info',
        BLOCKCHAIR: 'https://api.blockchair.com'
    },
    
    // Update intervals (in milliseconds)
    UPDATE_INTERVALS: {
        BACKGROUND_ALARM: 1, // minutes
        POPUP_REFRESH: 30000, // 30 seconds
        TIME_DISPLAY: 1000, // 1 second
        INITIAL_DELAY: 2000, // 2 seconds
        ERROR_HIDE: 5000, // 5 seconds
        DATA_FRESHNESS_THRESHOLD: 45000, // 45 seconds - data considered stale
        FETCH_TIMEOUT: 10000, // 10 seconds - API request timeout
        DEBOUNCE_DELAY: 300, // 300ms - input debounce
        MIN_REQUEST_INTERVAL: 5000 // 5 seconds - minimum time between API calls
    },

    // Retry configuration
    RETRY: {
        COUNT: 3,
        DELAY: 1000, // milliseconds
        BACKOFF_MULTIPLIER: 1.5 // exponential backoff
    },

    // Fee multipliers for Bitcoin gas estimation
    FEE_MULTIPLIERS: {
        STANDARD: 1.5,
        FAST: 2
    },

    // A source reporting below this fee is skipped and the next one is tried.
    // Bitcoin Core 30.0 (October 2025) lowered the default relay floor from
    // 1 sat/vB to 0.1 sat/vB, which is why this is no longer a whole number:
    // a quiet mempool prices at 0.1 and those transactions do relay. It stayed
    // node policy rather than consensus, so this is a floor to check against,
    // not a promise that such a transaction confirms.
    MIN_RELAY_FEE_SAT_VB: 0.1,
    
    // Last-resort gas values, used only when every live source fails. Ethereum
    // fees move by orders of magnitude (0.06 gwei in 2026 against 20 gwei in
    // 2022), so a hardcoded gwei number would mislead more than an empty
    // reading, and the popup renders null as a dash.
    DEFAULT_GAS: {
        ETHEREUM: {
            low: null,
            standard: null,
            fast: null
        },
        BITCOIN: {
            // Deliberately conservative: this only appears when every source
            // failed, and a fee that confirms beats a cheap one that sits in
            // the mempool. Live readings below 1 sat/vB are normal on a quiet
            // mempool, and they win whenever any source answers.
            low: 1,
            standard: 2,
            fast: 3
        }
    },
    
    // Supported currencies
    CURRENCIES: [
        { value: 'bitcoin', text: 'Bitcoin', messageKey: 'bitcoinName', symbol: 'BTC' },
        { value: 'ethereum', text: 'Ethereum', messageKey: 'ethereumName', symbol: 'ETH' },
        { value: 'usd', text: 'USD', messageKey: 'usdLabel', symbol: '$' }
    ],
    
    // Currency identifiers
    CURRENCY_IDS: {
        BITCOIN: 'bitcoin',
        ETHEREUM: 'ethereum',
        USD: 'usd'
    },
    
    // Chrome storage keys
    STORAGE_KEYS: {
        CRYPTO_DATA: 'cryptoData'
    },
    
    // Chrome alarm names
    ALARM_NAMES: {
        CRYPTO_UPDATE: 'crypto-update'
    },
    
    // Message types
    MESSAGE_TYPES: {
        FETCH_CRYPTO_DATA: 'FETCH_CRYPTO_DATA',
        CRYPTO_DATA_UPDATE: 'CRYPTO_DATA_UPDATE',
        UPDATE_BADGE: 'UPDATE_BADGE'
    },
    
    // Badge configuration
    BADGE: {
        COLOR: '#667eea',
    },
    
    // Conversion settings
    CONVERSION: {
        DECIMAL_PLACES_CRYPTO: 8, // For BTC/ETH amounts
        DECIMAL_PLACES_USD: 2,    // For USD amounts
        MIN_AMOUNT: 0
    },
    
    // Debug settings
    DEBUG: {
        ENABLED: false, // Set to true for development
        LOG_API_CALLS: false,
        LOG_USER_ACTIONS: false
    },
    
    // Error messages
    ERRORS: {
        API_FAILED: 'Unable to fetch cryptocurrency data',
        GAS_FAILED: 'Unable to fetch gas fees',
        INVALID_DATA: 'Invalid data format received',
        NETWORK_ERROR: 'Network connection failed'
    }
};

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}