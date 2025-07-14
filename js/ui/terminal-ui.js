import { executeCommand } from "../core/command-executor.js";
import { handleWelcomeInput, loadTasks } from "../core/task-manager.js";
import { t } from "../core/i18n.js";

export let started = false;

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
   * @private
   * Binds event listeners for handling keyboard input and rendering the caret.
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

    // Capture printable characters even when input is not focused
    document.addEventListener("keydown", (e) => {
      if (e.key.length === 1 && document.activeElement !== this.inputField) {
        e.preventDefault();
        this.inputField.focus();
      }
    });

    // Handle command submission on Enter key
    this.inputField.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();

        const command = this.getValue();
        this.clear();
        this.printToOutput(command);

        if (!started) {
          handleWelcomeInput(command, loadTasks).then((didStart) => {
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
   * @private
   * Renders the visual representation of input text with a custom caret.
   */
  _render() {
    const value = this.inputField.value;
    const start = this.inputField.selectionStart || 0;
    const end = this.inputField.selectionEnd || 0;
    const isSelected = start !== end;

    const chars = [];

    for (let i = 0; i < value.length; i++) {
      const char = value[i] || " ";
      if (isSelected && i >= start && i < end) {
        chars.push(`<span class="selected">${char}</span>`);
      } else if (!isSelected && i === start) {
        chars.push(`<span class="custom-caret">${char || "&nbsp;"}</span>`);
      } else {
        chars.push(`<span>${char}</span>`);
      }
    }

    if (start === value.length && !isSelected) {
      chars.push(`<span class="custom-caret">&nbsp;</span>`);
    }

    this.rendered.innerHTML = chars.join("");
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
   * @private
   * Scrolls the terminal to the bottom.
   */
  _scrollToBottom() {
    const terminal = document.getElementById("terminal");
    if (terminal) terminal.scrollTop = terminal.scrollHeight;
  }
}

/**
 * Displays the initial welcome instructions in the terminal.
 */
export function showWelcomeMessage() {
  printOutput(`<strong>${t("terminal.ui.welcome.title")}</strong>`);
  printOutput("&nbsp;");
  printOutput(`${t("terminal.ui.welcome.intro.1")}`);
  printOutput(`${t("terminal.ui.welcome.intro.2")}`);
  printOutput("&nbsp;");
  printOutput(`${t("terminal.ui.welcome.gettingStarted")}`);
  printOutput(`${t("terminal.ui.welcome.help")}`);
  printOutput(`${t("terminal.ui.welcome.man")}`);
  printOutput(`${t("terminal.ui.welcome.followTasks")}`);
  printOutput("&nbsp;");
  printOutput(`${t("terminal.ui.welcome.systemCommands")}`);
  printOutput(`${t("terminal.ui.welcome.hint")}`);
  printOutput(`${t("terminal.ui.welcome.theme")}`);
  printOutput(`${t("terminal.ui.welcome.reset")}`);
  printOutput("&nbsp;");
  printOutput(`${t("terminal.ui.welcome.ready")}`);
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
