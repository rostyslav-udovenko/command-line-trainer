/**
 * A map of available manual pages for built-in terminal commands.
 * Each key represents a command name, and each value provides a short description.
 *
 * These are used to provide quick user reference when running `man <command>`.
 *
 * Example usage: manualPages["cd"] => "cd — change directory"
 *
 * Note: HTML entities like &lt; are used to safely render characters like "<" in output.
 */

export const manualPages = {
  pwd: "pwd — print working directory",
  ls: "ls — list directory contents, ls -l — list directory contents with extra details (e.g. executable flag)",
  cd: "cd — change directory",
  mkdir: "mkdir — make directory",
  touch: "touch — create a new file or update timestamp",
  help: "help — show general command help",
  man: "man — an interface to the system reference manuals",
  cat: "cat — concatenate files and print on the standard output",
  less: "less — opposite of more",
  file: "file — determine file type",
  cp: "cp — copy files and directories",
  mv: "mv — move (rename) files",
  rm: "rm — remove files or directories",
  chmod: "chmod — change file permissions",
  stat: "stat — display file metadata like last modification time",
  date: "date — display or set the system date and time",
  whoami: "whoami — print effective user ID",
  uptime: "uptime — tell how long the system has been running",
  mount: "mount — mount a filesystem",
};
