import { executeCommand } from "./command-executor.js";
import { handleWelcomeInput } from "./task-manager.js";

const output = document.getElementById("output");
const inputField = document.getElementById("input");

let started = false;

export function setupInputHandler(loadTasks) {
  inputField.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      const command = inputField.value.trim();
      inputField.value = "";

      if (!started) {
        started = handleWelcomeInput(command, loadTasks);
      } else {
        executeCommand(command);
      }
    }
  });
}

export function showWelcomeMessage() {
  output.innerHTML += `
    <div><strong>Welcome to the Command Line Trainer!</strong></div>
    <div>You will learn the basics of UNIX-like terminal commands.</div>
    <div>Start training? (y/n)</div>
  `;
}

export function printCommand(command) {
  output.innerHTML += `
    <div class="terminal-line">
      <span class="prompt-symbol">$&nbsp;</span>${command}
    </div>
  `;
}

export function printOutput(text) {
  output.innerHTML += `<div>${text}</div>`;
}

export function scrollToBottom() {
  const terminal = document.getElementById("terminal");
  terminal.scrollTop = terminal.scrollHeight;
}

export function disableInput() {
  inputField.disabled = true;
}
