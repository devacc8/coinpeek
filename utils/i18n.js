/**
 * CoinPeek i18n helper.
 *
 * Chrome picks the locale from the browser UI language and exposes it through
 * chrome.i18n, so nothing here chooses a language: it only reads the catalogue
 * in _locales/<locale>/messages.json. Every user visible string goes through
 * this file, which is what keeps a new locale from silently falling back to
 * English.
 */
const I18N = {
    /**
     * Look up one message.
     *
     * @param {string} key - Message key as declared in messages.json.
     * @param {string|string[]} [substitutions] - Values for $PLACEHOLDER$ slots.
     * @returns {string} The localized message, or the key when it is missing.
     */
    t(key, substitutions) {
        try {
            if (typeof chrome !== 'undefined' && chrome.i18n && chrome.i18n.getMessage) {
                const message = chrome.i18n.getMessage(key, substitutions);
                if (message) return message;
            }
        } catch {
            // No catalogue, or a stripped chrome object: fall through.
        }
        return key;
    },

    /**
     * Fill every element in scope that carries a data-i18n attribute.
     *
     * @param {Document|Element} [root] - Defaults to the current document.
     */
    apply(root) {
        const scope = root || (typeof document !== 'undefined' ? document : null);
        if (!scope || !scope.querySelectorAll) return;

        scope.querySelectorAll('[data-i18n]').forEach((el) => {
            el.textContent = I18N.t(el.dataset.i18n);
        });
        scope.querySelectorAll('[data-i18n-title]').forEach((el) => {
            el.title = I18N.t(el.dataset.i18nTitle);
        });
        scope.querySelectorAll('[data-i18n-aria]').forEach((el) => {
            el.setAttribute('aria-label', I18N.t(el.dataset.i18nAria));
        });

        if (typeof document !== 'undefined' && scope === document) {
            document.title = I18N.t('pageTitle');
            // getUILanguage reports the browser UI language, which is not always
            // the locale Chrome resolved the catalogue to (a --lang run keeps
            // reporting en-US). The catalogue answers for itself instead.
            const code = I18N.t('localeCode');
            if (code && code !== 'localeCode') document.documentElement.lang = code;
        }
    },
};

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => I18N.apply(document));
}
