/**
 * Applies the selected theme by updating DOM attribute and localStorage.
 *
 * @param {string} theme - "light" or "dark"
 */
export function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
}

/**
 * Initializes theme from localStorage.
 */
export function setupTheme() {
  const savedTheme = localStorage.getItem("theme");
  const theme = savedTheme === "light" || savedTheme === "dark" ? savedTheme : "dark";
  
  applyTheme(theme);
}