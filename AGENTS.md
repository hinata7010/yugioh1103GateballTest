# AGENTS.md

이 파일은 Codex가 이 저장소에서 작업할 때 따라야 할 가이드를 제공합니다.

## 프로젝트 개요

유희왕 덱 추천 퀴즈 애플리케이션입니다. 사용자의 플레이 성향을 7가지 축으로 분석해 가장 적합한 덱을 매칭합니다.

## 개발 명령어

패키지 매니저: `pnpm` (필수, npm optional dependency 이슈 회피)

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행 (HMR, 기본 포트 5173)
pnpm run dev

# 프로덕션 빌드
pnpm run build

# 빌드 결과 미리보기
pnpm run preview

# 새 패키지 추가
pnpm add <package-name>
```

타입 체크는 빌드 시 `vue-tsc -b`로 함께 수행됩니다.

Vercel은 `pnpm-lock.yaml`과 `package.json#packageManager`를 기반으로 자동으로 pnpm을 사용합니다.

## 핵심 아키텍처

### 퀴즈 플로우

1. `/` (Home): 퀴즈 시작
2. `/quiz` (Quiz): 질문 응답 및 점수 누적
3. `/results` (Results): 매칭 덱 결과 표시

### 상태 관리 (Pinia)

단일 스토어: `src/stores/quiz.ts`

- `rawScores`: 정규화 전 축별 누적 점수
- `userScores`: 1~10으로 정규화된 `AxisScores`
- `selectedTags`: 소환 방식 필터 (예: 싱크로, 엑시즈, 융합)
- `matchResults`: 코사인 유사도 기반 덱 매칭 결과

주요 액션:

- `answerQuestion()`: 이전 답변 효과를 제거하고 새 답변 효과 적용
- `calculateResults()`: 점수 정규화 후 매칭 수행
- `loadResultsFromUrl()`: URL에 인코딩된 점수로 결과 복원

### 7축 점수 모델

`src/types/deck.ts`의 `AxisScores`

- `stability`: 안정성, 말림/붕괴 저항
- `difficulty`: 운영 난이도, 루트/판단 요구치
- `ceiling`: 최대 고점
- `tempo`: 전개/게임 진행 속도
- `niche`: 비주류/연구 성향
- `interaction`: 견제/대응 수단
- `power`: 순수 덱 파워

모든 축은 1~10 범위로 정규화됩니다.

### 매칭 알고리즘

`src/utils/matching.ts`의 `findMatches()`

1. `selectedTags`로 태그 필터링
2. 중심화된 벡터(기준 5.5)에 대해 코사인 유사도 계산 (`config.json#weights` 가중치 반영)
3. `(similarity + 1) * 50`으로 매칭률(%) 변환
4. 매칭률 내림차순 정렬

`calculateDistance`는 deprecated 상태이며 호환성 목적으로만 유지됩니다.

### 점수 정규화

`src/utils/scoring.ts`

- `calculateMaxScores()`: 질문 전체 기준 축별 이론 최대치 계산
- `normalizeScores()`: 원시 점수를 1~10으로 매핑
  - 음수 최대 구간 => 1
  - 0점 => 5.5
  - 양수 최대 구간 => 10

### 데이터 파일

`src/data/`

- `questions.json`
  - `type`: `single` 또는 `tags`
  - 답변 `effects`가 축 점수에 +/- 적용
- `decks.json`
  - `scores`: 덱의 7축 프로필
  - `tags`: 덱 태그
- `config.json`
  - `weights`
  - `axisDescriptions`
  - `deckTags`

### 라우팅

`src/router/index.ts`

- `/` => `Home.vue`
- `/quiz` => `Quiz.vue`
- `/results` => `Results.vue`

모든 라우트는 lazy loading을 사용합니다.

## 컴포넌트 구조

- `src/components/common/`: Button, Card, ProgressBar, ShareButtons
- `src/components/quiz/`: QuestionCard, TagsQuestionCard, AnswerOption
- `src/components/results/`: DeckCard
- `src/views/`: Home, Quiz, Results

## 유틸리티

`src/utils/encoding.ts`

- `encodeScores()`: `AxisScores` -> 14자 16진수 문자열
- `decodeScores()`: 인코딩 문자열 -> `AxisScores`
- `generateShareUrl()`: `/results?s={encoded}` 형식 URL 생성

## 주의사항

### 답변 변경 시 점수 복원

`answerQuestion()`에서는 반드시 이전 답변 효과를 먼저 빼고, 새 답변 효과를 더해야 합니다.

### 디버그 로그 존재

다음 파일에 `console.log`가 남아 있습니다.

- `src/stores/quiz.ts`
- `src/utils/matching.ts`
- `src/utils/scoring.ts`

프로덕션 배포 전 제거하거나 조건부 로깅으로 전환하세요.

### 태그 필터링 규칙

`findMatches()` 기준:

- `selectedTags`에 `상관없음`이 포함되면 모든 덱 표시
- 특정 태그가 선택되면 해당 태그를 가진 덱만 표시
- 빈 배열이면 모든 덱 표시

## 데이터 수정 가이드

### 새 질문 추가 (`src/data/questions.json`)

아래 스키마를 유지합니다.

```json
{
  "id": "q_unique_id",
  "text": "질문 텍스트",
  "type": "single",
  "answers": [
    {
      "id": "a1",
      "text": "답변 1",
      "effects": [
        { "axis": "stability", "value": 2 },
        { "axis": "tempo", "value": -1 }
      ]
    }
  ]
}
```

태그 선택 질문은 `"type": "tags"`로 설정하고 `answers`에 태그 선택지를 넣습니다.

### 새 덱 추가 (`src/data/decks.json`)

`id`, `name`, `description`, `commentary`, `image`, `tags`, `scores`(7축 전체)를 포함한 스키마를 유지합니다.

덱 이미지는 `public/images/decks/`에 추가합니다.

## 기술 스택

- Vue 3.5 (Composition API)
- TypeScript 5.9
- Vite 7.2
- Pinia 3.0
- Vue Router 5.0
- Tailwind CSS 3.4
- Lucide Vue Next
- VueUse Core
- Vercel Analytics

## 패키지 관리 정책

반드시 `pnpm`만 사용합니다.

- `package.json`의 `packageManager`는 `pnpm@10.29.3`
- `pnpm-lock.yaml`로 Vercel에서 pnpm 사용 보장
- npm 명령어로 변경하지 않음
