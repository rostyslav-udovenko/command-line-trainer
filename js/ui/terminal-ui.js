import { executeCommand } from "../core/command-executor.js";
import { handleWelcome, loadTasks } from "../core/task-manager.js";
import { t } from "../core/i18n.js";

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

    // Focus input if user starts typing anywhere
    document.addEventListener("keydown", (e) => {
      if (e.key.length === 1 && document.activeElement !== this.inputField) {
        e.preventDefault();
        this.inputField.focus();
      }
    });

    // Close modal if open when user starts typing
    document.addEventListener("keydown", (e) => {
      if (e.key.length === 1 || e.key === "Enter") {
        const settingsModal = document.getElementById("settings-modal");
        if (settingsModal && !settingsModal.classList.contains("hidden")) {
          settingsModal.classList.add("hidden");

          if (e.key.length === 1) {
            this.inputField.value += e.key;
            this._render();
          }
        }
      }
    });

    // Handle Enter to run command
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
    });
  }

  _render() {
    const value = this.inputField.value;
    const chars = value
      .split("")
      .map((char) => `<span>${char}</span>`)
      .join("");

    this.rendered.innerHTML =
      chars + `<span class="custom-caret">&nbsp;</span>`;
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
  printOutput(t("command.help.systemCommandsList.progress.reset"));
  printOutput(t("command.help.systemCommandsList.language"));
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
