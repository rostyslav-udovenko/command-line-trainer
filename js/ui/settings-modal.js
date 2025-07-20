import { applyTheme } from "./theme-switcher.js";
import { setHintsEnabled } from "../core/task-manager.js";
import { executeCommand } from "../core/command-executor.js";

export function setupSettingsModal() {
  const settingsBtn = document.getElementById("settings-btn");
  const settingsModal = document.getElementById("settings-modal");

  if (settingsBtn && settingsModal) {
    settingsBtn.addEventListener("click", () => {
      settingsModal.classList.toggle("hidden");
    });
  }

  document.querySelectorAll("[data-theme]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const theme = btn.getAttribute("data-theme");
      applyTheme(theme);
    });
  });

  const toggleHintsBtn = document.getElementById("toggle-hints");
  if (toggleHintsBtn) {
    toggleHintsBtn.addEventListener("click", () => {
      const enabled =
        JSON.parse(localStorage.getItem("trainerProgress"))?.hintsEnabled ??
        true;
      setHintsEnabled(!enabled);
    });
  }

  const resetProgressBtn = document.getElementById("reset-progress");
  if (resetProgressBtn) {
    resetProgressBtn.addEventListener("click", () => {
      localStorage.removeItem("trainerProgress");
      location.reload();
    });
  }

  const showHelpBtn = document.getElementById("show-help");
  if (showHelpBtn) {
    showHelpBtn.addEventListener("click", () => {
      executeCommand("help");
    });
  }
}
