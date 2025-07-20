# Сommand Line Trainer

An easy-to-use terminal simulator that operates within your web browser, designed to assist you in mastering fundamental UNIX-like commands through a virtual file system.

This initiative aims to guide newcomers in learning terminal commands progressively, all within a welcoming and interactive online setting.

## Features

- Command-line interactions that allow for inputs such as `cd`, `ls`, `mkdir`, `touch`, `pwd`, `help`, `man`,  `cat`, `less`, `file`, `cp`, `mv`, `rm`, `chmod`, `ls -l`, `stat`, `date`, `whoami`, `uptime` and `mount`
- System command such as `hint on/off` to enable or disable task hints, `progress reset` to reset progress, `language en/uk` to switch interface language
- Progress saving - completed tasks are automatically saved to localStorage and restored when the user returns
- Immediate task validation accompanied by feedback and hints for each task
- An integrated virtual file system that refreshes with each task, utilizing JSON
- A modular architecture based on ES modules
- A user experience designed entirely for keyboard navigation, eliminating the need for a mouse
- Hidden "Matrix Mode" easter egg (`neo` command)
- Supports **dark** and **light** themes via `theme dark/light` command

## Easter Egg: Matrix Mode

To enable **Matrix Rain** mode, simply enter the command `neo` in the terminal whenever you wish. This action will transform the terminal display into a captivating animated green rain effect reminiscent of *The Matrix*. 

## Example Commands

```bash
user@machine:~$ cd projects
user@machine:~$ mkdir images
user@machine:~$ touch index.html
user@machine:~$ pwd
user@machine:~$ help
user@machine:~$ man cd
```

## Help System

You can type `help` at any time to get a list of available commands:

```
user@machine:~$ help
Available commands:
  pwd, ls, cd, mkdir, touch, cat, less, file, cp, mv, rm, chmod, ls -l, stat, date, whoami, uptime, mount
 
System commands:
  hint [on|off] - Toggle task hints
  theme [light|dark] - Switch color theme
  progress reset - Reset learning progress
  language [en|uk] - Switch interface language
 
Use man <command> for more information.
```

Each command also has its own manual page via `man`:

```
user@machine:~$ man touch
touch — create a new file
```

## Tasks

Each task is described as a JSON file and includes:

- `id` – unique task identifier within the module
- `description` – short instruction for the user
- `type` – expected command (e.g. `cd`, `mkdir`, `touch`, etc.)
- `fs` – starting virtual file system structure with directories and files
- `startDirectory` – path where the user starts the task
- `check` – validation rules to determine if the task is complete
- `hint` – helpful tip shown after several failed attempts

Tasks are organized into modules in the `tasks/` directory:
```
tasks/
├── module-1/                       # Directory Operations
│   ├── task-1.json                 # Navigate to the `projects` directory
│   ├── task-2.json                 # Create a directory named `images`
│   ├── task-3.json                 # List contents using `ls`
│   └── task-4.json                 # Display current path using `pwd`
├── module-2/                       # File Operations
│   ├── task-1.json                 # Create `index.html` in `projects`
│   ├── task-2.json                 # Read `note.txt` using `cat`
│   ├── task-3.json                 # View `log.txt` using `less`
│   ├── task-4.json                 # Inspect `script.sh` using `file`
│   ├── task-5.json                 # Copy `a.txt` to `b.txt` using `cp`
│   ├── task-6.json                 # Rename `old.txt` to `new.txt` using `mv`
│   ├── task-7.json                 # Move `note.txt` into `docs/` using `mv`
│   └── task-8.json                 # Remove `temp.txt` using `rm`
├── module-3/                       # File Permissions and Metadata
│   ├── task-1.json                 # Make `run.sh` executable using `chmod`
│   ├── task-2.json                 # Find executable with `ls -l`
│   ├── task-3.json                 # Show `log.txt` metadata using `stat`
│   └── task-4.json                 # Update `todo.txt` timestamp using `touch`
└──module-4/                        # System Commands
    ├── task-1.json                 # Show current time using `date`
    ├── task-2.json                 # Display current username using `whoami`
    ├── task-3.json                 # Check system uptime using `uptime`
    └── task-4.json                 # List mounted filesystems using `mount`
 ```

 Validation rules (`check`) may include:

