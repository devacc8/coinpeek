// Simple Background Service Worker for Crypto Extension
importScripts('config/constants.js', 'utils/formatters.js');

// Enable debug mode for development
if (CONFIG.DEBUG.ENABLED) {
    Formatters.log('info', 'Background service worker starting...');
}

// Simple API service embedded
class SimpleApiService {
    constructor() {
        this.baseUrl = CONFIG.API_URLS.COINGECKO;
    }

    async fetchPrices() {
        console.log('Fetching prices and gas fees...');
        try {
            // Fetch crypto prices
            const response = await fetch(`${this.baseUrl}/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true`);
            const data = await response.json();
            console.log('Prices fetched:', data);
            
            // Validate API response format
            if (!data.bitcoin || !data.ethereum || !data.bitcoin.usd || !data.ethereum.usd) {
                console.error('Invalid API response format:', data);
                throw new Error('Invalid API response - missing price data');
            }
            
            // Fetch gas fees
            const [ethGas, btcGas] = await Promise.all([
                this.fetchEthereumGas(),
                this.fetchBitcoinGas()
            ]);
            
            return {
                prices: {
                    bitcoin: {
                        price: data.bitcoin.usd,
                        change24h: data.bitcoin.usd_24h_change
                    },
                    ethereum: {
                        price: data.ethereum.usd,
                        change24h: data.ethereum.usd_24h_change
                    }
                },
                gas: {
                    ethereum: ethGas,
                    bitcoin: btcGas
                },
                timestamp: Date.now()
            };
        } catch (error) {
            console.error('Error fetching prices:', error);
            throw error;
        }
    }

    async fetchEthereumGas() {
        try {
            const response = await fetch(`${CONFIG.API_URLS.BLOCKNATIVE}/gasprices/blockprices?chainid=1`);
            const data = await response.json();
            
            if (data.blockPrices && data.blockPrices.length > 0) {
                const gasData = data.blockPrices[0].estimatedPrices;
                return {
                    low: gasData.find(p => p.confidence === CONFIG.GAS_CONFIDENCE.LOW)?.price || CONFIG.DEFAULT_GAS.ETHEREUM.LOW,
                    standard: gasData.find(p => p.confidence === CONFIG.GAS_CONFIDENCE.STANDARD)?.price || CONFIG.DEFAULT_GAS.ETHEREUM.STANDARD,
                    fast: gasData.find(p => p.confidence === CONFIG.GAS_CONFIDENCE.FAST)?.price || CONFIG.DEFAULT_GAS.ETHEREUM.FAST
                };
            }
            throw new Error('Invalid gas data');
        } catch (error) {
            console.error('Error fetching Ethereum gas:', error);
            return CONFIG.DEFAULT_GAS.ETHEREUM;
        }
    }

    async fetchBitcoinGas() {
        // Try multiple APIs in order of preference
        const apis = [
            {
                name: 'mempool.space',
                url: `${CONFIG.API_URLS.MEMPOOL}/fees/recommended`,
                parser: (data) => ({
                    low: Math.round(data.hourFee),
                    standard: Math.round(data.halfHourFee),
                    fast: Math.round(data.fastestFee)
                })
            },
            {
                name: 'blockchain.info',
                url: `${CONFIG.API_URLS.BLOCKCHAIN_INFO}/mempool/fees`,
                parser: (data) => ({
                    low: Math.round(data.regular),
                    standard: Math.round(data.priority),
                    fast: Math.round(data.priority * 1.5)
                })
            },
            {
                name: 'blockchair.com',
                url: `${CONFIG.API_URLS.BLOCKCHAIR}/bitcoin/stats`,
                parser: (data) => ({
                    low: Math.round(data.data.suggested_transaction_fee_per_byte_sat),
                    standard: Math.round(data.data.suggested_transaction_fee_per_byte_sat * 1.5),
                    fast: Math.round(data.data.suggested_transaction_fee_per_byte_sat * 2)
                })
            }
        ];

        for (const api of apis) {
            try {
                const response = await fetch(api.url);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                
                const data = await response.json();
                const result = api.parser(data);
                
                // Validate that we got reasonable numbers
                if (result.low > 0 && result.standard > 0 && result.fast > 0) {
                    console.log(`Bitcoin gas fees from ${api.name}:`, result);
                    return result;
                }
            } catch (error) {
                console.log(`${api.name} API failed:`, error.message);
                continue;
            }
        }
        
        // If all APIs fail, return null to show dashes
        console.log('All Bitcoin gas APIs failed, will show dashes');
        return null;
    }
}

// Create service instance
const apiService = new SimpleApiService();

// Message listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Background: Message received:', message);
    
    if (message.type === CONFIG.MESSAGE_TYPES.FETCH_CRYPTO_DATA) {
        apiService.fetchPrices()
            .then(data => {
                console.log('Background: Sending data:', data);
                // Store in storage
                chrome.storage.local.set({ [CONFIG.STORAGE_KEYS.CRYPTO_DATA]: data });
                
                // Update badge
                if (data.prices && data.prices.bitcoin) {
                    updateBadge(data.prices.bitcoin.price);
                }
                
                sendResponse({ success: true, data: data });
            })
            .catch(error => {
                console.error('Background: Error:', error);
                sendResponse({ success: false, error: error.message });
            });
        
        return true; // Keep message channel open
    }
    
    sendResponse({ success: false, error: 'Unknown message type' });
});

// Update badge function
function updateBadge(price) {
    if (!price || isNaN(price) || price <= 0) {
        console.log('Invalid price for badge:', price);
        return;
    }
    
    try {
        const badgeText = Formatters.formatBadgePrice(price);
        
        chrome.action.setBadgeText({ text: badgeText });
        chrome.action.setBadgeBackgroundColor({ color: CONFIG.BADGE.COLOR });
        chrome.action.setTitle({ title: `${CONFIG.BADGE.TOOLTIP_PREFIX}${Formatters.formatPrice(price)}` });
        
        if (CONFIG.DEBUG.ENABLED) {
            console.log('Badge updated:', badgeText);
        }
    } catch (error) {
        console.error('Error updating badge:', error);
    }
}

// Periodic updates
chrome.alarms.create(CONFIG.ALARM_NAMES.CRYPTO_UPDATE, { periodInMinutes: CONFIG.UPDATE_INTERVALS.BACKGROUND_ALARM });

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === CONFIG.ALARM_NAMES.CRYPTO_UPDATE) {
        console.log('Alarm triggered, fetching data...');
        apiService.fetchPrices()
            .then(data => {
                chrome.storage.local.set({ [CONFIG.STORAGE_KEYS.CRYPTO_DATA]: data });
                if (data.prices && data.prices.bitcoin) {
                    updateBadge(data.prices.bitcoin.price);
                }
            })
            .catch(error => {
                console.error('Alarm fetch error:', error);
            });
    }
});

// Initial fetch
setTimeout(() => {
    console.log('Initial data fetch...');
    apiService.fetchPrices()
        .then(data => {
            chrome.storage.local.set({ [CONFIG.STORAGE_KEYS.CRYPTO_DATA]: data });
            if (data.prices && data.prices.bitcoin) {
                updateBadge(data.prices.bitcoin.price);
            }
        })
        .catch(error => {
            console.error('Initial fetch error:', error);
        });
}, CONFIG.UPDATE_INTERVALS.INITIAL_DELAY);

console.log('Background service worker initialized');