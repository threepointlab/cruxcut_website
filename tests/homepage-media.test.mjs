import assert from "node:assert/strict";
import {execFile} from "node:child_process";
import {readFile, stat} from "node:fs/promises";
import test from "node:test";
import {promisify} from "node:util";

const execFileAsync = promisify(execFile);

const budgets = new Map([
    ["../assets/home/followcam-proof.mp4", 5_000_000],
    ["../assets/home/highlights-proof.mp4", 4_000_000],
    ["../assets/home/route-sticker-proof.mp4", 2_000_000],
    ["../assets/home/followcam-poster.jpg", 700_000],
    ["../assets/home/highlights-poster.jpg", 700_000],
    ["../assets/home/route-sticker-poster.jpg", 700_000],
    ["../assets/home/og.png", 2_500_000],
]);

test("ships every homepage media asset inside its byte budget", async () => {
    for (const [relativePath, maximumBytes] of budgets) {
        const metadata = await stat(new URL(relativePath, import.meta.url));
        assert.ok(
            metadata.size <= maximumBytes,
            `${relativePath} is ${metadata.size} bytes; limit is ${maximumBytes}`,
        );
    }
});

test("follow-cam proof is backed by a moving tracked crop path", async () => {
    const trackingUrl = new URL("../assets/home/followcam-tracking.json", import.meta.url);
    const tracking = JSON.parse(await readFile(trackingUrl, "utf8"));
    const centers = tracking.frames.map(({cx, cy}) => ({cx, cy}));
    const horizontalRange = Math.max(...centers.map(({cx}) => cx))
        - Math.min(...centers.map(({cx}) => cx));
    const verticalRange = Math.max(...centers.map(({cy}) => cy))
        - Math.min(...centers.map(({cy}) => cy));

    assert.equal(tracking.lockedOn, true);
    assert.ok(centers.length >= 300, `only ${centers.length} tracked frames`);
    assert.ok(horizontalRange >= 40, `horizontal range is only ${horizontalRange}px`);
    assert.ok(verticalRange >= 40, `vertical range is only ${verticalRange}px`);
});

test("follow-cam proof compresses the approved 20–65 second source span into 15 seconds", async () => {
    const trackingUrl = new URL("../assets/home/followcam-tracking.json", import.meta.url);
    const tracking = JSON.parse(await readFile(trackingUrl, "utf8"));

    assert.deepEqual(tracking.segment, {startSeconds: 20, durationSeconds: 45});
    assert.equal(tracking.outputDurationSeconds, 15);
    assert.equal(tracking.playbackRate, 3);
});

const proofContracts = [
    {
        path: "../assets/home/followcam-proof.mp4",
        width: 1280,
        height: 720,
        minimumDuration: 14.8,
        maximumDuration: 15.2,
    },
    {
        path: "../assets/home/highlights-proof.mp4",
        width: 540,
        height: 960,
        minimumDuration: 9.9,
        maximumDuration: 10.1,
    },
];

test("ships concise web-playable proof loops with their intended framing", async () => {
    for (const contract of proofContracts) {
        const mediaUrl = new URL(contract.path, import.meta.url);
        const {stdout} = await execFileAsync("ffprobe", [
            "-v", "error",
            "-show_entries", "format=duration:stream=codec_type,codec_name,width,height,r_frame_rate",
            "-of", "json",
            mediaUrl.pathname,
        ]);
        const probe = JSON.parse(stdout);
        const video = probe.streams.find((stream) => stream.codec_type === "video");
        const audio = probe.streams.filter((stream) => stream.codec_type === "audio");
        const [frames, seconds] = video.r_frame_rate.split("/").map(Number);
        const frameRate = frames / seconds;
        const duration = Number(probe.format.duration);

        assert.equal(video.codec_name, "h264", contract.path);
        assert.equal(video.width, contract.width, contract.path);
        assert.equal(video.height, contract.height, contract.path);
        assert.ok(frameRate >= 29 && frameRate <= 31, `${contract.path} is ${frameRate} fps`);
        assert.equal(audio.length, 0, contract.path);
        assert.ok(
            duration >= contract.minimumDuration && duration <= contract.maximumDuration,
            `${contract.path} is ${duration} seconds`,
        );
    }
});
