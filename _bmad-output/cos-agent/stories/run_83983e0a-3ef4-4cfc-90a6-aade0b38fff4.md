# 오늘의 미니 체크인 - Stories v0

## Overview

이 문서는 승인된 brief, PRD, architecture를 기준으로 `오늘의 미니 체크인`의 구현용 epics와 stories를 정의한다. 분해 기준은 `작은 autonomous run 단위`, `한 화면 UX 유지`, `로컬 저장소 복원 안정성`, `모바일 자연스러움`이다.

## Decomposition Principles

- 화면 골격과 각 입력 surface를 먼저 분리하고, 이후 상태 계약과 persistence binding을 따로 분리한다.
- `UI surface 구현`과 `localStorage 정책`을 한 story에 같이 넣지 않는다. 불가피한 통합은 마지막 hydration story로 한정한다.
- 경험 브리프의 `밝고 차분한 대시보드`, `한 화면 노출`, `모바일 자연스러움`, `입력 요소의 명확한 구분`은 UI 관련 story의 acceptance criteria와 validation steps에 직접 반영한다.

## Risks / Decisions Needed

- 기분 3종의 최종 라벨과 아이콘 사용 여부는 아직 제품 확정 사항이 아니다. required story에서는 문자열을 한 상수 모듈로 집중시켜 후속 변경 비용을 제한한다.
- 날짜가 바뀌었을 때 기존 로컬 상태를 유지할지 초기화할지는 아직 미확정이다. required story에서는 same-browser refresh/reopen 복원만 보장하고, cross-date 정책은 `story-3.1`로 분리한다.

## Epic List

- `epic-1` Single-Screen Foundation: 한 화면 체크인 앱의 실행 기반, 날짜 헤더, 입력 surface들을 분리 구현한다.
- `epic-2` Local State and Restore: 중앙 상태 계약, storage adapter, per-surface binding, hydration을 분리 구현한다.
- `epic-3` Deferred Policy Hardening: MVP 필수 범위 밖인 날짜 경계 정책을 별도 story로 보존한다.

## Epic 1: Single-Screen Foundation

한 화면에서 날짜, 기분, 할 일, 메모가 모두 보이는 초경량 대시보드의 골격을 만든다. 이 epic은 화면 구조와 각 입력 surface를 독립 구현 가능한 단위로 나눈다.

### Story 1.1: Vite app shell and responsive dashboard frame
Story Key: story-1.1
Epic Key: epic-1
Required for Success: yes
Depends On: none

### Goal

- 브라우저에서 바로 실행되는 단일 페이지 앱 골격을 만들고, 데스크톱과 모바일에서 모두 무리 없는 대시보드 레이아웃을 확보한다.

### In Scope

- `Vite + TypeScript + plain CSS` 기반 초기 scaffold 구성
- 단일 페이지 앱 엔트리와 semantic HTML 구조 작성
- 날짜, 기분, 할 일, 메모 섹션이 모두 보이는 카드형 dashboard frame 구성
- 밝고 차분한 톤의 CSS 변수, 카드 경계, 입력/버튼 기본 스타일 토큰 정의
- 로컬 실행과 정적 빌드가 가능한 기본 스크립트 및 실행 안내 반영

### Out of Scope

- 실제 날짜 계산 로직
- 기분 선택 상호작용
- 할 일 체크/입력 동작
- 메모 입력 동작
- localStorage 저장/복원

### Acceptance Criteria

- `npm run dev`로 별도 백엔드 없이 앱이 실행된다.
- 첫 렌더에서 날짜, 기분, 할 일, 메모를 위한 네 개의 주요 영역이 같은 페이지 안에 동시에 보인다.
- 데스크톱에서는 정보가 흩어져 보이지 않도록 최대 2열 수준의 카드 배치를 사용하고, 모바일에서는 세로 스택으로 자연스럽게 재배치된다.
- 입력 영역과 버튼형 요소의 기본 경계, 배경, focus 상태가 시각적으로 구분된다.
- 핵심 기능을 위해 라우팅, 모달, 탭, 아코디언이 필수 경로에 들어가지 않는다.

