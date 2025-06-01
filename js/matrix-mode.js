export function activateMatrixMode() {
  const terminal = document.getElementById("terminal");
  terminal.innerHTML = "";
  
  const canvas = document.createElement("canvas");
  canvas.id = "matrix-canvas";
  terminal.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  canvas.width = terminal.clientWidth;
  canvas.height = terminal.clientHeight;

  const letters = "アカサタナハマヤラワ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const fontSize = 14;
  const columns = canvas.width / fontSize;
  const drops = new Array(Math.floor(columns)).fill(1);

  function draw() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#0F0";
    ctx.font = fontSize + "px monospace";

    drops.forEach((y, i) => {
      const text = letters[Math.floor(Math.random() * letters.length)];
      ctx.fillText(text, i * fontSize, y * fontSize);
      drops[i] = y * fontSize > canvas.height || Math.random() > 0.975 ? 0 : y + 1;
    });
  }

  setInterval(draw, 50);
}