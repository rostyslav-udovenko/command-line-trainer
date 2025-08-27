import {
  initFileSystem,
  getDirectory,
  virtualFileSystem,
} from "./file-system.js";
import { printOutput, disableInput, hideCaret } from "../ui/terminal-ui.js";
import { t } from "./i18n.js";

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

  Object.entries(tasksByModule).forEach(([moduleName, moduleTasks]) => {
    const moduleTaskIds = moduleTasks.map((task) => task.globalIndex);
    const completedInModule = moduleTaskIds.filter(
      (id) => id < currentTaskIndex
    ).length;

    progress[moduleName] = {
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
      `<strong>${t("task.manager.task.label")} ${task.id}:</strong> ${t(
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
    printOutput(t("task.manager.loadingTasks"));
    await loadCallback();
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
      path: "tasks/module-1",
      count: 5,
    },
    {
      name: t("modules.2"),
      path: "tasks/module-2",
      count: 8,
    },
    {
      name: t("modules.3"),
      path: "tasks/module-3",
      count: 4,
    },
    {
      name: t("modules.4"),
      path: "tasks/module-4",
      count: 4,
    },
  ];

  try {
    const taskPromises = [];
    let globalIndex = 0;

    for (const module of modules) {
      for (let i = 1; i <= module.count; i++) {
        const url = `${module.path}/task-${i}.json`;
        const promise = fetch(url)
          .then((res) => {
            if (!res.ok) {
              throw new Error(`Failed to load task: ${url}`);
            }
            return res.json();
          })
          .then((task) => {
            task.moduleName = module.name;
            task.globalIndex = globalIndex++;
            return task;
          })
          .catch((error) => {
            console.error(`Error loading task ${url}:`, error);
            return null;
          });
        taskPromises.push(promise);
      }
    }

    const loadedTasks = await Promise.all(taskPromises);
    const validTasks = loadedTasks.filter(Boolean);

    tasks.splice(0, tasks.length, ...validTasks);

    tasksByModule = Object.groupBy(tasks, (task) => task.moduleName);

    printOutput(t("task.manager.loadingDone"));

    if (tasks.length > 0) {
      if (currentTaskIndex >= tasks.length) {
        printOutput(
          `<strong>${t(
            "task.manager.training.allTasksCompleted.1"
          )}</strong> ${t("task.manager.training.allTasksCompleted.2")}`
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
        `<strong>${t("task.manager.task.label")} ${nextTask.id}:</strong> ${t(
          nextTask.description
        )}`
      );
    } else {
      printOutput(
        `<strong>${t("task.manager.training.congratulations.1")}</strong> ${t(
          "task.manager.training.congratulations.2"
        )}`
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
