import { executeCommand } from "../core/command-executor.js";
import { handleWelcome, loadTasks } from "../core/task-manager.js";
import { t } from "../core/i18n.js";

export let started = false;
export let caret;

/**
 * Sets the global caret instance so other modules can access and focus it.
 * @param {TerminalCaret} instance - The caret instance to store.
 */
export function setCaret(instance) {
  caret = instance;
}

/**
 * TerminalCaret handles user input rendering in a simulated terminal interface.
 * It separates visual caret display from the actual input logic using a hidden input field.
 * This allows for a more flexible and visually appealing terminal experience.
 *
 * @class TerminalCaret
 * @param {Object} options - Configuration options for the terminal caret.
 * @param {string} options.inputId - ID of the hidden input field.
 * @param {string} options.renderedId - ID of the container where the custom caret and input are rendered.
 * @param {string} options.outputId - ID of the terminal output container.
 *
 * @method _bindEvents - Binds event listeners for handling keyboard input and rendering the caret.
 * @method _render - Renders the visual representation of input text with a custom caret.
 * @method getValue - Returns the trimmed current input value.
 * @method clear - Clears the input and caret, refocuses the field.
 * @method focus - Sets focus on the hidden input field.
 * @method printToOutput - Prints the typed command into the terminal output area.
 * @method _scrollToBottom - Scrolls the terminal to the bottom.
 */
export class TerminalCaret {
  /**
   * Creates an instance of TerminalCaret.
   * @param {Object} options
   * @param {string} options.inputId - ID of the hidden input field.
   * @param {string} options.renderedId - ID of the container where the custom caret and input are rendered.
   * @param {string} options.outputId - ID of the terminal output container.
   */
  constructor({ inputId, renderedId, outputId }) {
    this.inputField = document.getElementById(inputId);
    this.rendered = document.getElementById(renderedId);
    this.output = document.getElementById(outputId);

    this._bindEvents();
    this._render();
  }

  /**
   * Binds events: input, focus, Enter key to execute commands, etc.
   * Keeps the caret always at the end and focused.
   */
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

    // Сlose modal if open when user starts typing
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

  /**
   * Renders all text as spans and always adds custom caret at the end.
   * This avoids cursor jump when typing.
   */
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

  /**
   * Returns the trimmed current input value.
   * @returns {string} The user input with surrounding whitespace removed.
   */
  getValue() {
    return this.inputField.value.trim();
  }

  /**
   * Clears the input and caret, refocuses the field.
   */
  clear() {
    this.inputField.value = "";
    this._render();
    this.inputField.focus();
  }

  /**
   * Sets focus on the hidden input field.
   */
  focus() {
    this.inputField.focus();
  }

  /**
   * Prints the typed command into the terminal output area.
   * @param {string} command - The command string to be printed.
   */
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

  /**
   * Scrolls the terminal to the bottom.
   * @private
   */
  _scrollToBottom() {
    const terminal = document.getElementById("terminal");
    if (terminal) terminal.scrollTop = terminal.scrollHeight;
  }
}

/**
 * Shows the initial welcome message in the terminal.
 */
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

/**
 * Prints a string (HTML-safe) to the output container.
 * @param {string} html - Raw HTML string to insert directly into output.
 */
export function printOutput(html) {
  const output = document.getElementById("output");
  if (!output) return;

  const div = document.createElement("div");
  div.className = "terminal-line";
  div.innerHTML = html;
  output.appendChild(div);
}

/**
 * Scrolls the terminal container to the bottom.
 */
export function scrollToBottom() {
  const terminal = document.getElementById("terminal");
  if (terminal) terminal.scrollTop = terminal.scrollHeight;
}

/**
 * Disables the hidden input field (e.g. after training is completed).
 */
export function disableInput() {
  const input = document.getElementById("hidden-input");
  if (input) input.disabled = true;
}

/**
 * Visually hides the custom caret (e.g. after training is completed).
 */
export function hideCaret() {
  const rendered = document.getElementById("custom-rendered-input");
  if (!rendered) return;

  rendered.querySelectorAll(".custom-caret").forEach((el) => {
    el.classList.remove("custom-caret", "custom-caret--selected");
    el.style.backgroundColor = "transparent";
    el.style.color = "inherit";
  });
}

/**
 * Sets the started flag for the terminal session.
 * Used to determine if training has been initiated.
 *
 * @param {boolean} value - True if training has started, false otherwise.
 */
export function setStarted(value) {
  started = value;
}

/**
 * Returns whether the training has been started.
 *
 * @returns {boolean} - True if training has started, false otherwise.
 */
export function getStarted() {
  return started;
}
