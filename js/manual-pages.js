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
  ls: "ls — list directory contents",
  cd: "cd — change directory",
  mkdir: "mkdir — make directory",
  touch: "touch — create a new file",
  help: "help — show general command help",
  man: "an interface to the system reference manuals",
  cat: "cat — concatenate files and print on the standard output",
  less: "less — opposite of more",
  file: "file — determine file type",
  cp: "cp — copy files and directories",
  mv: "mv — move (rename) files",
  rm: "rm — remove files or directories",
};
