import { setupThemeSwitcher } from "./theme-switcher.js";
import { TerminalCaret, showWelcomeMessage } from "./terminal-ui.js";
import { executeCommand } from "./command-executor.js";

/**
 * Entry point for initializing the Command Line Trainer interface.
 * This script runs once the DOM is fully loaded.
 *
 * - Displays the initial welcome message.
 * - Initializes the TerminalCaret for custom input rendering.
 * - Focuses the input field for immediate user interaction.
 */
document.addEventListener("DOMContentLoaded", () => {
  // Set up the theme switcher functionality
  setupThemeSwitcher();

  // Print welcome instructions to the terminal
  showWelcomeMessage();

  // Initialize the custom terminal input with caret rendering
  const caret = new TerminalCaret({
    inputId: "hidden-input", // ID of the invisible <input> element
    renderedId: "custom-rendered-input", // ID of the visual caret/text renderer
    outputId: "output", // ID of the container where output is printed
  });

  // Set focus so the user can start typing immediately
  caret.focus();

  const helpBtn = document.getElementById("help-btn");
  if (helpBtn) {
    helpBtn.addEventListener("click", () => {
      executeCommand("help");
      caret.focus();
    });
  }
});
