import {
  initFileSystem,
  getDirectory,
  virtualFileSystem,
} from "./file-system.js";
import {
  printOutput,
  disableInput,
  hideCaret,
  scrollToBottom,
} from "../ui/components/terminal-ui.js";
import { t } from "./i18n/i18n.js";

const SUCCESS_MESSAGES = [
  "task.manager.success.wellDone",
  "task.manager.success.taskComplete",
  "task.manager.success.niceJob",
  "task.manager.success.youNailedIt",
  "task.manager.success.taskSolved",
  "task.manager.success.greatWork",
  "task.manager.success.youDidIt",
];

export let tasks = [];
export let tasksByModule = {};

export let currentTaskIndex =
  JSON.parse(localStorage.getItem("trainerProgress"))?.currentTaskIndex || 0;

let attemptCount = 0;

let hintsEnabled =
  JSON.parse(localStorage.getItem("trainerProgress"))?.hintsEnabled ?? true;

function groupBy(array, keyFunction) {
  return array.reduce((groups, item) => {
    const key = keyFunction(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {});
}

export function setCurrentTaskIndex(index) {
  if (typeof index === "number" && index >= 0 && index < tasks.length) {
    currentTaskIndex = index;
    saveProgress();
  }
}

export function getCurrentTaskIndex() {
  return currentTaskIndex;
}

export function getModuleProgress() {
  const progress = {};

  const moduleKeyMap = {
    "Module 1 - Directory Operations": "modules.1",
    "Module 2 - File Operations": "modules.2",
    "Module 3 - File Permissions & Metadata": "modules.3",
    "Module 4 - System Commands": "modules.4",
    "Module 5 - Text Processing": "modules.5",
    "Module 6 - File Search & Navigation": "modules.6",
  };

  Object.entries(tasksByModule).forEach(([originalModuleName, moduleTasks]) => {
    const moduleTaskIds = moduleTasks.map((task) => task.globalIndex);
    const completedInModule = moduleTaskIds.filter(
      (id) => id < currentTaskIndex
    ).length;

    const moduleKey = moduleKeyMap[originalModuleName];
    const translatedName = moduleKey ? t(moduleKey) : originalModuleName;

    progress[translatedName] = {
      completed: completedInModule,
      total: moduleTasks.length,
      percentage: Math.round((completedInModule / moduleTasks.length) * 100),
    };
  });

  return progress;
}

function saveProgress() {
  localStorage.setItem(
    "trainerProgress",
    JSON.stringify({
      currentTaskIndex,
      hintsEnabled,
    })
  );
}

function showTask(index) {
  const task = tasks[index];
  if (!task) {
    printOutput(`${t("task.manager.error.taskDataMissing")}`);
    return;
  }

  initFileSystem(task.fs);
  virtualFileSystem.currentDirectory = task.startDirectory || "/";

  const output = document.getElementById("output");
  if (output) {
    const lines = [
      `<strong>${task.moduleName}</strong>`,
      `<strong>${t("task.manager.label")} ${task.id}:</strong> ${t(
        task.description
      )}`,
    ];

    lines.forEach((html) => {
      const div = document.createElement("div");
      div.className = "terminal-line";
      div.innerHTML = html;
      output.appendChild(div);
    });
  }
}

export function resetProgress() {
  localStorage.removeItem("trainerProgress");
  location.reload();
}

function printHintsStatus() {
  if (hintsEnabled) {
    printOutput(`${t("task.manager.hints.enabled")}`);
  } else {
    printOutput(`${t("task.manager.hints.disabled")}`);
  }
}

export async function handleWelcome(command, loadCallback) {
  if (command.toLowerCase() === "y") {
    printOutput(`${t("task.manager.training.started")}`);
    printHintsStatus();
    printOutput(t("task.manager.loading.tasks"));
    await loadCallback();
    scrollToBottom();
    return true;
  } else if (command.toLowerCase() === "n") {
    printOutput(`${t("task.manager.training.canceled")}`);
    disableInput();
    hideCaret();
    return false;
  } else {
    printOutput(`${t("task.manager.training.enterYorN")}`);
    return false;
  }
}

export async function loadTasks() {
  const modules = [
    {
      name: t("modules.1"),
      originalName: "Module 1 - Directory Operations",
      count: 5,
    },
    {
      name: t("modules.2"),
      originalName: "Module 2 - File Operations",
      count: 8,
    },
    {
      name: t("modules.3"),
      originalName: "Module 3 - File Permissions & Metadata",
      count: 4,
    },
    {
      name: t("modules.4"),
      originalName: "Module 4 - System Commands",
      count: 5,
    },
    {
      name: t("modules.5"),
      originalName: "Module 5 - Text Processing",
      count: 4,
    },
    {
      name: t("modules.6"),
      originalName: "Module 6 - File Search & Navigation",
      count: 4,
    },
  ];

  try {
    const taskPromises = [];
    let globalIndex = 0;

    for (let moduleIndex = 0; moduleIndex < modules.length; moduleIndex++) {
      const module = modules[moduleIndex];

      for (let taskIndex = 1; taskIndex <= module.count; taskIndex++) {
        const promise = (async () => {
          try {
            let taskData;

            if (moduleIndex === 0) {
              // Module 1
              if (taskIndex === 1)
                taskData = await import("../data/tasks/module-1/task-1.json");
              else if (taskIndex === 2)
                taskData = await import("../data/tasks/module-1/task-2.json");
              else if (taskIndex === 3)
                taskData = await import("../data/tasks/module-1/task-3.json");
              else if (taskIndex === 4)
                taskData = await import("../data/tasks/module-1/task-4.json");
              else if (taskIndex === 5)
                taskData = await import("../data/tasks/module-1/task-5.json");
            } else if (moduleIndex === 1) {
              // Module 2
              if (taskIndex === 1)
                taskData = await import("../data/tasks/module-2/task-1.json");
              else if (taskIndex === 2)
                taskData = await import("../data/tasks/module-2/task-2.json");
              else if (taskIndex === 3)
                taskData = await import("../data/tasks/module-2/task-3.json");
              else if (taskIndex === 4)
                taskData = await import("../data/tasks/module-2/task-4.json");
              else if (taskIndex === 5)
                taskData = await import("../data/tasks/module-2/task-5.json");
              else if (taskIndex === 6)
                taskData = await import("../data/tasks/module-2/task-6.json");
              else if (taskIndex === 7)
                taskData = await import("../data/tasks/module-2/task-7.json");
              else if (taskIndex === 8)
                taskData = await import("../data/tasks/module-2/task-8.json");
            } else if (moduleIndex === 2) {
              // Module 3
              if (taskIndex === 1)
                taskData = await import("../data/tasks/module-3/task-1.json");
              else if (taskIndex === 2)
                taskData = await import("../data/tasks/module-3/task-2.json");
              else if (taskIndex === 3)
                taskData = await import("../data/tasks/module-3/task-3.json");
              else if (taskIndex === 4)
                taskData = await import("../data/tasks/module-3/task-4.json");
            } else if (moduleIndex === 3) {
              // Module 4
              if (taskIndex === 1)
                taskData = await import("../data/tasks/module-4/task-1.json");
              else if (taskIndex === 2)
                taskData = await import("../data/tasks/module-4/task-2.json");
              else if (taskIndex === 3)
                taskData = await import("../data/tasks/module-4/task-3.json");
              else if (taskIndex === 4)
                taskData = await import("../data/tasks/module-4/task-4.json");
              else if (taskIndex === 5)
                taskData = await import("../data/tasks/module-4/task-5.json");
            } else if (moduleIndex === 4) {
              // Module 5
              if (taskIndex === 1)
                taskData = await import("../data/tasks/module-5/task-1.json");
              else if (taskIndex === 2)
                taskData = await import("../data/tasks/module-5/task-2.json");
              else if (taskIndex === 3)
                taskData = await import("../data/tasks/module-5/task-3.json");
              else if (taskIndex === 4)
                taskData = await import("../data/tasks/module-5/task-4.json");
            } else if (moduleIndex === 5) {
              // Module 6
              if (taskIndex === 1)
                taskData = await import("../data/tasks/module-6/task-1.json");
              else if (taskIndex === 2)
                taskData = await import("../data/tasks/module-6/task-2.json");
              else if (taskIndex === 3)
                taskData = await import("../data/tasks/module-6/task-3.json");
              else if (taskIndex === 4)
                taskData = await import("../data/tasks/module-6/task-4.json");
            }

            if (!taskData) {
              throw new Error(
                `Task not found: module-${moduleIndex + 1}/task-${taskIndex}`
              );
            }

            const task = taskData.default || taskData;
            task.moduleName = module.name;
            task.originalModuleName = module.originalName;
            task.globalIndex = globalIndex++;
            return task;
          } catch (error) {
            console.error(
              `Error loading task module-${moduleIndex + 1}/task-${taskIndex}:`,
              error
            );
            return null;
          }
        })();

        taskPromises.push(promise);
      }
    }

    const loadedTasks = await Promise.all(taskPromises);
    const validTasks = loadedTasks.filter(Boolean);

    tasks.splice(0, tasks.length, ...validTasks);

    tasksByModule = groupBy(tasks, (task) => task.originalModuleName);

    printOutput(t("task.manager.loading.done"));

    if (tasks.length > 0) {
      if (currentTaskIndex >= tasks.length) {
        printOutput(
          `<strong>${t(
            "task.manager.training.allTasksCompleted.line1"
          )}</strong> ${t("task.manager.training.allTasksCompleted.line2")}`
        );
      } else {
        showTask(currentTaskIndex);
      }
    } else {
      printOutput(`${t("task.manager.error.noTasksLoaded")}`);
    }
  } catch (error) {
    printOutput(`${t("task.manager.error.failedToLoadTasks")} ${error}`);
  }
}

document.addEventListener("localeChanged", async () => {
  if (tasks.length > 0) {
    await loadTasks();
  }
});

export function checkTask(command, cmd, result, isErrorOutput = false) {
  // TODO: refactor this monster later
  const task = tasks[currentTaskIndex];
  if (!task) {
    printOutput(`${t("task.manager.error.taskDataMissingCheck")}`);
    return;
  }

  const check = task.check;
  const currentDir = getDirectory(virtualFileSystem.currentDirectory);

  let success = true;

  if (typeof task.type === "string" && task.type !== "" && cmd !== task.type) {
    success = false;
  }

  if (check.currentDirectoryEndsWith) {
    success =
      success &&
      virtualFileSystem.currentDirectory.endsWith(
        check.currentDirectoryEndsWith
      );
  }

  if (check.currentDirectoryIs) {
    success =
      success &&
      virtualFileSystem.currentDirectory === check.currentDirectoryIs;
  }

  if (check.fileExists) {
    success =
      success && currentDir?.children[check.fileExists]?.type === "file";
  }

  if (check.fileDoesNotExist) {
    success = success && !currentDir?.children[check.fileDoesNotExist];
  }

  if (check.expectedCommandArgs) {
    const enteredArgs = command.trim().split(" ").slice(1);
    const expectedArgs = check.expectedCommandArgs;

    const argsMatch =
      JSON.stringify(enteredArgs) === JSON.stringify(expectedArgs);
    success = success && argsMatch;
  }

  if (check.dirExists) {
    success = success && currentDir?.children[check.dirExists]?.type === "dir";
  }

  if (check.dirDoesNotExist) {
    success = success && !currentDir?.children[check.dirDoesNotExist];
  }

  if (check.fileInDir) {
    const dirNode = currentDir?.children[check.fileInDir.dir];
    const fileNode = dirNode?.children?.[check.fileInDir.file];
    success = success && fileNode?.type === "file";
  }

  if (check.fileExecutable) {
    const file = currentDir?.children[check.fileExecutable];
    success =
      success && file?.type === "file" && file.meta?.isExecutable === true;
  }

  if (check.expectedOutputIncludesKeys) {
    if (typeof result === "string") {
      success =
        success &&
        check.expectedOutputIncludesKeys.every(({ key, params }) => {
          const expectedText = t(key, params || {});
          return result.includes(expectedText);
        });
    } else {
      success = false;
    }
  }

  if (check.expectedOutputIncludes) {
    if (typeof result === "string") {
      success =
        success &&
        check.expectedOutputIncludes.every((expectedText) => {
          return result.includes(expectedText);
        });
    } else {
      success = false;
    }
  }

  if (isErrorOutput) {
    success = false;
  }

  if (success) {
    attemptCount = 0;

    const randomMessage =
      SUCCESS_MESSAGES[Math.floor(Math.random() * SUCCESS_MESSAGES.length)];

    let message = `<strong>${t(randomMessage)}</strong>`;
    if (task.explanation) {
      message += ` ${t(task.explanation)}`;
    }
    printOutput(message);

    currentTaskIndex++;
    saveProgress();

    if (currentTaskIndex < tasks.length && tasks[currentTaskIndex]) {
      const nextTask = tasks[currentTaskIndex];

      if (task.moduleName !== nextTask.moduleName) {
        printOutput(`<strong>${nextTask.moduleName}</strong>`);
      }

      initFileSystem(nextTask.fs);
      virtualFileSystem.currentDirectory = nextTask.startDirectory || "/";
      printOutput(
        `<strong>${t("task.manager.label")} ${nextTask.id}:</strong> ${t(
          nextTask.description
        )}`
      );
    } else {
      printOutput(
        `<strong>${t(
          "task.manager.training.congratulations.line1"
        )}</strong> ${t("task.manager.training.congratulations.line2")}`
      );
      printOutput(`${t("task.manager.training.resetToStart")}`);
    }
  } else {
    attemptCount++;

    if (task.hint && attemptCount >= 3 && hintsEnabled) {
      printOutput(
        `<strong>${t("task.manager.hints.label")}</strong> ${t(task.hint)}`
      );
    }
  }
}

export function setHintsEnabled(value) {
  hintsEnabled = value;
  saveProgress();
}

export function hasCompletedAllTasks() {
  return currentTaskIndex >= tasks.length;
}
