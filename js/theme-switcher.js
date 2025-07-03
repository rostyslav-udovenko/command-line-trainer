/**
 * Applies the selected theme by updating DOM attribute, localStorage, and icon.
 *
 * @param {string} theme - "light" or "dark"
 */
export function applyTheme(theme) {
  // Set theme on root element
  document.documentElement.setAttribute("data-theme", theme);

  // Persist preference
  localStorage.setItem("theme", theme);

  // Update toggle icon image
  const icon = document.getElementById("theme-toggle-btn");
  if (icon) {
    icon.src = theme === "light" ? "icons/light.svg" : "icons/dark.svg";
  }
}

/**
 * Initializes theme from localStorage and binds toggle click handler.
 */
export function setupThemeSwitcher() {
  const icon = document.getElementById("theme-toggle-btn");

  // Load saved theme or fallback to "dark"
  const saved = localStorage.getItem("theme");
  const initial = saved === "light" || saved === "dark" ? saved : "dark";

  // Apply theme immediately
  applyTheme(initial);

  // Toggle theme on icon click
  if (icon) {
    icon.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme");
      const next = current === "light" ? "dark" : "light";
      applyTheme(next);
    });
  }
}