- `currentDirectoryIs` – matches the current path exactly
- `currentDirectoryEndsWith` – ends with a specific folder
- `fileExists` – checks for presence of a file
- `dirExists` – checks for presence of a directory
- `fileInDir` – checks that a file exists inside a specific directory
- `fileExecutable` – verifies that a file is marked as executable
- `fileDoesNotExist` – confirms that a file has been removed
- `expectedOutputIncludes` – output must include specific strings
- `expectedOutputIncludesKeys` – output must include translated strings resolved from localization keys (for multi-language support)
- `expectedCommandArgs` – checks that the user entered specific command-line arguments (e.g., `["note.txt"]`)

## Modular JavaScript Structure

The application code is organized into well-structured ES module files to enhance both scalability and clarity:
```
js/ 
├── core/                           # Core logic and virtual file system operations
│   ├── command-executor.js         # Command definitions and execution logic
│   ├── file-system.js              # Virtual file system operations
│   ├── i18n.js                     # Internationalization (i18n): loads and applies translations
│   └── task-manager.js             # Task loading, validation and flow control
├── data/                           # Static data for internal commands
│   └── manual-pages.js             # Manual entries for use by the `man` command
├── effects/                        # Visual effects and easter eggs
│   └── matrix-mode.js              # Matrix Rain mode
├── ui/                             # Terminal user interface logic
│   ├── terminal-ui.js              # Handles UI: output, input, scrolling
│   ├── theme-switcher-init.js      # Sets initial theme on first page load based on localStorage
│   └── theme-switcher.js           # Manages the switching of themes and the toggling of icons
└── main.js                         # Entry point, initializes everything
 ```

## SCSS Structure

This project uses a modular SCSS structure for better scalability and organization.

```
css/
├── styles.css                      # Generated from SCSS (do not edit manually)
└── styles.css.map                  # Source map for dev tools

scss/
├── base/                           # Base settings and resets
│   ├── _globals.scss               # Global element styles
│   ├── _reset.scss                 # Reset and normalize styles
│   └── _typography.scss            # Typography rules
├── components/                     # Reusable UI components
│   ├── _input.scss                 # Input field styling
│   ├── _prompt.scss                # Prompt symbol and input wrapper
│   └── _theme-icon.scss            # Styles for theme toggle icon
├── layout/                         # Structural layout sections
│   ├── _footer.scss                # Footer styling
│   ├── _header.scss                # Header styling
│   └── _terminal.scss              # Terminal area styling
├── media/                          # Media queries and breakpoints
│   └── _responsive.scss            # Responsive adjustments
├── themes/                         # Theme system with CSS variables
│   └── _themes.scss                # Defines dark and light theme variables using :root and [data-theme]
└── main.scss                       # UI Entry point
```

## Install Sass

You can install Sass globally using npm:

```
npm install -g sass
```

## Compile SCSS to CSS

From the root directory of the project, run:

```
sass --watch scss/main.scss:css/styles.css
```

This will **watch** for changes and automatically update the `styles.css` file in the `css/` folder.

## One-time Compile

If you just want to compile SCSS once without watching:

```
sass scss/main.scss css/styles.css
```

**Do not** edit `css/styles.css` manually — all changes should be made in SCSS files.

## File Structure

