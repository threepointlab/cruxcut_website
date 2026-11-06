/* home_v2 arm B behaviour: scroll reveals, press feedback, synced auto-zoom demo, CTA attention. */
(() => {
  const root = document.documentElement;
  if (root.dataset.exp !== "b") return;
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const canObserve = typeof IntersectionObserver === "function";

  // Scroll reveals for calm, non-sticky blocks only (sticky scroll stories keep their own motion).
  const groups = [".az-copy", ".az-stage", ".on-device-copy", ".on-device-points li", ".more-intro > *", ".feature-story-copy", ".trust > *", ".faq-item", ".community .section-shell > *", ".final-cta .section-shell > *"];
  groups.forEach((selector) => document.querySelectorAll(selector).forEach((el, index) => {
    el.setAttribute("data-reveal", "");
    el.style.setProperty("--reveal-delay", `${Math.min(index, 5) * 70}ms`);
  }));
  const targets = [...document.querySelectorAll("[data-reveal]")];
  if (!reduce && canObserve) {
    root.classList.add("exp-motion");
    const io = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-revealed");
      io.unobserve(entry.target);
    }), {threshold: 0.12, rootMargin: "0px 0px -6% 0px"});
    targets.forEach((el) => io.observe(el));
  } else {
    targets.forEach((el) => el.classList.add("is-revealed"));
  }

  // Press feedback that survives touch devices where :active is brief.
  document.addEventListener("pointerdown", (event) => {
    const el = event.target.closest?.(".app-store-badge, .button");
    if (!el) return;
    el.classList.add("is-pressed");
    setTimeout(() => el.classList.remove("is-pressed"), 160);
  }, {passive: true});

  // Auto-zoom demo: play only while visible (the real app recording, or a legacy source/result pair).
  const demos = [...document.querySelectorAll("[data-az-video]")];
  const stage = document.querySelector(".az-stage");
  if (demos.length && stage) {
    const play = () => demos.forEach((v) => { if (v.preload !== "auto") { v.preload = "auto"; v.load(); } v.play().catch(() => {}); });
    const pause = () => demos.forEach((v) => v.pause());
    if (canObserve) new IntersectionObserver((entries) => entries.forEach((entry) => (entry.isIntersecting ? play() : pause())), {threshold: 0.35}).observe(stage);
    else play();
  }

  // One gentle highlight on the hero store badge once the page settles.
  const heroBadge = [...document.querySelectorAll(".hero-copy-b .exp-badge")].find((el) => el.offsetParent !== null);
  if (heroBadge && !reduce) setTimeout(() => heroBadge.classList.add("exp-cta-glow"), 1400);

  // When the hero CTA leaves the screen, nudge the sticky "Get the app" button twice.
  const hero = document.querySelector(".hero-copy-b");
  const sticky = [...document.querySelectorAll(".exp-sticky .button")].find((el) => el.offsetParent !== null);
  if (hero && sticky && canObserve && !reduce) {
    let nudged = false;
    new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting || nudged || entry.boundingClientRect.top > 0) return;
      nudged = true; sticky.classList.add("exp-attn");
    }), {threshold: 0}).observe(hero.querySelector(".exp-store-ctas") || hero);
  }

  // Thin reading-progress bar.
  if (!reduce) {
    const bar = document.createElement("div");
    bar.className = "exp-progress"; bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);
    let ticking = false;
    const update = () => {
      ticking = false;
      const max = root.scrollHeight - window.innerHeight;
      bar.style.setProperty("--exp-progress", max > 0 ? Math.min(1, window.scrollY / max).toFixed(4) : "1");
    };
    window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, {passive: true});
    update();
  }
})();
