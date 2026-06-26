# tplab-backlog — 작업 규칙

## ⚠️ 새 인풋 처리 규칙 (필수)

새 백로그 인풋(메모·스프레드시트·노션·지라 등)이 들어오면 **곧바로 추가하지 말고**, 항목 하나하나에 대해 다음을 사용자에게 **먼저 확인한 뒤** 반영한다:

1. **어떤 티켓으로 어떻게 작성할지** — 제목·type(feature/engineering/bugfix)·category(new/cliff_ios/climbpipekit)·핵심 필드(요지) 제시
2. **기존 티켓과 유사한지** — 유사하면 병합할지 / 별도로 둘지 확인 (병합 시 기존 `source[]`에 출처 누적)
3. **해석이 불확실하면** ⚠️로 표시하고 질문

확인을 받은 뒤에만 `backlog.json`에 반영하고 `build.py`로 리빌드한다. 새 아이디어는 다음 번호부터(IDEA-0xx).

## 스키마 / 도구

- `data/backlog.json` = 단일 소스 → `build.py`로 `index.html` 생성 → `serve.py`(http://localhost:8787)로 편집(완료 표시·수정·삭제).
- 점수: ICE 각 1~10. feature는 `iceScore = max(personaImpact) × confidence × ease`. engineering·bugfix는 Ease 기준.
- 카테고리(접이식): `new` / `cliff_ios` / `climbpipekit` / `gtm`(🚀 GTM·운영).
- 지원: 계층형 `children`(use case), 단계별 `ease`, `evidence`(Confidence 근거·출처), `deferred`(보류 사유 — 상단 콜아웃), `status`(todo/doing/done), `userPriority`(메모 `!` 개수), `goalFit`(retention/monetization/both/foundational).
- 페르소나: P1 공유러(SNS·콘텐츠), P2 성장러(기록·복기·습관). 비즈 우선순위: 리텐션 > 결제 유도.
- 설계 상세: `docs/specs/2026-06-25-backlog-organizer-design.md`.
