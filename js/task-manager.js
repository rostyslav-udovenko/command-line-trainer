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
  const modules = [
    {
      name: "Module 1 - Directory Operations",
      path: "tasks/module-1",
      count: 4,
    },
    {
      name: "Module 2 - File Operations",
      path: "tasks/module-2",
      count: 2,
    },
  ];

  try {
    for (const module of modules) {
      for (let i = 1; i <= module.count; i++) {
        const url = `${module.path}/task-${i}.json`;
        const response = await fetch(url);
        const task = await response.json();
        task.moduleName = module.name;
        tasks.push(task);

        if (tasks.length === 1) {
          setupFileSystem(task.fs);
          virtualFileSystem.currentDirectory = task.startDirectory || "/";
          printOutput(`<strong>${task.moduleName}</strong>`);
          printOutput(`<strong>Task ${task.id}:</strong> ${task.description}`);
        }
      }
    }
  } catch (error) {
    printOutput(`Failed to load tasks: ${error}`);
  }
}

/**
 * Checks whether the current task is completed based on defined conditions.
 * If successful, moves to the next task or finishes the training.
 * Otherwise, increases the attempt count and shows a hint if needed.
 */
export function checkTaskCompletion(
  command,
  cmd,
  result,
  isErrorOutput = false
) {
  const task = tasks[currentTaskIndex];

  if (typeof task.type === "string" && cmd !== task.type) {
    return;
  }

  if (isErrorOutput) {
    currentAttemptCount++;
    if (task.hint && currentAttemptCount >= 3 && hintsEnabled) {
      printOutput(`<strong>Hint:</strong> ${task.hint}`);
    }
    return;
  }

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

    // Array of success messages to display
    const successMessages = [
      "Well done!",
      "Task complete!",
      "Nice job!",
      "You nailed it!",
      "Task solved!",
      "Great work!",
      "You did it!",
    ];

    // Randomly select a success message
    const randomMessage =
      successMessages[Math.floor(Math.random() * successMessages.length)];

    printOutput(`<strong>${randomMessage}</strong>`);

    currentTaskIndex++;
    if (currentTaskIndex < tasks.length) {
      const nextTask = tasks[currentTaskIndex];

      // If the module name changes, print it
      if (task.moduleName !== nextTask.moduleName) {
        printOutput(`<strong>${nextTask.moduleName}</strong>`);
      }

      setupFileSystem(nextTask.fs);
      virtualFileSystem.currentDirectory = nextTask.startDirectory || "/";
      printOutput(
        `<strong>Task ${nextTask.id}:</strong> ${nextTask.description}`
      );
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

/**
 * Checks if all tasks have been completed.
 *
 * @returns {boolean} - True if all tasks are done, false otherwise.
 */
export function hasCompletedAllTasks() {
  return currentTaskIndex >= tasks.length;
}