### Validation Steps

1. `npm install`
2. `npm run dev`
3. 브라우저에서 데스크톱 폭과 모바일 폭(예: 390px 전후)으로 열어 네 개 섹션이 한 페이지 흐름 안에 모두 보이는지 확인한다.
4. `npm run build`

### Affected Files or Modules

- `package.json`
- `tsconfig.json`
- `vite.config.ts`
- `index.html`
- `src/main.ts`
- `src/app/createApp.ts`
- `src/styles.css`
- `README.md`

### Deferred Follow-ups

- 최종 카피 문구와 세부 색상 토닝
- PWA, 오프라인 캐시, 배포 자동화

### Story 1.2: Device-local today date header
Story Key: story-1.2
Epic Key: epic-1
Required for Success: yes
Depends On: story-1.1

### Goal

- 사용자가 앱을 열자마자 오늘 날짜를 인지할 수 있도록 상단 헤더에 기기 기준 오늘 날짜를 표시한다.

### In Scope

- 현재 브라우저 환경의 오늘 날짜 계산
- 재사용 가능한 단일 날짜 포맷 유틸리티 작성
- 헤더 영역에 읽기 전용 날짜 표시 연결
- 날짜 영역이 다른 입력 요소보다 먼저 보이도록 시각 위계 반영

### Out of Scope

- 날짜별 기록 히스토리
- 날짜 변경 시 저장 상태 초기화 정책
- 서버 시간 동기화

### Acceptance Criteria

- 첫 화면 상단에서 오늘 날짜가 즉시 보인다.
- 날짜는 서버 시간이 아니라 현재 기기 기준 날짜를 사용한다.
- 날짜 표시는 하나의 공용 formatter/module만 사용해 일관되게 렌더링된다.
- 날짜는 입력 컨트롤에 묻히지 않는 위치와 스타일 위계를 가진다.

### Validation Steps

1. `npm run dev`
2. 브라우저에서 앱 첫 화면을 열어 날짜가 헤더에 즉시 나타나는지 확인한다.
3. 시스템 locale 또는 브라우저 locale 기준으로 날짜 포맷이 한 방식으로 일관되는지 확인한다.
4. `npm run build`

### Affected Files or Modules

- `src/app/createApp.ts`
- `src/features/header/dateDisplay.ts`
- `src/lib/formatDate.ts`
- `src/styles.css`

### Deferred Follow-ups

- 한국어 고정 포맷 vs locale 기반 포맷의 최종 제품 결정
- 날짜 헤더의 보조 카피 여부

### Story 1.3: Three-option mood selector UI
Story Key: story-1.3
Epic Key: epic-1
Required for Success: yes
Depends On: story-1.1

### Goal

- 사용자가 오늘의 기분을 정확히 3가지 선택지 중 하나로 고를 수 있는 명확한 단일 선택 UI를 제공한다.

### In Scope

- 기분 3종을 한 상수 모듈에서 정의
- 세 선택지를 동시에 보여주는 single-select UI 구현
- 선택/비선택 상태 스타일 정의
- 키보드와 터치 조작이 가능한 접근 가능한 마크업 구성

### Out of Scope

- 기분 선택 저장/복원
- 기분 옵션의 최종 제품 카피 승인
- 아이콘, 애니메이션, 통계 기능

### Acceptance Criteria

- 기분 선택지는 정확히 3개이며 첫 화면에서 동시에 보인다.
- 사용자는 한 번에 하나의 기분만 선택할 수 있다.
- 선택 상태는 배경/테두리/텍스트 대비 중 최소 두 가지 이상으로 비선택 상태와 구분된다.
- 기분 라벨과 내부 key는 분리되어 있으며, 라벨 문자열은 단일 상수 모듈에만 정의된다.
- 모바일에서 각 선택지는 탭하기에 무리가 없는 크기와 간격을 가진다.

### Validation Steps

1. `npm run dev`
2. 기분 선택지를 순서대로 클릭하거나 키보드로 이동해 항상 하나만 선택되는지 확인한다.
3. 모바일 폭에서 선택지 간 간격과 selected state가 충분히 구분되는지 확인한다.
4. `npm run build`

