import { executeCommand } from "./command-executor.js";
import { handleWelcomeInput } from "./task-manager.js";

let started = false;

export function setupInputHandler(loadTasks) {
  const inputField = document.getElementById("hidden-input");
  const rendered = document.getElementById("custom-rendered-input");

  if (!inputField || !rendered) return;

  inputField.focus();
  updateCaret(inputField, rendered);

  document.addEventListener("keydown", (event) => {
    const isPrintableKey = event.key.length === 1;

    if (document.activeElement !== inputField && isPrintableKey) {
      event.preventDefault();
      inputField.focus();
    }
  });

  inputField.addEventListener("input", () => {
    updateCaret(inputField, rendered);
  });

  inputField.addEventListener("click", () => {
    setTimeout(() => updateCaret(inputField, rendered), 0);
  });

  inputField.addEventListener("keyup", () => {
    setTimeout(() => updateCaret(inputField, rendered), 0);
  });

  inputField.addEventListener("focus", () => {
    updateCaret(inputField, rendered);
  });

  inputField.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();

      const command = inputField.value.trim();
      inputField.value = "";
      updateCaret(inputField, rendered);

      printCommand(command);

      if (!started) {
        started = handleWelcomeInput(command, loadTasks);
      } else {
        executeCommand(command);
      }

      scrollToBottom();
    }
  });
}

function updateCaret(inputField, renderedContainer) {
  const value = inputField.value;
  const start = inputField.selectionStart || 0;
  const end = inputField.selectionEnd || 0;
  const isSelected = start !== end;

  renderedContainer.innerHTML = value
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
    renderedContainer.innerHTML += `<span class="custom-caret">&nbsp;</span>`;
  }
}

export function showWelcomeMessage() {
  const output = document.getElementById("output");
  if (!output) return;

  output.innerHTML += `
    <div class="terminal-line"><strong>Welcome to the Command Line Trainer!</strong></div>
    <div class="terminal-line">In this interactive simulation, you will gradually familiarize yourself with the fundamentals of UNIX-like terminal commands.</div>
    <div class="terminal-line">You will receive guidance on straightforward tasks such as moving through directories, generating files, and additional activities.</div>
    <div class="terminal-line">At any moment, you can type &#96;help&#96; to see a list of available commands.</div>
    <div class="terminal-line">For in-depth information on a particular command, simply enter &#96;man &lt;command&gt;&#96;.</div>
    <div class="terminal-line">Are you prepared to get started? Type &#96;y&#96; to begin or &#96;n&#96; to exit.</div>
  `;
}

export function printCommand(command) {
  const output = document.getElementById("output");
  if (!output) return;

  output.innerHTML += `
    <div class="terminal-line">
      <span class="prompt-symbol">$&nbsp;</span>${command}
    </div>
  `;
}

export function printOutput(text) {
  const output = document.getElementById("output");
  if (!output) return;

  output.innerHTML += `
    <div class="terminal-line">
      ${text}
    </div>
  `;
}

export function scrollToBottom() {
  const terminal = document.getElementById("terminal");
  if (terminal) terminal.scrollTop = terminal.scrollHeight;
}

export function disableInput() {
  const inputField = document.getElementById("hidden-input");
  if (inputField) inputField.disabled = true;
}

export function enableInput() {
  const inputWrapper = document.getElementById("input-wrapper");
  const inputField = document.getElementById("hidden-input");

  if (inputWrapper) inputWrapper.style.display = "flex";
  if (inputField) {
    inputField.disabled = false;
    inputField.focus();
  }
}
