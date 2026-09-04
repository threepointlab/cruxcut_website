# CruxCut premium marketing homepage — design QA

- Direction: approved hybrid of the calm, warm-ivory “Gallery Cut” concept, immersive climbing footage, and scroll-led scene changes.
- Reference captures: `design-audit/06-umano-desktop-hero-settled.png`, `design-audit/07-umano-mobile-hero-settled.png`, `design-audit/08-facilpay-desktop-hero.png`, and `design-audit/09-facilpay-mobile-hero.png`.
- Implementation captures: `design-audit/10-built-desktop-hero.png`, `design-audit/11-built-desktop-full.png`, `design-audit/12-built-mobile-hero.png`, `design-audit/13-built-mobile-full.png`, and focused follow-cam captures 14 and 17.
- Tested viewports: 1440 × 1000 desktop and 390 × 844 mobile.
- Annotation iteration viewports: 1440 × 1000 desktop and 521 × 970 mobile.
- Localization/carousel iteration: English and Korean pages at 521 × 970 mobile.

## Visual comparison

The implementation preserves the approved editorial qualities: warm ivory canvas, restrained black and ivory typography, generous whitespace, a compact floating navigation pill, and climbing media as the dominant source of color. Orange is limited to conversion and tracking cues. Dark immersive scenes create controlled transitions without introducing additional palette noise.

The large serif typography and asymmetric media treatment echo the visual references without cloning them. The follow-cam section adopts FacilPay’s scene-like progression: the copy remains stable while active steps and the tracking treatment change with scroll position.

## Responsive and interaction checks

- Desktop and mobile hero hierarchy remains intact.
- At 390 px, document, body, and viewport widths all equal 390 px; no horizontal overflow.
- Navigation simplifies on mobile while preserving the App Store CTA.
- Hero conversion action uses Apple's unmodified black App Store badge artwork at a legible, subordinate size.
- Follow-cam steps stack before the proof media on mobile.
- Follow-cam now runs as one pinned media scene: Detect creates the crop box, Track moves it with the climber, Edit changes its size and ratio, and Export removes the overlay and tightens the finished frame.
- Lead and Bouldering examples switch automatically as their narrative regions cross the viewport; the pills remain available as an optional direct control.
- Lead/Bouldering is now a true horizontal carousel driven continuously by vertical scroll progress. Both videos coexist in one track, so the transition visibly passes from one scene to the next instead of swapping the same media slot.
- `/ko/` mirrors the complete product story with Korean-first persuasion copy, localized metadata, hreflang links, language controls, and an official Korean App Store badge.
- Lead and bouldering tabs, FAQ disclosure controls, and all video pause controls remain keyboard-operable.
- Reduced-motion preferences disable smooth scrolling and transitions.
- Browser console errors: none.

## Findings and fixes

- P2: Prototype replacement language appeared inside the user-facing app workflow. Replaced it with the production label “Actual in-app workflow.”
- P2: Earlier explorations used too many competing colors. Consolidated the palette to warm ivory, near-black, muted gray, and one orange accent.
- P2: Supporting features risked reading as small cards. Highlights and Route Stickers now receive dedicated, immersive sections between the More introduction and trust content.
- P2: The workflow originally separated its text from the media on mobile. The four step cards now appear directly over the pinned video during scrolling.
- P2: The Lead/Bouldering proof originally required a tap. Intersection-driven scene changes now make both examples visible through normal page scrolling.
- P2: Comparison story text collided with the sticky title on the 521 px mobile viewport. The mobile scene now relies on the active pill and media caption; desktop retains the overlaid editorial copy.
- P2: The intermediate automatic swap still read like tabs rather than a carousel. Rebuilt it as a two-panel horizontal track whose translation is directly tied to vertical scroll progress.
- P2: Korean workflow status and playback controls reverted to English after JavaScript state changes. Both now follow the document language.
- P2: The hero used a custom orange download button. It now uses official App Store badge artwork without modification.
- No remaining actionable P0, P1, or P2 findings.

