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
 * Supports optional params for {{placeholders}}
 * Falls back to the key itself if translation is missing
 *
 * @param {string} key - translation key
 * @param {Object} [params] - object with placeholders to replace
 * @returns {string} - translated text
 */
export function t(key, params = {}) {
  let text = translations[key] || key;

  // Replace placeholders like {{name}} with values from params
  for (const [param, value] of Object.entries(params)) {
    text = text.replace(new RegExp(`{{\\s*${param}\\s*}}`, 'g'), value);
  }

  return text;
}

/**
 * Returns the current active locale
 *
 * @returns {string} - current locale code
 */
export function getCurrentLocale() {
  return currentLocale;
}
