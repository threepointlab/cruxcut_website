# 기획노트 인제스트 설계 (Planning-Note Ingest)

> 작성일: 2026-07-02
> 레포: `tplab-backlog`
> 소스: `기획노트_클라이밍앱_완전판.html` (Google Sheets 기반 — 고객정의·문제+solution(ICE)·문제·바이럴 전략·맥 시트)
> 상태: 설계 확정 (backlog.json 반영 전 단계)

---

## 1. 목적

기획노트 HTML의 기능/아이디어를 기존 백로그(IDEA 70개 · 스토리 32개)와 대조해, **신규 후보 20개를 티켓화**하고 **기존 티켓 1개를 보강**한다. 애매·추상적이던 항목은 사용자 확인을 거쳐 범위·형태를 확정했다(이 문서 §7 결정 로그).

**범위**: `data/backlog.json`에 신규 IDEA-076~095 추가 + IDEA-014 수정. 반영 후 `build.py`로 리빌드. 유저스토리·ICE는 **초안(추정)**이며, 사용자 검토 후 확정.

**출처 규칙**: 모든 신규 티켓의 `source[]`에 `planning-note` 를 넣는다(값: `"planning-note"`). IDEA-014는 기존 `source[]`에 `planning-note` 를 누적.

---

## 2. 제품 맥락 (Impact·Ease 판단 근거)

대상 제품은 **climbwork / cliff_ios** (클라이밍 영상 분석, iOS 우선). 3함수 API(extractFramePose/crop/slice), 온디바이스 Vision 기반, C++ canonical. 페르소나 P1=공유러(SNS·콘텐츠), P2=성장러(기록·복기·습관). 비즈 우선순위: 리텐션 > 결제. 상세는 `PRODUCT_CONTEXT.md`.

**ICE 규약**: 각 1~10. `iceScore(feature) = max(personaImpact) × confidence × ease`. 기획노트에 ICE가 있던 항목은 원 점수를 최대한 보존(max(P1,P2)=기획노트 Impact), 없던 항목은 추정. **모든 점수는 초안이며 사용자가 조정 가능**.

---

## 3. 스코프 요약

| 구분 | 건수 | 항목 |
|---|---|---|
| 신규 티켓(활성) | 13 | 076·077·078·080·081·082·085·087·088·089·090·091·094 |
| 신규 티켓(deferred) | 6 | 079·083·084·086·092·095 |
| 신규 티켓(foundational) | 1 | 093 |
| 기존 티켓 수정 | 1 | IDEA-014 (H 흡수) |
| 제외 | 6 | 센터 밀도·이용동의서 QR·센터통계 B2C/B2B·멀티체육인·장비중고거래·커플서비스 |

번호는 기존 최대 IDEA-075 다음인 **IDEA-076부터** 순차 부여.

---

## 4. 신규 티켓 상세 (유저스토리·ICE 초안)

> 각 티켓 공통: `type: "feature"`, `source: ["planning-note"]`, `userPriority: 0`(기획노트엔 `!` 표기 없음 — ICE가 우선순위 신호). ICE는 초안.

### IDEA-076 · 썸네일 자동추출 + 자동편집 [A]
- category `new` / theme `editing` / status **todo(활성)** / goalFit `retention`
- **유저스토리** — as: 공유러 / want: SNS 업로드용 썸네일을, 스켈레톤이 가장 역동적인 구간에서 자동으로 3개 뽑아 그중 하나를 고르고 문구까지 얹을 수 있다 / soThat: 썸네일 정하는 데 5분 쓰던 걸 5초로 줄이고 반응 좋은 표지를 얻는다
- **problem**: SNS 업로드 시 썸네일이 중요한데 좋은 프레임을 직접 찾고 정하기 귀찮음
- **children**: ① 역동적 구간 기반 후보 3개 추출(고르기 UX) ② 썸네일 자동편집(문구·간단 효과)
- ICE: personaImpact {P1:6, P2:2}, confidence 5, ease 8 → **240** (기획노트 원점수 보존)
- implementation: reuse=slice/highlight(역동 구간), pose 스켈레톤 · new=후보 3개 추출·선택 UI, 썸네일 문구 편집 · synergy=하이라이트(IDEA-033), 색필터(IDEA-049)

