import { setupTheme } from "./ui/theme-manager.js";
import {
  setCaret,
  showWelcomeMessage,
  TerminalCaret,
} from "./ui/terminal-ui.js";
import { executeCommand } from "./core/command-executor.js";
import { setupI18n } from "./core/i18n.js";
import { setupSettingsModal } from "./ui/settings-modal.js";

/**
 * Entry point for initializing the Command Line Trainer interface.
 * This script runs once the DOM is fully loaded.
 *
 * - Loads the selected locale translations.
 * - Displays the initial welcome message.
 * - Initializes the TerminalCaret for custom input rendering.
 * - Focuses the input field for immediate user interaction.
 */
document.addEventListener("DOMContentLoaded", async () => {
  // Setup i18n with saved locale or default
  await setupI18n();

  // Set up the theme switcher functionality
  setupTheme();

  // Set up settings modal functionality
  setupSettingsModal();

  // Print welcome instructions to the terminal
  showWelcomeMessage();

  // Initialize the custom terminal input with caret rendering
  const caretInstance = new TerminalCaret({
    inputId: "hidden-input",
    renderedId: "custom-rendered-input",
    outputId: "output",
  });
  setCaret(caretInstance);

  // Set focus so the user can start typing immediately
  caretInstance.focus();

  const helpBtn = document.getElementById("help-btn");
  if (helpBtn) {
    helpBtn.addEventListener("click", () => {
      executeCommand("help");

      // Ensure the caret is focused after showing help
      caretInstance.focus();
    });
  }
});
