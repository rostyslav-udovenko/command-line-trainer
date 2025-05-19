import { setupFileSystem, getDirectory } from "./file-system.js";
import { virtualFileSystem } from "./file-system.js";
import { printCommand, printOutput, disableInput } from "./terminal-ui.js";

export let tasks = [];
export let currentTaskIndex = 0;

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
    printOutput('Please enter "y" or "n".');
    return false;
  }
}

export async function loadTasks() {
  try {
    const files = ["/tasks/task1.json", "/tasks/task2.json", "/tasks/task3.json"];
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
  printOutput(`<strong>New Task:</strong> ${task.description}`);
}

export function checkTaskCompletion() {
  const task = tasks[currentTaskIndex];
  const check = task.check;

  let success = false;

  const currentDir = getDirectory(virtualFileSystem.currentDirectory);

  if (check.currentDirectoryEndsWith) {
    success = virtualFileSystem.currentDirectory.endsWith(check.currentDirectoryEndsWith);
  } else if (check.fileExists) {
    success = currentDir?.children[check.fileExists]?.type === "file";
  } else if (check.dirExists) {
    success = currentDir?.children[check.dirExists]?.type === "dir";
  }

  if (success) {
    printOutput(`<strong>Task completed!</strong> ${task.description}`);
    currentTaskIndex++;
    if (currentTaskIndex < tasks.length) {
      setupFileSystem(tasks[currentTaskIndex].fs);
      virtualFileSystem.currentDirectory = tasks[currentTaskIndex].startDirectory || "/";
      showCurrentTask();
    } else {
      printOutput("<strong>Congratulations!</strong> You have completed all tasks.");
    }
  } else {
    printOutput("<strong>Incorrect action!</strong> Try again.");
  }
}
