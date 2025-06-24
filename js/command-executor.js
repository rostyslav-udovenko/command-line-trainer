import { applyTheme } from "./theme-switcher.js";
import {
  virtualFileSystem,
  getDirectory,
  normalizePath,
} from "./file-system.js";
import { printOutput, scrollToBottom } from "./terminal-ui.js";
import {
  checkTaskCompletion,
  tasks,
  currentTaskIndex,
  setHintsEnabled,
} from "./task-manager.js";
import { activateMatrixMode } from "./matrix-mode.js";
import { manualPages } from "./manual-pages.js";

/**
 * Parses and executes a terminal command, prints result,
 * and optionally checks for task completion.
 *
 * @param {string} command - Full command string entered by user.
 */
export function executeCommand(command) {
  const [cmd, ...args] = command.split(" ");

  let result;

  if (commands[cmd]) {
    result = commands[cmd](args);
  } else {
    result = `Command not found: ${cmd}`;
  }

  if (result) {
    printOutput(result);
  }

  // Only check task completion for non-system commands
  if (cmd !== "help" && cmd !== "man" && cmd !== "hint" && cmd !== "theme") {
    checkTaskCompletion(command);
  }

  scrollToBottom();
}

/**
 * Changes the current working directory if valid.
 *
 * @param {string} dir - Target directory path or relative segment.
 * @returns {string} - Status message.
 */
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

/**
 * Creates a new directory in the current location.
 *
 * @param {string} name - Directory name.
 * @returns {string} - Status message.
 */
function createDirectory(name) {
  const currentDir = getDirectory(virtualFileSystem.currentDirectory);
  if (currentDir && !currentDir.children[name]) {
    currentDir.children[name] = { name, type: "dir", children: {} };
    return `Directory ${name} created`;
  }
  return `Directory ${name} already exists or invalid path`;
}

/**
 * Creates a new file in the current directory.
 *
 * @param {string} name - File name.
 * @returns {string} - Status message.
 */
function createFile(name) {
  const currentDir = getDirectory(virtualFileSystem.currentDirectory);
  if (currentDir && !currentDir.children[name]) {
    currentDir.children[name] = { name, type: "file" };
    return `File ${name} created`;
  }
  return `File ${name} already exists or invalid path`;
}

/**
 * Supported command implementations.
 * Each command is a function that returns output (or null).
 */
const commands = {
  /**
   * Prints the current working directory.
   * @returns {string}
   */
  pwd: () => virtualFileSystem.currentDirectory,

  /**
   * Lists files and directories in the current directory.
   * @returns {string}
   */
  ls: () => {
    const currentDir = getDirectory(virtualFileSystem.currentDirectory);
    return currentDir
      ? Object.keys(currentDir.children).join(" ") || "No files or directories"
      : "Directory not found";
  },

  /**
   * Changes the current directory.
   * @param {[string]} args - Array with one directory name or path.
   * @returns {string}
   */
  cd: ([dir]) => (dir ? changeDirectory(dir) : "Usage: cd &lt;directory&gt;"),

  /**
   * Creates a new directory.
   * @param {[string]} args - Array with one directory name.
   * @returns {string}
   */
  mkdir: ([name]) =>
    name ? createDirectory(name) : "Usage: mkdir &lt;directory&gt;",

  /**
   * Creates a new file.
   * @param {[string]} args - Array with one file name.
   * @returns {string}
   */
  touch: ([name]) =>
    name ? createFile(name) : "Usage: touch &lt;filename&gt;",

  /**
   * Prints available commands and usage.
   */
  help: () => {
    printOutput(
      "Available commands: pwd, ls, cd, mkdir, touch, help, man. Use&nbsp;<strong>man &lt;command&gt;&nbsp;</strong>for more information."
    );
    printOutput("System commands: hint [on|off], theme [light|dark]");
  },

  /**
   * Toggles or displays hints for the current task.
   * @param {[string]} args - Optional argument: 'on' or 'off'
   * @returns {string}
   */
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

  /**
   * Activates a matrix-mode easter egg.
   */
  neo: () => {
    activateMatrixMode();
    return null;
  },

  /**
   * Changes the visual theme of the terminal interface.
   * Accepts either "light" or "dark" as valid arguments and applies the theme accordingly.
   * Updates both the UI and the saved preference in localStorage.
   *
   * @param {[string]} arg - An array with a single argument: the desired theme.
   * @returns {string} - Confirmation message or usage hint.
   */
  theme: ([arg]) => {
    if (!arg) {
      return "Usage: theme [light|dark]";
    }

    const option = arg.toLowerCase();

    if (option === "light" || option === "dark") {
      applyTheme(option);
      return `Switched to ${option} theme.`;
    }

    return "Usage: theme [light|dark]";
  },
};

/**
 * Shows manual information for a command, if available.
 *
 * @param {[string]} args - Command name to show documentation for.
 * @returns {string}
 */
commands.man = ([cmd]) =>
  cmd && manualPages[cmd] ? manualPages[cmd] : "Usage: man &lt;command&gt;";
