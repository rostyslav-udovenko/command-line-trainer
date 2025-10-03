let currentLocale = "en";
let translations = {};
let isLoading = false;

export const SUPPORTED_LOCALES = ["en", "uk"];
export const DEFAULT_LOCALE = "en";

export async function loadLocale(locale) {
  if (!SUPPORTED_LOCALES.includes(locale)) {
    console.warn(`Unsupported locale: ${locale}. Using ${DEFAULT_LOCALE}`);
    locale = DEFAULT_LOCALE;
  }

  if (currentLocale === locale && Object.keys(translations).length > 0) {
    return true;
  }

  isLoading = true;

  try {
    let localeData;

    if (locale === "en") {
      localeData = await import("./locales/en.json");
    } else if (locale === "uk") {
      localeData = await import("./locales/uk.json");
    } else {
      throw new Error(`Unsupported locale: ${locale}`);
    }

    translations = localeData.default || localeData;
    currentLocale = locale;
    localStorage.setItem("locale", locale);

    return true;
  } catch (error) {
    console.error(`Error loading locale ${locale}:`, error);

    if (locale !== DEFAULT_LOCALE) {
      return await loadLocale(DEFAULT_LOCALE);
    }

    return false;
  } finally {
    isLoading = false;
  }
}

export function t(key, params = {}) {
  if (!key) {
    return "";
  }

  let text = translations[key];

  if (!text) {
    console.warn(`Missing translation: ${key}`);
    return key;
  }

  // Replace {{param}} with values
  for (const [param, value] of Object.entries(params)) {
    if (value != null) {
      text = text.replace(
        new RegExp(`{{\\s*${param}\\s*}}`, "g"),
        String(value)
      );
    }
  }

  return text;
}

export function getCurrentLocale() {
  return currentLocale;
}

export function isLoadingLocale() {
  return isLoading;
}

export async function setupI18n() {
  const savedLocale = localStorage.getItem("locale");
  const locale = SUPPORTED_LOCALES.includes(savedLocale)
    ? savedLocale
    : DEFAULT_LOCALE;

  const success = await loadLocale(locale);

  if (!success) {
    console.error("Failed to setup i18n");
  }

  return currentLocale;
}

export function updateUI() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (key) {
      const text = t(key);
      if (text !== key) {
        el.innerHTML = text;
      }
    }
  });
}

export async function switchLocale(newLocale) {
  if (newLocale === currentLocale) {
    return true;
  }

  const success = await loadLocale(newLocale);

  if (success) {
    updateUI();

    // Notify components about locale change
    document.dispatchEvent(
      new CustomEvent("localeChanged", {
        detail: {
          previous: currentLocale,
          current: newLocale,
        },
      })
    );
  }

  return success;
}
