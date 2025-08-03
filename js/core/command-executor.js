import { applyTheme } from "../ui/theme-manager.js";
import {
  virtualFileSystem,
  getDirectory,
  normalizePath,
} from "./file-system.js";
import { printOutput, scrollToBottom, setStarted } from "../ui/terminal-ui.js";
import {
  checkTask,
  tasks,
  currentTaskIndex,
  setCurrentTaskIndex,
  setHintsEnabled,
  hasCompletedAllTasks,
  loadTasks,
} from "./task-manager.js";
import { activateMatrixMode } from "../effects/matrix-mode.js";
import { manualPages } from "../data/manual-pages.js";
import { loadLocale, t } from "./i18n.js";

/**
 * Parses and executes a terminal command, prints result,
 * and optionally checks for task completion.
 *
 * @param {string} command - Full command string entered by user.
 */
export async function executeCommand(command) {
  const [cmd, ...args] = command.trim().split(" ");

  if (!cmd) {
    printOutput(t("command.error.enterCommand"));
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
    result = `${t("command.error.notFound")} ${cmd}`;
  }

  if (result) {
    printOutput(result);
  }

  // Only check task completion if the command is valid and not an error/usage response
  const systemCommands = [
    "help",
    "man",
    "hint",
    "theme",
    "language",
    "progress",
  ];
  const isSystemCmd = systemCommands.includes(cmd);

  const usageKeys = [
    "command.cat.usage",
    "command.ls.usage",
    "command.cd.usage",
    "command.mkdir.usage",
    "command.touch.usage",
    "command.cp.usage",
    "command.mv.usage",
    "command.rm.usage",
    "command.chmod.usage",
    "command.stat.usage",
    "command.date.usage",
    "command.whoami.usage",
    "command.uptime.usage",
    "command.mount.usage",
    "command.theme.usage",
    "command.language.usage",
    "command.progress.usage",
    "command.man.usage",
  ];

  const isErrorOutput =
    (typeof result === "string" &&
      usageKeys.some((key) => result.startsWith(t(key)))) ||
    result.startsWith(t("command.error.notFound")) ||
    result.startsWith(t("command.error.noSuchFile")) ||
    result.startsWith(t("command.error.dirNotFound"));

  if (!isSystemCmd) {
    checkTask(command, cmd, result, isErrorOutput);
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
    return t("command.cd.changed", { path: newPath });
  } else {
    return t("command.error.dirNotFound", { dir });
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
    return t("command.mkdir.success", { name });
  }
  return t("command.mkdir.exists", { name });
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
    if (!currentDir) return t("command.error.dirNotFound");

    const entries = Object.values(currentDir.children || {});
    if (!entries.length) return t("command.ls.empty");

    // Only allow no args or a single "-l" flag
    if (args.length > 1 || (args.length === 1 && args[0] !== "-l")) {
      return t("command.ls.usage");
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
  cd: ([dir]) => (dir ? changeDirectory(dir) : t("command.cd.usage")),

  /**
   * Creates a new directory.
   * @param {[string]} args - Array with one directory name.
   * @returns {string}
   */
  mkdir: ([name]) => (name ? createDirectory(name) : t("command.mkdir.usage")),

  /**
   * Creates a new file or updates last modified time if it exists.
   * @param {[string]} args - Array with one file name.
   * @returns {string}
   */
  touch: ([name]) => {
    if (!name) return t("command.touch.usage");

    const currentDir = getDirectory(virtualFileSystem.currentDirectory);
    if (!currentDir) return t("command.error.dirNotFound");

    const now = new Date().toISOString();
    const file = currentDir.children[name];

    // Update lastModified if file exists
    if (file?.type === "file") {
      file.meta = file.meta || {};
      file.meta.lastModified = now;
      return t("command.touch.touched", { name });
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

    return t("command.touch.created", { name });
  },

  /**
   * Outputs file contents using `cat`.
   * @param {[string]} args - Array with one file name.
   * @returns {string}
   */
  cat: ([name]) => {
    if (!name) {
      return t("command.cat.usage");
    }

    const currentDir = getDirectory(virtualFileSystem.currentDirectory);
    const file = currentDir?.children[name];

    if (file?.type === "file") {
      return file.content || ""; // If content is missing, show empty string
    }

    return t("command.error.noSuchFile", { name });
  },

  /**
   * Displays file contents in a simulated pager using `less`.
   * @param {[string]} args - Array with one file name.
   * @returns {string}
   */
  less: ([name]) => {
    if (!name) {
      return t("command.less.usage");
    }

    const currentDir = getDirectory(virtualFileSystem.currentDirectory);
    const file = currentDir?.children[name];

    if (file?.type === "file") {
      return file.content || "";
    }

    return t("command.error.noSuchFile", { name });
  },

  /**
   * Simulates inspecting a file type using `file`.
   * @param {[string]} args - Array with one file name.
   * @returns {string}
   */
  file: ([name]) => {
    if (!name) {
      return t("command.file.usage");
    }

    const currentDir = getDirectory(virtualFileSystem.currentDirectory);
    const node = currentDir?.children[name];

    if (!node) {
      return t("command.error.noSuchFile", { name });
    }

    if (node.type === "dir") {
      return t("command.file.isDirectory", { name });
    }

    return t("command.file.isFile", { name });
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
      return t("command.cp.usage");
    }

    const [src, dest] = args;
    const sourceFile = currentDir?.children[src];

    if (sourceFile?.type === "file") {
      currentDir.children[dest] = {
        name: dest,
        type: "file",
        content: sourceFile.content || "",
      };
      return t("command.cp.copied", { src, dest });
    }

    return t("command.error.sourceNotFound", { src });
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
      return t("command.mv.usage");
    }

    const [src, dest] = args;
    const sourceFile = currentDir?.children[src];

    if (!sourceFile || sourceFile.type !== "file") {
      return t("command.error.sourceNotFound", { src });
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
      return t("command.mv.moved", { src, dest });
    }

    // Otherwise: rename file in current directory
    currentDir.children[dest] = {
      name: dest,
      type: "file",
      content: sourceFile.content || "",
    };
    delete currentDir.children[src];
    return t("command.mv.renamed", { src, dest });
  },

  /**
   * Removes a file from the current directory.
   */
  rm: ([name]) => {
    const currentDir = getDirectory(virtualFileSystem.currentDirectory);
    if (!name) return t("command.rm.usage");
    if (currentDir?.children[name]?.type === "file") {
      delete currentDir.children[name];
      return t("command.rm.removed", { name });
    }
    return t("command.error.noSuchFile", { name });
  },

  /**
   * Changes file permissions to executable using `chmod +x`.
   */
  chmod: ([flag, name]) => {
    if (flag !== "+x" || !name) return t("command.chmod.usage");

    const currentDir = getDirectory(virtualFileSystem.currentDirectory);
    const file = currentDir?.children[name];

    if (file?.type === "file") {
      file.meta = file.meta || {};
      file.meta.isExecutable = true;
      return t("command.chmod.success", { name });
    }

    return t("command.error.noSuchFile", { name });
  },

  /**
   * Shows metadata of a file including last modification date.
   */
  stat: ([name]) => {
    if (!name) return t("command.stat.usage");

    const currentDir = getDirectory(virtualFileSystem.currentDirectory);
    const file = currentDir?.children[name];

    if (file?.type === "file") {
      const modified = file.meta?.lastModified || "unknown";
      return `${name}\n${t("command.stat.type")}\n${t(
        "command.stat.lastModified",
        { modified }
      )}`;
    }

    return t("command.error.noSuchFile", { name });
  },

  /**
   * Displays the current date and time.
   *
   * @param {[string]} args - Optional arguments (should be empty).
   * @returns {string} - Current date or usage message.
   */
  date: (args) => {
    if (args.length > 0) {
      return t("command.date.usage");
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
      return t("command.whoami.usage");
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
      return t("command.uptime.usage");
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
      return t("command.mount.usage");
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
    printOutput(t("command.help.availableCommands"));
    printOutput(t("command.help.userCommandsList"));
    printOutput("&nbsp;");
    printOutput(t("command.help.systemCommands"));
    printOutput(t("command.help.systemCommandsList.hint"));
    printOutput(t("command.help.systemCommandsList.theme"));
    printOutput(t("command.help.systemCommandsList.progress.reset"));
    printOutput(t("command.help.systemCommandsList.language"));
    printOutput("&nbsp;");
    printOutput(t("command.help.moreInfo"));
  },

  /**
   * Toggles or displays hints for the current task.
   * @param {[string]} args - Optional argument: 'on' or 'off'
   * @returns {string}
   */
  hint: ([arg]) => {
    if (!arg) {
      return tasks[currentTaskIndex].hint || t("command.hint.noHint");
    }

    const option = arg.toLowerCase();

    if (option === "off" || option === "disable") {
      setHintsEnabled(false);
      return t("task.manager.hints.disabled");
    }

    if (option === "on" || option === "enable") {
      setHintsEnabled(true);
      return t("task.manager.hints.enabled");
    }

    return t("command.hint.usage");
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
      printOutput(t("command.progress.reset"));
      await loadTasks();
      setStarted(true);
      return null;
    }
    return t("command.progress.usage");
  },

  /**
   * Changes the application language.
   * Accepts either "en" or "uk" as valid arguments and reloads translations.
   * Updates localStorage so preference persists.
   *
   * @param {[string]} args - An array with a single argument: the desired locale.
   * @returns {string} - Confirmation message or usage hint.
   */
  language: async ([arg]) => {
    if (!arg) {
      return t("command.language.usage");
    }

    const locale = arg.toLowerCase();

    if (locale === "en" || locale === "uk") {
      await loadLocale(locale);
      localStorage.setItem("locale", locale);
      return t("command.language.switched", { locale });
    }

    return t("command.language.usage");
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
      return t("command.theme.usage");
    }

    const option = arg.toLowerCase();

    if (option === "light" || option === "dark") {
      applyTheme(option);
      return t("command.theme.switched", { option });
    }

    return t("command.theme.usage");
  },
};

/**
 * Shows manual information for a command, if available.
 *
 * @param {[string]} args - Command name to show documentation for.
 * @returns {string}
 */
commands.man = ([cmd]) =>
  cmd && manualPages[cmd] ? t(manualPages[cmd]) : t("command.man.usage");
