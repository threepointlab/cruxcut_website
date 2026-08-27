# Route Sticker reveal design QA

- Source visual truth: `/tmp/codex-remote-attachments/01a03c34-cade-7423-b0f4-09eb503c59e2/2E64A08A-21F8-4F4C-B4A6-9E05BCAC4F06/3-사진-3.jpg`, plus the approved existing heart-drawing video in `assets/home/route-sticker-proof.mp4`.
- Implementation screenshots: `/private/tmp/cruxcut-route-sticker-desktop-final.png` and `/private/tmp/cruxcut-route-sticker-mobile-final.png`.
- Combined comparison: `/private/tmp/cruxcut-route-sticker-comparison.png`.
- Viewports: desktop 1280 x 1000 CSS px; mobile 390 x 844 CSS px.
- Source pixels: 1080 x 903. Implementation pixels: 1280 x 1000 and 390 x 844. Browser density was 1 CSS px per captured pixel; the combined comparison normalized both sides into 720 x 720 frames.
- State: heart path complete, route-sticker information visible, video paused for stable comparison.

## Full-view comparison evidence

The source's right-aligned hierarchy (`5.7 GRADE`, `1 TRY`, `38s TIME`) and lower `cruxcut.` signature remain recognizable in the implementation. The white export canvas and orange static path were intentionally replaced by a transparent overlay on the existing cyan heart-drawing video, matching the approved behavior rather than reproducing a standalone image export.

## Focused region comparison evidence

The route card was checked at desktop and mobile widths. The stats and wordmark remain inside the 9:16 media stage, do not cover the climber's central body, and do not create horizontal overflow. The existing heart path stays visible under the information layer.

## Findings

- No actionable P0, P1, or P2 mismatch.
- Typography: Pretendard hierarchy is legible; numeric emphasis and uppercase labels match the source's visual order.
- Spacing and layout: right-side stats and lower wordmark stay within the media bounds at both tested widths.
- Colors and tokens: warm white text and the orange brand dot use the existing site tokens; the cyan route is intentionally preserved from the approved source video.
- Image quality: the original 540 x 960 H.264 proof remains sharp at its intended portrait size and stays within the media budget.
- Copy: `5.7`, `Grade`, `1`, `Try`, `38s`, `Time`, and `cruxcut.` match the supplied sticker content.

## Interaction verification

- Overlay hidden before 2.6 seconds.
- Overlay visible after the heart path completes.
- Play/Pause control remains functional.
- Overlay resets after the video loops.
- Browser console errors: none.

## Comparison history

- Initial implementation pass: no actionable P0/P1/P2 findings after desktop and mobile browser checks.

## Implementation checklist

- [x] Preserve the existing heart-drawing sequence.
- [x] Reveal sticker information only after the route is complete.
- [x] Hold the final state long enough to read.
- [x] Reset cleanly for the next loop.
- [x] Verify desktop and mobile bounds, controls, and console output.

## Follow-up polish

- P3: Fine-tune the 2.4-second hold after watching the loop in context, if desired.

final result: passed
