# yugioh1103GateballTest

유희왕 덱 추천 퀴즈 애플리케이션 - 사용자의 플레이 성향을 7가지 축으로 분석하여 최적의 덱을 매칭합니다.

## Tech Stack
- Vue 3 + TypeScript + Vite
- Tailwind CSS
- Pinia (State Management)
- Vue Router
- Vercel Analytics

## 시작하기

### 사전 요구사항
- Node.js 18 이상
- pnpm (권장)

### pnpm 설치
```bash
npm install -g pnpm
```

### 프로젝트 설치
```bash
# 의존성 설치
pnpm install
```

### 개발 서버 실행
```bash
pnpm run dev
```
개발 서버가 http://localhost:5173 에서 실행됩니다.

### 프로덕션 빌드
```bash
pnpm run build
```
빌드된 파일은 `dist/` 디렉토리에 생성됩니다.

### 빌드 미리보기
```bash
pnpm run preview
```

## 배포

이 프로젝트는 Vercel에 배포되도록 설정되어 있습니다.
- `pnpm-lock.yaml`과 `packageManager` 필드로 자동으로 pnpm 사용
- Vercel Analytics가 통합되어 있음

## 주요 기능

- 7축 점수 시스템으로 플레이 성향 분석
- 코사인 유사도 기반 덱 매칭 알고리즘
- 결과 공유 기능 (URL 인코딩)
- 소환 방식별 필터링 (싱크로, 엑시즈, 융합 등)
