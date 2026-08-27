const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const proofVideos = [...document.querySelectorAll("video[data-autoplay]")];
const playbackButtons = new Map(
    [...document.querySelectorAll("[data-video-toggle]")]
        .map((button) => [button.dataset.videoToggle, button]),
);

const syncPlaybackButton = (video) => {
    const button = playbackButtons.get(video.id);
    if (!button) {
        return;
    }

    const action = video.paused ? "Play" : "Pause";
    button.textContent = action;
    button.setAttribute("aria-label", `${action} video`);
};

for (const video of proofVideos) {
    const button = playbackButtons.get(video.id);
    video.addEventListener("play", () => syncPlaybackButton(video));
    video.addEventListener("pause", () => syncPlaybackButton(video));

    button?.addEventListener("click", async () => {
        if (video.paused) {
            await video.play().catch(() => {
                video.controls = true;
            });
            return;
        }

        video.pause();
    });
    syncPlaybackButton(video);
}

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
