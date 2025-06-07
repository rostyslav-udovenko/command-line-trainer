import { setupFileSystem, getDirectory } from "./file-system.js";
import { virtualFileSystem } from "./file-system.js";
import { printCommand, printOutput, disableInput } from "./terminal-ui.js";

export let tasks = [];
export let currentTaskIndex = 0;
let currentAttemptCount = 0;

export function handleWelcomeInput(command, loadTasksCallback) {
  printCommand(command);
  if (command.toLowerCase() === "y") {
    printOutput("Training started!");
    loadTasksCallback();
    return true;
  } else if (command.toLowerCase() === "n") {
    printOutput("Training canceled. See you next time!");
    disableInput();
    return false;
  } else {
    printOutput("Please enter `y` or `n`.");
    return false;
  }
}

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

function showCurrentTask() {
  const task = tasks[currentTaskIndex];
  printOutput(`<strong>Task&nbsp;${task.id}:</strong>&nbsp;${task.description}`);
}

export function checkTaskCompletion() {
  const task = tasks[currentTaskIndex];
  const check = task.check;

  let success = false;
  const currentDir = getDirectory(virtualFileSystem.currentDirectory);

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

  if (success) {
    currentAttemptCount = 0;
    printOutput(`<strong>Task completed!</strong>&nbsp;${task.description}`);
    currentTaskIndex++;
    if (currentTaskIndex < tasks.length) {
      setupFileSystem(tasks[currentTaskIndex].fs);
      virtualFileSystem.currentDirectory =
        tasks[currentTaskIndex].startDirectory || "/";
      showCurrentTask();
    } else {
      printOutput(
        "<strong>Congratulations!&nbsp;</strong>You have completed all tasks."
      );
    }
  } else {
    printOutput("<strong>Incorrect action!&nbsp;</strong>Try again.");
    currentAttemptCount++;

    if (task.hint && currentAttemptCount >= 3) {
      printOutput(`<strong>Hint:</strong>&nbsp;${task.hint}`);
    }
  }
}
