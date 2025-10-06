const VALID_THEMES = ["dark", "light", "amber"];

export function applyTheme(theme) {
  const validTheme = VALID_THEMES.includes(theme) ? theme : "dark";

  document.documentElement.setAttribute("data-theme", validTheme);
  localStorage.setItem("theme", validTheme);
}

export function setupTheme() {
  const savedTheme = localStorage.getItem("theme");

  const theme = VALID_THEMES.includes(savedTheme) ? savedTheme : "dark";

  applyTheme(theme);
}

export function getCurrentTheme() {
  const savedTheme = localStorage.getItem("theme");
  return VALID_THEMES.includes(savedTheme) ? savedTheme : "dark";
}
