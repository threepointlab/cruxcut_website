/* home_v2 arm B behaviour: scroll reveals, press feedback, synced auto-zoom demo, CTA attention. */
(() => {
  const root = document.documentElement;
  if (root.dataset.exp !== "b") return;
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const canObserve = typeof IntersectionObserver === "function";

  // Mobile-first headings: each authored line (<br>) stays on one line and the font shrinks to fit,
  // so phones never get "Follow-cam / edits / Hard to make?". One-word tail lines merge back.
  // Keep hyphenated product terms on one line (e.g. "on-device", "follow-cam").
  const walker = document.createTreeWalker(document.querySelector("main") || document.body, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (/\b(on|follow)-(device|cam)\b/i.test(node.nodeValue)) node.nodeValue = node.nodeValue.replace(/\b(on|follow)-(device|cam)\b/gi, "$1\u2011$2");
  }
  const fitTargets = [...document.querySelectorAll(".hero-copy-b h1, main h2, .feature-story-copy > p:not(.feature-number)")]
    .filter((h) => h.querySelector("br") && [...h.children].every((c) => c.tagName === "BR"));
  const fitted = [];
  fitTargets.forEach((h) => {
    const parts = h.innerHTML.split(/<br\s*\/?>/i).map((x) => x.trim()).filter(Boolean);
    const lines = [];
    parts.forEach((part) => {
      const words = part.replace(/<[^>]+>/g, "").trim().split(/\s+/);
      if (lines.length && words.length === 1 && /^[A-Za-z]{1,8}[.,!?]?$/.test(words[0])) lines[lines.length - 1] += " " + part;
      else lines.push(part);
    });
    if (lines.length < 2) { h.innerHTML = lines.join(" "); return; }
    h.innerHTML = lines.map((line) => `<span class="fit-line">${line}</span>`).join("");
    h.classList.add("fit-lines");
    fitted.push(h);
  });
  const fit = () => fitted.forEach((h) => {
    h.style.fontSize = "";
    const available = h.clientWidth;
    const widest = Math.max(...[...h.querySelectorAll(".fit-line")].map((l) => l.scrollWidth));
    if (available > 0 && widest > available) {
      const size = parseFloat(getComputedStyle(h).fontSize);
      h.style.fontSize = `${Math.max(24, Math.floor(size * (available / widest) * 0.92))}px`;
    }
  });
  fit();
  document.fonts?.ready?.then(fit);
  let fitTimer; window.addEventListener("resize", () => { clearTimeout(fitTimer); fitTimer = setTimeout(fit, 120); });

  // Scroll reveals for calm, non-sticky blocks only (sticky scroll stories keep their own motion).
  const groups = [".az-copy", ".az-stage", ".on-device-copy", ".on-device-points li", ".more-intro > *", ".feature-story-copy", ".trust > *", ".faq-item", ".community .section-shell > *", ".final-cta .section-shell > *"];
  groups.forEach((selector) => document.querySelectorAll(selector).forEach((el, index) => {
    el.setAttribute("data-reveal", "");
    el.style.setProperty("--reveal-delay", `${Math.min(index, 5) * 70}ms`);
  }));
  const targets = [...document.querySelectorAll("[data-reveal]")];
  if (!reduce && canObserve) {
    root.classList.add("js", "exp-motion");
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
    demos.forEach((v) => { v.muted = true; v.defaultMuted = true; v.playsInline = true; v.setAttribute("playsinline", ""); });
    // Start buffering well before the section is on screen so playback begins immediately.
    let warmed = false;
    const warm = () => { if (warmed) return; warmed = true; demos.forEach((v) => { v.preload = "auto"; v.load(); }); };
    const play = () => { warm(); demos.forEach((v) => { const attempt = v.play(); if (attempt?.catch) attempt.catch(() => stage.classList.add("az-needs-tap")); }); };
    const pause = () => demos.forEach((v) => v.pause());
    stage.addEventListener("click", () => { stage.classList.remove("az-needs-tap"); demos.forEach((v) => { v.muted = true; v.play().catch(() => {}); }); });
    if (canObserve) {
      new IntersectionObserver((entries) => entries.forEach((entry) => entry.isIntersecting && warm()), {rootMargin: "1200px 0px"}).observe(stage);
      new IntersectionObserver((entries) => entries.forEach((entry) => (entry.isIntersecting ? play() : pause())), {threshold: 0.2}).observe(stage);
    } else play();
    // Also warm after the page settles, for visitors who jump straight down via "See auto zoom".
    (window.requestIdleCallback || ((fn) => setTimeout(fn, 2500)))(warm);
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