### IDEA-077 · 초상권 보호 블러 [B]
- category `new` / theme `editing` / status **todo(활성)** / goalFit `retention`
- **유저스토리** — as: 공유러 / want: 영상 속 다른 사람(또는 나) 얼굴이 자동 인식돼 블러 처리된다 / soThat: 타인·본인 초상권 걱정 없이 마음 편히 업로드한다
- **problem**: 영상에 다른 사람 얼굴이 찍히거나(내가 남 영상에 찍히거나), 내 얼굴 노출이 부끄러워 업로드를 망설임. 레딧에도 공감대 있음. 서비스 평판에도 이점
- ICE: personaImpact {P1:3, P2:3}, confidence 7, ease 9 → **189** (기획노트 원점수 보존)
- **note**: 고난이도 **인페인팅(얼굴 지우고 배경 복원)**은 Easiness가 매우 낮아(원 ICE 21) 이 티켓의 **미래 확장 note**로만 둠 — 별도 티켓 아님
- implementation: reuse=온디바이스 Vision(얼굴 감지) · new=얼굴 트래킹 기반 블러 렌더

### IDEA-078 · 게이미피케이션 메타티켓 (캐릭터·뱃지·갓챠) [C]
- category `new` / theme `habit` / status **todo(활성)** / goalFit `retention`
- **유저스토리** — as: 성장러 / want: 등반 활동(오른 높이·잡은 홀드 수·푼 문제 수)이 캐릭터 성장·뱃지·마일리지·랭킹으로 쌓이고, 출석보상·이벤트·랜덤뽑기(갓챠)로 재미가 붙는다 / soThat: 꾸준히 오게 되는 습관 훅이 생긴다
- **problem**: 등반 기록이 성취감·재미로 환원되지 않아 리텐션 훅이 약함
- **children**: ① 캐릭터/아바타 성장(굿즈 연계 가능) ② 마일리지·뱃지·업적 ③ 출석·이벤트·리워드(랜덤뽑기 갓챠, 업적→할인쿠폰)
- ICE: personaImpact {P1:5, P2:7}, confidence 6, ease 4 → **168** (기획노트 원점수 보존)
- implementation: **synergy(기존 티켓 파괴 없이 연결)**=IDEA-020(streaks)·IDEA-023(잔디 위젯)·IDEA-026(랭킹)을 이 상위 테마의 하위 use case로 **우산화만** 함(병합·삭제 없음). new=캐릭터 성장 시스템·갓챠·보상 루프
- **notes**: 기존 020/023/026은 그대로 유지하고 relatedIds/synergy로 연결. 굿즈(쵸크백·티셔츠)는 수익화 곁가지 note

### IDEA-079 · 클라이밍 게임 (홀드 배틀 미니게임 + 벽 프로젝션) [D]
- category `new` / theme `effect` / status **todo** / goalFit `retention`
- **deferred**: "실현 난이도가 큼(미니게임=실시간 홀드 인식·경쟁 로직, 벽 프로젝션=AR/프로젝션 하드웨어). 핵심 영상 파이프라인·리텐션 훅이 자리잡은 뒤 탐색. 지금은 우선순위 밖."
- **유저스토리** — as: 공유러 / want: 특정 문제의 홀드를 하나씩 없애가며 친구와 경쟁하거나(발로 터치한 홀드만 사용), 벽 배경에 마리오식 프로젝션을 얹어 논다 / soThat: 등반이 놀이가 되어 바이럴·재방문이 생긴다
- **problem**: 등반에 게임적 재미 레이어가 없어 라이트 유저 유입·확산이 약함
- **children**: ① 홀드 배틀 미니게임(홀드 제거·발 터치 룰) ② 벽 배경 프로젝션(마리오 컨셉)
- ICE: personaImpact {P1:6, P2:3}, confidence 4, ease 5 → **120** (기획노트: 미니게임 160 / 벽 105 절충)

