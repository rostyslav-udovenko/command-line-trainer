# Сommand Line Trainer

![GitHub License](https://img.shields.io/github/license/rostyslavudovenko/command-line-trainer)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-%23FE5196?logo=conventionalcommits&logoColor=white)](https://conventionalcommits.org)
![GitHub Release](https://img.shields.io/github/v/release/rostyslavudovenko/command-line-trainer?include_prereleases)
![GitHub commit activity](https://img.shields.io/github/commit-activity/m/rostyslavudovenko/command-line-trainer)
![GitHub commits since latest release](https://img.shields.io/github/commits-since/rostyslavudovenko/command-line-trainer/latest?include_prereleases)

A web-based terminal trainer for learning UNIX commands without fear of breaking anything important.

Perfect starting point if you've never touched the command line but always wanted to try.

## How It Works

25 practical tasks across 5 modules - from basic navigation to system commands.

Each task:

- Gives you a clear goal
- Checks your work automatically
- Shows hints when you're stuck
- Uses a fresh virtual file system

Start with `cd` and `ls`, end up comfortable with the command line!

## Learning Path

- **Module 1:** Directory Operations. Learn to navigate: `cd`, `mkdir`, `ls`, `pwd`, `rmdir`
- **Module 2:** File Operations. Create, read, copy, move files: `touch`, `cat`, `less`, `file`, `cp`, `mv`, `rm`
- **Module 3:** File Permissions and Metadata. Make files executable and check details: `chmod`, `stat`, `ls -l`, `touch`
- **Module 4:** System Commands. Check time, user, system status: `date`, `whoami`, `uptime`, `mount`
- **Module 5:** Text Processing. Search and sort text files: `grep`, `sort`, `uniq`, `tr`

Plus `help` and `man` commands to guide you along the way!

## Easter Egg: Matrix Mode

Hidden feature alert! Type `neo` to turn your boring terminal into falling green Matrix rain. Because why not?

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
  pwd, ls, cd, mkdir, rmdir, touch, cat, less, file, cp, mv, rm, chmod, ls -l, stat, date, whoami, uptime, mount, grep, sort, uniq, tr

System commands:
  hint [on|off] - Toggle task hints
  theme [light|dark|amber] - Switch color theme
  progress [status|reset] - Show/reset learning progress
  language [en|uk] - Switch interface language
  clear - Clear terminal screen
  task - Show current task

Use man <command> for more information.
```

Each command also has its own manual page via `man`:

```
user@machine:~$ man touch
touch — create a new file
```

## Getting Started

### Prerequisites

To compile SCSS styles, you'll need Node.js and npm installed on your system.

### Installation

1. Clone the repository:

```bash
git clone https://github.com/rostyslavudovenko/command-line-trainer.git
cd command-line-trainer
```

2. Install Sass

```
npm install -g sass
```

3. Compile SCSS to CSS


```
sass scss/main.scss css/styles.css
```

4. Start a local web server:

```
npx serve .
```

### Development Workflow

For active development, use the watch mode to automatically recompile CSS when SCSS files change:

```
sass --watch scss/main.scss:css/styles.css
```

**Important:** Do not edit `css/styles.css` manually — all changes should be made in SCSS files. The CSS files are generated and excluded from version control via `.gitignore`.

## Tasks

Each task is described as a JSON file and includes:

- `id` – unique task identifier within the module
- `description` – short instruction for the user
- `type` – expected command (e.g. `cd`, `mkdir`, `rmdir`, `touch`, etc.)
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
│   ├── task-4.json                 # Display current path using `pwd`
│   └── task-5.json                 # Remove empty directory using `rmdir`
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
├── module-4/                       # System Commands
│   ├── task-1.json                 # Show current time using `date`
│   ├── task-2.json                 # Display current username using `whoami`
│   ├── task-3.json                 # Check system uptime using `uptime`
│   └── task-4.json                 # List mounted filesystems using `mount`
└──module-5/                        # Text Processing
    ├── task-1.json                 # Search for 'error' in `server.log` using `grep`
    ├── task-2.json                 # Sort lines in `names.txt` using `sort`
    ├── task-3.json                 # Remove duplicate lines in `duplicates.txt` `uniq`
    └── task-4.json                 # Transform text case in `message.txt` using `tr`
```

Validation rules (`check`) may include:

- `currentDirectoryIs` – matches the current path exactly
- `currentDirectoryEndsWith` – ends with a specific folder
- `fileExists` – checks for presence of a file
- `dirExists` – checks for presence of a directory
- `dirDoesNotExist` – confirms that a directory has been removed
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
│   ├── cache-buster.js             # Cache busting utilities for fresh content delivery
│   ├── command-executor.js         # Command definitions and execution logic
│   ├── file-system.js              # Virtual file system operations
│   ├── i18n.js                     # Internationalization (i18n): loads and applies translations
│   └── task-manager.js             # Task loading, validation and flow control
├── effects/                        # Visual effects and easter eggs
│   └── matrix-mode.js              # Matrix Rain mode
├── ui/                             # Terminal user interface logic
│   ├── terminal-ui.js              # Handles UI: output, input, scrolling
│   ├── theme-manager-init.js       # Sets initial theme on first page load based on localStorage
│   └── theme-manager.js            # Handles theme initialization and application
└── main.js                         # Entry point, initializes everything
```

## Cache Busting System

The `cache-buster.js` module ensures users always receive the latest content:

- Automatic versioning for JSON task files and translation files
- Manual versioning for CSS and main JavaScript files via HTML
- Fallback support for older browsers using custom `groupBy` implementation
- No-cache headers for enhanced cache control

## SCSS Structure

This project uses a modular SCSS structure for better scalability and organization.

```
scss/
├── base/                           # Base settings and resets
│   ├── _globals.scss               # Global element styles
│   ├── _reset.scss                 # Reset and normalize styles
│   └── _typography.scss            # Typography rules
├── components/                     # Reusable UI components
│   ├── _input.scss                 # Input field styling
│   ├── _prompt.scss                # Prompt symbol and input wrapper
│   └── _scrollbar.scss             # Custom scrollbar styling with theme
├── layout/                         # Structural layout sections
│   ├── _footer.scss                # Footer styling
│   ├── _header.scss                # Header styling
│   └── _terminal.scss              # Terminal area styling
├── media/                          # Media queries and breakpoints
│   └── _responsive.scss            # Responsive adjustments
├── themes/                         # Theme system with CSS variables
│   └── _themes.scss                # Defines dark, light and amber theme variables using :root and [data-theme]
└── main.scss                       # UI Entry point
```

The compiled CSS is generated in the `css/` folder and excluded from version control.

## File Structure

```
project-root/
├── css/                            # Generated CSS (excluded from git)
│   ├── styles.css                  # Generated from SCSS (do not edit manually)
│   └── styles.css.map              # Source map for dev tools
├── fonts/
│   ├── IBMPlexMono-Bold.woff       # IBM Plex Mono Bold font (WOFF format)
│   ├── IBMPlexMono-Bold.woff2      # IBM Plex Mono Bold font
│   ├── IBMPlexMono-Regular.woff    # IBM Plex Mono Regular font (WOFF format)
│   └── IBMPlexMono-Regular.woff2   # IBM Plex Mono Regular font
├── js/
│   ├── core/                       # Core logic and virtual file system operations
│   │   ├── cache-buster.js         # Cache busting utilities for fresh content delivery
│   │   ├── command-executor.js     # Command definitions and execution logic
│   │   ├── file-system.js          # Virtual file system operations
│   │   ├── i18n.js                 # Internationalization (i18n): loads and applies translations
│   │   └── task-manager.js         # Task loading, validation and flow control
│   ├── effects/                    # Visual effects and easter eggs
│   │   └── matrix-mode.js          # Matrix Rain mode
│   ├── ui/                         # Terminal user interface logic
│   │   ├── terminal-ui.js          # Handles UI: output, input, scrolling
│   │   ├── theme-manager-init.js   # Sets initial theme on first page load based on localStorage
│   │   └── theme-manager.js        # Handles theme initialization and application
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
│   │   └── _scrollbar.scss         # Custom scrollbar styling with theme
│   ├── layout/                     # Structural layout sections
│   │   ├── _footer.scss            # Footer styling
│   │   ├── _header.scss            # Header styling
│   │   └── _terminal.scss          # Terminal area styling
│   ├── media/                      # Media queries and breakpoints
│   │   └── _responsive.scss        # Responsive adjustments
│   ├── themes/                     # Theme system with CSS variables
│   │   └── _themes.scss            # Defines dark, light and amber theme variables using :root and [data-theme]
│   └── main.scss                   # UI Entry point
├── tasks/
│   ├── module-1/                   # Directory Operations
│   │   ├── task-1.json             # Navigate to the `projects` directory
│   │   ├── task-2.json             # Create a directory named `images`
│   │   ├── task-3.json             # List contents using `ls`
│   │   ├── task-4.json             # Display current path using `pwd`
│   │   └── task-5.json             # Remove empty directory using `rmdir`
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
│   ├── module-4/                   # System Commands
│   │   ├── task-1.json             # Show current time using `date`
│   │   ├── task-2.json             # Display current username using `whoami`
│   │   ├── task-3.json             # Check system uptime using `uptime`
│   │   └── task-4.json             # List mounted filesystems using `mount`
│   └── module-5/                   # Text Processing
│       ├── task-1.json             # Search for 'error' in `server.log` using `grep`
│       ├── task-2.json             # Sort lines in `names.txt` using `sort`
│       ├── task-3.json             # Remove duplicate lines in `duplicates.txt` `uniq`
│       └── task-4.json             # Transform text case in `message.txt` using `tr`
├── 404.html
├── 500.html
├── index.html                      # UI shell and entry point
├── LICENSE
└── README.md
```

## Third-party Assets

**Typography:** [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono) v0.2.0 by [IBM](https://www.ibm.com/plex/), used under the [SIL Open Font License](https://scripts.sil.org/OFL).

## Contributing

Contributions are welcome! If you have any ideas, improvements, or found a bug, please create a new [GitHub Issue](https://github.com/rostyslavudovenko/command-line-trainer/issues).

Please check [existing issues](https://github.com/rostyslavudovenko/command-line-trainer/issues) to avoid duplicates before creating a new one.

## License

Licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

Made with ❤️ by [Rostyslav Udovenko](mailto:rostyslavudovenko@icloud.com)
