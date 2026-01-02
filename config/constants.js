// Configuration constants for Crypto Extension

const CONFIG = {
    // API URLs
    API_URLS: {
        COINGECKO: 'https://api.coingecko.com/api/v3',
        BLOCKNATIVE: 'https://api.blocknative.com',
        COINCAP: 'https://api.coincap.io/v2',
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
    
    // Gas fee confidence levels
    GAS_CONFIDENCE: {
        LOW: 70,
        STANDARD: 80,
        FAST: 95
    },
    
    // Default gas values (fallback)
    DEFAULT_GAS: {
        ETHEREUM: {
            LOW: 15,
            STANDARD: 20,
            FAST: 25
        },
        BITCOIN: {
            LOW: 10,
            STANDARD: 20,
            FAST: 30
        }
    },
    
    // Supported currencies
    CURRENCIES: [
        { value: 'bitcoin', text: 'Bitcoin', symbol: 'BTC' },
        { value: 'ethereum', text: 'Ethereum', symbol: 'ETH' },
        { value: 'usd', text: 'USD', symbol: '$' }
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
        TOOLTIP_PREFIX: 'Bitcoin: '
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