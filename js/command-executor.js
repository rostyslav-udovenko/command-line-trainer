import { virtualFileSystem, getDirectory, normalizePath } from "./file-system.js";
import { printCommand, printOutput, scrollToBottom } from "./terminal-ui.js";
import { checkTaskCompletion } from "./task-manager.js";

export function executeCommand(command) {
  const [cmd, ...args] = command.split(" ");
  let result;

  if (commands[cmd]) {
    result = commands[cmd](args);
  } else {
    result = `Command not found: ${cmd}`;
  }

  printCommand(command);
  printOutput(result);
  checkTaskCompletion(command);
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
  cd: ([dir]) => dir ? changeDirectory(dir) : "Usage: cd <directory>",
  mkdir: ([name]) => name ? createDirectory(name) : "Usage: mkdir <directory>",
  touch: ([name]) => name ? createFile(name) : "Usage: touch <filename>",
};
