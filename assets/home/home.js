const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const isKorean = document.documentElement?.lang === "ko";
const canEnhancePage = typeof document.querySelector === "function";
document.querySelector?.(".hero-wordmark")?.remove();

const problemSection = canEnhancePage ? document.querySelector(".problem") : null;
if (problemSection) {
  problemSection.className = "problem problem-scroll";
  problemSection.dataset.beforeAfter = "";
  problemSection.innerHTML = isKorean
    ? `<div class="problem-sticky"><div class="problem-copy section-shell"><div class="problem-message problem-question"><h2 id="problem-title">팔로우캠,<br>만들기 어렵나요?</h2><p>클라이머를 놓치지 않는 영상은<br>촬영도 편집도 어렵습니다.</p></div><div class="problem-message problem-answer"><p>AI 팔로우캠 완성까지</p><h2><strong>평균 22초</strong></h2><small>영상만 고르면 CruxCut이 알아서 따라갑니다.</small></div></div><div class="before-after" role="group" aria-label="고정 카메라 원본과 AI 팔로우캠 결과 비교"><figure class="compare-card compare-before"><figcaption>Before</figcaption><div class="compare-phone"><video class="before-image" data-problem-video muted loop playsinline preload="metadata" aria-label="클라이머가 작게 보이는 고정 카메라 원본"><source src="https://cruxcut.cruxcutapp.workers.dev/hls/lead1_w_belayer/master.m3u8" type="application/vnd.apple.mpegurl"></video></div></figure><figure class="compare-card compare-after"><figcaption>After</figcaption><div class="compare-phone"><video class="after-image" data-problem-video muted loop playsinline preload="metadata" poster="/assets/home/followcam-after-portrait.jpg" aria-label="클라이머를 확대해 따라가는 팔로우캠 결과"><source src="https://cruxcut.cruxcutapp.workers.dev/hls/full-hd/master.m3u8" type="application/vnd.apple.mpegurl"></video></div></figure></div></div>`
    : `<div class="problem-sticky"><div class="problem-copy section-shell"><div class="problem-message problem-question"><h2 id="problem-title">Follow-cam edits<br>Hard to make?</h2><p>Keeping the climber in frame makes<br>both filming and editing a challenge.</p></div><div class="problem-message problem-answer"><p>Your AI follow-cam is ready in</p><h2><strong>22 seconds</strong></h2><small>Just choose a video. CruxCut takes it from there.</small></div></div><div class="before-after" role="group" aria-label="Static camera footage compared with the AI follow-cam result"><figure class="compare-card compare-before"><figcaption>Before</figcaption><div class="compare-phone"><video class="before-image" data-problem-video muted loop playsinline preload="metadata" aria-label="Static wide climbing footage before editing"><source src="https://cruxcut.cruxcutapp.workers.dev/hls/lead1_w_belayer/master.m3u8" type="application/vnd.apple.mpegurl"></video></div></figure><figure class="compare-card compare-after"><figcaption>After</figcaption><div class="compare-phone"><video class="after-image" data-problem-video muted loop playsinline preload="metadata" poster="/assets/home/followcam-after-portrait.jpg" aria-label="Tight follow-cam result after editing"><source src="https://cruxcut.cruxcutapp.workers.dev/hls/full-hd/master.m3u8" type="application/vnd.apple.mpegurl"></video></div></figure></div></div>`;
}

