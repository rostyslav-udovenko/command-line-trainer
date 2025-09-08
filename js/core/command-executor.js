import { applyTheme } from "../ui/theme-manager.js";
import { virtualFileSystem, getDirectory, resolvePath } from "./file-system.js";
import {
  printOutput,
  scrollToBottom,
  setStarted,
  clearTerminal,
} from "../ui/terminal-ui.js";
import {
  checkTask,
  tasks,
  currentTaskIndex,
  setCurrentTaskIndex,
  setHintsEnabled,
  hasCompletedAllTasks,
  loadTasks,
  getModuleProgress,
} from "./task-manager.js";
import { showMatrix } from "../effects/matrix-mode.js";
import { switchLocale, t } from "./i18n.js";

const manPages = {
  cd: "manual.cd",
  ls: "manual.ls",
  pwd: "manual.pwd",
  mkdir: "manual.mkdir",
  rmdir: "manual.rmdir",
  touch: "manual.touch",
  help: "manual.help",
  man: "manual.man",
  cat: "manual.cat",
  less: "manual.less",
  file: "manual.file",
  cp: "manual.cp",
  mv: "manual.mv",
  rm: "manual.rm",
  chmod: "manual.chmod",
  stat: "manual.stat",
  date: "manual.date",
  whoami: "manual.whoami",
  uptime: "manual.uptime",
  mount: "manual.mount",
  clear: "manual.clear",
  task: "manual.task",
  progress: "manual.progress",
  grep: "manual.grep",
  sort: "manual.sort",
};

export async function executeCommand(command) {
  const [cmd, ...args] = command.trim().split(" ");

  if (!cmd) {
    printOutput(t("command.error.enterCommand"));
    scrollToBottom();
    return;
  }

  // Don't let user continue after finishing all tasks (except reset)
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

  // System commands don't count for task validation
  const systemCmds = [
    "help",
    "man",
    "hint",
    "theme",
    "language",
    "progress",
    "clear",
    "task",
  ];
  const isSystemCmd = systemCmds.includes(cmd);

  // Check if command failed or showed usage - these don't count as task progress
  const usageMessages = [
    t("command.cat.usage"),
    t("command.ls.usage"),
    t("command.cd.usage"),
    t("command.mkdir.usage"),
    t("command.rmdir.usage"),
    t("command.touch.usage"),
    t("command.cp.usage"),
    t("command.mv.usage"),
    t("command.rm.usage"),
    t("command.chmod.usage"),
    t("command.stat.usage"),
    t("command.date.usage"),
    t("command.whoami.usage"),
    t("command.uptime.usage"),
    t("command.mount.usage"),
    t("command.theme.usage"),
    t("command.language.usage"),
    t("command.progress.usage"),
    t("command.man.usage"),
    t("command.clear.usage"),
    t("command.task.usage"),
    t("command.grep.usage"),
    t("command.sort.usage"),
  ];

  // Check if command failed or showed usage - these don't count as task progress
  const isError =
    typeof result === "string" &&
    (usageMessages.some((usage) => result.startsWith(usage)) ||
      result.startsWith(t("command.error.notFound")) ||
      result.startsWith(t("command.error.noSuchFile")) ||
      result.startsWith(t("command.error.dirNotFound")));

  if (!isSystemCmd) {
    checkTask(command, cmd, result, isError);
  }

  scrollToBottom();
}

function changeDirectory(dir) {
  const newPath = resolvePath(virtualFileSystem.currentDirectory, dir);
  const dirNode = getDirectory(newPath);

  if (dirNode) {
    virtualFileSystem.currentDirectory = newPath;
    return t("command.cd.changed", { path: newPath });
  } else {
    return t("command.error.dirNotFound", { dir });
  }
}

function createDirectory(name) {
  const currentDir = getDirectory(virtualFileSystem.currentDirectory);
  if (currentDir && !currentDir.children[name]) {
    currentDir.children[name] = { name, type: "dir", children: {} };
    return t("command.mkdir.success", { name });
  }
  return t("command.mkdir.exists", { name });
}

function removeDirectory(name) {
  const currentDir = getDirectory(virtualFileSystem.currentDirectory);
  if (!currentDir || !currentDir.children[name]) {
    return t("command.error.dirNotFound", { dir: name });
  }

  const dir = currentDir.children[name];
  if (dir.type !== "dir") {
    return t("command.rmdir.notDirectory", { name });
  }

  if (Object.keys(dir.children).length > 0) {
    return t("command.rmdir.notEmpty", { name });
  }

  delete currentDir.children[name];
  return t("command.rmdir.removed", { name });
}

