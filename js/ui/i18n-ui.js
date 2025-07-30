import { t } from "../core/i18n.js";

/**
 * Updates static text elements in the UI based on current translations.
 */
export function updateStaticTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const translated = t(key);
    if (translated) {
      el.innerHTML = translated;
    }
  });
}
