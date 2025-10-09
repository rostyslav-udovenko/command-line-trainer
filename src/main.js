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
  showWelcomeMessage();

  const caret = new TerminalCaret({
    inputId: "hidden-input",
    renderedId: "custom-rendered-input",
    outputId: "output",
  });
  setCaret(caret);

  caret.focus();
});