function createProgressBar(percentage, width = 12) {
  const filled = Math.round((percentage / 100) * width);
  const empty = width - filled;
  return "[" + "█".repeat(filled) + "░".repeat(empty) + "]";
}

const commands = {
  pwd: (args) => {
    if (args.length > 0) return t("command.pwd.usage");
    return virtualFileSystem.currentDirectory;
  },

  ls: (args) => {
    const currentDir = getDirectory(virtualFileSystem.currentDirectory);
    if (!currentDir) return t("command.error.dirNotFound");

    const entries = Object.values(currentDir.children || {});
    if (!entries.length) return t("command.ls.empty");

    // Only support no args or -l flag
    if (args.length > 1 || (args.length === 1 && args[0] !== "-l")) {
      return t("command.ls.usage");
    }

    const longFormat = args[0] === "-l";

    return entries
      .map((item) => {
        const exec = item.meta?.isExecutable ? "*" : "";
        return longFormat ? item.name + exec : item.name;
      })
      .join(longFormat ? "\n" : " ");
  },

  cd: ([dir]) => (dir ? changeDirectory(dir) : t("command.cd.usage")),

  mkdir: ([name]) => (name ? createDirectory(name) : t("command.mkdir.usage")),

  rmdir: ([name]) => (name ? removeDirectory(name) : t("command.rmdir.usage")),

  touch: ([name]) => {
    if (!name) return t("command.touch.usage");

    const currentDir = getDirectory(virtualFileSystem.currentDirectory);
    if (!currentDir) return t("command.error.dirNotFound");

    const now = new Date().toISOString();
    const file = currentDir.children[name];

    if (file?.type === "file") {
      file.meta = file.meta || {};
      file.meta.lastModified = now;
      return t("command.touch.touched", { name });
    }

    // Create new file
    currentDir.children[name] = {
      name,
      type: "file",
      content: "",
      meta: { lastModified: now },
    };

    return t("command.touch.created", { name });
  },

  cat: ([name]) => {
    if (!name) return t("command.cat.usage");

    const currentDir = getDirectory(virtualFileSystem.currentDirectory);
    const file = currentDir?.children[name];

    if (file?.type === "file") {
      return file.content || "";
    }

    return t("command.error.noSuchFile", { name });
  },

  less: ([name]) => {
    if (!name) return t("command.less.usage");

    const currentDir = getDirectory(virtualFileSystem.currentDirectory);
    const file = currentDir?.children[name];

    if (file?.type === "file") {
      return file.content || "";
    }

    return t("command.error.noSuchFile", { name });
  },

  file: ([name]) => {
    if (!name) return t("command.file.usage");

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

    const destNode = currentDir.children[dest];

    if (destNode?.type === "dir") {
      destNode.children[src] = {
        name: src,
        type: "file",
        content: sourceFile.content || "",
      };
      delete currentDir.children[src];
      return t("command.mv.moved", { src, dest });
    }

    currentDir.children[dest] = {
      name: dest,
      type: "file",
      content: sourceFile.content || "",
    };
    delete currentDir.children[src];
    return t("command.mv.renamed", { src, dest });
  },

  rm: ([name]) => {
    const currentDir = getDirectory(virtualFileSystem.currentDirectory);
    if (!name) return t("command.rm.usage");
    if (currentDir?.children[name]?.type === "file") {
      delete currentDir.children[name];
      return t("command.rm.removed", { name });
    }
    return t("command.error.noSuchFile", { name });
  },

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

  date: (args) => {
    if (args.length > 0) return t("command.date.usage");
    return new Date().toString();
  },

  whoami: (args) => {
    if (args.length > 0) return t("command.whoami.usage");
    return "user";
  },

  uptime: (args) => {
    if (args.length > 0) return t("command.uptime.usage");

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

  mount: (args) => {
    if (args.length > 0) return t("command.mount.usage");

    return [
      "/dev/sda1 on / type ext4 (rw,relatime,data=ordered)",
      "proc on /proc type proc (rw,nosuid,nodev,noexec,relatime)",
      "sysfs on /sys type sysfs (rw,nosuid,nodev,noexec,relatime)",
      "tmpfs on /run type tmpfs (rw,nosuid,nodev,size=1638400k,mode=755)",
    ].join("\n");
  },

  clear: (args) => {
    if (args.length > 0) return t("command.clear.usage");
    clearTerminal();
    return null;
  },

  task: (args) => {
    if (args.length > 0) return t("command.task.usage");

    if (hasCompletedAllTasks()) {
      return t("command.task.allCompleted");
    }

    const currentTask = tasks[currentTaskIndex];
    if (!currentTask) {
      return t("command.task.noTask");
    }

    printOutput(`<strong>${currentTask.moduleName}</strong>`);
    printOutput(
      `<strong>${t("task.manager.task.label")} ${currentTask.id}:</strong> ${t(
        currentTask.description
      )}`
    );
    return null;
  },

  help: () => {
    printOutput(t("command.help.availableCommands"));
    printOutput(t("command.help.userCommandsList"));
    printOutput("&nbsp;");
    printOutput(t("command.help.systemCommands"));
    printOutput(t("command.help.systemCommandsList.hint"));
    printOutput(t("command.help.systemCommandsList.theme"));
    printOutput(t("command.help.systemCommandsList.progress"));
    printOutput(t("command.help.systemCommandsList.language"));
    printOutput(t("command.help.systemCommandsList.clear"));
    printOutput(t("command.help.systemCommandsList.task"));
    printOutput("&nbsp;");
    printOutput(t("command.help.moreInfo"));
  },

  hint: ([arg]) => {
    if (!arg) {
      return tasks[currentTaskIndex].hint
        ? t(tasks[currentTaskIndex].hint)
        : t("command.hint.noHint");
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

  neo: () => {
    showMatrix();
    return null;
  },

  progress: async ([arg]) => {
    if (!arg) {
      return t("command.progress.usage");
    }

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

    if (arg === "status") {
      if (hasCompletedAllTasks()) {
        printOutput(
          `<strong>${t("command.progress.status.allCompleted")}</strong>`
        );
        return null;
      }

      const moduleProgress = getModuleProgress();
      const totalTasks = tasks.length;
      const overallProgress = Math.round((currentTaskIndex / totalTasks) * 100);

      printOutput(
        `${t(
          "command.progress.status.overall"
        )}: ${currentTaskIndex}/${totalTasks} (${overallProgress}%)`
      );
      printOutput("&nbsp;");

      const moduleNames = Object.keys(moduleProgress);
      const maxNameLength = Math.max(...moduleNames.map((name) => name.length));

      Object.entries(moduleProgress).forEach(([moduleName, progress]) => {
        const paddedName = moduleName.padEnd(maxNameLength);
        const progressText = `${progress.completed}/${progress.total}`;
        const paddedProgress = progressText.padStart(5);
        const percentText = `${progress.percentage}%`;
        const paddedPercent = percentText.padStart(4);
        const progressBar = createProgressBar(progress.percentage);

        const line = `${paddedName} ${paddedProgress} ${progressBar} ${paddedPercent}`;
        printOutput(line);
      });

      return null;
    }

    return t("command.progress.usage");
  },

  language: async ([arg]) => {
    if (!arg) return t("command.language.usage");

    const locale = arg.toLowerCase();

    if (locale === "en" || locale === "uk") {
      const success = await switchLocale(locale);
      if (success) {
        return t("command.language.switched", { locale });
      } else {
        return t("command.error.languageSwitch");
      }
    }

    return t("command.language.usage");
  },

  theme: ([arg]) => {
    if (!arg) return t("command.theme.usage");

    const option = arg.toLowerCase();

    if (option === "light" || option === "dark" || option === "amber") {
      applyTheme(option);
      return t("command.theme.switched", { option });
    }

    return t("command.theme.usage");
  },

  man: ([cmd]) => {
    return cmd && manPages[cmd] ? t(manPages[cmd]) : t("command.man.usage");
  },

  grep: (args) => {
    if (args.length !== 2) {
      return t("command.grep.usage");
    }

    const [pattern, filename] = args;
    const currentDir = getDirectory(virtualFileSystem.currentDirectory);
    const file = currentDir?.children[filename];

    if (!file || file.type !== "file") {
      return t("command.error.noSuchFile", { name: filename });
    }

    const content = file.content || "";
    const lines = content.split("\n");
    const matchingLines = lines.filter((line) =>
      line.toLowerCase().includes(pattern.toLowerCase())
    );

    return matchingLines.join("\n");
  },

  sort: (args) => {
    if (args.length !== 1) {
      return t("command.sort.usage");
    }

    const [filename] = args;
    const currentDir = getDirectory(virtualFileSystem.currentDirectory);
    const file = currentDir?.children[filename];

    if (!file || file.type !== "file") {
      return t("command.error.noSuchFile", { name: filename });
    }

    const content = file.content || "";
    const lines = content.split("\n").filter((line) => line.trim() !== "");
    const sortedLines = lines.sort((a, b) => a.localeCompare(b));

    return sortedLines.join("\n");
  },
};
