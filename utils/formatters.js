// Shared formatting utilities for Crypto Extension

class Formatters {
    static formatPrice(price, decimals = 2) {
        if (!price || isNaN(price)) return '$0.00';
        
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(price);
    }
    
    static formatPercentChange(change) {
        if (!change || isNaN(change)) return '0.00%';
        
        const formatted = Math.abs(change).toFixed(2);
        const sign = change >= 0 ? '+' : '-';
        return `${sign}${formatted}%`;
    }
    
    static formatBadgePrice(price) {
        if (!price || isNaN(price)) return '';
        
        if (price >= 1000000) {
            return Math.round(price / 1000000) + 'M';
        } else if (price >= 1000) {
            return Math.round(price / 1000) + 'K';
        } else {
            return Math.round(price).toString();
        }
    }
    
    static formatTimeAgo(timestamp) {
        if (!timestamp) return 'never';
        
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffSecs < 60) {
            return `${diffSecs} seconds ago`;
        } else if (diffMins < 60) {
            return `${diffMins} min ago`;
        } else {
            return date.toLocaleTimeString();
        }
    }
    
    static validatePrice(price) {
        return typeof price === 'number' && price > 0 && !isNaN(price);
    }
    
    static validatePercentChange(change) {
        return typeof change === 'number' && !isNaN(change);
    }
    
    // Debug logging utility
    static log(level, message, data = null) {
        if (typeof CONFIG !== 'undefined' && CONFIG.DEBUG && CONFIG.DEBUG.ENABLED) {
            const timestamp = new Date().toISOString();
            const logMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
            
            switch (level.toLowerCase()) {
                case 'error':
                    console.error(logMessage, data);
                    break;
                case 'warn':
                    console.warn(logMessage, data);
                    break;
                case 'info':
                    console.info(logMessage, data);
                    break;
                default:
                    console.log(logMessage, data);
            }
        }
    }
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Formatters;
} else if (typeof window !== 'undefined') {
    window.Formatters = Formatters;
}