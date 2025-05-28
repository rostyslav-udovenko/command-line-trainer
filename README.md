# Сommand Line Trainer

A simple in-browser terminal simulator to help you learn basic UNIX-like commands using a virtual file system.

This project is built to **teach beginners how to use terminal commands** step-by-step in a friendly, interactive environment — directly in the browser.

## 🧠 Features

- Interactive command-line input (`cd`, `ls`, `mkdir`, `touch`, `pwd`, `help`, `man`)
- Real-time task validation with feedback and per-task hints
- Built-in virtual file system that resets per task (via JSON)
- Modular codebase (ES modules)
- Fully keyboard-based UX — no mouse required

## 🔡 Example Commands

```bash
$ cd projects
$ mkdir images
$ touch index.html
$ pwd
$ help
$ man cd
```

## 🆘 Help System

You can type `help` at any time to get a list of available commands:

```
$ help
Available commands: pwd, ls, cd, mkdir, touch, help, man
Use man <command> for more information.
```

Each command also has its own manual page via `man`:

```
$ man touch
touch — create a new file
```

## 🧪 Tasks

Each task is described as a JSON file and includes:

- `description` – what you need to do
- `fs` – starting virtual file system structure
- `check` – validation rule (e.g. directory exists, file created, current path)
- `hint` – helpful tip if your command is incorrect

## 📦 Modular JavaScript Structure

The application code is split into clean ES module files for scalability and clarity:
```
js/ 
 ├── main.js                # Entry point, initializes everything 
 ├── terminal-ui.js         # Handles UI: output, input, scrolling
 ├── file-system.js         # Virtual file system operations
 ├── command-executor.js    # Command definitions and execution logic 
 └── task-manager.js        # Task loading, validation and flow control
 ```

 ## 🗂 File Structure

```
project-root/
├── index.html               # UI shell and entry point
├── css/
│   └── styles.css
├── js/
│   ├── main.js
│   ├── terminal-ui.js
│   ├── file-system.js
│   ├── command-executor.js
│   └── task-manager.js
├── tasks/
│   ├── task-1.json
│   ├── task-2.json
│   └── ...
└── README.md
```

## 👨‍💻 Author

Created by **Rostyslav Udovenko**  
📧 Contact: [rostyslavudovenko@icloud.com](mailto:rostyslavudovenko@icloud.com)  
🔗 GitHub: [github.com/rostyslavudovenko](https://github.com/rostyslavudovenko)