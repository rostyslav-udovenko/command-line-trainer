import { executeCommand } from "./command-executor.js";
import { handleWelcomeInput } from "./task-manager.js";
import { loadTasks } from "./task-manager.js";

let started = false;

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

    document.addEventListener("keydown", (e) => {
      if (e.key.length === 1 && document.activeElement !== this.inputField) {
        e.preventDefault();
        this.inputField.focus();
      }
    });

    this.inputField.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();

        const command = this.getValue();
        this.clear();
        this.printToOutput(command);

        if (!started) {
          started = handleWelcomeInput(command, loadTasks);
        } else {
          executeCommand(command);
        }

        this._scrollToBottom();
      }
    });
  }

  _render() {
    const value = this.inputField.value;
    const start = this.inputField.selectionStart || 0;
    const end = this.inputField.selectionEnd || 0;
    const isSelected = start !== end;

    this.rendered.innerHTML = value
      .split("")
      .map((char, index) => {
        if (isSelected && index >= start && index < end) {
          return `<span class="custom-caret custom-caret--selected">${char}</span>`;
        }

        if (!isSelected && index === start) {
          return `<span class="custom-caret">${char || "&nbsp;"}</span>`;
        }

        return `<span>${char}</span>`;
      })
      .join("");

    if (start === value.length && !isSelected) {
      this.rendered.innerHTML += `<span class="custom-caret">&nbsp;</span>`;
    }
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
    prompt.textContent = "$ ";

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
  printOutput("<strong>Welcome to the Command Line Trainer!</strong>");
  printOutput(
    "In this interactive simulation, you will gradually familiarize yourself with the fundamentals of UNIX-like terminal commands."
  );
  printOutput(
    "You will receive guidance on straightforward tasks such as moving through directories, generating files, and additional activities."
  );
  printOutput(
    "At any moment, you can type `help` to see a list of available commands."
  );
  printOutput(
    "For in-depth information on a particular command, simply enter `man &lt;command&gt;`."
  );
  printOutput(
    "Are you prepared to get started? Type `y` to begin or `n` to exit."
  );
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
