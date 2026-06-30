# climbwork 제품 맥락 (Product Context)

> 작성일: 2026-06-24
> 목적: 백로그/아이디어 정리를 위한 **제품 관점 요약**. 기술 세부는 `DESIGN.md`, `STATUS.md`, `CODEMAP.md` 참조.
> 이 문서는 "지금 우리가 무엇을 만들었고, 무엇을 할 수 있고, 어디까지 와 있는지"를 한눈에 보기 위한 기획용 컨텍스트다.

---

## 1. 한 줄 정의

**climbwork**는 클라이밍 영상을 **신경망 1회 추론으로 분석해, 한 번의 결과를 3가지 독립적 용도(① 자동 추적 크롭, ② 동작 분할, ③ 하이라이트 감지)로 재사용**하는 결정론적 영상 분석 플랫폼이다. (iOS 우선, C++ 코어로 크로스플랫폼 대비)

---

## 2. 핵심 가치 제안

- **효율**: 1-pass neural inference. 한 번 추론한 골격/추적 결과를 세 경로가 공유 → 중복 연산 없음.
- **결정론**: C++ POD를 canonical로 두고 Swift/Python이 동일 결과(golden parity). 플랫폼 간 일관된 출력 보장.
- **온디바이스**: iOS 내장 Vision(기본) 기반, 클라우드 의존 없이 기기에서 분석.

---

## 3. 제품이 하는 일 (3-Function API)

현재 공개 API는 3개 함수로 **고정(frozen)**되어 있다:

| 함수 | 입력 → 출력 | 사용자 가치 |
|---|---|---|
| **`extractFramePose`** | 영상 → `[FramePose]` (sparse 골격) | 분석의 토대. 프레임별 클라이머 추적 + 자세 추정 |
| **`crop`** | framePoses + 원본 → 크롭 영상 | **자동 추적 크롭 영상** 생성 (클라이머 따라가며 잘라줌) |
| **`slice`** | framePoses → `[CutMetadata]` | **동작 단위 분할** + **하이라이트 구간** 메타데이터 |

→ 즉 사용자 관점 기능: **(a) 클라이머만 따라가는 크롭 영상 자동 생성**, **(b) 무브별 자동 분할**, **(c) 명장면 자동 하이라이트**.

---

## 4. 구현된 기능 (SHIPPED & VERIFIED)

| 단계 | 기능 | 상태 |
|---|---|---|
| Detection | NanoDet ONNX (416px, scene-adaptive) | ✅ |
| Motion | Background subtraction (running average 기본) | ✅ |
| Pose | Apple Vision(17 COCO, 기본) / MediaPipe BlazePose(33, 옵션) | ✅ |
| Tracking | Main-climber 선택 + warm-up backfill | ✅ |
| Crop | Tracked crop 렌더 (parallel vImage, 2.4–2.6× 가속, 색/오디오 보존) | ✅ |
| Move-seg | Hand-arrival 기반 동작 분할 (+ kinematic fallback) | ✅ |
| Highlight | Stillness + kinematic 기반 하이라이트 감지, top-N 랭킹 | ✅ |
| Demo | 라이브 오버레이, 추적 크롭 미리보기, 하이라이트 타임라인, 백엔드/프리셋 벤치마크 | ✅ |

---

## 5. 컴포넌트 지도

| 모듈 | 역할 |
|---|---|
| `cpp/climbcore/` | **C++ canonical 알고리즘** (numerics, motion, selection, move-seg, highlight) — 진실의 원천 |
| `ClimbPipeKit/` | Swift/iOS SwiftPM 라이브러리 — 3함수 파사드 + C++ 브리지 |
| `ClimbPipeDemo/` | iOS 데모 앱 (검증/벤치마크 UI) |
| `cliff_ios/` | 외부 소비 앱 (별도 범위, 통합 대기) |
| `climbpipe/` | Python 참고 구현 (알고리즘 검증, golden fixture 생성, 시각화) |
| `contracts/` | 다국어 동등성 검증용 golden JSON |
| `docs/` | 설계/상태/맵 문서 |

---

## 6. 기술 스택

- **코어**: C++17 (POD 계약), ONNX Runtime
- **iOS**: Swift 6.3 / Xcode 16+ / SwiftPM, AVFoundation, Vision, Accelerate(vImage), 옵션 MediaPipe
- **참고**: Python 3.12 (numpy/opencv/onnxruntime)

---

## 7. 현재 상태 (2026-06-24)

**단계: MVP 통합 완료 → 제품 정책 고정 + 출시 준비**

- ✅ 3함수 API / 데이터 계약 frozen
- ✅ C++ 코어 알고리즘 완성, Swift 브리지 검증, cross-language parity OK
- ✅ iOS 데모 앱 동작, 성능 최적화(parallel crop) 완료
- ⚠️ 실제 기기 벤치마크 숫자 대기 (시뮬레이터 smoke만 검증됨)
- ⚠️ `cliff_ios` 실제 앱 통합 대기 (별도 범위)
- ❌ Android(Kotlin) 미러 / strict concurrency 마이그레이션 — deferred

