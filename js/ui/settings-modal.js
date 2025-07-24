import { applyTheme } from "./theme-switcher.js";
import { setHintsEnabled } from "../core/task-manager.js";
import { executeCommand } from "../core/command-executor.js";

/**
 * Calculates and applies position of the settings modal
 * relative to the terminal element.
 */
function positionSettingsModal() {
  const terminal = document.getElementById("terminal");
  const settingsModal = document.getElementById("settings-modal");
  const terminalRect = terminal.getBoundingClientRect();

  settingsModal.style.top = terminalRect.top + 8 + "px";
  settingsModal.style.right = window.innerWidth - terminalRect.right + 8 + "px";
}

/**
 * Handles window resize: repositions the modal if it's open.
 */
window.addEventListener("resize", function () {
  const settingsModal = document.getElementById("settings-modal");
  if (!settingsModal.classList.contains("hidden")) {
    positionSettingsModal();
  }
});

/**
 * Initializes settings modal:
 * - Toggle open/close on button click
 * - Close when clicking outside
 * - Theme switching
 * - Toggle hints
 * - Reset progress
 * - Show help
 */
export function setupSettingsModal() {
  const settingsBtn = document.getElementById("settings-btn");
  const settingsModal = document.getElementById("settings-modal");

  // Toggle modal open/close on button click
  if (settingsBtn && settingsModal) {
    settingsBtn.addEventListener("click", () => {
      if (settingsModal.classList.contains("hidden")) {
        positionSettingsModal();
        settingsModal.classList.remove("hidden");
      } else {
        settingsModal.classList.add("hidden");
      }
    });
  }

  // Close modal when clicking outside
  document.addEventListener("click", (event) => {
    if (!settingsModal.contains(event.target) && !settingsBtn.contains(event.target)) {
      settingsModal.classList.add("hidden");
    }
  });

  // Theme switch buttons (use data-theme attribute)
  document.querySelectorAll("[data-theme]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const theme = btn.getAttribute("data-theme");
      applyTheme(theme);
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
    });
  }
}