# 백로그 통합 정리 설계 (Backlog Organizer)

> 작성일: 2026-06-25
> 레포: `tplab-backlog`
> 상태: 설계 확정 (구현 계획 전 단계)

---

## 1. 목적

흩어진 백로그(기획 스프레드시트, 지라, 메모, 노션)를 **하나의 단일 인터랙티브 HTML 문서**로 모아 중복을 제거하고, 일관된 템플릿으로 정리한다. 사람(플래닝)과 LLM(자동 데이터 수집/파싱) 모두에게 보기 좋은 결과물을 만든다.

**범위**: 일회성 통합 문서. Linear/지라 MCP 연동·자동 수집 파이프라인은 이번 범위에서 제외(향후 확장).

---

## 2. 제품 맥락 (Impact·Ease 판단 근거)

대상 제품은 **climbwork** (클라이밍 영상 분석 플랫폼, iOS 우선). 상세는 `PRODUCT_CONTEXT.md` 참조.

- **타겟 유저**: 클라이밍하는 사람들 — ① SNS에 영상 공유하는 사람, ② 기록으로 실력 늘리려는 사람.
- **JTBD**: 등반 복기 · SNS용 영상 · 루트 기록.
- **현재 비즈니스 목표 (우선순위)**: ① 리텐션(최우선) → ② 결제 유도(차순위).

---

## 3. 산출물

새 레포 `tplab-backlog` 구조:
```
tplab-backlog/
  PRODUCT_CONTEXT.md          # climbwork 제품 맥락 (Ease 재사용성 판단 근거)
  data/                       # 원천 백로그 (메모/스프레드시트/노션/지라 export)
  docs/specs/                 # 설계 문서
  index.html                  # 단일 자기완결 인터랙티브 산출물
```

`index.html`:
- 단일 파일, 외부 의존성 없음(바닐라 JS/CSS).
- 데이터는 파일 안에 `<script type="application/json" id="backlog-data">…</script>`로 내장.
  - → LLM은 이 JSON 블록을 파싱, 사람은 UI로 탐색. "둘 다 보기 좋게" 달성.

---

## 4. 정리 파이프라인 (5단계, 각 단계 사용자 확인)

```
① 원천 수집     원천 데이터를 data/에 받음 (출처 보존)
② 정규화·중복제거 같은 아이디어 병합 → source[]에 출처 누적 → 고유 아이디어 flat list
③ 페르소나 확정  아이디어 + 제품 맥락에서 페르소나 도출/확정
④ 템플릿 채우기  아이디어별 전체 스키마 채움 (ICE 채점 포함)
⑤ HTML 생성     정렬·필터 가능한 단일 index.html 생성
```
verify: 각 단계 산출물을 사용자가 확인한 뒤 다음 단계로 진행.

---

## 5. 페르소나 (strawman, 데이터 보고 확정)

| ID | 페르소나 | 핵심 가치 | 리텐션 훅 |
|---|---|---|---|
| **P1 공유러** | SNS에 등반 클립 올리는 사람 | 빠르고 멋진 하이라이트·크롭 영상 | "올릴 거리"가 계속 생기는가 |
| **P2 성장러** | 기록으로 실력 늘리려는 사람 | 등반 복기, 루트 기록, 진척 추적 | "성장"이 눈에 보이는가 |

데이터 검토 후 3번째 페르소나(입문자/올라운더 등) 추가 여부 결정.

---

## 6. 아이디어 스키마 (내장 JSON, 1건)

백로그는 3가지 `type`이 섞여 있어 **유형별 차등 템플릿**을 쓴다. 모두 한 HTML 안에 두고 `type`으로 구분·필터한다.

### 공통 필드 (모든 type)
```json
{
  "id": "IDEA-001",
  "title": "한 줄 제목",
  "type": "feature | engineering | bugfix",
  "source": ["memo", "spreadsheet", "jira:ABC-12", "notion"],
  "theme": "tracking | crop | highlight | moveseg | export | memo | logging | social | recommend | ...",
  "userPriority": 2,        // 메모의 `!` 개수 (0~4). 사용자 직감 신호. ICE와 별개.
  "ease": 7,                // 1~10, 복합 지표 (모든 type 공통)
  "implementation": {
    "reuse": "기존 climbwork 코드/기능 재사용",
    "new": "새로 필요한 것 (없으면 '-')",
    "synergy": "기존 기능/같은 product와의 align"
  },
  "notes": ""
}
```

### `feature` 추가 필드 (풀 템플릿)
```json
{
  "goalFit": "retention | monetization | both | foundational",
  "userStory": { "as": "클라이머", "want": "...", "soThat": "..." },
  "problem": "이 기능이 없으면 유저가 겪는 문제",
  "alternatives": "지금은 어떻게 우회하는가",
  "personaImpact": { "P1": 8, "P2": 4 },
  "confidence": 6,
  "iceScore": 336           // 파생값 = 종합Impact × confidence × ease
}
```

### `engineering` / `bugfix` 추가 필드 (경량 템플릿)
```json
{
  "enables": "이게 받쳐주는 유저 가치/기능 (예: '하이라이트 품질 → P1 공유러')",
  "rationale": "왜 필요한가 (1줄)"
}
```
- 엔지니어링/버그는 persona-ICE·유저스토리를 **강제하지 않음**. Ease + `enables` + userPriority로 가볍게 정리.

