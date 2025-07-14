/**
 * Currently selected locale (defaults to English)
 * @type {string}
 */
let currentLocale = 'en';

/**
 * Translation dictionary for the current locale
 * @type {Object}
 */
let translations = {};

/**
 * Loads translation file for the given locale
 * Updates the current locale and translations object
 *
 * @param {string} locale - locale code (e.g., 'en' or 'uk')
 */
export async function loadLocale(locale) {
  try {
    const res = await fetch(`locales/${locale}.json`);
    translations = await res.json();
    currentLocale = locale;
  } catch (err) {
    console.error("Failed to load locale", locale, err);
  }
}

/**
 * Returns translation for the given key
 * Falls back to the key itself if translation is missing
 *
 * @param {string} key - translation key
 * @returns {string} - translated text or the key itself
 */
export function t(key) {
  return translations[key] || key;
}

/**
 * Returns the current active locale
 *
 * @returns {string} - current locale code
 */
export function getCurrentLocale() {
  return currentLocale;
}