### IDEA-080 · 촬영 중 배터리 최적화 [E]
- category `cliff_ios` / theme `perf` / status **todo(활성)** / goalFit `retention`
- **유저스토리** — as: 클라이머 / want: 긴 세션 동안 삼각대로 계속 녹화해도 화면 밝기 자동 저감 등으로 배터리 소모가 크게 준다 / soThat: 보조배터리 없이도 한 세션을 다 촬영한다
- **problem**: 영상 촬영 배터리 소모가 커서 지인들이 보조배터리에 의존. "이것만으로 수요"가 있을 수 있음
- ICE: personaImpact {P1:3, P2:3}, confidence 7, ease 5 → **105** (기획노트 원점수 보존)
- implementation: reuse=녹화 파이프라인 · new=녹화 중 화면 밝기·자원 최적화, 동작 피드백(플래시/소리)
- **synergy**: 자동 녹화(IDEA-001)와 함께 쓰이면 효과 큼

### IDEA-081 · 등반 결과·문제 자동분류 [F]
- category `new` / theme `logging` / status **todo(활성)** / goalFit `retention`
- **유저스토리** — as: 성장러 / want: 등반이 끝나면 성공/실패가 자동 판정되고, 어떤 문제를 풀었는지도 자동 분류돼 기록된다 / soThat: 실패 영상 일일이 확인·삭제하거나 문제를 수동 분류하는 번거로움이 사라진다
- **problem**: 실패 영상이 많은데 일일이 확인/삭제가 번거롭고, 어떤 문제를 풀었는지 수동 분류(오클고식)가 귀찮아 기록이 안 쌓임
- **children**: ① 성공/실패 자동 판정(스타트→탑홀드 도달 기반) ② 문제 자동 분류(문제 식별자 연계) ③ 수동 보정(사용자 확인)
- ICE: personaImpact {P1:2, P2:6}, confidence 5, ease 5 → **150** (기획노트: 수동 40·자동 16 — 스타트/탑홀드 선택 기반이면 ease 상승)
- implementation: reuse=IDEA-001 스타트/탑홀드 선택·판정 · depends=IDEA-093(문제 DB·식별자) · new=결과 자동판정·문제 매칭

### IDEA-082 · AI 자세 피드백 (모범베타 비교 MVP → 음성 실시간 코칭) [G]
- category `new` / theme `correction` / status **todo(활성)** / goalFit `both`
- **유저스토리** — as: 초보 성장러 / want: 내 스켈레톤을 모범 베타와 비교해 차이 나는 지점을 짚어주고(MVP), 나아가 이어폰(에어팟)으로 등반 중 음성 코칭까지 받는다 / soThat: 전문가에게 매번 묻지 않아도 뭘 고쳐야 할지 스스로 안다
- **problem**: 초보자가 알아야 할 게 많고, 실패 원인을 전문가에게 물어보기 어려움
- **children**: ① 모범 베타/정답 자세와 비교해 차이 지점 표시(MVP) ② LLM 자세 문제점 텍스트 설명 ③ 이어폰 음성 실시간 코칭(비전 — Ease 낮음, note)
- ICE: personaImpact {P1:3, P2:7}, confidence 4, ease 2 → **56** (기획노트 원점수 보존)
- implementation: reuse=IDEA-068(스플릿 비교 뷰)·IDEA-070(스켈레톤 유사도 엔진) · new=비교 판정·차이 설명 · **프리미엄 후보**(both)

### IDEA-083 · 부상예방 경고 [I]
- category `new` / theme `analytics` / status **todo** / goalFit `retention`
- **deferred**: "과부하 경고·재활 가이드는 수행능력·운동 빈도/강도 데이터가 충분히 쌓여야 신뢰도가 나옴. 유저 운동기록(IDEA-003) 데이터 축적이 선행. 지금은 방향만."
- **유저스토리** — as: 성장러 / want: 최근 운동 빈도·강도와 수행능력을 바탕으로 과부하를 사전에 경고받고, 부상 시 재활 가이드를 받는다 / soThat: 부상 위험이 높은 스포츠에서 몸을 지키며 오래 등반한다
- **problem**: 클라이밍은 부상 위험이 상대적으로 높은데 과부하를 사전 경고해주는 툴이 없음
- ICE: personaImpact {P1:2, P2:7}, confidence 5, ease 3 → **105** (추정)
- implementation: depends=IDEA-003(운동기록) · new=부하 계산·경고 로직, 재활 가이드 콘텐츠

