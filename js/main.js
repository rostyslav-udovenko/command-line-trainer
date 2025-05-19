import { setupInputHandler, showWelcomeMessage } from "./terminal-ui.js";
import { loadTasks } from "./task-manager.js";

showWelcomeMessage();
setupInputHandler(loadTasks);