```
project-root/
├── css/
│   ├── styles.css                  # Generated from SCSS (do not edit manually)
│   └── styles.css.map              # Source map for dev tools
├── icons/
│   ├── dark.svg                    # Icon representing dark theme
│   ├── help.svg                    # Icon representing help
│   └── light.svg                   # Icon representing light theme
├── js/
│   ├── core/                       # Core logic and virtual file system operations
│   │   ├── command-executor.js     # Command definitions and execution logic
│   │   ├── file-system.js          # Virtual file system operations
│   │   ├── i18n.js                 # Internationalization (i18n): loads and applies
│   │   └── task-manager.js         # Task loading, validation and flow control
│   ├── data/                       # Static data for internal commands
│   │   └── manual-pages.js         # Manual entries for use by the `man` command
│   ├── effects/                    # Visual effects and easter eggs
│   │   └── matrix-mode.js          # Matrix Rain mode
│   ├── ui/                         # Terminal user interface logic
│   │   ├── terminal-ui.js          # Handles UI: output, input, scrolling
│   │   ├── theme-switcher-init.js  # Sets initial theme on first page load based on localStorage
│   │   └── theme-switcher.js       # Manages the switching of themes and the toggling of icons
│   └── main.js                     # Entry point, initializes everything
├── locales/
│   ├── en.json                     # English localization file
│   └── uk.json                     # Ukrainian localization file
├── scss/
│   ├── base/                       # Base settings and resets
│   │   ├── _globals.scss           # Global element styles
│   │   ├── _reset.scss             # Reset and normalize styles
│   │   └── _typography.scss        # Typography rules
│   ├── components/                 # Reusable UI components
│   │   ├── _input.scss             # Input field styling
│   │   ├── _prompt.scss            # Prompt symbol and input wrapper
│   │   └── _theme-icon.scss        # Styles for theme toggle icon
│   ├── layout/                     # Structural layout sections
│   │   ├── _footer.scss            # Footer styling
│   │   ├── _header.scss            # Header styling
│   │   └── _terminal.scss          # Terminal area styling
│   ├── media/                      # Media queries and breakpoints
│   │   └── _responsive.scss        # Responsive adjustments
│   ├── themes/                     # Theme system with CSS variables
│   │   └── _themes.scss            # Defines dark and light theme variables using :root and [data-theme]
│   └── main.scss                   # UI Entry point
├── tasks/
│   ├── module-1/                   # Directory Operations
│   │   ├── task-1.json             # Navigate to the `projects` directory
│   │   ├── task-2.json             # Create a directory named `images`
│   │   ├── task-3.json             # List contents using `ls`
│   │   └── task-4.json             # Display current path using `pwd`
│   ├── module-2/                   # File Operations
│   │   ├── task-1.json             # Create `index.html` in `projects`
│   │   ├── task-2.json             # Read `note.txt` using `cat`
│   │   ├── task-3.json             # View `log.txt` using `less`
│   │   ├── task-4.json             # Inspect `script.sh` using `file`
│   │   ├── task-5.json             # Copy `a.txt` to `b.txt` using `cp`
│   │   ├── task-6.json             # Rename `old.txt` to `new.txt` using `mv`
│   │   ├── task-7.json             # Move `note.txt` into `docs/` using `mv`
│   │   └── task-8.json             # Remove `temp.txt` using `rm`
│   ├── module-3/                   # File Permissions and Metadata
│   │   ├── task-1.json             # Make `run.sh` executable using `chmod`
│   │   ├── task-2.json             # Find executable with `ls -l`
│   │   ├── task-3.json             # Show `log.txt` metadata using `stat`
│   │   └── task-4.json             # Update `todo.txt` timestamp using `touch`
│   └── module-4/                   # System Commands
│       ├── task-1.json             # Show current time using `date`
│       ├── task-2.json             # Display current username using `whoami`
│       ├── task-3.json             # Check system uptime using `uptime`
│       └── task-4.json             # List mounted filesystems using `mount`
├── 404.html
├── 500.html
├── index.html                      # UI shell and entry point
├── LICENSE
└── README.md
```

## How to Run Locally

Clone the repository:

```bash
git clone https://github.com/rostyslavudovenko/command-line-trainer.git
cd command-line-trainer
```

Start a local web server using the built-in static server from Node.js:

```
npx serve .
```

> On first run, this will install the serve package temporarily.

Then open your browser and navigate to:

```
http://localhost:3000
```

> Or whichever port is printed in your terminal

## Third-party Assets

Icons by [Tabler Icons](https://github.com/tabler/tabler-icons), used under the [MIT License](https://github.com/tabler/tabler-icons/blob/main/LICENSE).

## License

Licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Author

Developed by **Rostyslav Udovenko**  
Contact: [rostyslavudovenko@icloud.com](mailto:rostyslavudovenko@icloud.com)  
GitHub: [github.com/rostyslavudovenko](https://github.com/rostyslavudovenko)