## Verification

- `node --test tests/*.test.mjs`: 44/44 passing.
- Hero, full page, all four follow-cam states, automatic Lead/Bouldering switching, mobile layout, focus states, and overflow were checked in the local browser.
- Korean hero, the Lead start state, the 72% transition state, and the completed Bouldering state were captured and reviewed. Mobile horizontal overflow remained 0 px.

## Annotation refinement — simplified story

- Follow-cam step cards were removed. One text treatment now stays at the same lower-left position while inactive steps fade to opacity 0 and the active step fades to opacity 1.
- Removed the hero processing note, the visible app-workflow section, environment eyebrow, More eyebrow/supporting sentence, privacy mark, privacy inline link, and FAQ eyebrow.
- Replaced Korean feature copy exactly as requested and aligned the English feature story to the same concise hierarchy.
- The carousel no longer contains Lead/Boulder buttons. It now spans four source conditions: outdoor lead, indoor boulder, wide-angle footage, and vertical handheld footage.
- Added a functional mobile section menu; Korean and English download actions read `다운로드` and `Download`.
- Privacy-policy access remains in the footer.
- Browser checks at 584 × 1514 confirmed: menu opens with six destinations, hidden app workflow, no hero processing note, four carousel slides, zero carousel buttons, fixed text position with inactive opacity 0, transparent text treatment, and zero horizontal overflow.
- `node --test tests/*.test.mjs`: 44/44 passing.

final result: passed

## English FAQ cleanup — 2026-09-03

**Source visual truth**

- Conversation attachments for Browser Comments 1 and 2 on `/?refine=gradient2#follow-cam`: the highlighted `QUESTIONS, ANSWERED` eyebrow and the full `CLIMBING VIDEO GUIDE` promo block are the removal targets.
- Source browser metadata: 638 × 1514 CSS px; attached previews are 540 × 1514 px.

**Implementation evidence**

- Local route: `http://127.0.0.1:4173/?refine=cleanup7#faq`.
- Screenshot: `design-audit/69-english-faq-cleanup.png`.
- Implementation capture: 577 × 1514 CSS px and 577 × 1514 pixels at device scale 1. The source and implementation were normalized by the shared mobile layout state; the requested changes are binary element removals rather than pixel-position changes.
- Full-view comparison: the FAQ now begins directly with `About CruxCut`; after the final FAQ row, the orange final CTA follows immediately with no guide promo block or abandoned spacing.
- Focused comparison was not needed because both targets were complete block removals and their surrounding section boundaries are fully visible in the implementation capture.

**Required fidelity surfaces**

- Fonts and typography: the existing FAQ display face, question weights, wrapping, and hierarchy remain unchanged; only the unwanted eyebrow is absent.
- Spacing and layout rhythm: the FAQ-to-final-CTA flow is continuous and no empty guide-card height remains.
- Colors and visual tokens: the paper FAQ field and orange final CTA preserve the established palette and contrast.
- Image quality and asset fidelity: no image assets were changed or substituted in this cleanup.
- Copy and content: `QUESTIONS, ANSWERED`, `CLIMBING VIDEO GUIDE`, its headline, and its text link are absent; all FAQ questions and answers remain intact.

**Findings**

- No actionable P0, P1, or P2 mismatch remains.

**Comparison history**

- Earlier: the English FAQ retained an unwanted eyebrow and a large guide-promo block between the FAQ and final CTA.
- Fix: removed the eyebrow and the complete guide-card markup while preserving the public guide route and footer discovery links.
- Post-fix evidence: screenshot 69 shows the cleaned FAQ-to-CTA transition; DOM checks report zero `.guide-card` elements, no `#faq .eyebrow`, and 0 px horizontal overflow.

**Implementation checklist**

