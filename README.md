# Сommand Line Trainer

An easy-to-use terminal simulator that operates within your web browser, designed to assist you in mastering fundamental UNIX-like commands through a virtual file system.

This initiative aims to guide newcomers in learning terminal commands progressively, all within a welcoming and interactive online setting.

## 🧠 Features

- Command-line interactions that allow for inputs such as `cd`, `ls`, `mkdir`, `touch`, `pwd`, `help`, `man`,  `cat`, `less`, `file`, `cp`, `mv`, `rm`, `chmod`, `ls -l` and `stat`
- System command such as `hint on/off` to enable or disable task hints
- Immediate task validation accompanied by feedback and hints for each task
- An integrated virtual file system that refreshes with each task, utilizing JSON
- A modular architecture based on ES modules
- A user experience designed entirely for keyboard navigation, eliminating the need for a mouse
- Hidden "Matrix Mode" easter egg (`neo` command)
- Supports **dark** and **light** themes via `theme dark/light` command

## 🥚 Easter Egg: Matrix Mode

To enable **Matrix Rain** mode, simply enter the command `neo` in the terminal whenever you wish. This action will transform the terminal display into a captivating animated green rain effect reminiscent of *The Matrix*. 

## 🔡 Example Commands

```bash
user@machine:~$ cd projects
user@machine:~$ mkdir images
user@machine:~$ touch index.html
user@machine:~$ pwd
user@machine:~$ help
user@machine:~$ man cd
```

## 🆘 Help System

You can type `help` at any time to get a list of available commands:

```
user@machine:~$ help
Available commands: pwd, ls, cd, mkdir, touch, help, man, cat, less, file, cp, mv, rm, chmod, ls -l, stat. Use man <command> for more information.
System commands: hint [on|off], theme [light|dark]
```

Each command also has its own manual page via `man`:

```
user@machine:~$ man touch
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
 ├── command-executor.js        # Command definitions and execution logic 
 ├── file-system.js             # Virtual file system operations
 ├── main.js                    # Entry point, initializes everything
 ├── manual-pages.js            # Manual entries for use by the `man` command
 ├── matrix-mode.js             # Matrix Rain mode
 ├── task-manager.js            # Task loading, validation and flow control
 ├── terminal-ui.js             # Handles UI: output, input, scrolling
 ├── theme-switcher-init.js     # Sets initial theme on first page load based on localStorage
 └── theme-switcher.js          # Manages the switching of themes and the toggling of icons
 ```

## 🎨 SCSS Structure

This project uses a modular SCSS structure for better scalability and organization.

```
css/
├── styles.css                  # Generated from SCSS (do not edit manually)
└── styles.css.map              # Source map for dev tools

scss/
├── base/                       # Base settings and resets
│   ├── _globals.scss           # Global element styles
│   ├── _reset.scss             # Reset and normalize styles
│   └── _typography.scss        # Typography rules
├── components/                 # Reusable UI components
│   ├── _input.scss             # Input field styling
│   ├── _prompt.scss            # Prompt symbol and input wrapper
│   └── _theme-icon.scss        # Styles for theme toggle icon
├── layout/                     # Structural layout sections
│   ├── _footer.scss            # Footer styling
│   ├── _header.scss            # Header styling
│   └── _terminal.scss          # Terminal area styling
├── media/                      # Media queries and breakpoints
│   └── _responsive.scss        # Responsive adjustments
├── themes/                     # Theme system with CSS variables
│   └── _themes.scss            # Defines dark and light theme variables using :root and [data-theme]
└── main.scss                   # UI Entry point
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
├── css/
│   ├── styles.css              # Generated from SCSS (do not edit manually)
│   └── styles.css.map          # Source map for dev tools
├── icons/
│   ├── dark.svg                # Icon representing dark theme
│   └── light.svg               # Icon representing light theme
├── js/
│   ├── command-executor.js     # Command definitions and execution logic
│   ├── file-system.js          # Virtual file system operations
│   ├── main.js                 # Entry point, initializes everything
│   ├── manual-pages.js         # Manual entries for use by the `man` command
│   ├── matrix-mode.js          # Matrix Rain mode
│   ├── task-manager.js         # Task loading, validation and flow control
│   ├── terminal-ui.js          # Handles UI: output, input, scrolling
│   ├── theme-switcher-init.js  # Sets initial theme on first page load based on localStorage
│   └── theme-switcher.js       # Manages the switching of themes and the toggling of icons
├── scss/
│   ├── base/                   # Base settings and resets
│   │   ├── _globals.scss       # Global element styles
│   │   ├── _reset.scss         # Reset and normalize styles
│   │   └── _typography.scss    # Typography rules
│   ├── components/             # Reusable UI components
│   │   ├── _input.scss         # Input field styling
│   │   ├── _prompt.scss        # Prompt symbol and input wrapper
│   │   └── _theme-icon.scss    # Styles for theme toggle icon
│   ├── layout/                 # Structural layout sections
│   │   ├── _footer.scss        # Footer styling
│   │   ├── _header.scss        # Header styling
│   │   └── _terminal.scss      # Terminal area styling
│   ├── media/                  # Media queries and breakpoints
│   │   └── _responsive.scss    # Responsive adjustments
│   ├── themes/                 # Theme system with CSS variables
│   │   └── _themes.scss        # Defines dark and light theme variables using :root and [data-theme]
│   └── main.scss               # UI Entry point
├── tasks/
│   ├── module-1                # Directory Operations
│   │   ├── task-1.json
│   │   ├── task-2.json
│   │   ├── task-3.json
│   │   └── task-4.json
│   ├── module-2                # File Operations
│   │   ├── task-1.json
│   │   ├── task-2.json
│   │   ├── task-3.json
│   │   ├── task-4.json
│   │   ├── task-5.json
│   │   ├── task-6.json
│   │   ├── task-7.json
│   │   └── task-8.json
│   └── module-3                # File Permissions and Metadata
│       ├── task-1.json
│       ├── task-2.json
│       ├── task-3.json
│       └── task-4.json
├── 404.html
├── 500.html
├── index.html                  # UI shell and entry point
├── LICENSE
└── README.md
```

## 🧩 Third-party Assets

Icons by [Tabler Icons](https://github.com/tabler/tabler-icons), used under the [MIT License](https://github.com/tabler/tabler-icons/blob/main/LICENSE).

## 📄 License

Licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

Created by **Rostyslav Udovenko**  
📧 Contact: [rostyslav.udovenko@gmail.com](mailto:rostyslav.udovenko@gmail.com)  
🔗 GitHub: [github.com/rostyslav-udovenko](https://github.com/rostyslav-udovenko)