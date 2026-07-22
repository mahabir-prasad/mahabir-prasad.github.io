/**
 * assets/js/page-background.js
 *
 * Adds a fixed, blurred background image behind every page's content that
 * shifts position as you scroll (a "parallax" effect). Configured entirely
 * from _config.yml — see the `page_background_*` keys — so this file itself
 * never needs editing.
 *
 * Designed to never interfere with foreground content:
 *   - low opacity + blur, so it reads as texture/atmosphere, not a photo
 *     competing with your text
 *   - pointer-events: none, so it never intercepts clicks/taps
 *   - sits behind everything in normal paint order (inserted as the very
 *     first element in <body>, so every other element paints over it)
 *   - respects prefers-reduced-motion by disabling the moving/parallax
 *     part (the image itself still shows, just without the scroll motion)
 */
(function () {
  var config = window.pageBackground;
  if (!config || !config.image) return;

  function init() {
    var bg = document.createElement("div");
    bg.id = "page-background";
    bg.style.backgroundImage = "url('" + config.image + "')";

    var style = document.createElement("style");
    style.textContent =
      "#page-background {" +
      "position: fixed;" +
      "top: -10%;" +
      "left: -10%;" +
      "width: 120%;" +
      "height: 120%;" +
      "background-size: cover;" +
      "background-position: center;" +
      "background-repeat: no-repeat;" +
      "filter: blur(" + config.blur + "px);" +
      "opacity: " + config.opacity + ";" +
      "pointer-events: none;" +
      "will-change: transform;" +
      "}";
    document.head.appendChild(style);
    document.body.insertBefore(bg, document.body.firstChild);

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    var ticking = false;
    function updatePosition() {
      var offset = window.scrollY * config.speed;
      bg.style.transform = "translate3d(0, " + offset + "px, 0)";
      ticking = false;
    }

    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          window.requestAnimationFrame(updatePosition);
          ticking = true;
        }
      },
      { passive: true }
    );

    updatePosition();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
