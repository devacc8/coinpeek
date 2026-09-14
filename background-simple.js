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
    async fetchWithTimeout(url, timeout = CONFIG.UPDATE_INTERVALS.FETCH_TIMEOUT, options = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, { ...options, signal: controller.signal });
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

    /**
     * Ethereum gas, from two live sources. Blocknative's gas API was shut down
     * on 2026-06-19, so the single source this used to have is gone, and with it
     * the confidence levels the old response carried.
     *
     * @returns {Promise<{low: number|null, standard: number|null, fast: number|null}>}
     */
    async fetchEthereumGas() {
        const fromOwlracle = await this.fetchEthereumGasFromOwlracle();
        if (fromOwlracle) return fromOwlracle;

        const fromRpc = await this.fetchEthereumGasFromRpc();
        if (fromRpc) return fromRpc;

        Formatters.log('warn', 'Ethereum gas: no source answered');
        return CONFIG.DEFAULT_GAS.ETHEREUM;
    }

    /**
     * Owlracle reports one entry per acceptance probability, and its top tier
     * (acceptance 1.0) prices a transaction that cannot fail, which runs
     * several times above the tier anyone actually pays at. So each row is
     * matched to the entry whose acceptance is closest to a target instead of
     * to the extremes.
     *
     * @returns {Promise<{low: number, standard: number, fast: number}|null>}
     */
    async fetchEthereumGasFromOwlracle() {
        const targets = { low: 0.35, standard: 0.6, fast: 0.9 };

        try {
            const data = await this.fetchWithTimeout(`${CONFIG.API_URLS.OWLCRACLE}/eth/gas`, 5000);
            const speeds = (Array.isArray(data?.speeds) ? data.speeds : [])
                .map((speed) => ({
                    acceptance: Number(speed?.acceptance),
                    price: Number(speed?.maxFeePerGas)
                }))
                .filter((speed) => Number.isFinite(speed.acceptance) && Number.isFinite(speed.price) && speed.price > 0);

            if (speeds.length === 0) throw new Error('no usable price');

            // Three decimals below 0.1, because a quiet chain prices gas around
            // 0.05 gwei and two decimals would flatten the rows into one number.
            const round = (value) => Number(value.toFixed(value < 0.1 ? 3 : 2));
            const nearest = (target) => speeds.reduce((best, speed) => (
                Math.abs(speed.acceptance - target) < Math.abs(best.acceptance - target) ? speed : best
            )).price;

            Formatters.log('info', 'Ethereum gas from owlracle.info');
            return {
                low: round(nearest(targets.low)),
                standard: round(nearest(targets.standard)),
                fast: round(nearest(targets.fast))
            };
        } catch (error) {
            Formatters.log('warn', 'owlracle.info failed:', error.message);
            return null;
        }
    }

    /**
     * The backup is a public JSON-RPC node: one eth_gasPrice in wei, split into
     * the three rows the popup has. The multipliers are deliberately mild, since
     * a node answer is a spot price and this is the fallback, not the oracle.
     *
     * @returns {Promise<{low: number, standard: number, fast: number}|null>}
     */
    async fetchEthereumGasFromRpc() {
        try {
            const data = await this.fetchWithTimeout(CONFIG.API_URLS.ETH_RPC, 5000, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_gasPrice', params: [] })
            });

            const wei = Number.parseInt(data?.result ?? '', 16);
            if (!Number.isFinite(wei) || wei <= 0) throw new Error('unexpected result');

            const gwei = wei / 1e9;
            const round = (value) => Number(value.toFixed(2));

            Formatters.log('info', 'Ethereum gas from a public RPC node');
            return { low: round(gwei), standard: round(gwei * 1.15), fast: round(gwei * 1.4) };
        } catch (error) {
            Formatters.log('warn', 'public RPC failed:', error.message);
            return null;
        }
    }

    async fetchBitcoinGas() {
        // 0 sat/vB is what a quiet mempool reports, but a transaction below the
        // 1 sat/vB relay minimum never leaves the node, so a source that reports
        // 0 is skipped and the next one is tried.
        const feeNumber = (value) => {
            const number = Number(value);
            return Number.isFinite(number) && number >= 0 ? Math.round(number) : null;
        };

        const apis = [
            {
                name: 'mempool.space',
                url: `${CONFIG.API_URLS.MEMPOOL}/fees/recommended`,
                parser: (data) => {
                    const low = feeNumber(data?.hourFee);
                    const standard = feeNumber(data?.halfHourFee);
                    const fast = feeNumber(data?.fastestFee);
                    if (low === null || standard === null || fast === null) return null;
                    return { low, standard, fast };
                }
            },
            {
                name: 'blockchain.info',
                url: `${CONFIG.API_URLS.BLOCKCHAIN_INFO}/mempool/fees`,
                parser: (data) => {
                    const low = feeNumber(data?.regular);
                    const standard = feeNumber(data?.priority);
                    if (low === null || standard === null) return null;
                    return {
                        low,
                        standard,
                        fast: Math.round(standard * CONFIG.FEE_MULTIPLIERS.STANDARD)
                    };
                }
            },
            {
                name: 'blockchair.com',
                url: `${CONFIG.API_URLS.BLOCKCHAIR}/bitcoin/stats`,
                parser: (data) => {
                    const fee = feeNumber(data?.data?.suggested_transaction_fee_per_byte_sat);
                    if (fee === null) return null;
                    return {
                        low: fee,
                        standard: Math.round(fee * CONFIG.FEE_MULTIPLIERS.STANDARD),
                        fast: Math.round(fee * CONFIG.FEE_MULTIPLIERS.FAST)
                    };
                }
            }
        ];

        for (const api of apis) {
            try {
                const data = await this.fetchWithTimeout(api.url, 5000);
                const result = api.parser(data);

                if (result && ['low', 'standard', 'fast'].every((key) => Number.isFinite(result[key]) && result[key] >= CONFIG.MIN_RELAY_FEE_SAT_VB)) {
                    Formatters.log('info', `Bitcoin gas from ${api.name}`);
                    return result;
                }
            } catch (error) {
                Formatters.log('warn', `${api.name} failed:`, error.message);
            }
        }

        Formatters.log('warn', 'All Bitcoin gas APIs failed');
        return CONFIG.DEFAULT_GAS.BITCOIN;
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
