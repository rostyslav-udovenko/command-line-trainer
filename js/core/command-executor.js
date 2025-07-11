import { applyTheme } from "../ui/theme-switcher.js";
import {
  virtualFileSystem,
  getDirectory,
  normalizePath,
} from "./file-system.js";
import { printOutput, scrollToBottom, setStarted } from "../ui/terminal-ui.js";
import {
  checkTaskCompletion,
  tasks,
  currentTaskIndex,
  setCurrentTaskIndex,
  setHintsEnabled,
  hasCompletedAllTasks,
  loadTasks,
} from "./task-manager.js";
import { activateMatrixMode } from "../effects/matrix-mode.js";
import { manualPages } from "../data/manual-pages.js";

/**
 * Parses and executes a terminal command, prints result,
 * and optionally checks for task completion.
 *
 * @param {string} command - Full command string entered by user.
 */
export async function executeCommand(command) {
  const [cmd, ...args] = command.trim().split(" ");

  if (!cmd) {
    printOutput("Please enter a command.");
    scrollToBottom();
    return;
  }

  // allow "progress reset" to work even if all tasks completed
  if (hasCompletedAllTasks() && cmd !== "progress") {
    return;
  }

  let result;

  if (commands[cmd]) {
    result = await commands[cmd](args);
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
   *
   * If called with the -l flag, lists each entry on a new line and
   * marks executable files with an asterisk (*).
   * Returns usage message on unexpected arguments.
   *
   * @param {[string]} args - Optional array of command-line arguments (e.g., ["-l"]).
   * @returns {string} - Formatted directory listing or usage/error message.
   */
  ls: (args) => {
    const currentDir = getDirectory(virtualFileSystem.currentDirectory);
    if (!currentDir) return "Directory not found";

    const entries = Object.values(currentDir.children || {});
    if (!entries.length) return "No files or directories";

    // Only allow no args or a single "-l" flag
    if (args.length > 1 || (args.length === 1 && args[0] !== "-l")) {
      return "Usage: ls [-l]";
    }

    const isLongFormat = args[0] === "-l";

    return entries
      .map((item) => {
        const isExec = item.meta?.isExecutable ? "*" : "";
        return isLongFormat ? item.name + isExec : item.name;
      })
      .join(isLongFormat ? "\n" : " ");
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
    if (flag !== "+x" || !name) return "Usage: chmod +x &lt;filename&gt;";

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
   * Shows metadata of a file including last modification date.
   */
  stat: ([name]) => {
    if (!name) return "Usage: stat &lt;filename&gt;";

    const currentDir = getDirectory(virtualFileSystem.currentDirectory);
    const file = currentDir?.children[name];

    if (file?.type === "file") {
      const modified = file.meta?.lastModified || "unknown";
      return `${name}\nType: file\nLast modified: ${modified}`;
    }

    return `No such file: ${name}`;
  },

  /**
   * Displays the current date and time.
   *
   * @param {[string]} args - Optional arguments (should be empty).
   * @returns {string} - Current date or usage message.
   */
  date: (args) => {
    if (args.length > 0) {
      return "Usage: &lt;date&gt;";
    }
    return new Date().toString();
  },

  /**
   * Displays the current user name.
   *
   * @param {[string]} args - Optional arguments (should be empty).
   * @returns {string}
   */
  whoami: (args) => {
    if (args.length > 0) {
      return "Usage: &lt;whoami&gt;";
    }
    return "user";
  },

  /**
   * Simulates the `uptime` command by showing current time, uptime duration, users, and load average.
   *
   * @param {[string]} args - Optional arguments (should be empty).
   * @returns {string}
   */
  uptime: (args) => {
    if (args.length > 0) {
      return "Usage: &lt;uptime&gt;";
    }

    const now = new Date();
    const pad = (n) => n.toString().padStart(2, "0");

    const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(
      now.getSeconds()
    )}`;
    const uptimeHours = Math.floor(Math.random() * 5);
    const uptimeMinutes = Math.floor(Math.random() * 60);
    const users = 1;
    const load1 = (Math.random() * 1).toFixed(2);
    const load5 = (Math.random() * 0.8).toFixed(2);
    const load15 = (Math.random() * 0.5).toFixed(2);

    return `${time} up ${uptimeHours}:${pad(
      uptimeMinutes
    )},  ${users} user,  load average: ${load1}, ${load5}, ${load15}`;
  },

  /**
   * Simulates the `mount` command output with realistic-looking mount points.
   *
   * @param {[string]} args - Optional arguments (should be empty).
   * @returns {string}
   */
  mount: (args) => {
    if (args.length > 0) {
      return "Usage: &lt;mount&gt;";
    }

    return [
      "/dev/sda1 on / type ext4 (rw,relatime,data=ordered)",
      "proc on /proc type proc (rw,nosuid,nodev,noexec,relatime)",
      "sysfs on /sys type sysfs (rw,nosuid,nodev,noexec,relatime)",
      "tmpfs on /run type tmpfs (rw,nosuid,nodev,size=1638400k,mode=755)",
    ].join("\n");
  },

  /**
   * Prints available commands and usage.
   */
  help: () => {
    printOutput("Available commands:");
    printOutput(
      "  pwd, ls, cd, mkdir, touch, cat, less, file, cp, mv, rm, chmod, ls -l, stat, date, whoami, uptime, mount"
    );
    printOutput("&nbsp;");
    printOutput("System commands:");
    printOutput("  hint [on|off] - Toggle task hints");
    printOutput("  theme [light|dark] - Switch color theme");
    printOutput("  progress reset - Reset learning progress");
    printOutput("&nbsp;");
    printOutput("Use man &lt;command&gt; for more information.");
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
   * Resets training progress by clearing localStorage, resetting index,
   * and reloading tasks from the server so user can start fresh.
   * Usage: progress reset
   *
   * @param {[string]} args - Command arguments (should be ['reset'])
   * @returns {string|null} - Status message or null if handled asynchronously
   */
  progress: async ([arg]) => {
    if (arg === "reset") {
      localStorage.removeItem("trainerProgress");
      setCurrentTaskIndex(0);
      setHintsEnabled(true);
      tasks.length = 0;
      printOutput("Training progress has been reset. Restarting training...");
      await loadTasks();
      setStarted(true);
      return null;
    }
    return "Usage: progress reset";
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
