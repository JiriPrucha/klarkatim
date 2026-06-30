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
    const mainStage = document.getElementById("mainStage");
    const wheelStage = document.getElementById("wheelStage");
    const wheel = document.getElementById("wheel");
    const spinHint = document.getElementById("spinHint");
    if (!stage || !playBtn || !overlay || !closeBtn || !video) return;
    if (!mainStage || !wheelStage || !wheel || !spinHint) return;

    let isOpen = false;
    let wheelSpinning = false;

    // Decode the wheel's first frame so it shows instantly (paused) with no flash.
    wheel.addEventListener("loadeddata", () => {
      try {
        if (wheel.currentTime < 0.04) wheel.currentTime = 0.04;
      } catch (_) { /* ignore */ }
    }, { once: true });

    function openVideo() {
      if (isOpen) return;
      isOpen = true;

      // Reveal the overlay and START PLAYBACK SYNCHRONOUSLY, inside the click
      // gesture. Browsers reliably allow a click-initiated play (even with sound),
      // but often block a play() that's deferred in a setTimeout — which left the
      // video paused on a near-blank frame. The CSS opacity transitions still give
      // a soft cross-fade from the stage to the video.
      stage.classList.add("fading-out");
      overlay.classList.add("visible");
      overlay.setAttribute("aria-hidden", "false");

      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        // If a browser still blocks it, the poster + visible controls let the
        // user press play themselves.
        playPromise.catch(() => { /* blocked — poster + controls are the fallback */ });
      }
    }

    // Main message ended → seamlessly reveal the wheel (paused, waiting for a tap).
    function showWheel() {
      try { video.pause(); } catch (_) { /* ignore */ }

      // If the message was watched in fullscreen, drop back to the page so the
      // wheel is actually visible (otherwise it just "stays" on the last frame).
      if (document.fullscreenElement) {
        try { document.exitFullscreen(); } catch (_) { /* ignore */ }
      }

      mainStage.classList.remove("active");
      mainStage.setAttribute("aria-hidden", "true");

      wheelStage.classList.add("active");
      wheelStage.setAttribute("aria-hidden", "false");
    }

    // Tap the wheel → it spins (with sound — allowed inside this user gesture).
    function spinWheel() {
      if (wheelSpinning || !wheelStage.classList.contains("active")) return;
      wheelSpinning = true;

      wheelStage.classList.add("spinning");
      wheel.muted = false;

      try {
        if (wheel.currentTime > 0.2) wheel.currentTime = 0;
      } catch (_) { /* ignore */ }

      const playPromise = wheel.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => { /* if blocked, a second tap will start it */ wheelSpinning = false; });
      }
    }

    function closeVideo() {
      if (!isOpen) return;
      isOpen = false;
      wheelSpinning = false;

      try {
        video.pause();
        video.currentTime = 0;
      } catch (_) { /* ignore */ }

      try {
        wheel.pause();
        wheel.currentTime = 0.04;
        wheel.muted = true;
      } catch (_) { /* ignore */ }

      // Reset stages so the next open starts cleanly from the main video.
      wheelStage.classList.remove("active", "spinning");
      wheelStage.setAttribute("aria-hidden", "true");
      mainStage.classList.add("active");
      mainStage.setAttribute("aria-hidden", "false");

      overlay.classList.remove("visible");
      overlay.setAttribute("aria-hidden", "true");

      window.setTimeout(() => {
        stage.classList.remove("fading-out");
      }, 700);
    }

    playBtn.addEventListener("click", openVideo);
    closeBtn.addEventListener("click", closeVideo);
    video.addEventListener("ended", showWheel);

    wheel.addEventListener("click", spinWheel);
    spinHint.addEventListener("click", spinWheel);
    // Keep up the illusion: no right-click menu ("Save video as…", playback speed, etc.)
    wheel.addEventListener("contextmenu", (e) => e.preventDefault());
    // Wheel reaching "THE END" simply freezes on the last frame — no loop, no close.

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
