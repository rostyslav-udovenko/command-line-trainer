import { executeCommand } from "./command-executor.js";
import { handleWelcomeInput } from "./task-manager.js";

let started = false;

export function setupInputHandler(loadTasks) {
  const inputField = document.getElementById("input");
  if (!inputField) return;

  inputField.focus();
  placeCaretAtEnd(inputField);

  document.addEventListener("keydown", (event) => {
    const isPrintableKey = event.key.length === 1;

    if (document.activeElement !== inputField && isPrintableKey) {
      event.preventDefault();

      inputField.focus();
      placeCaretAtEnd(input);
      document.execCommand("insertText", false, event.key);
    }
  });

  inputField.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();

      const command = inputField.innerText.trim();
      inputField.innerText = "";

      printCommand(command);

      if (!started) {
        started = handleWelcomeInput(command, loadTasks);
      } else {
        executeCommand(command);
      }

      scrollToBottom();
      placeCaretAtEnd(input);
    }
  });
}

export function showWelcomeMessage() {
  const output = document.getElementById("output");
  if (!output) return;

  output.innerHTML += `
    <div class="terminal-line"> 
      <strong>Welcome to the Command Line Trainer!</strong>
    </div>
    <div class="terminal-line"> 
      In this interactive simulation, you will gradually familiarize yourself with the fundamentals of UNIX-like terminal commands.
    </div>
    <div class="terminal-line"> 
      You will receive guidance on straightforward tasks such as moving through directories, generating files, and additional activities.
    </div>
    <div class="terminal-line"> 
      At any moment, you can type &#96;help&#96; to see a list of available commands.
    </div>
    <div class="terminal-line"> 
      For in-depth information on a particular command, simply enter &#96;man &lt;command&gt;&#96;.
    </div>
    <div class="terminal-line">
      Are you prepared to get started? Type &#96;y&#96; to begin or &#96;n&#96; to exit.
    </div>
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
  const inputField = document.getElementById("input");
  if (inputField) inputField.disabled = true;
}

export function enableInput() {
  const inputWrapper = document.getElementById("input-wrapper");
  const inputField = document.getElementById("input");

  if (inputWrapper) inputWrapper.style.display = "flex";
  if (inputField) {
    inputField.disabled = false;
    inputField.focus();
  }
}

function placeCaretAtEnd(el) {
  const range = document.createRange();
  const sel = window.getSelection();
  range.selectNodeContents(el);
  range.collapse(false);
  sel.removeAllRanges();
  sel.addRange(range);
}
