# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

유희왕 덱 추천 퀴즈 애플리케이션 - 사용자의 플레이 성향을 7가지 축으로 분석하여 최적의 덱을 매칭합니다.

## 개발 명령어

**패키지 매니저: pnpm** (npm의 optional dependencies 버그 회피)

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행 (HMR 지원, 기본 포트 5173)
pnpm run dev

# 프로덕션 빌드
pnpm run build

# 빌드 결과 미리보기
pnpm run preview

# 새 패키지 추가
pnpm add <package-name>
```

**타입 체크**: `pnpm run build` 시 `vue-tsc -b`가 자동으로 실행됩니다.

**Vercel 배포**: `pnpm-lock.yaml` 파일과 `package.json`의 `packageManager` 필드로 자동으로 pnpm 사용

## 핵심 아키텍처

### 퀴즈 플로우

1. **Home** (`/`) - 퀴즈 시작
2. **Quiz** (`/quiz`) - 질문 응답 및 점수 누적
3. **Results** (`/results`) - 매칭 덱 결과 표시

### 상태 관리 (Pinia)

**`src/stores/quiz.ts`** - 전체 퀴즈 상태를 관리하는 단일 스토어:

- `rawScores` - 사용자의 응답에 따른 7개 축의 누적 점수 (정규화 전)
- `userScores` - 1~10 범위로 정규화된 점수 (AxisScores 타입)
- `selectedTags` - 사용자가 선택한 소환 방식 필터 (싱크로, 엑시즈, 융합)
- `matchResults` - 코사인 유사도 기반 덱 매칭 결과

**주요 액션:**
- `answerQuestion()` - 답변 선택 시 이전 답변 효과를 취소하고 새 효과를 적용
- `calculateResults()` - 점수 정규화 후 덱 매칭 수행
- `loadResultsFromUrl()` - 공유 URL의 인코딩된 점수로부터 결과 복원

### 7축 점수 시스템

**`src/types/deck.ts`의 AxisScores 인터페이스:**

| 축 | 의미 | 범위 |
|---|---|---|
| `stability` | 저점이 높고 게임이 잘 안 무너짐 | 1-10 |
| `difficulty` | 루트 암기, 선택지 판단 요구 | 1-10 |
| `ceiling` | 한 턴/한 패의 최대 파괴력 | 1-10 |
| `tempo` | 전개 속도, 게임 진행 속도 | 1-10 |
| `niche` | 메타 외 덱, 연구 성향 | 1-10 |
| `interaction` | 견제, 방해, 대응 수단 | 1-10 |
| `power` | 순수 덱 강함 (티어 체감) | 1-10 |

### 덱 매칭 알고리즘

**`src/utils/matching.ts`의 `findMatches()`:**

1. **필터링** - `selectedTags`로 덱 필터링 ("상관없음" 선택 시 전체 덱 대상)
2. **코사인 유사도 계산** - 사용자 점수와 덱 점수 벡터의 방향성 비교
   - 중심화: 5.5를 기준으로 -4.5 ~ +4.5 범위로 변환
   - 가중치 적용: `config.json`의 `weights` 사용 (현재 모든 축 1.0)
   - 결과: -1 ~ 1 범위 (1에 가까울수록 유사)
3. **매칭률 변환** - `(similarity + 1) * 50`으로 0~100% 범위로 변환
4. **정렬** - 매칭률 내림차순 정렬

**기존 거리 기반 방식(`calculateDistance`)은 deprecated - 호환성 유지 목적으로만 존재**

### 점수 정규화

**`src/utils/scoring.ts`:**

- `calculateMaxScores()` - 모든 질문에서 각 축의 이론적 최대값 계산
- `normalizeScores()` - 원시 점수를 1~10 범위로 정규화
  - `min점 (음의 최대값) = 1`
  - `0점 = 5.5`
  - `max점 (양의 최대값) = 10`

### 데이터 구조

**`src/data/` 디렉토리:**

- `questions.json` - 퀴즈 질문 배열
  - `type`: `'single'` (일반 질문) 또는 `'tags'` (소환 방식 선택)
  - `answers`: 각 답변의 `effects`가 특정 축에 +/- 점수 부여
- `decks.json` - 덱 데이터 배열
  - `scores`: 각 덱의 7개 축 점수 (미리 정의됨)
  - `tags`: 덱의 소환 방식 태그
- `config.json` - 전역 설정
  - `weights`: 각 축의 가중치 (현재 모든 축 1.0)
  - `axisDescriptions`: 축 설명
  - `deckTags`: 사용 가능한 덱 태그 목록

### 라우팅

**`src/router/index.ts`** - Vue Router로 3개 페이지 관리:
- `/` - Home.vue
- `/quiz` - Quiz.vue
- `/results` - Results.vue

모든 라우트는 lazy loading 적용 (`() => import(...)`).

## 컴포넌트 구조

- **공통 컴포넌트** (`src/components/common/`) - Button, Card, ProgressBar, ShareButtons
- **퀴즈 컴포넌트** (`src/components/quiz/`) - QuestionCard, TagsQuestionCard (다중 선택), AnswerOption
- **결과 컴포넌트** (`src/components/results/`) - DeckCard
- **뷰** (`src/views/`) - Home, Quiz, Results

## 유틸리티

**`src/utils/encoding.ts`** - 결과 URL 공유 기능:
- `encodeScores()` - AxisScores를 14자 16진수 문자열로 인코딩
- `decodeScores()` - 인코딩된 문자열을 AxisScores로 디코딩
- `generateShareUrl()` - 공유 URL 생성 (`/results?s={encoded}`)

## 주의사항

### 답변 변경 시 점수 복원
`answerQuestion()`에서 이전 답변의 효과를 정확히 되돌립니다. 답변을 바꿀 때마다 이전 효과를 빼고 새 효과를 더합니다.

### 디버깅 로그
여러 파일에 `console.log` 디버깅 코드가 남아있습니다:
- `src/stores/quiz.ts`: calculateResults, loadResultsFromUrl
- `src/utils/matching.ts`: findMatches, calculateCosineSimilarity
- `src/utils/scoring.ts`: normalizeScores, calculateMaxScores

프로덕션 배포 전 제거 권장.

### 태그 필터링 로직
`findMatches()`에서 "상관없음" 태그는 특별 처리됩니다:
- `selectedTags.includes('상관없음')` → 모든 덱 표시
- 그 외 태그 선택 → 해당 태그를 가진 덱만 필터링
- 빈 배열 → 모든 덱 표시

## 데이터 수정 가이드

### 새 질문 추가 (`src/data/questions.json`)

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
    },
    {
      "id": "a2",
      "text": "답변 2",
      "effects": [
        { "axis": "ceiling", "value": 3 }
      ]
    }
  ]
}
```

