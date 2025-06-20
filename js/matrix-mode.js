/**
 * Activates a "Matrix"-style animation in the terminal container.
 * Clears the terminal content and draws animated green characters
 * falling down the screen using a canvas element.
 *
 * Intended for visual flair and easter egg behavior (triggered by `neo` command).
 */
export function activateMatrixMode() {
  const terminal = document.getElementById("terminal");
  terminal.innerHTML = "";

  const canvas = document.createElement("canvas");
  canvas.id = "matrix-canvas";
  terminal.appendChild(canvas);

  const ctx = canvas.getContext("2d");

  // Character set to simulate "Matrix rain"
  const letters =
    "アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let fontSize;
  let columns;
  let drops;

  /**
   * Determines font size based on the reference UI element (e.g. footer).
   * @returns {number} Font size in pixels
   */
  function getResponsiveFontSizeFromElement() {
    const referenceElement = document.querySelector(".footer") || document.body;
    const style = getComputedStyle(referenceElement);
    const fontSize = parseFloat(style.fontSize);

    return fontSize || 14; // fallback if parsing fails
  }

  /**
   * Resizes the canvas to match terminal dimensions
   * and reinitializes column-based raindrop state.
   */
  function resizeCanvas() {
    canvas.width = terminal.clientWidth;
    canvas.height = terminal.clientHeight;
    fontSize = getResponsiveFontSizeFromElement();
    columns = Math.floor(canvas.width / fontSize);
    drops = new Array(columns).fill(1);
  }

  // Update canvas size on window resize
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  /**
   * Draws the next frame of the falling character animation.
   */
  function draw() {
    // Slightly fade the canvas
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-matrix-bg') || "rgba(0, 0, 0, 0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Set character color and font
    ctx.fillStyle = "#0F0";
    ctx.font = fontSize + "px monospace";

    // Draw each character and update drop positions
    drops.forEach((y, i) => {
      const text = letters[Math.floor(Math.random() * letters.length)];
      ctx.fillText(text, i * fontSize + fontSize * 0.3, y * fontSize);

      // Reset drop if it goes off screen or randomly
      drops[i] =
        y * fontSize > canvas.height || Math.random() > 0.975 ? 0 : y + 1;
    });
  }

  // Start animation loop
  setInterval(draw, 50);
}