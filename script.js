(function () {
  "use strict";

  const HEART_COUNT = 24;
  const HEART_COLORS = ["#FFB3D1", "#FFD9E8", "#E6D7F2", "#F5A8C4"];

  const rand = (min, max) => Math.random() * (max - min) + min;

  function spawnHearts() {
    const layer = document.querySelector(".hearts");
    if (!layer) return;

    const frag = document.createDocumentFragment();
    for (let i = 0; i < HEART_COUNT; i++) {
      const heart = document.createElement("span");
      heart.className = "heart";
      const size = rand(12, 28);
      const duration = rand(9, 18);
      const delay = rand(0, 14);
      const left = rand(0, 100);
      const color = HEART_COLORS[Math.floor(rand(0, HEART_COLORS.length))];

      heart.style.setProperty("--size", size + "px");
      heart.style.setProperty("--color", color);
      heart.style.left = left + "%";
      heart.style.animationDuration = duration + "s";
      heart.style.animationDelay = "-" + delay + "s";

      frag.appendChild(heart);
    }
    layer.appendChild(frag);
  }

  function setupPlayback() {
    const stage = document.getElementById("stage");
    const playBtn = document.getElementById("playBtn");
    const overlay = document.getElementById("videoOverlay");
    const closeBtn = document.getElementById("closeBtn");
    const video = document.getElementById("video");
    if (!stage || !playBtn || !overlay || !closeBtn || !video) return;

    let isOpen = false;

    function openVideo() {
      if (isOpen) return;
      isOpen = true;

      stage.classList.add("fading-out");

      window.setTimeout(() => {
        overlay.classList.add("visible");
        overlay.setAttribute("aria-hidden", "false");
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(() => { /* autoplay blocked — user can press play */ });
        }
      }, 600);
    }

    function closeVideo() {
      if (!isOpen) return;
      isOpen = false;

      try {
        video.pause();
        video.currentTime = 0;
      } catch (_) { /* ignore */ }

      overlay.classList.remove("visible");
      overlay.setAttribute("aria-hidden", "true");

      window.setTimeout(() => {
        stage.classList.remove("fading-out");
      }, 700);
    }

    playBtn.addEventListener("click", openVideo);
    closeBtn.addEventListener("click", closeVideo);
    video.addEventListener("ended", closeVideo);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isOpen) {
        closeVideo();
      }
    });
  }

  function init() {
    spawnHearts();
    setupPlayback();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
