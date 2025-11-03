import { executeCommand } from "../../core/command-executor.js";
import { handleWelcome, loadTasks } from "../../core/task-manager.js";
import { t } from "../../core/i18n/i18n.js";

export let started = false;
export let caret;

export function setCaret(instance) {
  caret = instance;
}

export class TerminalCaret {
  constructor({ inputId, renderedId, outputId }) {
    this.inputField = document.getElementById(inputId);
    this.rendered = document.getElementById(renderedId);
    this.output = document.getElementById(outputId);
    this.isUserSelecting = false;

    this._bindEvents();
    this._render();
  }

  _bindEvents() {
    if (!this.inputField || !this.rendered) return;

    this.inputField.addEventListener("input", () => this._render());
    this.inputField.addEventListener("click", () =>
      setTimeout(() => this._render(), 0)
    );
    this.inputField.addEventListener("keyup", () =>
      setTimeout(() => this._render(), 0)
    );
    this.inputField.addEventListener("focus", () => this._render());

    // Track selection state
    document.addEventListener("selectstart", () => {
      this.isUserSelecting = true;
    });

    document.addEventListener("selectionchange", () => {
      const selection = window.getSelection();
      if (!selection || selection.toString().length === 0) {
        // TODO: 100ms might be too much, but works for now
        setTimeout(() => {
          this.isUserSelecting = false;
        }, 100);
      }
    });

    document.addEventListener("keydown", (e) => {
      if (this.isUserSelecting) return;

      const selection = window.getSelection();
      const hasSelection = selection && selection.toString().length > 0;

      if (hasSelection) return;

      const settingsModal = document.getElementById("settings-modal");
      const isModalOpen =
        settingsModal && !settingsModal.classList.contains("hidden");

      if (isModalOpen) {
        if (e.key.length === 1 || e.key === "Enter") {
          settingsModal.classList.add("hidden");
          if (e.key.length === 1) {
            e.preventDefault();
            this.inputField.focus();
            this.inputField.value += e.key;
            this._render();
          }
        }
        return;
      }

      if (e.key.length === 1 && document.activeElement !== this.inputField) {
        e.preventDefault();
        this.inputField.focus();
        this.inputField.value += e.key;
        this._render();
      }
    });

    let clickTimeout;
    document.addEventListener("mousedown", (e) => {
      const settingsModal = document.getElementById("settings-modal");
      if (
        (settingsModal && settingsModal.contains(e.target)) ||
        this.inputField.contains(e.target)
      ) {
        return;
      }

      if (clickTimeout) {
        clearTimeout(clickTimeout);
        clickTimeout = null;
      }
    });

    document.addEventListener("mouseup", (e) => {
      const settingsModal = document.getElementById("settings-modal");
      if (
        (settingsModal && settingsModal.contains(e.target)) ||
        this.inputField.contains(e.target)
      ) {
        return;
      }

      clickTimeout = setTimeout(() => {
        const selection = window.getSelection();
        const hasSelection = selection && selection.toString().length > 0;

        if (!hasSelection && !this.isUserSelecting) {
          const modal = document.getElementById("settings-modal");
          if (!modal || modal.classList.contains("hidden")) {
            this.inputField.focus();
          }
        }
      }, 50); // Small delay to allow selection to register
    });

    this.inputField.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();

        const command = this.getValue();
        this.clear();
        this.printToOutput(command);

        if (!started) {
          handleWelcome(command, loadTasks).then((didStart) => {
            started = didStart;
          });
        } else {
          executeCommand(command);
        }

        this._scrollToBottom();
      }

      if (
        event.key === "ArrowLeft" ||
        event.key === "ArrowRight" ||
        event.key === "ArrowUp" ||
        event.key === "ArrowDown" ||
        event.key === "Home" ||
        event.key === "End"
      ) {
        setTimeout(() => this._render(), 0);
      }

