// CoinPeek Background Service Worker
importScripts('config/constants.js', 'utils/formatters.js');

if (CONFIG.DEBUG.ENABLED) {
    Formatters.log('info', 'Background service worker starting...');
}

class SimpleApiService {
    constructor() {
        this.baseUrl = CONFIG.API_URLS.COINGECKO;
        this.lastFetchTime = 0;
    }

    // Fetch with timeout and response validation
    async fetchWithTimeout(url, timeout = CONFIG.UPDATE_INTERVALS.FETCH_TIMEOUT) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error(`Request timeout after ${timeout}ms`);
            }
            throw error;
        }
    }

    // Rate limiting check
    canMakeRequest() {
        const now = Date.now();
        if (now - this.lastFetchTime < CONFIG.UPDATE_INTERVALS.MIN_REQUEST_INTERVAL) {
            Formatters.log('warn', 'Request throttled - too soon since last request');
            return false;
        }
        return true;
    }

    // Validate and sanitize price data
    validatePriceData(data) {
        if (!data || typeof data !== 'object') return false;
        if (!data.bitcoin || !data.ethereum) return false;

        const btcPrice = Number(data.bitcoin.usd);
        const ethPrice = Number(data.ethereum.usd);

        return !isNaN(btcPrice) && !isNaN(ethPrice) && btcPrice > 0 && ethPrice > 0;
    }

    async fetchPrices(forceRefresh = false) {
        if (!forceRefresh && !this.canMakeRequest()) {
            const cached = await this.getCachedData();
            if (cached) return cached;
        }

        Formatters.log('info', 'Fetching prices and gas fees...');

        try {
            const data = await this.fetchWithTimeout(
                `${this.baseUrl}/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true`
            );

            if (!this.validatePriceData(data)) {
                Formatters.log('error', 'Invalid API response format:', data);
                // Try to use cached data as fallback
                const cached = await this.getCachedData();
                if (cached) {
                    Formatters.log('info', 'Using cached data due to invalid API response');
                    return cached;
                }
                throw new Error(CONFIG.ERRORS.INVALID_DATA);
            }

            this.lastFetchTime = Date.now();

            const [ethGas, btcGas] = await Promise.all([
                this.fetchEthereumGas(),
                this.fetchBitcoinGas()
            ]);

            return {
                prices: {
                    bitcoin: {
                        price: Number(data.bitcoin.usd),
                        change24h: Number(data.bitcoin.usd_24h_change) || 0
                    },
                    ethereum: {
                        price: Number(data.ethereum.usd),
                        change24h: Number(data.ethereum.usd_24h_change) || 0
                    }
                },
                gas: {
                    ethereum: ethGas,
                    bitcoin: btcGas
                },
                timestamp: Date.now()
            };
        } catch (error) {
            Formatters.log('error', 'Error fetching prices:', error.message);
            // Try to return cached data on any error
            const cached = await this.getCachedData();
            if (cached) {
                Formatters.log('info', 'Returning cached data due to fetch error');
                return cached;
            }
            throw error;
        }
    }

    async getCachedData() {
        try {
            const result = await chrome.storage.local.get(CONFIG.STORAGE_KEYS.CRYPTO_DATA);
            return result[CONFIG.STORAGE_KEYS.CRYPTO_DATA] || null;
        } catch {
            return null;
        }
    }

    async fetchEthereumGas() {
        try {
            const data = await this.fetchWithTimeout(
                `${CONFIG.API_URLS.BLOCKNATIVE}/gasprices/blockprices?chainid=1`
            );

            if (data?.blockPrices?.[0]?.estimatedPrices) {
                const gasData = data.blockPrices[0].estimatedPrices;
                if (!Array.isArray(gasData)) throw new Error('Invalid gas data format');

                return {
                    low: gasData.find(p => p.confidence === CONFIG.GAS_CONFIDENCE.LOW)?.price || CONFIG.DEFAULT_GAS.ETHEREUM.LOW,
                    standard: gasData.find(p => p.confidence === CONFIG.GAS_CONFIDENCE.STANDARD)?.price || CONFIG.DEFAULT_GAS.ETHEREUM.STANDARD,
                    fast: gasData.find(p => p.confidence === CONFIG.GAS_CONFIDENCE.FAST)?.price || CONFIG.DEFAULT_GAS.ETHEREUM.FAST
                };
            }
            throw new Error('Invalid gas data structure');
        } catch (error) {
            Formatters.log('warn', 'Ethereum gas fetch failed:', error.message);
            return CONFIG.DEFAULT_GAS.ETHEREUM;
        }
    }

    async fetchBitcoinGas() {
        const apis = [
            {
                name: 'mempool.space',
                url: `${CONFIG.API_URLS.MEMPOOL}/fees/recommended`,
                parser: (data) => {
                    if (!data?.hourFee || !data?.halfHourFee || !data?.fastestFee) return null;
                    return {
                        low: Math.round(Number(data.hourFee)),
                        standard: Math.round(Number(data.halfHourFee)),
                        fast: Math.round(Number(data.fastestFee))
                    };
                }
            },
            {
                name: 'blockchain.info',
                url: `${CONFIG.API_URLS.BLOCKCHAIN_INFO}/mempool/fees`,
                parser: (data) => {
                    if (!data?.regular || !data?.priority) return null;
                    return {
                        low: Math.round(Number(data.regular)),
                        standard: Math.round(Number(data.priority)),
                        fast: Math.round(Number(data.priority) * CONFIG.FEE_MULTIPLIERS.STANDARD)
                    };
                }
            },
            {
                name: 'blockchair.com',
                url: `${CONFIG.API_URLS.BLOCKCHAIR}/bitcoin/stats`,
                parser: (data) => {
                    const fee = data?.data?.suggested_transaction_fee_per_byte_sat;
                    if (!fee) return null;
                    return {
                        low: Math.round(Number(fee)),
                        standard: Math.round(Number(fee) * CONFIG.FEE_MULTIPLIERS.STANDARD),
                        fast: Math.round(Number(fee) * CONFIG.FEE_MULTIPLIERS.FAST)
                    };
                }
            }
        ];

        for (const api of apis) {
            try {
                const data = await this.fetchWithTimeout(api.url, 5000);
                const result = api.parser(data);

                if (result && result.low > 0 && result.standard > 0 && result.fast > 0) {
                    Formatters.log('info', `Bitcoin gas from ${api.name}`);
                    return result;
                }
            } catch (error) {
                Formatters.log('warn', `${api.name} failed:`, error.message);
            }
        }

        Formatters.log('warn', 'All Bitcoin gas APIs failed');
        return null;
    }
}

