# Сommand Line Trainer

A simple in-browser terminal simulator to help you learn basic UNIX-like commands using a virtual file system.

## 🧠 Features

- Interactive command-line input (`cd`, `ls`, `mkdir`, `touch`, `pwd`)
- Real-time feedback and task validation
- Virtual file system per task (loaded from JSON)
- Keyboard only terminal UI experience

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