### Affected Files or Modules

- `src/features/mood/moodOptions.ts`
- `src/features/mood/moodSelector.ts`
- `src/app/createApp.ts`
- `src/styles.css`

### Deferred Follow-ups

- 최종 기분 라벨 카피 승인
- 아이콘 사용 여부와 감정 표현 강도 조정

### Story 1.4: Fixed three-slot todo entry UI
Story Key: story-1.4
Epic Key: epic-1
Required for Success: yes
Depends On: story-1.1

### Goal

- 사용자가 정확히 3개의 할 일을 입력하고 각 항목을 체크할 수 있는 고정형 입력 surface를 제공한다.

### In Scope

- 항상 보이는 3개의 todo row 렌더링
- 각 row의 checkbox와 text input 기본 상호작용
- row별 독립 입력과 체크 상태 처리
- 모바일에서 체크 영역과 텍스트 영역이 겹치지 않는 레이아웃 조정

### Out of Scope

- todo 추가/삭제/재정렬
- 저장/복원
- 우선순위, 태그, 알림

### Acceptance Criteria

- 할 일 입력 행은 정확히 3개이며 초기 화면에서 모두 보인다.
- 각 행은 checkbox 1개와 text input 1개를 가진다.
- 세 행은 서로 독립적으로 입력/체크/해제가 가능하다.
- 추가, 삭제, 재정렬 기능은 노출되지 않는다.
- 모바일에서도 checkbox 탭과 텍스트 입력 포커스가 서로 방해하지 않도록 간격이 유지된다.

### Validation Steps

1. `npm run dev`
2. 세 개의 할 일 행에 서로 다른 텍스트를 입력하고 각 checkbox를 독립적으로 조작한다.
3. 모바일 폭에서 checkbox를 탭할 때 인접 input이 오작동하지 않는지 확인한다.
4. `npm run build`

### Affected Files or Modules

- `src/features/todos/todoSlots.ts`
- `src/app/createApp.ts`
- `src/styles.css`

### Deferred Follow-ups

- 완료 항목의 추가 시각 처리 수준 조정
- 향후 동적 todo 개수 확장 검토

### Story 1.5: Short memo input surface
Story Key: story-1.5
Epic Key: epic-1
Required for Success: yes
Depends On: story-1.1

### Goal

- 사용자가 한 화면 안에서 짧은 메모를 여러 줄로 기록할 수 있는 독립 입력 영역을 제공한다.

### In Scope

- 기본 `textarea` 기반 메모 입력 영역 구현
- 메모 섹션 라벨과 설명 텍스트 구성
- 할 일 영역과 분리된 카드/섹션 스타일링
- 모바일에서도 작성 시작이 불편하지 않은 기본 높이 보장

### Out of Scope

- 저장/복원
- 리치 텍스트
- 문자 수 제한, 첨부 파일, 자동 요약

### Acceptance Criteria

- 메모 입력은 여러 줄 작성이 가능한 `textarea`로 제공된다.
- 메모 영역은 할 일 영역과 시각적으로 구분되는 독립 섹션으로 보인다.
- 첫 화면에서 메모 영역이 숨겨지지 않고 바로 보인다.
- 모바일에서도 입력 시작이 답답하지 않은 기본 높이와 padding을 가진다.

### Validation Steps

1. `npm run dev`
2. 메모 섹션에서 여러 줄 텍스트를 입력해 줄바꿈과 스크롤 동작을 확인한다.
3. 데스크톱과 모바일 폭에서 메모 카드가 할 일 카드와 구분되는지 확인한다.
4. `npm run build`

### Affected Files or Modules

- `src/features/memo/memoField.ts`
- `src/app/createApp.ts`
- `src/styles.css`

### Deferred Follow-ups

- textarea auto-resize 여부
- 메모 placeholder 카피 미세 조정

## Epic 2: Local State and Restore