### IDEA-084 · LLM 감성 스냅샷 생성 [J]
- category `new` / theme `content` / status **todo** / goalFit `retention`
- **deferred**: "감성사진 생성 품질·비용(LLM 이미지) 검증 필요. 핵심 영상 파이프라인 우선. 제작자↔이용자 수익화 마켓은 이 티켓 범위 밖(방향 note)."
- **유저스토리** — as: 공유러 / want: 내 등반 프레임을 LLM으로 고퀄 감성 사진으로 변환한다 / soThat: 비싼 사진사 없이도 인스타에 올릴 감성 스냅샷을 싸게 얻는다
- **problem**: 스냅샷 한 번 찍는 비용이 큰데, 고퀄 감성 사진 수요는 높음
- ICE: personaImpact {P1:7, P2:2}, confidence 4, ease 5 → **140** (추정)
- **note**: 원하는 감성을 잘 만드는 제작자↔이용자를 연결하는 수익화 플랫폼은 향후 방향(별도 검토)

### IDEA-085 · 센터맵 (이동수단별 소요시간 순) [K]
- category `new` / theme `platform` / status **todo(활성)** / goalFit `retention`
- **유저스토리** — as: 클라이머 / want: 현 위치에서 이동수단(차·대중교통·자전거)을 고르면 등록된 센터들이 소요시간이 짧은 순으로 보인다 / soThat: 초보는 어디 갈지, 중급자는 그날 일정에 맞는 가까운 센터를 쉽게 정한다
- **problem**: 초보자는 가까운/좋은 센터를 모르고, 중급자는 일정에 맞춰 가까운 센터를 찾고 싶음
- ICE: personaImpact {P1:4, P2:6}, confidence 6, ease 5 → **180** (추정)
- implementation: new=센터 위치 DB, 이동수단별 소요시간 정렬(단순 거리 필터로 시작 가능)

### IDEA-086 · 베타 공유 플랫폼 [M]
- category `new` / theme `social` / status **todo** / goalFit `retention`
- **deferred**: "문제 식별자·수집 인프라(IDEA-093)가 선행해야 베타를 문제 단위로 모을 수 있음. 그 뒤 탐색."
- **유저스토리** — as: 성장러 / want: 원하는 문제의 베타(공략) 영상을 문제 단위로 모아본다 / soThat: 흩어진 베타를 일일이 찾지 않고 한 곳에서 참고한다
- **problem**: 원하는 문제의 베타를 찾기가 어렵고 까다로움(KAYA 참고)
- ICE: personaImpact {P1:5, P2:7}, confidence 5, ease 3 → **105** (추정)
- implementation: depends=IDEA-093(문제 DB) · new=문제별 베타 수집·탐색 UI

### IDEA-087 · 암벽화 종류·사이즈 추천 엔진 [N]
- category `new` / theme `recommend` / status **todo(활성)** / goalFit `monetization`
- **유저스토리** — as: 클라이머 / want: 발 사진 AI 측정(족형·길이·너비)·선호 스타일·과거 신발 이력으로 최적 암벽화와 사이즈를 추천받는다 / soThat: 옵션이 너무 많고 브랜드마다 사이즈 기준이 달라 온라인 구매가 어렵던 문제를 푼다
- **problem**: 센터 대여화 품질이 낮고, 새로 사려니 옵션이 많으며, 브랜드 간 실착 기준이 달라 온라인 구매가 어려움
- ICE: personaImpact {P1:3, P2:6}, confidence 5, ease 4 → **120** (추정)
- implementation: new=발 사진 족형 분석, 커뮤니티(레딧·디시) 실측 크롤링, 공홈·리뷰 대조 · **커머스 제휴 수익화 후보**(monetization)