const transformIntro = canEnhancePage ? document.querySelector(".transform-intro") : null;
const transformList = canEnhancePage ? document.querySelector(".transform-steps") : null;
if (transformIntro && transformList) {
  transformIntro.innerHTML = isKorean
    ? `<h2 id="transform-title">AI와 함께<br>쉬운 편집</h2><p>영상을 고르면 AI가 알아서 편집하고, 바로 저장할 수 있어요.</p>`
    : `<h2 id="transform-title">Easy editing,<br>powered by AI</h2><p>Choose a video. AI handles the edit, so you can save and share right away.</p>`;
  transformList.innerHTML = isKorean
    ? `<li class="is-active" data-step="0"><span>01</span><div><strong>영상 선택</strong><p>편집할 등반 영상을 고르세요.</p></div></li><li data-step="1"><span>02</span><div><strong>자동 편집</strong><p>AI가 클라이머를 따라 팔로우캠을 만듭니다.</p></div></li><li data-step="2"><span>03</span><div><strong>저장</strong><p>완성된 영상을 바로 저장하고 공유하세요.</p></div></li>`
    : `<li class="is-active" data-step="0"><span>01</span><div><strong>Pick a video</strong><p>Choose the climb you want to edit.</p></div></li><li data-step="1"><span>02</span><div><strong>Automatic edit</strong><p>AI follows the climber and creates your follow-cam.</p></div></li><li data-step="2"><span>03</span><div><strong>Save</strong><p>Save and share your finished video right away.</p></div></li>`;
}

const workflowStage = canEnhancePage ? document.querySelector("[data-transform-stage]") : null;
if (workflowStage) {
  const workflowCopy = isKorean
    ? [["01", "영상 선택", "편집할 등반 영상을 고르세요."], ["02", "자동 편집", "AI가 클라이머를 따라 팔로우캠을 만듭니다."], ["03", "저장", "완성된 영상을 바로 저장하고 공유하세요."]]
    : [["01", "Pick a video", "Choose the climb you want to edit."], ["02", "Automatic edit", "AI follows the climber and creates your follow-cam."], ["03", "Save", "Save and share your finished video right away."]];
  workflowStage.innerHTML = `<div class="workflow-step-overlays">${workflowCopy.map((item, index) => `<div class="workflow-step-overlay" data-workflow-copy="${index}"><span>${item[0]}</span><div><strong>${item[1]}</strong><p>${item[2]}</p></div></div>`).join("")}</div><div class="workflow-phone" aria-label="${isKorean ? "세 단계로 바뀌는 CruxCut iPhone 화면" : "CruxCut iPhone screens changing through three steps"}"><img class="workflow-screen screen-intro" src="/assets/home/app-home.png" alt="${isKorean ? "CruxCut 홈 화면" : "The CruxCut home screen"}"><img class="workflow-screen screen-select" src="/assets/home/app-select.png" alt="${isKorean ? "등반 영상 선택 화면" : "Choose a climbing video"}"><img class="workflow-screen screen-edit" src="/assets/home/app-edit.png" alt="${isKorean ? "AI 자동 편집 화면" : "AI automatic edit"}"><img class="workflow-screen screen-save" src="/assets/home/app-save.png" alt="${isKorean ? "완성된 영상 저장 화면" : "Save the finished video"}"></div>`;
}

document.querySelector?.(".environments")?.remove();
document.querySelector?.("#highlights .video-toggle")?.remove();
document.querySelector?.("#privacy .eyebrow")?.remove();
const privacyTitle = document.querySelector?.("#privacy-title");
if (isKorean && privacyTitle) privacyTitle.textContent = "강력한 프라이버시";

const carouselEyebrow = canEnhancePage ? document.querySelector(".carousel-heading .eyebrow") : null;
const carouselTitle = canEnhancePage ? document.querySelector("#compare-title") : null;
if (isKorean && carouselEyebrow && carouselTitle) {
  carouselEyebrow.textContent = "어떤 등반이라도, 어떤 환경이라도 정확하게 추적";
  carouselTitle.innerHTML = "리드부터 볼더링까지<br>실내도 야외도";
}
// Safari plays HLS natively; everyone else needs hls.js.
const hlsVideos = [...document.querySelectorAll("video")]
  .map((video) => [video, video.querySelector?.("source")?.src])
  .filter(([video, src]) => src?.endsWith(".m3u8") && !video.canPlayType?.("application/vnd.apple.mpegurl"));
