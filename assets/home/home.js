const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const proofVideos = [...document.querySelectorAll("video[data-autoplay]")];

const syncPlaybackPreference = () => {
    for (const video of proofVideos) {
        if (reducedMotion.matches) {
            video.pause();
            video.removeAttribute("autoplay");
            continue;
        }

        video.setAttribute("autoplay", "");
        video.play().catch(() => {
            video.controls = true;
        });
    }
};

syncPlaybackPreference();
reducedMotion.addEventListener("change", syncPlaybackPreference);
