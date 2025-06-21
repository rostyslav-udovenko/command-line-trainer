/**
 * Applies the given theme by setting a data attribute,
 * updating localStorage and the theme icon.
 *
 * @param {string} theme - Either "light" or "dark"
 */
export function applyTheme(theme) {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);

  const toggleBtn = document.getElementById("theme-toggle-btn");
  if (toggleBtn) {
    toggleBtn.src = theme === "light" ? "icons/light.svg" : "icons/dark.svg";
  }
}

/**
 * Sets up the theme switcher by binding event listeners
 * and initializing the icon and theme from storage.
 */
export function setupThemeSwitcher() {
  const saved = localStorage.getItem("theme");
  const initialTheme = saved === "light" || saved === "dark" ? saved : "dark";
  applyTheme(initialTheme);

  const toggleBtn = document.getElementById("theme-toggle-btn");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const currentTheme = document.documentElement.getAttribute("data-theme");
      const newTheme = currentTheme === "light" ? "dark" : "light";
      applyTheme(newTheme);
    });
  }
}