- [x] English FAQ eyebrow removed.
- [x] English guide promo block removed.
- [x] FAQ accordion still opens and closes.
- [x] FAQ is directly adjacent to the final CTA.
- [x] `node --check assets/home/home.js`: passed.
- [x] `node --test tests/*.test.mjs`: 44/44 passing.
- [x] `git diff --check`: passed.

final result: passed

## Final centered-content annotation pass — 2026-09-03

**Source visual truth**

- The nine 638 × 1514 mobile browser annotation screenshots supplied in the current request, covering the Korean hero, problem question, 22-second answer, workflow intro/save state, Highlights, Route Stickers, Privacy, and FAQ.
- The requested design delta is scoped: preserve the existing visual system and media while changing the specified copy, centering, and terminal workflow state.

**Implementation evidence**

- Local route: `http://127.0.0.1:4173/ko/?refine=center3#follow-cam`.
- Browser verification viewport: 577 × 1514 CSS px at device scale 1. The source and implementation differ by 61 px in viewport width, so comparisons were normalized to each viewport's horizontal center rather than pixel-for-pixel left offsets.
- Full-view captures: `design-audit/59-mobile-centered-problem-final.png`, `design-audit/60-mobile-workflow-save-hold.png`, `design-audit/61-mobile-centered-support-sections.png`, and `design-audit/62-mobile-centered-22-seconds.png`.
- Focused comparison: the problem question and 22-second answer each use `justify-content: center`, `align-items: center`, and `text-align: center`; the workflow's last screen remains at opacity 1 with an identity transform after its copy exits; Highlights, Route Stickers, Privacy, and FAQ report centered text and 0 px horizontal overflow.

**Required fidelity surfaces**

- Fonts and typography: retained the existing Korean display serif and Pretendard hierarchy; only the hero copy was shortened to `클라이머를 위한 영상 편집`, preserving optical size and wrapping.
- Spacing and layout rhythm: centered both problem-message groups on both axes, centered the workflow subtitle, and applied consistent mobile alignment to the four requested supporting sections without changing desktop layout.
- Colors and visual tokens: retained the approved orange and near-black gradients, glass navigation, contrast, borders, and elevation.
- Image quality and asset fidelity: reused the existing source poster assets without recompression or placeholders; the terminal workflow holds the same `/assets/home/route-sticker-poster.jpg` used in the Save step.
- Copy and content: all requested Korean wording and labels remain intact, with the hero suffix `앱` removed exactly as annotated.

**Findings**

- No actionable P0, P1, or P2 mismatch remains in the annotated states.
- P3: the browser annotation viewport is 638 px wide while the available persistent mobile preview is 577 px wide; responsive centering is nevertheless exact by computed layout and remains free of horizontal overflow.

**Comparison history**

- Earlier: question and 22-second groups were top-weighted; workflow subtitle and supporting-section headings were left aligned; the final phone screen faded to blank after Save.
- Fix: added mobile flex centering and section-specific text centering, centered the workflow subtitle, updated hero copy, and held the final workflow image after the third stage.
- Post-fix evidence: captures 59–62 and computed layout checks confirm centered alignment and persistent Save-screen opacity 1.

**Implementation checklist**

- [x] Hero copy updated.
- [x] Problem and 22-second text centered vertically and horizontally.
- [x] Workflow intro subtitle centered.
- [x] Save image persists after the third step.
- [x] Highlights, Route Stickers, Privacy, and FAQ centered on mobile.
- [x] JavaScript syntax check passed.
- [x] `node --test tests/*.test.mjs`: 44/44 passing.

final result: passed

## FacilPay scroll-motion audit and implementation — 2026-09-03

### Reference evidence

- `design-audit/facilpay-01-top.png`: the opening visual is held inside a full-viewport pinned stage.
- `design-audit/facilpay-02-scroll.png`: device scale, rotation, glow, and opacity are continuously tied to scroll progress.
- `design-audit/facilpay-03-transition.png`: the next statement enters only after the first visual narrative has resolved.
- Browser inspection at 1280 × 720 found a 5,040 px hero (seven viewport heights), a `position: sticky; top: 0` stage, GSAP ScrollTrigger, Lenis, and compositor hints including `will-change: transform, filter, opacity`.

