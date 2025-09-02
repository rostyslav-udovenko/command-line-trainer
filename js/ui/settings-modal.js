import { applyTheme, getCurrentTheme } from "./theme-manager.js";
import { setHintsEnabled } from "../core/task-manager.js";
import { executeCommand } from "../core/command-executor.js";
import { switchLocale, t } from "../core/i18n.js";
import {
  getStarted,
  showWelcomeMessage,
  printOutput,
  scrollToBottom,
  caret,
} from "./terminal-ui.js";

function positionModal() {
  const terminal = document.getElementById("terminal");
  const modal = document.getElementById("settings-modal");
  const rect = terminal.getBoundingClientRect();

  modal.style.top = rect.top + "px";
  modal.style.right = window.innerWidth - rect.right + "px";
}

function updateSelections() {
  const currentTheme = getCurrentTheme();

  document.querySelectorAll("[data-theme]").forEach((btn) => {
    btn.classList.toggle("selected", btn.dataset.theme === currentTheme);
  });

  const currentLang = localStorage.getItem("locale") || "en";
  document.querySelectorAll("[data-language]").forEach((btn) => {
    btn.classList.toggle("selected", btn.dataset.language === currentLang);
  });

  const hintsBtn = document.getElementById("toggle-hints");
  if (hintsBtn) {
    const progress = JSON.parse(localStorage.getItem("trainerProgress"));
    const hintsOn = progress?.hintsEnabled ?? true;
    hintsBtn.classList.toggle("hints-on", hintsOn);
    hintsBtn.classList.toggle("hints-off", !hintsOn);
  }
}

// TODO: extract this to avoid repetition everywhere
function focusCaretSafely() {
  // Small delay to let modal close animation finish
  setTimeout(() => {
    const selection = window.getSelection();
    const hasSelection = selection && selection.toString().length > 0;

    if (!hasSelection) {
      caret?.focus();
    }
  }, 10); // 10ms seems to be enough, don't ask me why
}

window.addEventListener("resize", () => {
  const modal = document.getElementById("settings-modal");
  if (!modal.classList.contains("hidden")) {
    positionModal();
  }
});

/**
 * Initializes settings modal functionality.
 */
export function setupSettingsModal() {
  const btn = document.getElementById("settings-btn");
  const modal = document.getElementById("settings-modal");

  if (btn && modal) {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (modal.classList.contains("hidden")) {
        updateSelections();
        positionModal();
        modal.classList.remove("hidden");
      } else {
        modal.classList.add("hidden");
      }
    });
  }

  // Simple modal close handler - let terminal-ui handle the focus logic
  document.addEventListener("click", (e) => {
    if (!modal.contains(e.target) && !btn.contains(e.target)) {
      // Check if user has selected text - if so, don't interfere
      const selection = window.getSelection();
      const hasSelection = selection && selection.toString().length > 0;

      if (!hasSelection) {
        modal.classList.add("hidden");
      }
    }
  });

  document.querySelectorAll("[data-theme]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const theme = btn.dataset.theme;
      applyTheme(theme);
      localStorage.setItem("theme", theme);
      updateSelections();
      modal.classList.add("hidden");
      focusCaretSafely();
    });
  });

  document.querySelectorAll("[data-language]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const locale = btn.dataset.language;
      const success = await switchLocale(locale);

      if (!success) {
        printOutput(t("command.error.languageSwitch"));
        scrollToBottom();
        return;
      }

      updateSelections();

      if (!getStarted()) {
        const output = document.getElementById("output");
        if (output) {
          output.innerHTML = "";
          showWelcomeMessage();
        }
      } else {
        const name = locale === "en" ? "English" : "Ukrainian";
        printOutput(t("command.language.switched", { locale: name }));
        scrollToBottom();
      }

      modal.classList.add("hidden");
      focusCaretSafely();
    });
  });

  const hintsBtn = document.getElementById("toggle-hints");
  if (hintsBtn) {
    hintsBtn.addEventListener("click", () => {
      if (getStarted()) {
        const progress = JSON.parse(localStorage.getItem("trainerProgress"));
        const current = progress?.hintsEnabled ?? true;
        const newValue = !current;

        setHintsEnabled(newValue);
        updateSelections();

        const msg = newValue
          ? "task.manager.hints.enabled"
          : "task.manager.hints.disabled";
        printOutput(t(msg));
        scrollToBottom();
      } else {
        printOutput(t("settings.modal.startTrainingHint"));
        scrollToBottom();
      }
      modal.classList.add("hidden");
      focusCaretSafely();
    });
  }

  const resetBtn = document.getElementById("reset-progress");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      localStorage.removeItem("trainerProgress");
      location.reload();
    });
  }

  const helpBtn = document.getElementById("help-btn");
  if (helpBtn) {
    helpBtn.addEventListener("click", () => {
      if (getStarted()) {
        executeCommand("help");
      } else {
        printOutput(t("settings.modal.startTrainingHint"));
        scrollToBottom();
      }
      modal.classList.add("hidden");
      focusCaretSafely();
    });
  }
}
