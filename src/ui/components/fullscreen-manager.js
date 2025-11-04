export function enableFullscreen() {
  document.body.classList.add("fullscreen-mode");

  const header = document.querySelector(".header");
  const footer = document.querySelector(".footer");

  if (header) header.style.display = "none";
  if (footer) footer.style.display = "none";

  localStorage.setItem("fullscreenMode", "true");
}

export function disableFullscreen() {
  document.body.classList.remove("fullscreen-mode");

  const header = document.querySelector(".header");
  const footer = document.querySelector(".footer");

  if (header) header.style.display = "";
  if (footer) footer.style.display = "";

  localStorage.setItem("fullscreenMode", "false");
}

export function setupFullscreen() {
  const isFullscreen = localStorage.getItem("fullscreenMode");

  if (isFullscreen === "true") {
    enableFullscreen();
  } else if (isFullscreen === "false") {
    disableFullscreen();
  }
}

export function isFullscreenMode() {
  return localStorage.getItem("fullscreenMode") === "true";
}