### IDEA-088 · 스트레칭·웜업 가이드 [O-1]
- category `new` / theme `content` / status **todo(활성)** / goalFit `retention`
- **유저스토리** — as: 클라이머 / want: 클라이밍에 특화된 스트레칭·웜업 루틴을 가이드받는다 / soThat: 부상 없이 준비하고 퍼포먼스를 높인다
- **problem**: 클라이밍 특화 스트레칭이 필요한데 정리된 가이드가 없음(GOWOD 앱 참고)
- ICE: personaImpact {P1:2, P2:6}, confidence 6, ease 6 → **216** (추정)
- implementation: new=클라이밍 특화 스트레칭/웜업 콘텐츠·가이드

### IDEA-089 · 영양 가이드 [O-2]
- category `new` / theme `content` / status **todo(활성)** / goalFit `retention`
- **유저스토리** — as: 클라이머 / want: 클라이밍 세션 정보에 맞춘 영양 정보를 안내받는다 / soThat: 체중에 민감하지만 영양 지식이 부족한 상태를 개선한다
- **problem**: 클라이머들이 영양을 잘 모르면서 체중에 민감함
- ICE: personaImpact {P1:2, P2:6}, confidence 5, ease 5 → **150** (추정)
- implementation: new=영양 가이드 콘텐츠(세션 정보 연계), 커뮤니티 실측 정보 참고

### IDEA-090 · 입문→성장 커리큘럼 [P]
- category `new` / theme `onboarding` / status **todo(활성)** / goalFit `retention`
- **유저스토리** — as: 입문자 / want: 입문 초반부터 단계별 훈련법과 추천 문제를 커리큘럼으로 안내받는다 / soThat: 뭘 해야 할지 막막하지 않고, 비싼 체험강습(≈1만원) 없이도 시작한다
- **problem**: 입문자는 초반에 뭘 해야 할지 막막하고, 첫 체험강습이 비쌈
- ICE: personaImpact {P1:2, P2:7}, confidence 6, ease 5 → **210** (추정)
- implementation: reuse/synergy=IDEA-022(맞춤 훈련추천)·IDEA-054(온보딩) · new=단계별 커리큘럼·추천 문제·입문자 안내

### IDEA-091 · 보드 대통합 (+스프레이월) [Q-1]
- category `new` / theme `platform` / status **todo(활성)** / goalFit `retention`
- **유저스토리** — as: 성장러 / want: 분산된 보드 클라이밍(문/킬터/텐션)과 스프레이월을 한 플랫폼에서 모아 관리한다 / soThat: 여러 앱을 오가지 않고 보드 훈련을 한 곳에서 기록·활용한다
- **problem**: 보드 클라이밍(문/킬터/텐션)이 분산돼 있어 통합 관리가 안 됨
- ICE: personaImpact {P1:3, P2:7}, confidence 4, ease 3 → **84** (추정)
- **법적 리스크 정리(티켓 내 필수 기재)**:
  - **상표·브랜드권**: "Moonboard/Kilter/Tension"은 등록 상표. 명칭·로고 노출 시 상표권 이슈
  - **저작권**: 각 보드사의 문제(비트맵)·앱 데이터/이미지는 저작물일 수 있어 무단 수집·재배포 시 침해 소지
  - **API/약관**: 공식 API가 없으면 크롤링·리버스 엔지니어링이 각 앱 이용약관 위반일 수 있음(계약 위반)
  - **완화책**: 공식 제휴·API 협의 우선, 사용자 자기 데이터 입력 기반으로 시작, 상표는 명목적 사용(호환 표기)에 한정
- implementation: new=보드별 데이터 통합·기록. 스프레이월은 하위 확장(note)

