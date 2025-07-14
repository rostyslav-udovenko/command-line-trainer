import { t } from "../core/i18n.js";

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
  pwd: t("manual.pwd"),
  ls: t("manual.ls"),
  cd: t("manual.cd"),
  mkdir: t("manual.mkdir"),
  touch: t("manual.touch"),
  help: t("manual.help"),
  man: t("manual.man"),
  cat: t("manual.cat"),
  less: t("manual.less"),
  file: t("manual.file"),
  cp: t("manual.cp"),
  mv: t("manual.mv"),
  rm: t("manual.rm"),
  chmod: t("manual.chmod"),
  stat: t("manual.stat"),
  date: t("manual.date"),
  whoami: t("manual.whoami"),
  uptime: t("manual.uptime"),
  mount: t("manual.mount")
};
