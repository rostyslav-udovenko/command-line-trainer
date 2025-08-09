import { setupTheme } from "./ui/theme-manager.js";
import {
  setCaret,
  showWelcomeMessage,
  TerminalCaret,
} from "./ui/terminal-ui.js";
import { setupI18n, updateUI } from "./core/i18n.js";
import { setupSettingsModal } from "./ui/settings-modal.js";

document.addEventListener("DOMContentLoaded", async () => {
  // First load translations
  await setupI18n();
  updateUI();

  setupTheme();
  setupSettingsModal();
  showWelcomeMessage();

  const caret = new TerminalCaret({
    inputId: "hidden-input",
    renderedId: "custom-rendered-input", 
    outputId: "output",
  });
  setCaret(caret);

  caret.focus();
});