### Why the previous CruxCut motion felt less natural

- Workflow scenes were selected by `IntersectionObserver`, so scroll input produced state jumps instead of continuous motion.
- CSS transitions were layered on top of those state jumps, causing animation to lag behind the user's scroll position.
- The problem section inherited `display: grid` and centered its only child inside a multi-viewport container, creating a real empty interval before the sticky scene engaged.
- Carousel videos were paused or played during every scroll animation frame even when the active slide had not changed.
- The three workflow messages did not have an explicit reading hold between entrance and exit.

### Implemented changes

- Replaced threshold-driven workflow switching with one continuous normalized scroll progress.
- Added smoothstep interpolation for problem copy, image crossfade, orange fill, workflow copy, and phone-screen movement.
- Defined three workflow motion windows with right-side entrance, centered reading hold, and left-side exit.
- Removed scroll-linked CSS transition latency and moved scroll updates into one passive event plus one shared `requestAnimationFrame` scheduler.
- Limited video playback updates to actual active-carousel changes.
- Reset the problem section to block layout, eliminating the inherited grid-centering gap.
- Added reduced-motion overrides and retained zero horizontal overflow.

### Verification

- Desktop captures: `design-audit/53-final-problem-desktop.png`, `design-audit/54-final-workflow-desktop.png`, and `design-audit/55-final-carousel-desktop.png`.
- Mobile DOM verification at 576 × 1514 confirmed the problem section is block layout, the sticky stage remains one viewport high, and horizontal overflow is 0 px.
- Adjacent workflow samples confirmed continuous values: the second message moved from +102.5 px / 0.21 opacity to +27.7 px / 0.79, held at 0 px / 1.0, then moved through −28.7 px / 0.78 to −102.2 px / 0.21.
- `node --check assets/home/home.js`: passed.
- `node --test tests/*.test.mjs`: 44/44 passing.

final result: passed

## Annotation refinement — transition cleanup

- Moved the problem question from vertical center to 12svh from the top on mobile, removing the empty screen that previously appeared between the hero and the first message.
- Removed all text shadow from the `평균 22초.` answer treatment.
- Removed every carousel figcaption and the correction-proof `경로로 보정` label.
- Replaced flow-positioned step copy with a fixed overlay at 96 px from the mobile viewport top. Current copy sits at 0; incoming copy starts at +110 px; outgoing copy ends at −110 px.
- Darkened the mobile glass bar to `rgba(24,24,26,.38)` while retaining 30 px background blur, saturation, and a restrained translucent border.
- Browser verification confirmed the right-to-left intermediate transition, hidden captions/label, shadow-free 22-second hook, dark glass computed styles, and 0 px horizontal overflow.
- Capture: `design-audit/47-ko-tight-glass-workflow.png`.
- `node --test tests/*.test.mjs`: 44/44 passing.

final result: passed

## Annotation refinement — directional steps and glass navigation

- Removed overlap between the opening problem copy and the rising orange fill: at the measured 59.6% transition state, the question opacity is 0 before the fill reaches it.
- Restored the Korean `CruxCut으로 완성하는 쉬운 편집.` introduction and made its visibility reset correctly when scrolling back before the steps.
- Workflow copy now stays near the fixed upper position; future steps sit 88 px to the right, enter to 0, then exit to −88 px on the left.
- Removed all four carousel `slide-copy` blocks visually and expanded each media panel to the full slide width.
- Updated the Korean privacy title to `강력한 프라이버시`.
- Restyled the mobile bottom bar as translucent glass with 28 px blur, 180% saturation, a bright inner highlight, translucent border, and layered shadow.
- Mobile browser verification confirmed the intro reset, directional state transforms, zero visible slide-copy blocks, exact privacy title, glass computed styles, and 0 px horizontal overflow.
- Capture: `design-audit/46-ko-glass-directional-workflow.png`.
- `node --test tests/*.test.mjs`: 44/44 passing.

