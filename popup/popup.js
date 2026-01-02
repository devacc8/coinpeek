// Popup JavaScript for Crypto Extension
class CryptoPopup {
    constructor() {
        this.currentData = null;
        this.isLoading = false;
        this.lastUpdateTimestamp = null;
        this.updateTimer = null;
        this.elements = {};
        
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
        // Refresh button
        this.elements.refreshBtn.addEventListener('click', () => this.refreshData('manual-button'));
        
        // Converter inputs
        this.elements.fromCurrency.addEventListener('change', () => {
            this.updateCurrencyOptions();
            this.updateConversion();
        });
        this.elements.fromAmount.addEventListener('input', () => this.updateConversion());
        this.elements.toCurrency.addEventListener('change', () => this.updateConversion());
        
        // Swap currencies button
        this.elements.swapCurrencies.addEventListener('click', () => this.swapCurrencies());
        
        // Real-time updates from background script
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.type === CONFIG.MESSAGE_TYPES.CRYPTO_DATA_UPDATE) {
                this.updateUI(message.data);
            }
        });
        
        // Initial setup
        this.updateCurrencyOptions();
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
            return true; // Нет данных - нужно обновить
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
        // Bitcoin
        if (prices.bitcoin && Formatters.validatePrice(prices.bitcoin.price)) {
            this.elements.btcPrice.textContent = Formatters.formatPrice(prices.bitcoin.price);
            this.elements.btcChange.textContent = Formatters.formatPercentChange(prices.bitcoin.change24h);
            this.elements.btcChange.className = `price-change ${prices.bitcoin.change24h >= 0 ? 'positive' : 'negative'}`;
        }
        
        // Ethereum
        if (prices.ethereum && Formatters.validatePrice(prices.ethereum.price)) {
            this.elements.ethPrice.textContent = Formatters.formatPrice(prices.ethereum.price);
            this.elements.ethChange.textContent = Formatters.formatPercentChange(prices.ethereum.change24h);
            this.elements.ethChange.className = `price-change ${prices.ethereum.change24h >= 0 ? 'positive' : 'negative'}`;
        }
    }

    updateGasFees(gas) {
        // Update Bitcoin gas fees
        if (gas.bitcoin) {
            this.elements.btcGasLow.textContent = gas.bitcoin.low;
            this.elements.btcGasStandard.textContent = gas.bitcoin.standard;
            this.elements.btcGasFast.textContent = gas.bitcoin.fast;
        } else {
            this.elements.btcGasLow.textContent = '—';
            this.elements.btcGasStandard.textContent = '—';
            this.elements.btcGasFast.textContent = '—';
        }
        
        // Update Ethereum gas fees
        if (gas.ethereum) {
            this.elements.ethGasLow.textContent = gas.ethereum.low;
            this.elements.ethGasStandard.textContent = gas.ethereum.standard;
            this.elements.ethGasFast.textContent = gas.ethereum.fast;
        } else {
            this.elements.ethGasLow.textContent = '—';
            this.elements.ethGasStandard.textContent = '—';
            this.elements.ethGasFast.textContent = '—';
        }
    }

    updateConversion() {
        const amount = parseFloat(this.elements.fromAmount.value) || 0;
        const fromCurrency = this.elements.fromCurrency.value;
        const toCurrency = this.elements.toCurrency.value;
        
        if (amount > CONFIG.CONVERSION.MIN_AMOUNT && this.currentData && this.currentData.prices) {
            const result = this.convertCurrency(amount, fromCurrency, toCurrency);
            this.elements.toAmount.value = result.toFixed(CONFIG.CONVERSION.DECIMAL_PLACES);
        } else {
            this.elements.toAmount.value = '0';
        }
    }
    
    convertCurrency(amount, from, to) {
        if (!this.currentData || !this.currentData.prices) return 0;
        
        const prices = this.currentData.prices;
        
        // Convert to USD first
        let usdAmount = amount;
        if (from === CONFIG.CURRENCY_IDS.BITCOIN) {
            usdAmount = amount * prices.bitcoin.price;
        } else if (from === CONFIG.CURRENCY_IDS.ETHEREUM) {
            usdAmount = amount * prices.ethereum.price;
        }
        
        // Convert from USD to target currency
        if (to === CONFIG.CURRENCY_IDS.USD) {
            return usdAmount;
        } else if (to === CONFIG.CURRENCY_IDS.BITCOIN) {
            return usdAmount / prices.bitcoin.price;
        } else if (to === CONFIG.CURRENCY_IDS.ETHEREUM) {
            return usdAmount / prices.ethereum.price;
        }
        
        return 0;
    }
    
    updateCurrencyOptions() {
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
        const fromValue = this.elements.fromCurrency.value;
        const toValue = this.elements.toCurrency.value;
        const fromAmount = this.elements.fromAmount.value;
        const toAmount = this.elements.toAmount.value;
        
        // Swap currency selections
        this.elements.fromCurrency.value = toValue;
        this.elements.toCurrency.value = fromValue;
        
        // Swap amounts
        this.elements.fromAmount.value = toAmount;
        
        // Update currency options and conversion
        this.updateCurrencyOptions();
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
        if (!this.lastUpdateTimestamp) return;
        
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
        this.elements.refreshBtn.disabled = loading;
        
        if (loading) {
            this.setStatus('loading');
        }
    }

    setStatus(type) {
        this.elements.statusDot.className = `status-dot ${type}`;
    }

    showError(message) {
        // Create or update error notification
        if (!this.elements.errorNotification) {
            this.elements.errorNotification = document.createElement('div');
            this.elements.errorNotification.className = 'error-notification';
            this.elements.container.appendChild(this.elements.errorNotification);
        }
        
        this.elements.errorNotification.textContent = message;
        this.elements.errorNotification.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (this.elements.errorNotification) {
                this.elements.errorNotification.style.display = 'none';
            }
        }, CONFIG.UPDATE_INTERVALS.ERROR_HIDE);
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const popup = new CryptoPopup();
    
    // Cleanup timer when popup is closed
    window.addEventListener('beforeunload', () => {
        if (popup.updateTimer) {
            clearInterval(popup.updateTimer);
        }
    });
});