### IDEA-092 · 콜드스타트 (인스타 해시태그→기록 자동생성) [R]
- category `new` / theme `activation` / status **todo** / goalFit `retention`
- **deferred**: "인스타 게시물 크롤링·해시태그 파싱 등 외부 연동 부담과 약관 이슈. 온보딩(IDEA-054)이 자리잡은 뒤 검토."
- **유저스토리** — as: 신규 유저 / want: 내 인스타 게시물의 해시태그를 읽어 문제 풀이 기록이 자동 생성된다 / soThat: 초기에 일일이 입력하지 않아도 기록이 채워져 콜드스타트를 넘는다
- **problem**: 초기 업로드가 귀찮아 기록이 비어 있음
- ICE: personaImpact {P1:6, P2:6}, confidence 5, ease 4 → **120** (추정)
- implementation: new=인스타 해시태그 파싱→기록 매핑

### IDEA-093 · 문제 DB·식별자 (GPS+색+세팅날짜) [S]
- category `new` / theme `logging` / status **todo(활성)** / goalFit `foundational`
- **유저스토리** — as: 성장러 / want: 각 문제가 센터 GPS·문제 색·세팅 날짜로 식별자를 갖는다 / soThat: 문제 단위로 기록·통계·추천·베타 공유가 가능해진다
- **problem**: 문제를 식별할 표준 식별자가 없어 문제 단위 기능들이 성립하지 못함
- ICE: personaImpact {P1:4, P2:7}, confidence 6, ease 4 → **168** (추정)
- **foundational**: 여러 기능의 기반 — IDEA-081(문제 자동분류)·IDEA-086(베타 공유)·문제 통계/추천(IDEA-022)이 이 식별자에 의존
- implementation: new=문제 식별자 스키마(GPS+색+세팅날짜), 문제 등록/조회

### IDEA-094 · CMTI 클라이머 MBTI 바이럴 [T]
- category `gtm` / theme `growth` / status **todo(활성)** / (goalFit 생략 — gtm)
- **유저스토리** — as: 잠재 유저 / want: 클라이머 유형 테스트(CMTI)를 재미로 하고 결과·유형 캐릭터를 공유한다 / soThat: 테스트로 유입·바이럴이 생기고 유저 정보가 수집된다
- **problem**: 앱 인지·유입을 위한 가벼운 바이럴 훅이 필요
- ICE: personaImpact {P1:7, P2:4}, confidence 6, ease 7 → **294** (추정)
- implementation: reuse=기존 웹 `mbti4climber.vercel.app` · new=앱/마케팅 통합(유형→캐릭터 굿즈·유저 정보 수집 연계, 앱 링크)
- **note**: 별도 웹이 이미 존재 — 백로그 티켓은 "앱·마케팅으로 흡수/연계" 관점

### IDEA-095 · 영상기반 원격 코칭 마켓 [V]
- category `new` / theme `monetization` / status **todo** / goalFit `monetization`
- **deferred**: "코치↔유저 P2P 마켓은 별도 사업 성격(공급·수요·정산). 핵심 제품·유저 데이터가 자리잡은 뒤 biz 탐색. 지금은 방향만."
- **유저스토리** — as: 성장러 / want: 내 등반 영상을 올려 코치에게 원격으로 피드백·코칭을 받는다 / soThat: 오프라인 강습 없이도 전문가 코칭에 접근한다
- **problem**: 실패 원인·개선점을 전문가에게 묻기 어렵고, 오프라인 코칭은 접근성이 낮음
- ICE: personaImpact {P1:3, P2:6}, confidence 4, ease 2 → **48** (추정)
- implementation: new=코치 매칭·영상 피드백·정산(마켓플레이스) · **수익화 축**(monetization)

---

## 5. 기존 티켓 수정

### IDEA-014 · 스트라바식 경로 그림 + 통계 공유 사진 — **강·약점 레이더 흡수 [H]**
- `source[]`에 `planning-note` 추가
- **추가 use case(child)**: "강·약점 레이더 차트 — 그립/스타일/기술을 레이더 차트로 시각화. 클라이밍 실력은 복합 요소로 결정되는데 강/약점을 분석해주는 툴이 없음."
- 근거: 강·약점 분석은 스트라바식 퍼포먼스 시각화의 한 형태이자 훈련 추천(IDEA-022)의 입력. 별도 티켓 대신 IDEA-014에 편입.