final result: passed

## Annotation refinement — mobile bottom navigation

- Moved the fixed navigation pill from the top edge to 12 px above the mobile safe-area inset while preserving the desktop header position.
- Added mobile body clearance so the navigation does not cover the end of the footer or prevent access to final content.
- Browser verification at 584 × 1514 confirmed fixed positioning, an 11.55 px bottom gap, 560.43 px navigation width, and 0 px horizontal overflow at the hero and follow-cam scroll states.
- Capture: `design-audit/45-ko-mobile-bottom-nav.png`.
- `node --test tests/*.test.mjs`: 44/44 passing.

final result: passed

## Annotation refinement — slower pacing and unified motion

- Increased the problem story to 270svh and held the opening question fully visible through roughly the first 40% of the scene.
- The Before/After climbing imagery is limited to the opening message. The second message arrives as a solid orange field fills upward behind the oversized `평균 22초.` hook.
- Increased the editing walkthrough to 470svh. Its title now receives a dedicated introductory viewport before the first workflow step appears.
- Moved step explanations to the same upper position as the title and standardized every step to enter and exit along the same left-to-right horizontal axis.
- Removed the privacy eyebrow `기기 안에서 안전하게`.
- Mobile browser verification at 584 × 1514 confirmed the delayed question transition, orange fill state, intro-before-step timing, centered phone, same-axis transforms, hidden privacy eyebrow, and 0 px overflow.
- Captures: `design-audit/42-ko-slower-question.png`, `design-audit/43-ko-22-fill-transition.png`, and `design-audit/44-ko-workflow-slower.png`.
- `node --test tests/*.test.mjs`: 44/44 passing.

final result: passed

## Annotation refinement — 22-second hook and phone workflow

- Compressed the problem statement to `팔로우캠, 만들기 어렵나요?` and converted the scroll story into a copy transition that lands on the oversized `평균 22초.` hook.
- Removed the image-scale animation; the imagery now stays stable behind the question-to-answer transition with a restrained crossfade.
- Rebuilt the follow-cam walkthrough on a near-black background with one centered portrait phone presentation and three horizontally transitioning screens for 영상 선택, 자동 편집, 저장.
- Step descriptions now enter from alternating horizontal directions while the phone remains fixed at the viewport center.
- Removed the duplicate environments section and the Highlights pause control.
- Mobile verification at 584 × 1514 confirmed centered phone geometry (292.2 px center versus 292 px viewport center), all three screen states, absent duplicate section/control, and 0 px horizontal overflow.
- Captures: `design-audit/40-ko-22-second-hook.png` and `design-audit/41-ko-phone-workflow.png`.
- `node --test tests/*.test.mjs`: 44/44 passing.

final result: passed

## Annotation refinement — stronger product story

- Changed the orange hero headline and supporting copy to near-black for stronger contrast and removed the duplicate centered hero wordmark.
- Rebuilt the problem section as a 190svh scroll story: the static wide Before frame enlarges while the tighter After frame fades and scales into view.
- Reframed the promise around the difficulty of creating a moving camera and the average 22-second AI result.
- Simplified the follow-cam workflow from four steps to three: 영상 선택, 자동 편집, 저장. Removed the old eyebrow and replaced the heading with `CruxCut으로 완성하는 쉬운 편집.`
- Updated the carousel hierarchy to `어떤 등반이라도, 어떤 환경이라도 정확하게 추적` and `리드부터 볼더링까지. 실내도 야외도.`
- Mobile browser verification at 584 × 1514 confirmed the animated intermediate state, black hero type, absent hero logo, exact three-step sequence, revised carousel copy, and 0 px horizontal overflow.
- Capture: `design-audit/39-ko-before-after-scroll.png`.
- `node --test tests/*.test.mjs`: 44/44 passing.

