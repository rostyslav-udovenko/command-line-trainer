import { TerminalCaret, showWelcomeMessage } from "./terminal-ui.js";

document.addEventListener("DOMContentLoaded", () => {
showWelcomeMessage();

  const caret = new TerminalCaret({
    inputId: "hidden-input",
    renderedId: "custom-rendered-input",
    outputId: "output",
  });

  caret.focus();
});