**태그 선택 질문**: `"type": "tags"`로 설정하고 `answers`에 태그 선택지 추가

### 새 덱 추가 (`src/data/decks.json`)

```json
{
  "id": "deck-id",
  "name": "덱 이름",
  "description": "한 줄 설명",
  "commentary": "결과 화면에 표시될 상세 코멘트",
  "image": "/images/decks/deck-image.jpg",
  "tags": ["싱크로", "엑시즈"],
  "scores": {
    "stability": 7.0,
    "difficulty": 6.5,
    "ceiling": 8.0,
    "tempo": 7.5,
    "niche": 5.0,
    "interaction": 6.0,
    "power": 7.0
  }
}
```

**이미지 추가**: `/public/images/decks/` 디렉토리에 이미지 파일 추가

## 기술 스택

- **프레임워크**: Vue 3.5 (Composition API)
- **언어**: TypeScript 5.9
- **빌드**: Vite 7.2, pnpm 10.29.3
- **상태 관리**: Pinia 3.0
- **라우팅**: Vue Router 5.0
- **스타일**: Tailwind CSS 3.4
- **아이콘**: Lucide Vue Next
- **유틸리티**: VueUse Core
- **분석**: Vercel Analytics

## 패키지 관리

**pnpm 사용 필수**: npm의 optional dependencies 버그로 인해 `@rollup/rollup-win32-x64-msvc` 설치 실패 문제가 있어 pnpm을 사용합니다.

- `package.json`에 `"packageManager": "pnpm@10.29.3"` 명시
- `pnpm-lock.yaml` 파일로 Vercel이 자동으로 pnpm 사용
- npm 대신 **반드시 pnpm 명령어 사용**