final result: passed

## Annotation refinement — orange scroll-over hero

- Rebuilt the Korean and English hero as a full orange editorial panel with centered wordmark, product promise, official App Store badge, and a large rounded app screen.
- The app screen rises from below the fold and passes over the sticky hero copy as the page scrolls; mobile captures verify the top state and the 650 px overlap state.
- Removed the mobile Menu control while retaining direct desktop section links and the localized Download action.
- Updated the Korean privacy and route-sharing copy exactly as requested.
- Removed the visible Highlights and Route Sticker feature numbers and the Route Sticker pause control.
- Browser checks at 584 × 1514 confirmed the orange hero, 0 menu buttons, hidden feature labels, hidden Route Sticker control, exact privacy copy, and 0 px horizontal overflow.
- Captures: `design-audit/37-ko-orange-hero-top.png` and `design-audit/38-ko-orange-hero-overlap.png`.

final result: passed

## Final scroll choreography revalidation — 2026-09-03

- The FacilPay-derived continuous progress model described above remains the latest implementation.
- Final desktop captures: `design-audit/53-final-problem-desktop.png`, `design-audit/54-final-workflow-desktop.png`, and `design-audit/55-final-carousel-desktop.png`.
- Final browser checks: 0 px horizontal overflow, block-layout problem story, full-viewport sticky stages, hidden carousel captions, continuous right-to-left workflow transforms, and no scroll-linked CSS transition delay.
- `node --check assets/home/home.js`: passed.
- `node --test tests/*.test.mjs`: 44/44 passing.

final result: passed

## Mobile centering and gradient refinement — 2026-09-03

- Centered both problem-story messages on mobile; measured headline center is 288.49 px against a 288.5 px viewport center.
- Replaced the Korean workflow title with `AI와 함께 쉬운 편집` and centered the title, description, step number, step title, and step description.
- Unified all three workflow step labels as restrained orange outline pills.
- Kept the first phone screen visible during the workflow introduction so it matches the first `영상 선택` stage.
- Removed the correction section from both Korean and English markup.
- Added restrained orange depth to the `평균 22초` field, a cool near-black spotlight to the workflow stage, and a dark translucent gradient to the mobile glass navigation.
- Browser verification at 577 × 1514 confirmed exact horizontal centering, first-screen opacity 1, zero correction sections, and 0 px horizontal overflow.
- Captures: `design-audit/56-mobile-centered-workflow-gradient.png`, `design-audit/57-mobile-centered-problem-gradient.png`, and `design-audit/58-mobile-centered-workflow-intro-gradient.png`.
- `node --check assets/home/home.js`: passed.
- `node --test tests/*.test.mjs`: 44/44 passing.

final result: passed

## Before/After card transition and 9:16 carousel — 2026-09-03

**Source visual truth**

- Current-request browser annotations at 638 × 1514 CSS px.
- Attached Before/After reference image at 640 × 1268 px, specifically its two labeled portrait frames and horizontal movement model.

**Implementation evidence**

- Local route: `http://127.0.0.1:4173/ko/?refine=compare4#problem-title`.
- Browser viewport: 577 × 1514 CSS px, device scale 1. Width differences were normalized around the viewport center and the shared 9:16 frame ratio.
- Full-view captures: `design-audit/63-mobile-before-card.png`, `design-audit/64-mobile-after-card.png`, and `design-audit/65-mobile-carousel-9x16.png`.
- Focused comparison: the problem rail moves from the centered Before frame to the centered After frame as scroll progress advances from 0 to 1. All four carousel figures compute to 390 × 693 px with `aspect-ratio: 9 / 16` and 0 px horizontal overflow.

**Required fidelity surfaces**

