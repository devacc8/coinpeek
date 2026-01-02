// Shared formatting utilities for CoinPeek Extension

class Formatters {
    static formatPrice(price, decimals = 2) {
        const num = Number(price);
        if (!num || isNaN(num) || !isFinite(num)) return '$0.00';

        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(num);
    }
    
    static formatPercentChange(change) {
        const num = Number(change);
        if (isNaN(num) || !isFinite(num)) return '0.00%';

        const formatted = Math.abs(num).toFixed(2);
        const sign = num >= 0 ? '+' : '-';
        return `${sign}${formatted}%`;
    }
    
    static formatBadgePrice(price) {
        const num = Number(price);
        if (!num || isNaN(num) || !isFinite(num) || num <= 0) return '';

        if (num >= 1000000) {
            return Math.round(num / 1000000) + 'M';
        } else if (num >= 1000) {
            return Math.round(num / 1000) + 'K';
        } else {
            return Math.round(num).toString();
        }
    }
    
    static formatTimeAgo(timestamp) {
        if (!timestamp) return 'never';

        const date = new Date(timestamp);
        if (isNaN(date.getTime())) return 'never';

        const now = new Date();
        const diffMs = now - date;

        // Handle future timestamps or invalid dates
        if (diffMs < 0) return 'just now';

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
        return typeof price === 'number' && price > 0 && !isNaN(price) && isFinite(price);
    }

    static validatePercentChange(change) {
        return typeof change === 'number' && !isNaN(change) && isFinite(change);
    }
    
    // Debug logging utility
    static log(level, message, data) {
        if (typeof CONFIG !== 'undefined' && CONFIG.DEBUG && CONFIG.DEBUG.ENABLED) {
            const timestamp = new Date().toISOString();
            const logMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
            const hasData = arguments.length > 2 && data !== undefined;

            switch (level.toLowerCase()) {
                case 'error':
                    hasData ? console.error(logMessage, data) : console.error(logMessage);
                    break;
                case 'warn':
                    hasData ? console.warn(logMessage, data) : console.warn(logMessage);
                    break;
                case 'info':
                    hasData ? console.info(logMessage, data) : console.info(logMessage);
                    break;
                default:
                    hasData ? console.log(logMessage, data) : console.log(logMessage);
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