이 epic은 UI surface를 하나의 상태 계약으로 묶고, 브라우저 localStorage 기반 autosave와 restore를 모듈별로 분리해 구현한다. `state contract`, `surface binding`, `boot hydration`을 나눠 한 번의 run 범위를 줄인다.

### Story 2.1: Central check-in state contract and storage adapter
Story Key: story-2.1
Epic Key: epic-2
Required for Success: yes
Depends On: story-1.2, story-1.3, story-1.4, story-1.5

### Goal

- 앱 전체가 공유하는 `CheckinState` 계약과 안전한 `localStorage` adapter를 정의해 persistence 리스크를 UI 바깥 경계로 격리한다.

### In Scope

- `schemaVersion`, `localDate`, `mood`, `todos`, `memo`, `updatedAt`를 포함한 상태 타입 정의
- 안전한 기본 상태 factory 작성
- 단일 storage key JSON read/write adapter 구현
- parse 실패, shape mismatch, read/write 실패 fallback 처리
- `resolveInitialState(currentDate, savedState)` 같은 날짜 경계 정책 함수 분리

### Out of Scope

- UI control과 실제 binding
- 최종 cross-date 제품 정책 결정
- 다중 날짜 저장, 히스토리, 클라우드 sync

### Acceptance Criteria

- 앱 저장 payload는 단일 key 하나에 JSON 문자열 하나로 저장된다.
- 저장 데이터가 없거나 손상돼도 앱은 오류를 던지지 않고 안전한 기본 상태로 복귀한다.
- storage adapter는 UI 코드가 직접 `localStorage`를 호출하지 않도록 읽기/쓰기 경계를 캡슐화한다.
- 날짜 비교 로직은 `resolveInitialState` 같은 전용 정책 함수에만 위치한다.
- write 실패가 발생해도 현재 세션의 메모리 상태는 유지되며, 실패는 앱 전체 오류로 번지지 않는다.

### Validation Steps

1. `npm run dev`
2. 브라우저 개발자 도구에서 storage key와 저장 payload shape을 확인한다.
3. storage 값을 손상된 JSON으로 바꾼 뒤 새로고침해도 앱이 기본 상태로 안전하게 뜨는지 확인한다.
4. `npm run build`

### Affected Files or Modules

- `src/state/checkinState.ts`
- `src/state/defaultState.ts`
- `src/state/storageAdapter.ts`
- `src/state/resolveInitialState.ts`
- `src/lib/storageKeys.ts`

### Deferred Follow-ups

- schema migration helper 추가 여부
- private browsing 등 브라우저별 저장 실패 UX 처리 고도화

### Story 2.2: Mood selector binding to central state
Story Key: story-2.2
Epic Key: epic-2
Required for Success: yes
Depends On: story-2.1, story-1.3

### Goal

- 기분 선택 UI가 독자적인 DOM 상태가 아니라 중앙 `CheckinState`를 기준으로 움직이도록 연결한다.

### In Scope

- mood selector에서 선택 이벤트를 중앙 상태 업데이트로 연결
- 중앙 상태 변화가 selector UI에 반영되도록 동기화
- direct `localStorage` 호출 없이 storage adapter를 통한 상태 흐름 사용

### Out of Scope

- todo binding
- memo binding
- 전체 앱 boot hydration 오케스트레이션

### Acceptance Criteria

- 기분 선택 시 중앙 상태의 `mood` 값이 즉시 갱신된다.
- selector는 중앙 상태를 기준으로 현재 선택 상태를 다시 렌더링한다.
- mood selector 모듈은 storage key나 raw JSON parsing 로직을 직접 가지지 않는다.
- 기분 선택 변경은 명시적 저장 버튼 없이 autosave 흐름에 포함될 준비가 되어 있다.

### Validation Steps

1. `npm run dev`
2. 기분 선택을 변경한 뒤 개발자 도구 또는 로그로 중앙 상태의 `mood` 값이 바뀌는지 확인한다.
3. 상태를 프로그램적으로 바꿨을 때 selector UI가 해당 선택 상태를 반영하는지 확인한다.
4. `npm run build`

### Affected Files or Modules

