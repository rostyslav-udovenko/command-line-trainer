import "./ui/styles/main.scss";
import { setupTheme } from "./ui/components/themes/theme-manager.js";
import {
  setCaret,
  showWelcomeMessage,
  TerminalCaret,
} from "./ui/components/terminal-ui.js";
import { setupI18n, updateUI } from "./core/i18n/i18n.js";

document.addEventListener("DOMContentLoaded", async () => {
  // First load translations
  await setupI18n();
  updateUI();

  setupTheme();

  // Restore fullscreen mode if it was enabled
  const isFullscreen = localStorage.getItem("fullscreenMode");
  if (isFullscreen === "true") {
    document.body.classList.add("fullscreen-mode");
    const header = document.querySelector(".header");
    const footer = document.querySelector(".footer");
    if (header) header.style.display = "none";
    if (footer) footer.style.display = "none";
  } else if (isFullscreen === "false") {
    // Explicitly ensure fullscreen is disabled
    document.body.classList.remove("fullscreen-mode");
    const header = document.querySelector(".header");
    const footer = document.querySelector(".footer");
    if (header) header.style.display = "";
    if (footer) footer.style.display = "";
  }

  showWelcomeMessage();

  const caret = new TerminalCaret({
    inputId: "hidden-input",
    renderedId: "custom-rendered-input",
    outputId: "output",
  });
  setCaret(caret);

  caret.focus();
});
