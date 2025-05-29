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
  output.innerHTML += `
    <div class="terminal-line">
      <span class="prompt-symbol">$&nbsp;</span>${command}
    </div>
  `;
}

export function printOutput(text) {
  output.innerHTML += `
    <div class="terminal-line">
      ${text}
    </div>
  `;
}

export function scrollToBottom() {
  const terminal = document.getElementById("terminal");
  terminal.scrollTop = terminal.scrollHeight;
}

export function disableInput() {
  inputField.disabled = true;
}