import {
  setupFileSystem,
  getDirectory,
  virtualFileSystem,
} from "./file-system.js";
import { printOutput, disableInput, hideCaret } from "../ui/terminal-ui.js";

/**
 * Loaded task definitions.
 * @type {Array<Object>}
 */
export let tasks = [];

/**
 * Current task index (restored from localStorage if available)
 * @type {number}
 */
export let currentTaskIndex =
  JSON.parse(localStorage.getItem("trainerProgress"))?.currentTaskIndex || 0;

/**
 * Number of attempts made for the current task.
 * @type {number}
 */
let currentAttemptCount = 0;

/**
 * Whether hints are enabled (restored from localStorage if available)
 * @type {boolean}
 */
let hintsEnabled =
  JSON.parse(localStorage.getItem("trainerProgress"))?.hintsEnabled ?? true;

/**
 * Sets the current task index
 * @param {number} index - New task index to set
 */
export function setCurrentTaskIndex(index) {
  if (typeof index === "number" && index >= 0 && index < tasks.length) {
    currentTaskIndex = index;
    saveProgress();
  }
}

/**
 * Gets the current task index
 * @returns {number} - The current task index
 */
export function getCurrentTaskIndex() {
  return currentTaskIndex;
}

/**
 * Saves the current progress to localStorage.
 */
function saveProgress() {
  localStorage.setItem(
    "trainerProgress",
    JSON.stringify({
      currentTaskIndex,
      hintsEnabled,
    })
  );
}

/**
 * Shows a task by its index: sets up file system and prints task description
 * @param {number} index
 */
function showTask(index) {
  const task = tasks[index];
  if (!task) {
    printOutput("Error: task data is missing.");
    return;
  }

  setupFileSystem(task.fs);
  virtualFileSystem.currentDirectory = task.startDirectory || "/";
  printOutput(`<strong>${task.moduleName}</strong>`);
  printOutput(`<strong>Task ${task.id}:</strong> ${task.description}`);
}

/**
 * Resets progress and reloads page
 */
export function resetProgress() {
  localStorage.removeItem("trainerProgress");
  location.reload();
}

/**
 * Handles welcome input from the user.
 * If 'y', starts training and loads tasks.
 * If 'n', cancels training and disables input.
 * If invalid input, prompts again.
 * @param {string} command - User-entered command (usually `y` or `n`).
 * @param {Function} loadTasksCallback - Callback to invoke if training is started.
 * @returns {boolean} - Whether the training was started.
 */
export async function handleWelcomeInput(command, loadTasksCallback) {
  if (command.toLowerCase() === "y") {
    printOutput("Training started!");
    printOutput(
      "Hints are enabled by default. Use `hint off` to disable or `hint on` to re-enable them."
    );
    await loadTasksCallback();
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
 * Loads all task definitions from the server.
 * Immediately shows the current task; others load in background.
 * Always keeps tasks array ordered by global index.
 */
/**
 * Loads all tasks from the server before training starts.
 * Waits for all tasks to finish loading, then displays the current task.
 * This prevents race conditions when user types the first command too fast.
 */
export async function loadTasks() {
  const modules = [
    {
      name: "Module 1 - Directory Operations",
      path: "tasks/module-1",
      count: 4,
    },
    { name: "Module 2 - File Operations", path: "tasks/module-2", count: 8 },
    {
      name: "Module 3 - File Permissions and Metadata",
      path: "tasks/module-3",
      count: 4,
    },
    { name: "Module 4 - Bash Commands", path: "tasks/module-4", count: 4 },
  ];

  try {
    // Array to collect all fetch promises
    const allTaskPromises = [];

    for (const module of modules) {
      for (let i = 1; i <= module.count; i++) {
        const url = `${module.path}/task-${i}.json`;
        const promise = fetch(url)
          .then((res) => {
            if (!res.ok) {
              throw new Error(`Failed to load task: ${url}`);
            }
            return res.json();
          })
          .then((task) => {
            task.moduleName = module.name;
            return task;
          })
          .catch((error) => {
            console.error(`Error loading task ${url}:`, error);
            return null; // return null if failed
          });
        allTaskPromises.push(promise);
      }
    }

    // Wait until all fetches complete
    const loadedTasks = await Promise.all(allTaskPromises);

    // Filter out failed ones
    const validTasks = loadedTasks.filter(Boolean);

    // Clear tasks array and fill with valid tasks
    tasks.splice(0, tasks.length, ...validTasks);

    if (tasks.length > 0) {
      if (currentTaskIndex >= tasks.length) {
        printOutput(
          "<strong>All tasks completed!</strong> Type `progress reset` to start again."
        );
      } else {
        showTask(currentTaskIndex);
      }
    } else {
      printOutput("Error: No tasks loaded or invalid progress.");
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
  if (!task) {
    printOutput("Error: task data missing.");
    return;
  }

  const check = task.check;
  const currentDir = getDirectory(virtualFileSystem.currentDirectory);

  // Combine all conditions; start with true, fail if any check fails
  let success = true;

  /**
   * Check if the entered command matches the expected task type.
   * We only compare the command keyword, not its arguments.
   * For example, `ls -l` should still match task type `ls`.
   */
  if (typeof task.type === "string" && task.type !== "" && cmd !== task.type) {
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

  // Check if a file is marked as executable
  if (check.fileExecutable) {
    const file = currentDir?.children[check.fileExecutable];
    success =
      success && file?.type === "file" && file.meta?.isExecutable === true;
  }

  // Check if output includes expected strings (supports wildcard-style executable suffix)
  if (check.expectedOutputIncludes) {
    if (typeof result === "string") {
      success =
        success &&
        check.expectedOutputIncludes.every((expected) => {
          // If expected ends with *, do prefix match (e.g. run.sh* should match run.sh)
          if (expected.endsWith("*")) {
            const prefix = expected.slice(0, -1);
            return result
              .split(/\s+/)
              .some((token) => token.startsWith(prefix));
          }

          // Exact match fallback
          return result.includes(expected);
        });
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

    // Print the success message with optional explanation
    let message = `<strong>${randomMessage}</strong>`;
    if (task.explanation) {
      message += ` ${task.explanation}`;
    }
    printOutput(message);

    currentTaskIndex++;
    saveProgress();

    // Safely show next task if it exists and is loaded
    if (currentTaskIndex < tasks.length && tasks[currentTaskIndex]) {
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
  saveProgress();
}

/**
 * Checks if all tasks have been completed.
 *
 * @returns {boolean} - True if all tasks are done, false otherwise.
 */
export function hasCompletedAllTasks() {
  return currentTaskIndex >= tasks.length;
}