### 계층형 티켓 (children)
한 기능이 **여러 문제 상황**을 해결하면 자식 use case로 계층 구성한다. 부모는 기능/구현/점수(ICE는 구현 단위라 1개)를 갖고, 각 자식은 자기 `userStory`·`problem`·`alternatives`를 가진다.
```json
"children": [
  { "title": "① ...", "userStory": {...}, "problem": "...", "alternatives": "..." },
  { "title": "② ...", "userStory": {...}, "problem": "...", "alternatives": "..." }
]
```
- `children`가 있으면 부모의 단일 `userStory/problem/alternatives`는 생략하고 자식들이 대체.
- 점수(personaImpact/confidence/iceScore)는 기본 **부모 단위**. 예: IDEA-001(출발/완등 인식)이 "등반 구간 자동 컷편집" + "시도별 운동/휴식 트래킹" 2개 use case.
- **단계(스텝)별로 구현 난이도가 다르면 자식에 개별 `ease`를 둔다.** 이때 부모 `ease`/`iceScore`는 **1차(가장 현실적·먼저 만들 스텝)** 기준으로 잡고, 후속 스텝의 낮은 Ease는 자식에 표시. 예: IDEA-013(들찍) 1차 앵글 변환 Ease 8 / 2차 패럴랙스 Ease 2, 부모 ICE는 1차 기준.
- 유저스토리는 As a / I want / so that **3줄 개행** 표시. 자식 `note`로 배경·구현 설명을 덧붙일 수 있다.

### Confidence 근거 (evidence)
Confidence 점수를 뒷받침하는 데이터·관찰을 출처와 함께 남긴다. 카드에 "🔍 Confidence 근거·출처"로 표시되고, 편집 UI에서 `설명 | 출처` 한 줄씩 입력한다.
```json
"evidence": [
  { "point": "Strava·인스타에서 경로 관련 게시물 반응이 더 좋음", "source": "운영자 관찰 — 검증 필요" }
]
```
- `source`가 URL이면 링크로 렌더. 근거가 쌓이면 confidence를 올리는 판단 자료로 사용(예: IDEA-014 7→8).

### 필드 노트
- `source[]`: 중복제거 추적용. 병합 시 출처 누적.
- `theme`: 그룹핑/필터 축.
- `userPriority`: 원본 메모의 `!` 개수(0~4). ICE와 독립된 "사용자 직감" 정렬축.
- `goalFit`(feature): ICE와 **별개**의 전략 정렬 태그. `foundational` = 직접 기여는 약하나 기반.
- `iceScore`(feature): 파생값 = 종합Impact × confidence × ease.

---

## 7. ICE 채점 규칙 (각 1~10)

**종합 ICE = 종합Impact × Confidence × Ease** (범위 1~1000), 내림차순 정렬 기본값.

### Impact (페르소나별, 1~10)
- 각 페르소나에 대해 따로 채점. **리텐션 기여도 중심.**
- 비즈니스 목표 우선순위를 상한에 반영: **리텐션 견인 > 결제 유도 > 기타** 순으로 Impact 상한이 높음.
- **종합 Impact = 페르소나 Impact 중 최댓값.** (특정 페르소나 한 명에게 강력하면 가치 있음) UI에서 특정 페르소나 기준으로 재정렬 가능.

### Confidence (1~10, 기능 단위 공유)
- 이 기능이 정말 필요하고 통할 것이라는 확신.

### Ease (1~10, 기능 단위 공유, **복합 지표**)
- **기본**: 일반 구현 난이도 — 작업량, 복잡도, 리스크.
- **가산**: climbwork 기존 코드 재사용 가능성 (재사용 가능할수록 가점).
- ⚠️ 재사용성은 Ease를 높이는 **한 입력일 뿐 유일한 근거가 아님.** 재사용이 쉬워도 본질적으로 복잡한 작업이면 Ease는 낮을 수 있음.
- 참고 앵커: frozen 3함수 API(extractFramePose/crop/slice) 조합으로 가능 → 재사용 가점 큼 / frozen API 변경·새 ML 모델 필요 → 난이도 급상승.

---

## 8. HTML UI

- **상단 요약**: 총 아이디어 수, type별 개수(feature/engineering/bugfix), 페르소나 칩, 테마별 개수, goalFit별 개수.
- **정렬**: 종합 ICE / 특정 페르소나 Impact / Ease / **userPriority(`!`)**.
- **필터**: **type**, 페르소나, 테마, goalFit, Ease 구간.
- **카드**:
  - 접힘: 제목 + type 배지 + ICE 배지(feature만) + userPriority(`!`) + theme + goalFit 태그.
  - 펼침(feature): 유저스토리, 문제·대안, personaImpact 분해, C/E, implementation(reuse/new/synergy), source, notes.
  - 펼침(engineering/bugfix): enables, rationale, Ease, implementation, source, notes.

---

## 9. 비범위 (YAGNI)

- Linear/지라 MCP 실시간 연동.
- 자동 데이터 수집 파이프라인.
- 다중 사용자 협업/실시간 편집.
- 백엔드/DB (단일 정적 HTML로 충분).
