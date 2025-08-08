const matrixChars =
  "アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

let canvas, ctx;
let fontSize, columns, drops;

export function showMatrix() {
  const terminal = document.getElementById("terminal");
  terminal.innerHTML = "";
  
  canvas = document.createElement("canvas");
  canvas.id = "matrix-canvas";  
  terminal.appendChild(canvas);
  
  ctx = canvas.getContext("2d");
  setupCanvas();
  
  window.addEventListener("resize", setupCanvas);
  setInterval(drawFrame, 50);
}

function setupCanvas() {
  canvas.width = document.getElementById("terminal").clientWidth;
  canvas.height = document.getElementById("terminal").clientHeight;
  
  const refEl = document.querySelector(".footer") || document.body;
  fontSize = parseFloat(getComputedStyle(refEl).fontSize) || 14;
  
  columns = Math.floor(canvas.width / fontSize);
  drops = Array(columns).fill(1);
}

function drawFrame() {
  const bgColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-matrix-bg') || "rgba(0, 0, 0, 0.05)";
  
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#0F0";
  ctx.font = `${fontSize}px monospace`;

  drops.forEach((y, i) => {
    const char = matrixChars[~~(Math.random() * matrixChars.length)];
    ctx.fillText(char, i * fontSize + fontSize * 0.3, y * fontSize);

    if (y * fontSize > canvas.height || Math.random() > 0.975) {
      drops[i] = 0;
    } else {
      drops[i] = y + 1;
    }
  });
}