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
      count: 8,
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
 *
 * Combines all conditions; all must pass to complete the task.
 *
 * @param {string} command - The full command entered by the user.
 * @param {string} cmd - The command keyword.
 * @param {string|null} result - The output of the command.
 * @param {boolean} isErrorOutput - Whether the command produced an error.
 */
export function checkTaskCompletion(
  command,
  cmd,
  result,
  isErrorOutput = false
) {
  const task = tasks[currentTaskIndex];
  const check = task.check;
  const currentDir = getDirectory(virtualFileSystem.currentDirectory);

  // Combine all conditions; start with true, fail if any check fails
  let success = true;

  // Verify command type matches task type
  if (typeof task.type === "string" && cmd !== task.type) {
    success = false;
  }

  // Check current directory path endings
  if (check.currentDirectoryEndsWith) {
    success =
      success &&
      virtualFileSystem.currentDirectory.endsWith(
        check.currentDirectoryEndsWith
      );
  }

  // Check current directory exact match
  if (check.currentDirectoryIs) {
    success =
      success &&
      virtualFileSystem.currentDirectory === check.currentDirectoryIs;
  }

  // Check if specified file exists
  if (check.fileExists) {
    success =
      success && currentDir?.children[check.fileExists]?.type === "file";
  }

  // Check if specified directory exists
  if (check.dirExists) {
    success = success && currentDir?.children[check.dirExists]?.type === "dir";
  }

  // Check if a file exists in a specific directory
  if (check.fileInDir) {
    const dirNode = currentDir?.children[check.fileInDir.dir];
    const fileNode = dirNode?.children?.[check.fileInDir.file];
    success = success && fileNode?.type === "file";
  }

  // Check if output includes expected strings
  if (check.expectedOutputIncludes) {
    if (typeof result === "string") {
      success =
        success &&
        check.expectedOutputIncludes.every((item) => result.includes(item));
    } else {
      success = false;
    }
  }

  // If command output had an error, mark as failed
  if (isErrorOutput) {
    success = false;
  }

  // Success case: all checks passed
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

    // Failure case: some checks failed
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
