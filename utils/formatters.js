// Shared formatting utilities for CoinPeek Extension

class Formatters {
    /** The locale Chrome resolved for this extension, or US English outside it. */
    static locale() {
        const code = typeof I18N !== 'undefined' ? I18N.t('localeCode') : '';
        return code && code !== 'localeCode' ? code : 'en-US';
    }


    /**
     * Format a USD price as `$76,955`.
     *
     * The dollar sign always leads and the digits always group with commas,
     * in every language. Locale currency formatting was tried first and it
     * disagreed with the layout: Russian put the sign last with a thin space
     * between the groups, Spanish and Chinese wrote US$, and the card is built
     * around the `$--,---` placeholder. A price is read at a glance, so one
     * shape everywhere beats four correct ones.
     *
     * The default is whole dollars: cents on a four or five digit price are
     * noise, and the badge tooltip has to stay short. Callers that need
     * fractions (the converter) pass an explicit count.
     */
    static formatPrice(price, decimals = 0) {
        const num = Number(price);
        const safe = !num || isNaN(num) || !isFinite(num) ? 0 : num;
        const digits = new Intl.NumberFormat('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(safe);

        return `$${digits}`;
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
        if (!timestamp) return I18N.t('timeNever');

        const date = new Date(timestamp);
        if (isNaN(date.getTime())) return I18N.t('timeNever');

        const now = new Date();
        const diffMs = now - date;

        // Handle future timestamps or invalid dates
        if (diffMs < 0) return I18N.t('timeJustNow');

        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffMs / 60000);

        if (diffSecs < 60) {
            return I18N.t('timeSecondsAgo', [String(diffSecs)]);
        } else if (diffMins < 60) {
            return I18N.t('timeMinutesAgo', [String(diffMins)]);
        } else {
            return date.toLocaleTimeString(Formatters.locale());
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