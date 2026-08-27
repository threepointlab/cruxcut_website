import assert from "node:assert/strict";
import {execFile} from "node:child_process";
import {stat} from "node:fs/promises";
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

const proofContracts = [
    {
        path: "../assets/home/followcam-proof.mp4",
        width: 1280,
        height: 720,
        minimumDuration: 11.8,
        maximumDuration: 12.2,
    },
    {
        path: "../assets/home/highlights-proof.mp4",
        width: 540,
        height: 960,
        minimumDuration: 9.2,
        maximumDuration: 9.5,
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