- Fonts and typography: retained the existing Korean display serif and used the reference's bold sans-serif treatment for Before/After labels.
- Spacing and layout rhythm: matched the reference's single centered portrait card per mobile viewport and horizontal movement toward the After position.
- Colors and visual tokens: preserved the existing near-black problem stage and orange completion field.
- Image quality and asset fidelity: derived dedicated 540 × 960 Before and After crops from the approved follow-cam proof asset; no placeholder or synthetic illustration was introduced.
- Copy and content: simplified the section bridge to `더 다양한 기능` exactly as requested.

**Findings**

- No actionable P0, P1, or P2 mismatch remains.
- P3: the available Before source is landscape, so its 9:16 derivative uses a softly blurred full-bleed extension around the uncropped wide view. This preserves the important small-climber context more clearly than an aggressive center crop.

**Comparison history**

- Earlier: the problem stage used a full-screen background/crossfade and the carousel allowed mixed media proportions.
- Fix: replaced the background treatment with a two-frame scroll rail, created dedicated portrait proof crops, and constrained every carousel figure to 9:16.
- Post-fix evidence: captures 63–65 show the Before/After endpoints and the third carousel item; computed checks confirm every carousel frame is 9:16.

**Implementation checklist**

- [x] Before and After frames are separately labeled and horizontally scroll-driven.
- [x] Orange 22-second completion field still follows the comparison.
- [x] Four carousel media frames share a 9:16 ratio.
- [x] Korean section bridge is shortened.
- [x] JavaScript syntax check passed.
- [x] `node --test tests/*.test.mjs`: 44/44 passing.

final result: passed

## Staged question-to-comparison story — 2026-09-03

**Source visual truth**

- User's current choreography brief: a clean solid-color question screen, followed by a Before video with a visible sliver of After, then a scroll-led move to the After video.
- The previously supplied 640 × 1268 Before/After reference remains the spatial reference for labeled portrait frames.

**Implementation evidence**

- Local route: `http://127.0.0.1:4173/ko/?refine=staged6#problem-title`.
- Browser viewport: 577 × 1514 CSS px, device scale 1.
- Full-view captures: `design-audit/66-mobile-question-solid.png`, `design-audit/67-mobile-before-after-peek.png`, and `design-audit/68-mobile-after-result.png`.
- Focused checks: the opening state has question opacity 1 and comparison opacity 0; the Before state exposes 39 px of the After card; the After state reaches 99.55% rail progress before the orange completion fill starts.

**Required fidelity surfaces**

- Fonts and typography: the centered Korean question retains the established display face and has uninterrupted white-on-solid contrast.
- Spacing and layout rhythm: the story now has four distinct phases—question, Before preview, After result, and 22-second completion—with no text/media collision.
- Colors and visual tokens: the opening uses the existing near-black token; the orange completion field is delayed until the After frame has settled.
- Image quality and asset fidelity: both 9:16 frames now use web-playable 540 × 960 videos derived from the approved follow-cam proof, with matching poster frames.
- Copy and content: all existing Korean question and result copy remains unchanged.

**Findings**

- No actionable P0, P1, or P2 mismatch remains.
- The 39 px After preview is intentionally small enough to preserve Before as the primary focus while clearly signaling another card to the right.

**Comparison history**

- Earlier: the question appeared directly over the Before thumbnail, reducing legibility; the After card was almost entirely outside the viewport.
- Fix: delayed comparison visibility until the question exits, separated the scroll timings, and reduced the mobile card slot to expose the next frame.
- Post-fix evidence: captures 66–68 show the three requested story states, both videos play only while the comparison is active, and horizontal overflow remains 0 px.

**Implementation checklist**

- [x] Question appears alone on a solid background.
- [x] Before video enters only after the question disappears.
- [x] After video is visibly previewed beside Before.
- [x] Scrolling centers the After video before completion begins.
- [x] Videos pause outside the comparison phase and respect reduced motion.
- [x] `node --check assets/home/home.js`: passed.
- [x] `node --test tests/*.test.mjs`: 44/44 passing.

final result: passed