- `src/features/mood/moodSelector.ts`
- `src/state/checkinState.ts`
- `src/app/createApp.ts`

### Deferred Follow-ups

- 키보드 단축 이동 세부 UX
- mood analytics나 히스토리 기능

### Story 2.3: Todo slots binding to central state
Story Key: story-2.3
Epic Key: epic-2
Required for Success: yes
Depends On: story-2.1, story-1.4

### Goal

- 세 개의 todo row가 중앙 상태의 `todos` 배열과 동기화되도록 연결한다.

### In Scope

- todo text input 변경을 중앙 상태 업데이트로 연결
- checkbox 변경을 중앙 상태 업데이트로 연결
- 정확히 3개 slot 구조를 상태 계약과 UI 모두에서 유지
- row별 `id`, `text`, `checked` 동기화

### Out of Scope

- memo binding
- mood binding
- 전체 앱 boot hydration 오케스트레이션
- todo 추가/삭제 기능

### Acceptance Criteria

- 각 todo row의 텍스트 변경이 중앙 상태의 대응 항목 `text`에 반영된다.
- 각 checkbox 변경이 중앙 상태의 대응 항목 `checked`에 반영된다.
- 상태와 UI 모두에서 todo 개수는 정확히 3개로 유지된다.
- todo 모듈은 raw `localStorage` 접근이나 별도 저장 key를 만들지 않는다.

### Validation Steps

1. `npm run dev`
2. 세 개의 todo row에 다른 값을 입력하고 체크 상태를 바꿔 중앙 상태의 대응 값이 각각 갱신되는지 확인한다.
3. UI 또는 상태에서 4번째 todo slot이 생기지 않는지 확인한다.
4. `npm run build`

### Affected Files or Modules

- `src/features/todos/todoSlots.ts`
- `src/state/checkinState.ts`
- `src/app/createApp.ts`

### Deferred Follow-ups

- 입력 중 debounce 세부 조정
- 완료 항목 시각 스타일 강화

### Story 2.4: Memo field binding to central state
Story Key: story-2.4
Epic Key: epic-2
Required for Success: yes
Depends On: story-2.1, story-1.5

### Goal

- 메모 입력 영역이 중앙 상태의 `memo` 필드와 동기화되도록 연결한다.

### In Scope

- textarea 입력 변경을 중앙 상태 업데이트로 연결
- 중앙 상태 변화가 memo field UI에 반영되도록 동기화
- 메모 영역이 별도 저장 경로 없이 동일 상태 계약을 사용하도록 정리

### Out of Scope

- mood binding
- todo binding
- 전체 앱 boot hydration 오케스트레이션
- 글자 수 제한 및 입력 보조 기능

### Acceptance Criteria

- 메모 입력 변경이 중앙 상태의 `memo` 값에 반영된다.
- 중앙 상태에서 `memo` 값이 바뀌면 textarea가 해당 값으로 동기화된다.
- memo field 모듈은 raw `localStorage` 접근과 자체 저장 키를 가지지 않는다.
- 메모 입력은 autosave 흐름에 포함될 준비가 되어 있다.

### Validation Steps

1. `npm run dev`
2. textarea에 여러 줄 텍스트를 입력해 중앙 상태의 `memo` 값이 갱신되는지 확인한다.
3. 상태 값을 프로그램적으로 바꿨을 때 textarea 값이 반영되는지 확인한다.
4. `npm run build`

### Affected Files or Modules

- `src/features/memo/memoField.ts`
- `src/state/checkinState.ts`
- `src/app/createApp.ts`

### Deferred Follow-ups

- 긴 메모 입력 시 auto-resize 또는 max-height 정책
- 메모 placeholder 및 힌트 카피 보정

### Story 2.5: Boot hydration and autosave restore flow
Story Key: story-2.5
Epic Key: epic-2
Required for Success: yes
Depends On: story-2.2, story-2.3, story-2.4

### Goal

- 앱 시작 시 저장된 상태를 한 번 복원하고, 사용 중 변경 사항이 자동 저장되어 새로고침 후에도 마지막 체크인을 그대로 이어가게 만든다.