if (hlsVideos.length) {
  import("https://cdnjs.cloudflare.com/ajax/libs/hls.js/1.6.14/hls.mjs")
    .then(({default: Hls}) => {
      if (!Hls.isSupported()) return;
      hlsVideos.forEach(([video, src]) => {
        // ABR ramps too slowly for a short loop, so open at the rendition the frame needs.
        const hls = new Hls({autoStartLoad: false});
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          const wanted = video.getBoundingClientRect().width * (window.devicePixelRatio || 1) || Infinity;
          const index = hls.levels.findIndex((level) => level.width >= wanted);
          hls.startLevel = index === -1 ? hls.levels.length - 1 : index;
          hls.startLoad();
        });
        hls.loadSource(src);
        hls.attachMedia(video);
      });
    })
    .catch(() => {});
}

const proofVideos = [...document.querySelectorAll("video[data-autoplay]")];
const workflowProofVideo = document.getElementById?.("workflow-proof-video");
if (workflowProofVideo) proofVideos.push(workflowProofVideo);
const playbackButtons = new Map([...document.querySelectorAll("[data-video-toggle]")].map((button) => [button.dataset.videoToggle, button]));
const stickerOverlays = new Map([...document.querySelectorAll("[data-sticker-overlay-for]")].map((overlay) => [overlay.dataset.stickerOverlayFor, overlay]));
const syncPlaybackButton = (video) => { const button = playbackButtons.get(video.id); if (!button) return; const action = video.paused ? (isKorean ? "재생" : "Play") : (isKorean ? "일시정지" : "Pause"); button.textContent = action; button.setAttribute("aria-label", isKorean ? `영상 ${action}` : `${action} video`); };
for (const video of proofVideos) {
  const button = playbackButtons.get(video.id); const stickerOverlay = stickerOverlays.get(video.id);
  video.addEventListener("play", () => syncPlaybackButton(video)); video.addEventListener("pause", () => syncPlaybackButton(video));
  if (stickerOverlay) { const revealAt = Number(video.dataset.stickerRevealAt); const syncStickerOverlay = () => stickerOverlay.classList.toggle("is-visible", video.currentTime >= revealAt); video.addEventListener("timeupdate", syncStickerOverlay); syncStickerOverlay(); }
  button?.addEventListener("click", async () => { if (video.paused) await video.play().catch(() => { video.controls = true; }); else video.pause(); }); syncPlaybackButton(video);
}
const syncPlaybackPreference = () => { for (const video of proofVideos) { if (reducedMotion.matches) { video.pause(); video.removeAttribute("autoplay"); } else { video.setAttribute("autoplay", ""); video.play().catch(() => { video.controls = true; }); } } };
syncPlaybackPreference(); reducedMotion.addEventListener("change", syncPlaybackPreference);
const canQueryOne = typeof document.querySelector === "function";
const transformStage = canQueryOne ? document.querySelector("[data-transform-stage]") : null;
const transformSteps = canQueryOne ? [...document.querySelectorAll("[data-step]")] : [];
const transformationSection = transformStage?.closest?.(".transformation") || null;
const workflowOverlays = canQueryOne ? [...document.querySelectorAll("[data-workflow-copy]")] : [];
const workflowScreens = canQueryOne ? [...document.querySelectorAll(".workflow-screen:not(.screen-intro)")] : [];
const introScreen = canQueryOne ? document.querySelector(".screen-intro") : null;
const stageCaption = canQueryOne ? document.querySelector("[data-stage-caption]") : null;
const stageCaptions = isKorean ? ["영상 선택", "자동 편집 중", "저장 준비 완료"] : ["Choose video", "Editing automatically", "Ready to save"];
const clamp01 = (value) => Math.max(0, Math.min(1, value));
const smoothstep = (start, end, value) => {
  const progress = clamp01((value - start) / Math.max(0.0001, end - start));
  return progress * progress * (3 - 2 * progress);
};
const fadeWindow = (value, enterStart, enterEnd, exitStart, exitEnd) => (
  smoothstep(enterStart, enterEnd, value) * (1 - smoothstep(exitStart, exitEnd, value))
);
let activeWorkflowIndex = -1;
const syncWorkflow = () => {
  if (!transformationSection || !transformStage) return;
  const rect = transformationSection.getBoundingClientRect();
  const travel = Math.max(1, rect.height - window.innerHeight);
  const progress = clamp01(-rect.top / travel);
  const introExit = smoothstep(0.08, 0.2, progress);
  transformationSection.style.setProperty("--workflow-progress", String(progress));
  transformationSection.style.setProperty("--workflow-intro-opacity", String(1 - introExit));
  transformationSection.style.setProperty("--workflow-intro-x", `${-72 * introExit}px`);
  transformationSection.classList.toggle("has-active-step", progress >= 0.16);

  const centers = workflowScreens.map((_, index, all) => 0.31 + index * (0.48 / Math.max(1, all.length - 1)));
  const gap = centers.length > 1 ? centers[1] - centers[0] : 0.24;
  const nearestIndex = centers.reduce((best, center, index) => (
    Math.abs(progress - center) < Math.abs(progress - centers[best]) ? index : best
  ), 0);
  const nextActiveIndex = progress < 0.16 ? -1 : nearestIndex;

  workflowOverlays.forEach((overlay, index) => {
    const center = centers[index];
    let x = 0;
    if (progress < center) x = 130 * (1 - smoothstep(center - gap * 0.4375, center - gap * 0.229, progress));
    else x = -130 * smoothstep(center + gap * 0.229, center + gap * 0.4375, progress);
    const opacity = fadeWindow(progress, center - gap * 0.4375, center - gap * 0.229, center + gap * 0.229, center + gap * 0.4375);
    overlay.style.setProperty("--workflow-copy-x", `${x}px`);
    overlay.style.setProperty("--workflow-copy-opacity", String(opacity));
    overlay.setAttribute("aria-hidden", String(opacity < 0.5));
  });

  if (introScreen) {
    const handover = smoothstep(centers[0] - gap * 0.5417, centers[0] - gap * 0.3125, progress);
    introScreen.style.opacity = String(1 - handover);
    introScreen.style.transform = `translate3d(${-20 * handover}%, 0, 0)`;
    introScreen.setAttribute("aria-hidden", String(handover > 0.5));
  }

  workflowScreens.forEach((screen, index) => {
    const center = centers[index];
    let x = 0;
    let opacity = 0;
    if (index === workflowScreens.length - 1 && progress >= center) {
      opacity = 1;
      x = 0;
    } else {
      if (progress < center) x = 20 * (1 - smoothstep(center - gap * 0.5417, center - gap * 0.3125, progress));
      else x = -20 * smoothstep(center + gap * 0.3125, center + gap * 0.5417, progress);
      opacity = fadeWindow(progress, center - gap * 0.5417, center - gap * 0.3125, center + gap * 0.3125, center + gap * 0.5417);
    }
    screen.style.opacity = String(opacity);
    screen.style.transform = `translate3d(${x}%, 0, 0) scale(${0.985 + opacity * 0.015})`;
    screen.setAttribute("aria-hidden", String(opacity < 0.5));
  });

  if (nextActiveIndex !== activeWorkflowIndex) {
    activeWorkflowIndex = nextActiveIndex;
    transformSteps.forEach((step, index) => {
      step.classList.toggle("is-active", index === activeWorkflowIndex);
      step.classList.toggle("is-before", activeWorkflowIndex >= 0 && index < activeWorkflowIndex);
      step.classList.toggle("is-after", activeWorkflowIndex < 0 || index > activeWorkflowIndex);
    });
    if (activeWorkflowIndex >= 0) {
      transformStage.dataset.state = String(activeWorkflowIndex);
      if (stageCaption) stageCaption.textContent = stageCaptions[activeWorkflowIndex];
    }
  }
};
if (transformationSection) syncWorkflow();
const climbCarousel = canQueryOne ? document.querySelector("[data-climb-carousel]") : null; const carouselTrack = canQueryOne ? document.querySelector("[data-carousel-track]") : null; const carouselButtons = canQueryOne ? [...document.querySelectorAll("[data-carousel-go]")] : []; const carouselVideos = canQueryOne ? [...document.querySelectorAll("[data-carousel-video]")] : [];
let activeCarouselIndex = -1;
const setCarouselProgress = (progress) => {
  const value = clamp01(progress);
  carouselTrack?.style.setProperty("--carousel-progress", String(value));
  const slideCount = carouselTrack?.children.length || 1;
  const activeIndex = Math.min(slideCount - 1, Math.round(value * (slideCount - 1)));
  if (activeIndex === activeCarouselIndex) return;
  activeCarouselIndex = activeIndex;
  carouselButtons.forEach((button,index) => {
    const active = index === activeIndex;
    button.classList.toggle("is-active",active);
    button.setAttribute("aria-pressed",String(active));
  });
  const activeSlide = carouselTrack?.children[activeIndex];
  carouselVideos.forEach((video) => {
    if (activeSlide?.contains(video) && !reducedMotion.matches) video.play().catch(() => { video.controls = true; });
    else video.pause();
  });
};
const syncCarousel = () => { if (!climbCarousel) return; const rect = climbCarousel.getBoundingClientRect(); const travel = Math.max(1,rect.height-window.innerHeight); setCarouselProgress(-rect.top/travel); };
if (climbCarousel) { carouselButtons.forEach((button) => button.addEventListener("click",() => { const index=Number(button.dataset.carouselGo); const top=climbCarousel.getBoundingClientRect().top+window.scrollY+(climbCarousel.offsetHeight-window.innerHeight)*index; window.scrollTo({top,behavior:reducedMotion.matches?"auto":"smooth"}); })); syncCarousel(); }
const syncBeforeAfter = () => {
  if (!problemSection) return;
  const rect = problemSection.getBoundingClientRect();
  const travel = Math.max(1, rect.height - window.innerHeight);
  const progress = clamp01(-rect.top / travel);
  problemSection.style.setProperty("--before-after-progress", String(progress));
  problemSection.style.setProperty("--problem-compare-opacity", String(smoothstep(0.24, 0.34, progress)));
  problemSection.style.setProperty("--problem-compare-progress", String(smoothstep(0.42, 0.68, progress)));
  problemSection.style.setProperty("--problem-question-opacity", String(1 - smoothstep(0.16, 0.27, progress)));
  problemSection.style.setProperty("--problem-question-shift", `${-18 * smoothstep(0.16, 0.29, progress)}px`);
  problemSection.style.setProperty("--problem-after-opacity", String(smoothstep(0.42, 0.68, progress)));
  problemSection.style.setProperty("--problem-fill", String(smoothstep(0.8, 0.92, progress)));
  problemSection.style.setProperty("--problem-answer-opacity", String(smoothstep(0.88, 0.97, progress)));
  problemSection.style.setProperty("--problem-answer-shift", `${24 * (1 - smoothstep(0.88, 0.97, progress))}px`);
  const shouldPlayComparison = progress >= 0.24 && progress < 0.96 && !reducedMotion.matches;
  document.querySelectorAll("[data-problem-video]").forEach((video) => {
    if (shouldPlayComparison && video.paused) video.play().catch(() => {});
    else if (!shouldPlayComparison && !video.paused) video.pause();
  });
};
if (problemSection) syncBeforeAfter();
let scrollStoryFrame = 0;
const syncScrollStories = () => {
  scrollStoryFrame = 0;
  syncBeforeAfter();
  syncWorkflow();
  syncCarousel();
};
const requestScrollStorySync = () => {
  if (!scrollStoryFrame) scrollStoryFrame = window.requestAnimationFrame(syncScrollStories);
};
window.addEventListener?.("scroll", requestScrollStorySync, {passive: true});
window.addEventListener?.("resize", requestScrollStorySync);
const menuToggle = document.querySelector?.(".menu-toggle"); const mobileMenu = document.querySelector?.(".mobile-menu");
const closeMenu = () => { if (!menuToggle || !mobileMenu) return; mobileMenu.hidden = true; menuToggle.setAttribute("aria-expanded","false"); };
menuToggle?.addEventListener("click",() => { const open = mobileMenu.hidden; mobileMenu.hidden = !open; menuToggle.setAttribute("aria-expanded",String(open)); });
mobileMenu?.querySelectorAll("a").forEach((link) => link.addEventListener("click",closeMenu));
