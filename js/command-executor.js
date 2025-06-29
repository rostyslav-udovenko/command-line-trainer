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
  hasCompletedAllTasks,
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
  const [cmd, ...args] = command.trim().split(" ");

  if (!cmd) {
    printOutput("Please enter a command.");
    scrollToBottom();
    return;
  }

  // If all tasks are completed, ignore further commands
  if (hasCompletedAllTasks()) {
    return;
  }

  let result;

  if (commands[cmd]) {
    result = commands[cmd](args);
  } else {
    result = `Command not found: ${cmd}`;
  }

  if (result) {
    printOutput(result);
  }

  // Only check task completion if the command is valid and not an error/usage response
  const isSystemCmd = ["help", "man", "hint", "theme"].includes(cmd);
  const isErrorOutput =
    typeof result === "string" &&
    (result.startsWith("Usage:") ||
      result.startsWith("Command not found") ||
      result.startsWith("No such file") ||
      result.startsWith("No such directory"));

  if (!isSystemCmd) {
    checkTaskCompletion(command, cmd, result, isErrorOutput);
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
    currentDir.children[name] = { name, type: "file", content: "" };
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
   * Creates a new file or updates last modified time if it exists.
   * @param {[string]} args - Array with one file name.
   * @returns {string}
   */
  touch: ([name]) => {
    if (!name) return "Usage: touch <filename>";

    const currentDir = getDirectory(virtualFileSystem.currentDirectory);
    if (!currentDir) return "Directory not found";

    const now = new Date().toISOString();
    const file = currentDir.children[name];

    // Update lastModified if file exists
    if (file?.type === "file") {
      file.meta = file.meta || {};
      file.meta.lastModified = now;
      return `Touched ${name}`;
    }

    // Create new file with meta
    currentDir.children[name] = {
      name,
      type: "file",
      content: "",
      meta: {
        lastModified: now,
      },
    };

    return `File ${name} created`;
  },

  /**
   * Outputs file contents using `cat`.
   * @param {[string]} args - Array with one file name.
   * @returns {string}
   */
  cat: ([name]) => {
    if (!name) {
      return "Usage: cat &lt;filename&gt;";
    }

    const currentDir = getDirectory(virtualFileSystem.currentDirectory);
    const file = currentDir?.children[name];

    if (file?.type === "file") {
      return file.content || ""; // If content is missing, show empty string
    }

    return `No such file: ${name}`;
  },

  /**
   * Displays file contents in a simulated pager using `less`.
   * @param {[string]} args - Array with one file name.
   * @returns {string}
   */
  less: ([name]) => {
    if (!name) {
      return "Usage: less &lt;filename&gt;";
    }

    const currentDir = getDirectory(virtualFileSystem.currentDirectory);
    const file = currentDir?.children[name];

    if (file?.type === "file") {
      return file.content || "";
    }

    return `No such file: ${name}`;
  },

  /**
   * Simulates inspecting a file type using `file`.
   * @param {[string]} args - Array with one file name.
   * @returns {string}
   */
  file: ([name]) => {
    if (!name) {
      return "Usage: file &lt;filename&gt;";
    }

    const currentDir = getDirectory(virtualFileSystem.currentDirectory);
    const node = currentDir?.children[name];

    if (!node) {
      return `No such file: ${name}`;
    }

    if (node.type === "dir") {
      return `${name}: directory`;
    }

    return `${name}: regular file`;
  },

  /**
   * Copies a file from one name to another.
   *
   * Ensures exactly two arguments are provided: source and destination file names.
   * Copies both file metadata and content. If source file is not found,
   * or arguments are incorrect, shows usage or error message.
   *
   * @param {[string]} args - Array with command arguments.
   * @returns {string} - Status message.
   */
  cp: (args) => {
    const currentDir = getDirectory(virtualFileSystem.currentDirectory);

    if (args.length !== 2) {
      return "Usage: cp &lt;source&gt; &lt;destination&gt;";
    }

    const [src, dest] = args;
    const sourceFile = currentDir?.children[src];

    if (sourceFile?.type === "file") {
      currentDir.children[dest] = {
        name: dest,
        type: "file",
        content: sourceFile.content || "",
      };
      return `Copied ${src} to ${dest}`;
    }

    return `Source file not found: ${src}`;
  },

  /**
   * Moves or renames a file in the current directory.
   *
   * If the destination is a new name, the file is renamed.
   * If the destination is an existing directory, the file is moved inside.
   *
   * @param {[string]} args - Array with source and destination.
   * @returns {string} - Status message.
   */
  mv: (args) => {
    const currentDir = getDirectory(virtualFileSystem.currentDirectory);

    if (args.length !== 2) {
      return "Usage: mv &lt;source&gt; &lt;destination&gt;";
    }

    const [src, dest] = args;
    const sourceFile = currentDir?.children[src];

    if (!sourceFile || sourceFile.type !== "file") {
      return `Source file not found: ${src}`;
    }

    const destinationNode = currentDir.children[dest];

    // If destination is an existing directory -> move file into it
    if (destinationNode?.type === "dir") {
      destinationNode.children[src] = {
        name: src,
        type: "file",
        content: sourceFile.content || "",
      };
      delete currentDir.children[src];
      return `Moved ${src} to ${dest}/`;
    }

    // Otherwise: rename file in current directory
    currentDir.children[dest] = {
      name: dest,
      type: "file",
      content: sourceFile.content || "",
    };
    delete currentDir.children[src];
    return `Renamed ${src} to ${dest}`;
  },

  /**
   * Removes a file from the current directory.
   */
  rm: ([name]) => {
    const currentDir = getDirectory(virtualFileSystem.currentDirectory);
    if (!name) return "Usage: rm &lt;filename&gt;";
    if (currentDir?.children[name]?.type === "file") {
      delete currentDir.children[name];
      return `${name} removed`;
    }
    return `No such file: ${name}`;
  },

  /**
   * Changes file permissions to executable using `chmod +x`.
   */
  chmod: ([flag, name]) => {
    if (flag !== "+x" || !name) return "Usage: chmod +x <filename>";

    const currentDir = getDirectory(virtualFileSystem.currentDirectory);
    const file = currentDir?.children[name];

    if (file?.type === "file") {
      file.meta = file.meta || {};
      file.meta.isExecutable = true;
      return `Added executable permission to ${name}`;
    }

    return `No such file: ${name}`;
  },

  /**
   * Lists files in the current directory, marking executables with *.
   */
  "ls-l": () => {
    const currentDir = getDirectory(virtualFileSystem.currentDirectory);
    if (!currentDir) return "Directory not found";

    const entries = Object.values(currentDir.children || {});
    if (!entries.length) return "No files or directories";

    return entries
      .map((item) => {
        const isExec = item.meta?.isExecutable ? "*" : "";
        return item.name + isExec;
      })
      .join("\n");
  },

  /**
   * Shows metadata of a file including last modification date.
   */
  stat: ([name]) => {
    if (!name) return "Usage: stat <filename>";

    const currentDir = getDirectory(virtualFileSystem.currentDirectory);
    const file = currentDir?.children[name];

    if (file?.type === "file") {
      const modified = file.meta?.lastModified || "unknown";
      return `${name}\nType: file\nLast modified: ${modified}`;
    }

    return `No such file: ${name}`;
  },

  /**
   * Prints available commands and usage.
   */
  help: () => {
    printOutput(
      "Available commands: pwd, ls, cd, mkdir, touch, help, man, cat, less, file, cp, mv, rm, chmod, ls -l, stat. Use&nbsp;<strong>man &lt;command&gt;&nbsp;</strong>for more information."
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