### In Scope

- 앱 부팅 시 storage adapter를 통해 중앙 상태 hydrate
- mood/checkbox는 즉시 저장, todo text와 memo text는 짧은 debounce 후 저장
- explicit save button 없이 자동 저장 흐름 구성
- 빈 storage와 복원된 storage 모두에서 동일 UI 구조 유지
- 새로고침/재방문 end-to-end restore 검증

### Out of Scope

- cross-date 정책 확정
- 클라우드 sync
- 저장 성공 토스트, 히스토리, 다중 브라우저 동기화

### Acceptance Criteria

- 사용자가 기분, todo 3개, 체크 상태, 메모를 입력한 뒤 새로고침해도 마지막 저장 상태가 복원된다.
- 저장 데이터가 없을 때는 오류 없이 깔끔한 초기 상태가 보인다.
- mood 변경과 checkbox 변경은 별도 제출 없이 저장 흐름에 반영된다.
- todo text와 memo text는 입력 중 과도한 저장을 피할 수 있도록 짧은 debounce 또는 동등한 완충 로직을 사용한다.
- 저장을 위해 별도 save 버튼이나 요란한 저장 토스트가 필수 경로에 추가되지 않는다.

### Validation Steps

1. `npm run dev`
2. 기분, todo 3개, 체크 상태, 메모를 모두 입력한 뒤 새로고침해 값이 유지되는지 확인한다.
3. 브라우저를 같은 프로필로 다시 열어 마지막 저장 상태가 복원되는지 확인한다.
4. storage key를 제거한 뒤 새로고침해 기본 상태가 깨지지 않는지 확인한다.
5. `npm run build`

### Affected Files or Modules

- `src/main.ts`
- `src/app/createApp.ts`
- `src/state/storageAdapter.ts`
- `src/state/resolveInitialState.ts`
- `src/features/mood/moodSelector.ts`
- `src/features/todos/todoSlots.ts`
- `src/features/memo/memoField.ts`

### Deferred Follow-ups

- cross-tab synchronization
- 저장 상태의 미세한 피드백 UX 필요 여부 재평가

## Epic 3: Deferred Policy Hardening

이 epic은 현재 success criteria를 넘는 미확정 정책만 다룬다. 구현자는 이 epic을 MVP 필수 작업으로 취급하지 않는다.

### Story 3.1: Cross-date restore policy finalization
Story Key: story-3.1
Epic Key: epic-3
Required for Success: no
Depends On: story-2.5

### Goal

- 저장된 `localDate`와 현재 날짜가 다를 때의 동작을 제품 결정에 맞춰 명시적으로 고정한다.

### In Scope

- cross-date behavior를 `유지`, `초기화`, `날짜별 분리 저장` 중 하나로 확정
- `resolveInitialState` 정책 함수 업데이트
- 선택된 정책에 맞는 manual validation 보강
- 필요한 경우 사용자-facing copy 조정

### Out of Scope

- 회고 히스토리 UI
- 달력 탐색
- 다중 날짜 통계

### Acceptance Criteria

- 현재 날짜와 저장된 `localDate`가 다를 때의 동작이 문서와 코드에서 일치한다.
- cross-date 분기 로직은 `resolveInitialState` 또는 동등한 단일 정책 경계에만 존재한다.
- 선택된 정책이 아닌 다른 동작은 숨은 사이드이펙트로 남지 않는다.

### Validation Steps

1. `npm run dev`
2. 개발자 도구에서 이전 날짜의 저장 payload를 주입한 뒤 앱을 다시 열어 정책대로 동작하는지 확인한다.
3. 현재 날짜 payload와 이전 날짜 payload를 각각 검증해 same-date restore가 회귀하지 않았는지 확인한다.
4. `npm run build`

### Affected Files or Modules

- `src/state/resolveInitialState.ts`
- `src/state/storageAdapter.ts`
- `src/lib/storageKeys.ts`
- `README.md`

### Deferred Follow-ups

- 다중 날짜 히스토리 확장 시 데이터 구조 재설계
- 제품 copy와 onboarding 문구 재정렬