---

## 8. 변경 시 준수할 고정 계약 (기획 시 제약 조건)

1. **3함수 API 시그니처 변경 금지**
2. **C++ POD가 canonical** — Swift는 얇은 미러만, 알고리즘 fork 금지
3. **Sparse FramePose 의미 유지** (frame_idx + t_ms 키)
4. **Golden parity 유지** (C++↔Swift↔Python 동일 결과)

> 기획/백로그에서 새 기능을 구상할 때, 위 계약을 깨는 방향(예: API 시그니처를 바꿔야 하는 기능)은 비용이 크다는 점을 ICE의 Effort에 반영할 것.

---

## 9. 비즈니스 모델 (BM) 방향 — 탐색 (나중에 결정)

> 사용자 메모(2026-06-26) 기반. **유저 사용 데이터를 먼저 모은 뒤** 구체화한다.

- **방향**: 횟수 제한보다 **기능 영역 게이팅**을 지향.
- **현재 구현 기능**은 확산(바이럴)에 유리한 쪽. **나중에 구현할 비즈니스 유리 기능**을 프리미엄으로 두는 그림 — 각각 개별 티켓: 백그라운드 처리[IDEA-057]·병렬 처리[IDEA-058]·고화질[IDEA-021]. 게이팅/과금 메커니즘은 [IDEA-056].
- **광고 실험**([IDEA-053], 보류): 유저의 광고 마찰 내성을 검증하려는 것이나 — ① 기능 활용도(engagement) 확인이 선행, ② 마찰 내성 데이터가 향후 다른 BM엔 전이 안 될 수 있음, ③ 지금은 광고 마찰이 확산을 해칠 수 있어 **보류**. 유저 데이터 먼저 수집.
- **사용량 모델 예시(검토안)**: 주 3회 무료 → 리워드 광고로 즉시 충전 → 결제 시 무제한. 사용량 복귀 시 알림 → [IDEA-056].
- **가격 등급(검토안, Jira CRUXCUT-118)**: 프로/프리미엄 **3단계**(미끼 상품으로 중간 등급 유도 = '합리적 선택의 착각'). 연간/월간/크레딧 분리 — **크레딧을 미끼**로.
- **광고·패키징(Jira CRUXCUT-95)**: 네이티브/배너 광고는 디자인을 해침 → **리워드 광고만**, "실시간 처리·무제한 생성" 워딩. 가격을 '신발 대여료·이용료'처럼 포장. 당장 가능 lever(컷 공유·메모 개수 제한, 게임) vs 나중(VSR 고해상도[IDEA-021]·색필터[IDEA-049]·워터마크 제거[IDEA-062]·서버/클라 백그라운드[IDEA-057]·여러 영상 배치[IDEA-058]). 경쟁사: 캡컷·스트라바·크림프드·카야.
- **결론**: 유저 사용 데이터 먼저 수집 후 재검토. (위 항목들은 확정 아님)

---

## 10. GTM·운영 방향 (탐색)

> 사용자 메모(2026-06-26). 실행 항목은 백로그 '🚀 GTM·운영' 카테고리 티켓으로.

- **홍보 채널**: 인스타·쓰레드·레딧 — 다양한 국가에서 유입. **GSO(생성형 검색 최적화)**에도 유리(예: "클라이밍 실력 올리는 앱 추천" 질문의 답변으로 노출되도록).
- **콘텐츠 앵글**: "내가 필요해서 만들었다"(진정성), "3달간 실력 향상 비법"(실용) 등.
- **실행 인프라(티켓)**: A/B 테스트[IDEA-059] · RevenueCat[IDEA-060] · CS 채널[IDEA-061].
- **North Star Metric (확정)**: **주간 가치행동 활성 유저 수(WVAU)** = 한 주에 「영상 1개+ 처리 **+** (복기[메모 작성/하이라이트·컷 시청] **또는** 공유[내보내기/SNS]) 1회+」를 한 유저 수.
  - 이유: 리텐션 우선 + "처리만 하고 끝"이 아닌 **가치 실현**까지 포함 + 게이밍 방어.
- **보조 지표**: ① W3 리텐션(습관 형성) ② 유저당 주간 처리 영상 수(몰입 깊이) ③ 공유율=처리 유저 중 공유 비율(바이럴·공유러) ④ (차순위 목표) 결제 전환율.
- **계측**: 이벤트 계측은 **Amplitude로 이미 가능** — 처리·복기·공유 이벤트만 정의·연결하면 WVAU 측정 가능. (A/B 실험[IDEA-059]은 별개 도구)