      if (event.key === "Backspace" || event.key === "Delete") {
        setTimeout(() => this._render(), 0);
      }
    });
  }

  _render() {
    const value = this.inputField.value;
    const selectionStart = this.inputField.selectionStart;
    const selectionEnd = this.inputField.selectionEnd;
    const hasSelection = selectionStart !== selectionEnd;
    const cursorPosition = selectionStart;

    if (value.length === 0) {
      const caretClass = hasSelection
        ? "custom-caret custom-caret--selected"
        : "custom-caret";
      this.rendered.innerHTML = `<span class="${caretClass}">&nbsp;</span>`;
    } else {
      const chars = value.split("").map((char, index) => {
        let className = "";

        if (hasSelection && index >= selectionStart && index < selectionEnd) {
          className = "selected";
        }

        if (!hasSelection && index === cursorPosition) {
          className = "custom-caret";
        }

        return `<span${
          className ? ` class="${className}"` : ""
        }>${char}</span>`;
      });

      this.rendered.innerHTML = chars.join("");

      if (!hasSelection && cursorPosition >= value.length) {
        this.rendered.innerHTML += `<span class="custom-caret">&nbsp;</span>`;
      }
    }

    this._scrollToBottom();
  }

  getValue() {
    return this.inputField.value.trim();
  }

  clear() {
    this.inputField.value = "";
    this._render();
    this.inputField.focus();
  }

  focus() {
    this.inputField.focus();
  }

  printToOutput(command) {
    const div = document.createElement("div");
    div.className = "terminal-line";

    const prompt = document.createElement("span");
    prompt.className = "prompt-symbol";
    prompt.textContent = "user@machine:~$ ";

    const text = document.createTextNode(command);

    div.append(prompt, text);
    this.output.appendChild(div);
  }

  _scrollToBottom() {
    const terminal = document.getElementById("terminal");
    if (terminal) terminal.scrollTop = terminal.scrollHeight;
  }
}

export function showWelcomeMessage() {
  printOutput(`<strong>${t("terminal.ui.welcome.title")}</strong>`);
  printOutput("&nbsp;");
  printOutput(t("terminal.ui.welcome.intro.1"));
  printOutput(t("terminal.ui.welcome.intro.2"));
  printOutput("&nbsp;");
  printOutput(t("terminal.ui.welcome.gettingStarted"));
  printOutput(t("terminal.ui.welcome.help"));
  printOutput(t("terminal.ui.welcome.man"));
  printOutput(t("terminal.ui.welcome.followTasks"));
  printOutput("&nbsp;");
  printOutput(t("command.help.systemCommands"));
  printOutput(t("command.help.systemCommandsList.hint"));
  printOutput(t("command.help.systemCommandsList.theme"));
  printOutput(t("command.help.systemCommandsList.progress"));
  printOutput(t("command.help.systemCommandsList.language"));
  printOutput(t("command.help.systemCommandsList.fullscreen"));
  printOutput(t("command.help.systemCommandsList.clear"));
  printOutput(t("command.help.systemCommandsList.task"));
  printOutput("&nbsp;");
  printOutput(t("terminal.ui.welcome.ready"));
}

export function printOutput(html) {
  const output = document.getElementById("output");
  if (!output) return;

  const div = document.createElement("div");
  div.className = "terminal-line";
  div.innerHTML = html;
  output.appendChild(div);
}

export function scrollToBottom() {
  const terminal = document.getElementById("terminal");
  if (terminal) terminal.scrollTop = terminal.scrollHeight;
}

export function disableInput() {
  const input = document.getElementById("hidden-input");
  if (input) input.disabled = true;
}

export function hideCaret() {
  const rendered = document.getElementById("custom-rendered-input");
  if (!rendered) return;

  rendered.querySelectorAll(".custom-caret").forEach((el) => {
    el.classList.remove("custom-caret", "custom-caret--selected");
    el.style.backgroundColor = "transparent";
    el.style.color = "inherit";
  });
}

export function clearTerminal() {
  const output = document.getElementById("output");
  if (output) {
    output.innerHTML = "";
  }
}

export function setStarted(value) {
  started = value;
}

export function getStarted() {
  return started;
}
