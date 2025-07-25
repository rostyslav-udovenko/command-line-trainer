import { applyTheme } from "./theme-switcher.js";
import { setHintsEnabled } from "../core/task-manager.js";
import { executeCommand } from "../core/command-executor.js";
import { loadLocale, t } from "../core/i18n.js";
import {
  getStarted,
  showWelcomeMessage,
  printOutput,
  scrollToBottom,
} from "./terminal-ui.js";

/**
 * Calculates and applies the position of the settings modal
 * relative to the terminal element on the page.
 */
function positionSettingsModal() {
  const terminal = document.getElementById("terminal");
  const settingsModal = document.getElementById("settings-modal");
  const terminalRect = terminal.getBoundingClientRect();

  settingsModal.style.top = terminalRect.top + 0 + "px";
  settingsModal.style.right = window.innerWidth - terminalRect.right + 0 + "px";
}

/**
 * Handles window resize events: repositions the modal if it's visible.
 */
window.addEventListener("resize", () => {
  const settingsModal = document.getElementById("settings-modal");
  if (!settingsModal.classList.contains("hidden")) {
    positionSettingsModal();
  }
});

/**
 * Initializes the settings modal:
 * - Opens/closes on settings button click
 * - Closes when clicking outside
 * - Switches theme
 * - Switches language (and optionally rerenders welcome message)
 * - Toggles hints
 * - Resets progress
 * - Shows help
 */
export function setupSettingsModal() {
  const settingsBtn = document.getElementById("settings-btn");
  const settingsModal = document.getElementById("settings-modal");

  // Toggle modal open/close when clicking the settings button
  if (settingsBtn && settingsModal) {
    settingsBtn.addEventListener("click", (event) => {
      event.stopPropagation(); // prevent document click listener from closing immediately
      if (settingsModal.classList.contains("hidden")) {
        positionSettingsModal();
        settingsModal.classList.remove("hidden");
      } else {
        settingsModal.classList.add("hidden");
      }
    });
  }

  // Close modal when clicking outside of it (but not on the settings button)
  document.addEventListener("click", (event) => {
    if (
      !settingsModal.contains(event.target) &&
      !settingsBtn.contains(event.target)
    ) {
      settingsModal.classList.add("hidden");
    }
  });

  // Theme switch buttons (use data-theme attribute)
  document.querySelectorAll("[data-theme]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const theme = btn.getAttribute("data-theme");
      applyTheme(theme);
      settingsModal.classList.add("hidden");
    });
  });

  // Language switch buttons (use data-language attribute)
  document.querySelectorAll("[data-language]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const locale = btn.getAttribute("data-language");
      await loadLocale(locale);

      // save to localStorage so it persists
      localStorage.setItem("locale", locale);

      // If training hasn't started yet, re-render the welcome message in new language
      if (!getStarted()) {
        const output = document.getElementById("output");
        if (output) {
          output.innerHTML = "";
          showWelcomeMessage();
        }
      }

      // Show confirmation message
      const localeName = locale === "en" ? "English" : "Ukrainian";
      printOutput(t("command.language.switched", { locale: localeName }));
      scrollToBottom();

      settingsModal.classList.add("hidden");
    });
  });

  // Toggle hints on/off
  const toggleHintsBtn = document.getElementById("toggle-hints");
  if (toggleHintsBtn) {
    toggleHintsBtn.addEventListener("click", () => {
      const enabled =
        JSON.parse(localStorage.getItem("trainerProgress"))?.hintsEnabled ??
        true;
      setHintsEnabled(!enabled);
      settingsModal.classList.add("hidden");
    });
  }

  // Reset training progress
  const resetProgressBtn = document.getElementById("reset-progress");
  if (resetProgressBtn) {
    resetProgressBtn.addEventListener("click", () => {
      localStorage.removeItem("trainerProgress");
      location.reload();
    });
  }

  // Show help command
  const showHelpBtn = document.getElementById("show-help");
  if (showHelpBtn) {
    showHelpBtn.addEventListener("click", () => {
      executeCommand("help");
      settingsModal.classList.add("hidden");
    });
  }
}