// Create service instance
const apiService = new SimpleApiService();

// Helper function to save data and update badge (DRY principle)
async function saveDataAndUpdateBadge(data) {
    try {
        await chrome.storage.local.set({ [CONFIG.STORAGE_KEYS.CRYPTO_DATA]: data });
        if (data?.prices?.bitcoin?.price) {
            updateBadge(data.prices.bitcoin.price);
        }
    } catch (error) {
        Formatters.log('error', 'Failed to save data:', error.message);
    }
}

// Update badge function
function updateBadge(price) {
    const numPrice = Number(price);
    if (!numPrice || isNaN(numPrice) || numPrice <= 0) {
        Formatters.log('warn', 'Invalid price for badge:', price);
        return;
    }

    try {
        const badgeText = Formatters.formatBadgePrice(numPrice);
        chrome.action.setBadgeText({ text: badgeText });
        chrome.action.setBadgeBackgroundColor({ color: CONFIG.BADGE.COLOR });
        chrome.action.setTitle({ title: `${CONFIG.BADGE.TOOLTIP_PREFIX}${Formatters.formatPrice(numPrice)}` });
        Formatters.log('info', 'Badge updated:', badgeText);
    } catch (error) {
        Formatters.log('error', 'Error updating badge:', error.message);
    }
}

// Message listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    Formatters.log('info', 'Message received:', message.type);

    if (message.type === CONFIG.MESSAGE_TYPES.FETCH_CRYPTO_DATA) {
        const forceRefresh = message.forceRefresh || false;

        apiService.fetchPrices(forceRefresh)
            .then(data => {
                saveDataAndUpdateBadge(data);
                sendResponse({ success: true, data });
            })
            .catch(error => {
                Formatters.log('error', 'Fetch failed:', error.message);
                sendResponse({ success: false, error: error.message });
            });

        return true; // Keep message channel open for async response
    }

    sendResponse({ success: false, error: 'Unknown message type' });
});

// Alarm handler
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === CONFIG.ALARM_NAMES.CRYPTO_UPDATE) {
        Formatters.log('info', 'Alarm triggered, fetching data...');
        apiService.fetchPrices(true)
            .then(saveDataAndUpdateBadge)
            .catch(error => Formatters.log('error', 'Alarm fetch failed:', error.message));
    }
});

// Initialize
(async function init() {
    // Create alarm only if it doesn't exist
    const existingAlarm = await chrome.alarms.get(CONFIG.ALARM_NAMES.CRYPTO_UPDATE);
    if (!existingAlarm) {
        chrome.alarms.create(CONFIG.ALARM_NAMES.CRYPTO_UPDATE, {
            periodInMinutes: CONFIG.UPDATE_INTERVALS.BACKGROUND_ALARM
        });
    }

    // Initial fetch after delay
    setTimeout(async () => {
        Formatters.log('info', 'Initial data fetch...');
        try {
            const data = await apiService.fetchPrices(true);
            await saveDataAndUpdateBadge(data);
        } catch (error) {
            Formatters.log('error', 'Initial fetch failed:', error.message);
            // Fallback to cached data
            const cached = await apiService.getCachedData();
            if (cached?.prices?.bitcoin?.price) {
                updateBadge(cached.prices.bitcoin.price);
                Formatters.log('info', 'Using cached data as fallback');
            }
        }
    }, CONFIG.UPDATE_INTERVALS.INITIAL_DELAY);

    Formatters.log('info', 'Background service worker initialized');
})();
