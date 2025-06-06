import { setupInputHandler, showWelcomeMessage, enableInput } from "./terminal-ui.js";
import { loadTasks } from "./task-manager.js";

document.addEventListener("DOMContentLoaded", () => {
  showWelcomeMessage();
  enableInput();
  setupInputHandler(loadTasks);
});