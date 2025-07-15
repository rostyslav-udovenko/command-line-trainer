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
  cd: "manual.cd",
  ls: "manual.ls",
  pwd: "manual.pwd",
  mkdir: "manual.mkdir",
  touch: "manual.touch",
  help: "manual.help",
  man: "manual.man",
  cat: "manual.cat",
  less: "manual.less",
  file: "manual.file",
  cp: "manual.cp",
  mv: "manual.mv",
  rm: "manual.rm",
  chmod: "manual.chmod",
  stat: "manual.stat",
  date: "manual.date",
  whoami: "manual.whoami",
  uptime: "manual.uptime",
  mount: "manual.mount"
};
