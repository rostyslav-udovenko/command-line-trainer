const output = document.getElementById("output");
const inputField = document.getElementById("input");

let tasks = [];
let currentTaskIndex = 0;
let started = false;

const virtualFileSystem = {
  root: { name: "/", type: "dir", children: {} },
  currentDirectory: "/",
};

showWelcomeMessage();
inputField.addEventListener("keydown", handleInput);

function showWelcomeMessage() {
  output.innerHTML += `
    <div><strong>Welcome to the Command Line Trainer!</strong></div>
    <div>You will learn the basics of UNIX-like terminal commands.</div>
    <div>Start training? (y/n)</div>
  `;
}

function handleInput(event) {
  if (event.key === "Enter") {
    const command = inputField.value.trim();
    inputField.value = "";

    if (!started) {
      handleWelcomeInput(command);
    } else {
      executeCommand(command);
    }
  }
}

function handleWelcomeInput(command) {
  if (command.toLowerCase() === "y") {
    started = true;
    printCommand(command);
    output.innerHTML += `<div>Training started!</div>`;
    loadTasks();
  } else if (command.toLowerCase() === "n") {
    printCommand(command);
    output.innerHTML += `<div>Training canceled. See you next time!</div>`;
    inputField.disabled = true;
  } else {
    printCommand(command);
    output.innerHTML += `<div>Please enter "y" or "n".</div>`;
  }
}

async function loadTasks() {
  try {
    const files = [
      "/tasks/task1.json",
      "/tasks/task2.json",
      "/tasks/task3.json",
    ];

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
    output.innerHTML += `<div>Failed to load tasks: ${error}</div>`;
  }
}

function showCurrentTask() {
  const task = tasks[currentTaskIndex];
  output.innerHTML += `<div><strong>New Task:</strong> ${task.description}</div>`;
}

function setupFileSystem(fs) {
  function clone(node) {
    if (node.type === "dir") {
      const clonedChildren = {};
      for (const key in node.children) {
        clonedChildren[key] = clone(node.children[key]);
      }
      return { name: node.name, type: "dir", children: clonedChildren };
    } else {
      return { name: node.name, type: "file" };
    }
  }
  virtualFileSystem.root = clone(fs);
}

const commands = {
  pwd: () => virtualFileSystem.currentDirectory,
  ls: () => {
    const currentDir = getDirectory(virtualFileSystem.currentDirectory);
    return currentDir
      ? Object.keys(currentDir.children).join(" ") || "No files or directories"
      : "Directory not found";
  },
  cd: ([dir]) => (dir ? changeDirectory(dir) : "Usage: cd <directory>"),
  mkdir: ([name]) =>
    name ? createDirectory(name) : "Usage: mkdir <directory>",
  touch: ([name]) => (name ? createFile(name) : "Usage: touch <filename>"),
};

function executeCommand(command) {
  const [cmd, ...args] = command.split(" ");
  let result;

  if (commands[cmd]) {
    result = commands[cmd](args);
  } else {
    result = `Command not found: ${cmd}`;
  }

  printCommand(command);
  output.innerHTML += `<div>${result}</div>`;
  checkTaskCompletion(command);
  scrollToBottom();
}

function printCommand(command) {
  output.innerHTML += `
    <div class="terminal-line">
      <span class="prompt-symbol">$&nbsp;</span>${command}
    </div>
  `;
}

function normalizePath(current, target) {
  const stack = current.split("/").filter(Boolean);
  const parts = target.split("/");

  if (target.startsWith("/")) stack.length = 0;

  for (const part of parts) {
    if (part === "..") stack.pop();
    else if (part !== "." && part !== "") stack.push(part);
  }

  return "/" + stack.join("/");
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

function getDirectory(path) {
  const parts = path.split("/").filter(Boolean);
  let current = virtualFileSystem.root;
  for (let part of parts) {
    if (current.children[part] && current.children[part].type === "dir") {
      current = current.children[part];
    } else {
      return null;
    }
  }
  return current;
}

function checkTaskCompletion(command) {
  const task = tasks[currentTaskIndex];
  const check = task.check;

  let success = false;
  if (check.currentDirectoryEndsWith) {
    success = virtualFileSystem.currentDirectory.endsWith(
      check.currentDirectoryEndsWith
    );
  } else if (check.fileExists) {
    const currentDir = getDirectory(virtualFileSystem.currentDirectory);
    success = currentDir?.children[check.fileExists]?.type === "file";
  } else if (check.dirExists) {
    const currentDir = getDirectory(virtualFileSystem.currentDirectory);
    success = currentDir?.children[check.dirExists]?.type === "dir";
  }

  if (success) {
    output.innerHTML += `<div><strong>Task completed!</strong> ${task.description}</div>`;
    currentTaskIndex++;
    if (currentTaskIndex < tasks.length) {
      setupFileSystem(tasks[currentTaskIndex].fs);
      virtualFileSystem.currentDirectory =
        tasks[currentTaskIndex].startDirectory || "/";
      showCurrentTask();
    } else {
      output.innerHTML += `<div><strong>Congratulations!</strong> You have completed all tasks.</div>`;
    }
  } else {
    output.innerHTML += `<div><strong>Incorrect action!</strong> Try again.</div>`;
  }
}

function scrollToBottom() {
  const terminal = document.getElementById("terminal");
  terminal.scrollTop = terminal.scrollHeight;
}