---

## 6. 제외 항목 (티켓 미생성 — 사유 기록)

| 항목 | 사유 |
|---|---|
| 센터 밀도 시각화 | 유저 규모가 커져야 성립. 센터 실시간 데이터 의존. 지금은 범위 밖 |
| 센터 이용동의서 QR 자동화 | 센터 제휴·개인정보 처리 의존. 유저 앱 핵심과 멀어 제외 |
| 센터 통계 B2C/B2B 컨설팅 | 별도 사업(B2B). 유저 앱 범위 밖 → PRODUCT_CONTEXT biz 메모로만 |
| 멀티 체육인(건강앱 연동) | 건강앱 동기화·타 운동 파트너십 필요. 핵심과 멀어 제외 |
| 장비 중고거래 커뮤니티 | 핵심 가치제안과 멀고 커뮤니티 규모 의존 |
| 커플 서비스 | 틈새 기능. 지금은 제외 |

> 중복(이미 백로그 반영) 항목은 §7 대조표 참조 — 이번엔 신규에 집중하므로 기존 티켓 출처 누적은 선택 작업으로 남김.

---

## 7. 결정 로그 & 대조표

### 7.1 기획노트↔백로그 대조 (이미 반영된 중복)
- 삼각대 들찍/트래킹 → IDEA-001·013 / 하이라이트·크럭스 → IDEA-033·034 / 영상 구간 나누기·유저 하이라이트 → IDEA-007·move_seg / 녹화 자동 → IDEA-001 / 영상 비교 → IDEA-067·068 / 스트라바·wrapped → IDEA-014·019 / 문제추천 → IDEA-022 / 마일리지·위젯 → IDEA-023 / 색필터 → IDEA-049 / 워터마크 → IDEA-062

### 7.2 사용자 확정 결정 (이 세션)
- **C**: 독립 게이미피케이션 메타티켓(078). 기존 020/023/026 파괴 없이 우산화만
- **D**: 미니게임+벽 프로젝션 한 티켓(079), 전체 deferred
- **F**: 등반 결과·문제 자동분류 한 티켓(081)
- **G**: 비교 MVP + 음성 코칭을 한 티켓(082)의 children. 활성, 음성코칭은 비전 note
- **H**: IDEA-014에 흡수(별도 티켓 X)
- **I**: 독립 티켓(083), deferred
- **J**: 앱 내 감성사진 생성만(084), deferred. 수익화 마켓은 note
- **K**: 센터맵만 독립 티켓(085) 활성. 밀도·QR 제외
- **L**: 제외
- **M**: 독립 티켓(086), deferred
- **N**: 독립 티켓(087) 활성
- **O**: 스트레칭(088)·영양(089) 각각 별도
- **P**: 입문→성장 커리큘럼 한 티켓(090)
- **Q**: 보드 통합 독립 티켓(091) 활성 + 법적 리스크 정리. 멀티체육인 제외
- **R**: 독립 activation 티켓(092), deferred
- **S**: foundational 기반 티켓(093)
- **T**: GTM 바이럴 티켓(094)
- **U**: 중고거래·커플 모두 제외
- **V**: 별도 biz 탐색 티켓(095), deferred

---

## 8. 반영 절차

1. `data/backlog.json` `ideas[]`에 IDEA-076~095 추가(위 필드), IDEA-014 수정, `meta.source`/note에 planning-note 반영
2. (선택) 유저스토리 티켓은 `stories[]`에도 US 항목 추가 — 이번엔 IDEA 우선, 스토리는 후속
3. `python build.py`로 `index.html` 리빌드 → `serve.py`(localhost:8787)로 확인
4. ICE·유저스토리 초안 → 사용자 검토 후 확정

---

## 9. 오픈 이슈 (사용자 확인 필요)
- ICE 점수는 전부 초안(추정). 특히 추정 항목(083·084·085·086·087·088·089·090·091·092·093·094·095)은 확정 전 조정 여지
- 신규 티켓의 `stories[]`(US) 동시 생성 여부(§8-2) — 이번 범위에 포함할지
