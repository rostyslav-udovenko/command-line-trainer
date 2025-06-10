import {
  virtualFileSystem,
  getDirectory,
  normalizePath,
} from "./file-system.js";
import { printCommand, printOutput, scrollToBottom } from "./terminal-ui.js";
import {
  checkTaskCompletion,
  tasks,
  currentTaskIndex,
  setHintsEnabled,
} from "./task-manager.js";
import { activateMatrixMode } from "./matrix-mode.js";
import { manualPages } from "./manual-pages.js";

export function executeCommand(command) {
  const [cmd, ...args] = command.split(" ");

  printCommand(command);

  let result;

  if (commands[cmd]) {
    result = commands[cmd](args);
  } else {
    result = `Command not found: ${cmd}`;
  }

  if (result) {
    printOutput(result);
  }

  if (cmd !== "help" && cmd !== "man" && cmd !== "hint") {
    checkTaskCompletion(command);
  }

  scrollToBottom();
}

function changeDirectory(dir) {
  const newPath = normalizePath(virtualFileSystem.currentDirectory, dir);
  const dirNode = getDirectory(newPath);

  if (dirNode) {
    virtualFileSystem.currentDirectory = newPath;
    return `Changed directory to ${newPath}`;
  } else {
    return `No such directory: ${dir}`;
  }
}

function createDirectory(name) {
  const currentDir = getDirectory(virtualFileSystem.currentDirectory);
  if (currentDir && !currentDir.children[name]) {
    currentDir.children[name] = { name, type: "dir", children: {} };
    return `Directory ${name} created`;
  }
  return `Directory ${name} already exists or invalid path`;
}

function createFile(name) {
  const currentDir = getDirectory(virtualFileSystem.currentDirectory);
  if (currentDir && !currentDir.children[name]) {
    currentDir.children[name] = { name, type: "file" };
    return `File ${name} created`;
  }
  return `File ${name} already exists or invalid path`;
}

const commands = {
  pwd: () => virtualFileSystem.currentDirectory,
  ls: () => {
    const currentDir = getDirectory(virtualFileSystem.currentDirectory);
    return currentDir
      ? Object.keys(currentDir.children).join(" ") || "No files or directories"
      : "Directory not found";
  },
  cd: ([dir]) => (dir ? changeDirectory(dir) : "Usage: cd &lt;directory&gt;"),
  mkdir: ([name]) =>
    name ? createDirectory(name) : "Usage: mkdir &lt;directory&gt;",
  touch: ([name]) =>
    name ? createFile(name) : "Usage: touch &lt;filename&gt;",
  help: () => {
    printOutput("Available commands: pwd, ls, cd, mkdir, touch, help, man. Use&nbsp;<strong>man &lt;command&gt;&nbsp;</strong> for more information.");
    printOutput("System commands: hint [on|off]");
  },
  hint: ([arg]) => {
    if (!arg) {
      return tasks[currentTaskIndex].hint || "No hint available for this task.";
    }

    const option = arg.toLowerCase();
    if (option === "off" || option === "disable") {
      setHintsEnabled(false);
      return "Hints have been disabled.";
    }
    if (option === "on" || option === "enable") {
      setHintsEnabled(true);
      return "Hints have been enabled.";
    }

    return "Usage: hint [on|off]";
  },
  neo: () => {
    activateMatrixMode();
    return null;
  },
};

commands.man = ([cmd]) =>
  cmd && manualPages[cmd] ? manualPages[cmd] : "Usage: man &lt;command&gt;";
