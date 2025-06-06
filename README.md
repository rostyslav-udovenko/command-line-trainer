# Сommand Line Trainer

An easy-to-use terminal simulator that operates within your web browser, designed to assist you in mastering fundamental UNIX-like commands through a virtual file system.

This initiative aims to guide newcomers in learning terminal commands progressively, all within a welcoming and interactive online setting.

## 🧠 Features

- Command-line interactions that allow for inputs such as `cd`, `ls`, `mkdir`, `touch`, `pwd`, `help`, and `man`
- Immediate task validation accompanied by feedback and hints for each task
- An integrated virtual file system that refreshes with each task, utilizing JSON
- A modular architecture based on ES modules
- A user experience designed entirely for keyboard navigation, eliminating the need for a mouse
- Hidden "Matrix Mode" easter egg (`neo` command)

## 🥚 Easter Egg: Matrix Mode

To enable **Matrix Rain** mode, simply enter the command `neo` in the terminal whenever you wish. This action will transform the terminal display into a captivating animated green rain effect reminiscent of *The Matrix*. 

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

The application code is organized into well-structured ES module files to enhance both scalability and clarity:
```
js/ 
 ├── main.js                # Entry point, initializes everything 
 ├── terminal-ui.js         # Handles UI: output, input, scrolling
 ├── file-system.js         # Virtual file system operations
 ├── command-executor.js    # Command definitions and execution logic 
 ├── task-manager.js        # Task loading, validation and flow control
 └── matrix-mode.js         # Matrix Rain mode
 ```

## 🎨 SCSS Structure

This project uses a modular SCSS structure for better scalability and organization.

```
css/
└── styles.css              # Generated from SCSS (do not edit manually)

scss/
├── main.scss               # UI Entry point
├── base/                   # Base settings and resets
│   ├── _globals.scss       # Global element styles
│   ├── _reset.scss         # Reset and normalize styles
│   ├── _typography.scss    # Typography rules
│   └── _variables.scss     # SCSS variables
├── components/             # Reusable UI components
│   ├── _input.scss         # Input field styling
│   └── _prompt.scss        # Prompt symbol and input wrapper
├── layout/                 # Structural layout sections
│   ├── _footer.scss        # Footer styling
│   ├── _header.scss        # Header styling
│   └── _terminal.scss      # Terminal area styling
└── media/                  # Media queries and breakpoints
    └── _responsive.scss    # Responsive adjustments
```

## ⚙️ Install Sass

You can install Sass globally using npm:

```
npm install -g sass
```

## 🔁 Compile SCSS to CSS

From the root directory of the project, run:

```
sass --watch scss/main.scss:css/styles.css
```

This will **watch** for changes and automatically update the `styles.css` file in the `css/` folder.

## 🛠️ One-time Compile

If you just want to compile SCSS once without watching:

```
sass scss/main.scss css/styles.css
```

⚠️ **Do not** edit `css/styles.css` manually — all changes should be made in SCSS files.

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
│   ├── task-manager.js
│   └── matrix-mode.js
├── scss/
│   ├── main.scss
│   ├── base/
│   │   ├── _globals.scss
│   │   ├── _reset.scss
│   │   ├── _typography.scss
│   │   └── _variables.scss
│   ├── components/
│   │   ├── _input.scss
│   │   └── _prompt.scss
│   ├── layout/
│   │   ├── _footer.scss
│   │   ├── _header.scss
│   │   └── _terminal.scss
│   └── media/
│       └── _responsive.scss
├── tasks/
│   ├── task-1.json
│   ├── task-2.json
│   └── ...
├── 404.html
├── 500.html
├── LICENSE
└── README.md
```

## 📄 License

Licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

Created by **Rostyslav Udovenko**  
📧 Contact: [rostyslavudovenko@icloud.com](mailto:rostyslavudovenko@icloud.com)  
🔗 GitHub: [github.com/rostyslavudovenko](https://github.com/rostyslavudovenko)