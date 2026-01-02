// Popup JavaScript for CoinPeek Extension
class CryptoPopup {
    constructor() {
        this.currentData = null;
        this.isLoading = false;
        this.lastUpdateTimestamp = null;
        this.updateTimer = null;
        this.errorHideTimer = null;
        this.debounceTimer = null;
        this.elements = {};
        this.messageListener = null;

        this.init();
    }

    async init() {
        Formatters.log('info', 'Popup: Initializing...');
        
        // Initialize DOM elements
        this.initializeElements();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Load cached data first
        await this.loadCachedData();
        
        // Only fetch fresh data if cached data is stale
        if (this.isDataStale()) {
            Formatters.log('info', 'Data is stale, fetching fresh data...');
            await this.refreshData('auto-stale');
        } else {
            Formatters.log('info', 'Using fresh cached data, skipping API call');
            this.setStatus('connected');
        }
    }

    initializeElements() {
        // Cache all DOM elements at once
        const elementIds = [
            'status-dot', 'btc-price', 'btc-change', 'eth-price', 'eth-change',
            'btc-gas-low', 'btc-gas-standard', 'btc-gas-fast',
            'eth-gas-low', 'eth-gas-standard', 'eth-gas-fast',
            'from-currency', 'from-amount', 'to-currency', 'to-amount',
            'swap-currencies', 'last-updated', 'refresh-btn'
        ];
        
        elementIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                // Convert dash-case to camelCase for property names
                const propName = id.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
                this.elements[propName] = element;
            }
        });
        
        // Cache frequently used elements
        this.elements.container = document.querySelector('.container');
    }

    setupEventListeners() {
        // Refresh button (with null check)
        if (this.elements.refreshBtn) {
            this.elements.refreshBtn.addEventListener('click', () => this.refreshData('manual-button'));
        }

        // Converter inputs (with null checks)
        if (this.elements.fromCurrency) {
            this.elements.fromCurrency.addEventListener('change', () => {
                this.updateCurrencyOptions();
                this.updateConversion();
            });
        }

        if (this.elements.fromAmount) {
            // Debounced input handler for performance
            this.elements.fromAmount.addEventListener('input', () => {
                if (this.debounceTimer) {
                    clearTimeout(this.debounceTimer);
                }
                this.debounceTimer = setTimeout(() => {
                    this.updateConversion();
                }, CONFIG.UPDATE_INTERVALS.DEBOUNCE_DELAY);
            });
        }

        if (this.elements.toCurrency) {
            this.elements.toCurrency.addEventListener('change', () => this.updateConversion());
        }

        // Swap currencies button (with null check)
        if (this.elements.swapCurrencies) {
            this.elements.swapCurrencies.addEventListener('click', () => this.swapCurrencies());
        }

        // Real-time updates from background script (store reference for cleanup)
        this.messageListener = (message, sender, sendResponse) => {
            if (message.type === CONFIG.MESSAGE_TYPES.CRYPTO_DATA_UPDATE) {
                this.updateUI(message.data);
            }
        };
        chrome.runtime.onMessage.addListener(this.messageListener);

        // Initial setup
        this.updateCurrencyOptions();
    }

    // Cleanup method for proper resource management
    cleanup() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
        }
        if (this.errorHideTimer) {
            clearTimeout(this.errorHideTimer);
            this.errorHideTimer = null;
        }
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = null;
        }
        if (this.messageListener) {
            chrome.runtime.onMessage.removeListener(this.messageListener);
            this.messageListener = null;
        }
    }


    async loadCachedData() {
        try {
            const result = await chrome.storage.local.get([CONFIG.STORAGE_KEYS.CRYPTO_DATA]);
            if (result[CONFIG.STORAGE_KEYS.CRYPTO_DATA]) {
                this.currentData = result[CONFIG.STORAGE_KEYS.CRYPTO_DATA];
                this.updateUI(this.currentData);
            }
        } catch (error) {
            Formatters.log('error', 'Failed to load cached data', error);
        }
    }

    isDataStale() {
        if (!this.currentData || !this.currentData.timestamp) {
            Formatters.log('info', 'No cached data found, refresh needed');
            return true; // No data - refresh needed
        }

        const now = Date.now();
        const dataAge = now - this.currentData.timestamp;
        const isStale = dataAge > CONFIG.UPDATE_INTERVALS.DATA_FRESHNESS_THRESHOLD;
        
        Formatters.log('info', `Data age: ${Math.round(dataAge/1000)}s, stale: ${isStale}`);
        return isStale;
    }

    async refreshData(source = 'manual', forceRefresh = false) {
        if (this.isLoading) return;
        
        // For manual button clicks, always refresh regardless of data age
        if (source === 'manual-button') {
            forceRefresh = true;
        }
        
        this.setLoadingState(true);
        
        try {
            Formatters.log('info', `Popup: Requesting fresh data (${source})...`);
            
            // Fetch data from background service
            const response = await chrome.runtime.sendMessage({
                type: CONFIG.MESSAGE_TYPES.FETCH_CRYPTO_DATA
            });
            
            if (response && response.success) {
                Formatters.log('info', 'Popup: Got data from background', response.data);
                this.currentData = response.data;
                this.updateUI(this.currentData);
                this.setStatus('connected');
            } else {
                throw new Error(response?.error || CONFIG.ERRORS.API_FAILED);
            }
        } catch (error) {
            Formatters.log('error', 'Failed to refresh data', error);
            this.setStatus('error');
            this.showError('Failed to update prices. Please try again.');
        } finally {
            this.setLoadingState(false);
        }
    }
    

    updateUI(data) {
        if (!data) return;
        
        try {
            // Update prices
            if (data.prices) {
                this.updatePrices(data.prices);
            }
            
            // Update gas fees
            if (data.gas) {
                this.updateGasFees(data.gas);
            }
            
            // Update conversion
            this.updateConversion();
            
            // Update timestamp
            this.updateTimestamp(data.timestamp);
            
        } catch (error) {
            console.error('Error updating UI:', error);
        }
    }

    updatePrices(prices) {
        // Bitcoin (with null checks)
        if (prices.bitcoin && Formatters.validatePrice(prices.bitcoin.price)) {
            if (this.elements.btcPrice) {
                this.elements.btcPrice.textContent = Formatters.formatPrice(prices.bitcoin.price);
            }
            if (this.elements.btcChange) {
                this.elements.btcChange.textContent = Formatters.formatPercentChange(prices.bitcoin.change24h);
                this.elements.btcChange.className = `price-change ${prices.bitcoin.change24h >= 0 ? 'positive' : 'negative'}`;
            }
        }

        // Ethereum (with null checks)
        if (prices.ethereum && Formatters.validatePrice(prices.ethereum.price)) {
            if (this.elements.ethPrice) {
                this.elements.ethPrice.textContent = Formatters.formatPrice(prices.ethereum.price);
            }
            if (this.elements.ethChange) {
                this.elements.ethChange.textContent = Formatters.formatPercentChange(prices.ethereum.change24h);
                this.elements.ethChange.className = `price-change ${prices.ethereum.change24h >= 0 ? 'positive' : 'negative'}`;
            }
        }
    }

    updateGasFees(gas) {
        // Update Bitcoin gas fees (with null checks)
        const btcLow = gas.bitcoin?.low ?? '—';
        const btcStandard = gas.bitcoin?.standard ?? '—';
        const btcFast = gas.bitcoin?.fast ?? '—';

        if (this.elements.btcGasLow) this.elements.btcGasLow.textContent = btcLow;
        if (this.elements.btcGasStandard) this.elements.btcGasStandard.textContent = btcStandard;
        if (this.elements.btcGasFast) this.elements.btcGasFast.textContent = btcFast;

        // Update Ethereum gas fees (with null checks)
        const ethLow = gas.ethereum?.low ?? '—';
        const ethStandard = gas.ethereum?.standard ?? '—';
        const ethFast = gas.ethereum?.fast ?? '—';

        if (this.elements.ethGasLow) this.elements.ethGasLow.textContent = ethLow;
        if (this.elements.ethGasStandard) this.elements.ethGasStandard.textContent = ethStandard;
        if (this.elements.ethGasFast) this.elements.ethGasFast.textContent = ethFast;
    }

    updateConversion() {
        // Null checks for DOM elements
        if (!this.elements.fromAmount || !this.elements.fromCurrency ||
            !this.elements.toCurrency || !this.elements.toAmount) {
            return;
        }

        const amount = parseFloat(this.elements.fromAmount.value) || 0;
        const fromCurrency = this.elements.fromCurrency.value;
        const toCurrency = this.elements.toCurrency.value;

        if (amount > CONFIG.CONVERSION.MIN_AMOUNT && this.currentData?.prices) {
            const result = this.convertCurrency(amount, fromCurrency, toCurrency);
            // Use appropriate decimal places based on target currency
            const decimalPlaces = toCurrency === CONFIG.CURRENCY_IDS.USD
                ? CONFIG.CONVERSION.DECIMAL_PLACES_USD
                : CONFIG.CONVERSION.DECIMAL_PLACES_CRYPTO;
            this.elements.toAmount.value = result.toFixed(decimalPlaces);
        } else {
            this.elements.toAmount.value = '0';
        }
    }

    convertCurrency(amount, from, to) {
        if (!this.currentData?.prices) return 0;

        const prices = this.currentData.prices;
        const btcPrice = prices.bitcoin?.price;
        const ethPrice = prices.ethereum?.price;

        // Convert to USD first
        let usdAmount = amount;
        if (from === CONFIG.CURRENCY_IDS.BITCOIN && btcPrice > 0) {
            usdAmount = amount * btcPrice;
        } else if (from === CONFIG.CURRENCY_IDS.ETHEREUM && ethPrice > 0) {
            usdAmount = amount * ethPrice;
        }

        // Convert from USD to target currency (with division by zero protection)
        if (to === CONFIG.CURRENCY_IDS.USD) {
            return usdAmount;
        } else if (to === CONFIG.CURRENCY_IDS.BITCOIN && btcPrice > 0) {
            return usdAmount / btcPrice;
        } else if (to === CONFIG.CURRENCY_IDS.ETHEREUM && ethPrice > 0) {
            return usdAmount / ethPrice;
        }

        return 0;
    }
    
    updateCurrencyOptions() {
        // Null checks for DOM elements
        if (!this.elements.fromCurrency || !this.elements.toCurrency) {
            return;
        }

        const fromValue = this.elements.fromCurrency.value;
        const currentToValue = this.elements.toCurrency.value;

        // Clear current options
        this.elements.toCurrency.innerHTML = '';

        // Add all currencies except the selected "from" currency
        let newToValue = currentToValue;
        let foundCurrentTo = false;

        CONFIG.CURRENCIES.forEach(currency => {
            if (currency.value !== fromValue) {
                const option = document.createElement('option');
                option.value = currency.value;
                option.textContent = currency.text;
                this.elements.toCurrency.appendChild(option);

                if (currency.value === currentToValue) {
                    foundCurrentTo = true;
                }
            }
        });

        // If current "to" currency is not available, select the first available option
        if (!foundCurrentTo && this.elements.toCurrency.options.length > 0) {
            newToValue = this.elements.toCurrency.options[0].value;
        }

        this.elements.toCurrency.value = newToValue;
    }

    swapCurrencies() {
        // Null checks for DOM elements
        if (!this.elements.fromCurrency || !this.elements.toCurrency ||
            !this.elements.fromAmount || !this.elements.toAmount) {
            return;
        }

        const fromValue = this.elements.fromCurrency.value;
        const toValue = this.elements.toCurrency.value;
        const toAmount = this.elements.toAmount.value;

        // Set "from" currency first (before updating options)
        this.elements.fromCurrency.value = toValue;

        // Update currency options (rebuilds "to" dropdown excluding new "from")
        this.updateCurrencyOptions();

        // Now set "to" currency (after options are rebuilt to include the old "from")
        this.elements.toCurrency.value = fromValue;

        // Move converted amount to input field
        this.elements.fromAmount.value = toAmount;

        // Recalculate conversion
        this.updateConversion();
    }
    

    updateTimestamp(timestamp) {
        if (!timestamp) return;

        this.lastUpdateTimestamp = timestamp;
        this.updateTimeDisplay();

        // Clear existing timer
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
        }

        // Start new timer to update every second
        this.updateTimer = setInterval(() => {
            this.updateTimeDisplay();
        }, CONFIG.UPDATE_INTERVALS.TIME_DISPLAY);
    }

    updateTimeDisplay() {
        if (!this.lastUpdateTimestamp || !this.elements.lastUpdated) return;

        const timeText = Formatters.formatTimeAgo(this.lastUpdateTimestamp);

        // Stop timer for old updates (when showing absolute time)
        if (timeText.includes(':') && this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
        }

        this.elements.lastUpdated.textContent = timeText;
    }

    setLoadingState(loading) {
        this.isLoading = loading;
        if (this.elements.refreshBtn) {
            this.elements.refreshBtn.disabled = loading;
        }

        if (loading) {
            this.setStatus('loading');
        }
    }

    setStatus(type) {
        if (this.elements.statusDot) {
            this.elements.statusDot.className = `status-dot ${type}`;
        }
    }

    showError(message) {
        // Clear any existing error hide timer
        if (this.errorHideTimer) {
            clearTimeout(this.errorHideTimer);
            this.errorHideTimer = null;
        }

        // Create or update error notification
        if (!this.elements.errorNotification) {
            if (!this.elements.container) return;
            this.elements.errorNotification = document.createElement('div');
            this.elements.errorNotification.className = 'error-notification';
            this.elements.container.appendChild(this.elements.errorNotification);
        }

        this.elements.errorNotification.textContent = message;
        this.elements.errorNotification.style.display = 'block';

        // Auto-hide after configured time
        this.errorHideTimer = setTimeout(() => {
            if (this.elements.errorNotification) {
                this.elements.errorNotification.style.display = 'none';
            }
            this.errorHideTimer = null;
        }, CONFIG.UPDATE_INTERVALS.ERROR_HIDE);
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const popup = new CryptoPopup();

    // Cleanup all resources when popup is closed
    window.addEventListener('beforeunload', () => {
        popup.cleanup();
    });
});