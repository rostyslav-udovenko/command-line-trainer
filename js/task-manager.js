import { setupFileSystem, getDirectory } from "./file-system.js";
import { virtualFileSystem } from "./file-system.js";
import { printOutput, disableInput, hideCaret } from "./terminal-ui.js";

/**
 * Loaded task definitions.
 * @type {Array<Object>}
 */
export let tasks = [];

/**
 * Current task index being evaluated.
 * @type {number}
 */
export let currentTaskIndex = 0;

/**
 * Number of attempts made for the current task.
 * @type {number}
 */
let currentAttemptCount = 0;

/**
 * Flag to indicate if hints are enabled.
 * @type {boolean}
 */
let hintsEnabled = true;

/**
 * Handles user input in the welcome prompt to either start or cancel the training.
 *
 * @param {string} command - User-entered command (usually `y` or `n`).
 * @param {Function} loadTasksCallback - Callback to invoke if training is started.
 * @returns {boolean} - Whether the training was started.
 */
export function handleWelcomeInput(command, loadTasksCallback) {
  if (command.toLowerCase() === "y") {
    printOutput("Training started!");
    printOutput(
      "Hints are enabled by default. Use `hint off` to disable or `hint on` to re-enable them."
    );
    loadTasksCallback();
    return true;
  } else if (command.toLowerCase() === "n") {
    printOutput("Training canceled. See you next time!");
    disableInput();
    hideCaret();
    return false;
  } else {
    printOutput("Please enter `y` or `n`.");
    return false;
  }
}

/**
 * Loads task definitions from the server, initializes file system and displays the first task.
 */
export async function loadTasks() {
  try {
    const files = [
      "/tasks/task-1.json",
      "/tasks/task-2.json",
      "/tasks/task-3.json",
      "/tasks/task-4.json",
      "/tasks/task-5.json",
    ];
    for (let i = 0; i < files.length; i++) {
      const res = await fetch(files[i]);
      const taskData = await res.json();
      tasks.push(taskData);
      if (i === 0) {
        setupFileSystem(taskData.fs);
        virtualFileSystem.currentDirectory = taskData.startDirectory || "/";
        showCurrentTask();
      }
    }
  } catch (error) {
    printOutput(`Failed to load tasks: ${error}`);
  }
}

/**
 * Prints the current task to the terminal.
 */
function showCurrentTask() {
  const task = tasks[currentTaskIndex];
  printOutput(`<strong>Task ${task.id}:</strong> ${task.description}`);
}

/**
 * Checks whether the current task is completed based on defined conditions.
 * If successful, moves to the next task or finishes the training.
 * Otherwise, increases the attempt count and shows a hint if needed.
 */
export function checkTaskCompletion() {
  const task = tasks[currentTaskIndex];
  const check = task.check;

  let success = false;
  const currentDir = getDirectory(virtualFileSystem.currentDirectory);

  // Task condition checks
  if (check.currentDirectoryEndsWith) {
    success = virtualFileSystem.currentDirectory.endsWith(
      check.currentDirectoryEndsWith
    );
  }

  if (check.currentDirectoryIs) {
    success = virtualFileSystem.currentDirectory === check.currentDirectoryIs;
  }

  if (check.fileExists) {
    success = currentDir?.children[check.fileExists]?.type === "file";
  }

  if (check.dirExists) {
    success = currentDir?.children[check.dirExists]?.type === "dir";
  }

  if (check.expectedOutputIncludes) {
    const children = Object.keys(currentDir?.children || {});
    success = check.expectedOutputIncludes.every((item) =>
      children.includes(item)
    );
  }

  // Success case
  if (success) {
    currentAttemptCount = 0;
    printOutput(`<strong>Task completed!</strong> ${task.description}`);
    currentTaskIndex++;
    if (currentTaskIndex < tasks.length) {
      setupFileSystem(tasks[currentTaskIndex].fs);
      virtualFileSystem.currentDirectory =
        tasks[currentTaskIndex].startDirectory || "/";
      showCurrentTask();
    } else {
      printOutput(
        "<strong>Congratulations! </strong>You have completed all tasks."
      );
      disableInput();
      hideCaret();
    }

    // Failure case
  } else {
    currentAttemptCount++;

    if (task.hint && currentAttemptCount >= 3 && hintsEnabled) {
      printOutput(`<strong>Hint:</strong> ${task.hint}`);
    }
  }
}

/**
 * Toggles hint visibility for tasks.
 *
 * @param {boolean} value - Whether to enable or disable hints.
 */
export function setHintsEnabled(value) {
  hintsEnabled = value;
}
