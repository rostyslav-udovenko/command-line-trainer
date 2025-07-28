import { applyTheme } from "./theme-switcher.js";
import { setHintsEnabled } from "../core/task-manager.js";
import { executeCommand } from "../core/command-executor.js";
import { loadLocale, t } from "../core/i18n.js";
import {
  getStarted,
  showWelcomeMessage,
  printOutput,
  scrollToBottom,
  caret,
} from "./terminal-ui.js";

/**
 * Calculates and applies the position of the settings modal
 * relative to the terminal element on the page.
 */
function positionSettingsModal() {
  const terminal = document.getElementById("terminal");
  const settingsModal = document.getElementById("settings-modal");
  const terminalRect = terminal.getBoundingClientRect();

  settingsModal.style.top = terminalRect.top + "px";
  settingsModal.style.right = window.innerWidth - terminalRect.right + "px";
}

/**
 * Updates the active selection highlighting in the modal
 * based on current theme and language stored in localStorage.
 */
function updateActiveSelections() {
  const currentTheme = localStorage.getItem("theme") || "dark";
  document.querySelectorAll("[data-theme]").forEach((btn) => {
    btn.classList.toggle(
      "selected",
      btn.getAttribute("data-theme") === currentTheme
    );
  });

  const currentLocale = localStorage.getItem("locale") || "en";
  document.querySelectorAll("[data-language]").forEach((btn) => {
    btn.classList.toggle(
      "selected",
      btn.getAttribute("data-language") === currentLocale
    );
  });

  const toggleHintsBtn = document.getElementById("toggle-hints");
  if (toggleHintsBtn) {
    const enabled =
      JSON.parse(localStorage.getItem("trainerProgress"))?.hintsEnabled ?? true;
    toggleHintsBtn.classList.toggle("hints-on", enabled);
    toggleHintsBtn.classList.toggle("hints-off", !enabled);
  }
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
 * - Updates active selections
 * - Closes when clicking outside
 * - Switches theme
 * - Switches language (with optional welcome re-render)
 * - Toggles hints
 * - Resets progress
 * - Shows help
 */
export function setupSettingsModal() {
  const settingsBtn = document.getElementById("settings-btn");
  const settingsModal = document.getElementById("settings-modal");

  // Toggle modal open/close on button click and update selections
  if (settingsBtn && settingsModal) {
    settingsBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      if (settingsModal.classList.contains("hidden")) {
        updateActiveSelections();
        positionSettingsModal();
        settingsModal.classList.remove("hidden");
      } else {
        settingsModal.classList.add("hidden");
      }
    });
  }

  // Close modal when clicking outside
  document.addEventListener("click", (event) => {
    if (
      !settingsModal.contains(event.target) &&
      !settingsBtn.contains(event.target)
    ) {
      settingsModal.classList.add("hidden");
    }
  });

  // Theme switch buttons
  document.querySelectorAll("[data-theme]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const theme = btn.getAttribute("data-theme");
      applyTheme(theme);
      localStorage.setItem("theme", theme);
      updateActiveSelections();
      settingsModal.classList.add("hidden");
    });
  });

  // Language switch buttons
  document.querySelectorAll("[data-language]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const locale = btn.getAttribute("data-language");
      await loadLocale(locale);
      localStorage.setItem("locale", locale);
      updateActiveSelections();

      if (!getStarted()) {
        const output = document.getElementById("output");
        if (output) {
          output.innerHTML = "";
          showWelcomeMessage();
        }
      }

      const localeName = locale === "en" ? "English" : "Ukrainian";
      printOutput(t("command.language.switched", { locale: localeName }));
      scrollToBottom();
      settingsModal.classList.add("hidden");
      caret?.focus();
    });
  });

  // Toggle hints
  const toggleHintsBtn = document.getElementById("toggle-hints");
  if (toggleHintsBtn) {
    toggleHintsBtn.addEventListener("click", () => {
      const enabled =
        JSON.parse(localStorage.getItem("trainerProgress"))?.hintsEnabled ??
        true;
      const newEnabled = !enabled;
      setHintsEnabled(newEnabled);
      updateActiveSelections();

      if (newEnabled) {
        printOutput(t("task.manager.hints.enabled"));
      } else {
        printOutput(t("task.manager.hints.disabled"));
      }
      scrollToBottom();

      settingsModal.classList.add("hidden");
      caret?.focus();
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

  // Show help
  const showHelpBtn = document.getElementById("help-btn");
  if (showHelpBtn) {
    showHelpBtn.addEventListener("click", () => {
      if (getStarted()) {
        executeCommand("help");
      } else {
        printOutput(t("settings.modal.startTrainingHint"));
        scrollToBottom();
      }
      settingsModal.classList.add("hidden");
      caret?.focus();
    });
  }
}
