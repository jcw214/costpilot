# 📋 Frontend 아키텍처 설계서

> **프로젝트명**: CostPilot — 원가/관리회계 통합관리 시스템  
> **문서 버전**: v1.0  
> **작성일**: 2026-04-22  
> **작성자**: 정찬우  
> **관련 문서**: `01_project_plan.md`, `02_requirements_spec.md`, `04_api_spec.md`

---

## 1. 아키텍처 개요

### 1.1 BFF (Backend For Frontend) 프록시 패턴

```
Browser ──HTTPS──▶ Next.js (Port 3033)
                      ├── SSR 페이지 렌더링
                      ├── API Route (/api/*) ──HTTP──▶ Spring Boot (Port 8081)
                      └── 세션 관리 (iron-session)
```

| 구성 요소 | 역할 |
|---|---|
| **Next.js Pages** | SSR/CSR 대시보드 페이지 렌더링 |
| **Next.js API Routes** | BFF 프록시 — Frontend → Backend API 중계 |
| **iron-session** | 쿠키 기반 세션 (SSR에서 인증 상태 유지) |

### 1.2 왜 BFF 프록시인가?

- Backend(8081)는 Docker 내부 네트워크에만 노출 → 외부 직접 접근 불가
- Frontend API Route가 내부 네트워크로 Backend를 호출하여 보안 유지
- `API_BASE_URL=http://backend:8081` (Docker 서비스 이름으로 통신)

---

## 2. 기술 스택

| 항목 | 기술 | 버전 | 선택 근거 |
|---|---|---|---|
| Framework | Next.js (App Router) | 14.x | SSR + API Routes + 기존 인프라 |
| Language | TypeScript | 5.x | 타입 안전성 |
| 차트 | Recharts | 2.x | React 네이티브, 선언적 API |
| HTTP Client | fetch (내장) | — | 별도 라이브러리 불필요 |
| 세션 | iron-session | 8.x | 쿠키 기반 경량 세션 |
| 스타일링 | CSS Modules | — | 컴포넌트 스코프 격리 |

---

## 3. 페이지 구조 (9개)

```
┌────────────┬──────────────────────────────────┐
│  사이드바    │        콘텐츠 영역                 │
│            │  ┌────────┐ ┌────────────────┐   │
│  전사 요약   │  │ 필터    │ │  KPI 카드       │   │
│  원가 집계   │  └────────┘ └────────────────┘   │
│  내부대체    │  ┌──────────────────────────┐   │
│  표준 배분   │  │      차트 영역             │   │
│  원가 요인   │  └──────────────────────────┘   │
│  성과 요인   │  ┌──────────────────────────┐   │
│  기준 데이터  │  │      데이터 테이블           │   │
│  거래 데이터  │  └──────────────────────────┘   │
│  설정       │                                │
└────────────┴──────────────────────────────────┘
```

### 3.1 페이지 목록

| # | 페이지 | 경로 | 유형 | API 호출 | 주요 구성 |
|---|---|---|---|---|---|
| 1 | **전사 요약** (홈) | `/` | 분석 | performance/executive, performance/margin, performance/profit | KPI 카드 8개 + 공헌이익 Bar + 수익성 Scatter |
| 2 | **원가 집계** | `/cost` | 분석 | cost/staff, cost/project, cost/department, cost/total | 4단계 탭 + 필터 + Stacked Bar + Pie |
| 3 | **내부대체가액** | `/transfer` | 분석 | transfer/pool, transfer/simulation | 방식 선택 + Driver 선택 + Grouped Bar |
| 4 | **표준원가 배분** | `/standard` | 분석 | standard/allocation, standard/compare | 기준 테이블 + Horizontal Bar + Grouped Bar |
| 5 | **원가 요인 분석** | `/variance` | 분석 | variance/labor, variance/overhead, variance/budget, variance/summary | Waterfall + Diverging Bar |
| 6 | **성과 요인 분석** | `/performance` | 분석 | performance/margin, performance/utilization, performance/profit | Grouped Bar + Horizontal Bar + Scatter |
| 7 | **기준 데이터** | `/master` | CRUD | departments, employees, projects, project-types, job-grades | 5개 탭 + 테이블 + 직급 시급 수정 |
| 8 | **거래 데이터** | `/transaction` | CRUD | timesheets, project-direct-costs, overhead-costs, budgets | 4개 탭 + 테이블 + CRUD 모달 |
| 9 | **설정** | `/settings` | 설정 | standard-costs | 표준공수 테이블 + 수정 |

---

## 4. 디렉토리 구조

```
frontend/
├── package.json
├── next.config.js
├── tsconfig.json
├── Dockerfile
│
├── public/
│   └── favicon.ico
│
└── src/
    ├── app/                          ← App Router
    │   ├── layout.tsx                ← 루트 레이아웃 (사이드바 + 콘텐츠)
    │   ├── page.tsx                  ← 전사 요약 (홈)
    │   ├── cost/page.tsx             ← 원가 집계
    │   ├── transfer/page.tsx         ← 내부대체가액
    │   ├── standard/page.tsx         ← 표준원가 배분
    │   ├── variance/page.tsx         ← 원가 요인 분석
    │   ├── performance/page.tsx      ← 성과 요인 분석
    │   ├── master/page.tsx           ← 기준 데이터
    │   ├── transaction/page.tsx      ← 거래 데이터
    │   ├── settings/page.tsx         ← 설정
    │   └── globals.css
    │
    ├── components/                   ← 공통 UI 컴포넌트
    │   ├── layout/
    │   │   ├── Sidebar.tsx
    │   │   ├── Header.tsx
    │   │   └── PageContainer.tsx
    │   ├── ui/
    │   │   ├── KpiCard.tsx
    │   │   ├── DataTable.tsx
    │   │   ├── FilterBar.tsx
    │   │   ├── TabGroup.tsx
    │   │   ├── Modal.tsx
    │   │   └── Badge.tsx
    │   └── charts/
    │       ├── StackedBarChart.tsx
    │       ├── GroupedBarChart.tsx
    │       ├── HorizontalBarChart.tsx
    │       ├── WaterfallChart.tsx
    │       ├── DivergingBarChart.tsx
    │       ├── PieDonutChart.tsx
    │       └── ScatterChart.tsx
    │
    ├── lib/                          ← 유틸리티
    │   ├── api.ts                    ← Backend API 호출 래퍼
    │   ├── format.ts                 ← 금액 포맷 (천 단위 쉼표)
    │   └── constants.ts              ← 색상 팔레트, 경로 상수
    │
    └── types/                        ← TypeScript 타입 정의
        ├── organization.ts
        ├── transaction.ts
        ├── analysis.ts
        └── common.ts
```

---

## 5. 컴포넌트 설계

### 5.1 레이아웃 구조

```tsx
// app/layout.tsx
<html>
  <body>
    <div className="app-layout">
      <Sidebar />           {/* 고정 사이드바, 네비게이션 메뉴 */}
      <main>
        <Header />           {/* 페이지 제목 + Breadcrumb */}
        <PageContainer>
          {children}         {/* 각 페이지 콘텐츠 */}
        </PageContainer>
      </main>
    </div>
  </body>
</html>
```

### 5.2 차트 컴포넌트 — Recharts 매핑

| 모듈 | 차트 컴포넌트 | Recharts 요소 | 시각화 대상 |
|---|---|---|---|
| M1 | StackedBarChart | `<BarChart>` + `<Bar stackId>` | 프로젝트별 원가 구성 (직접인건비/직접경비/간접원가) |
| M1 | PieDonutChart | `<PieChart>` + `<Pie innerRadius>` | 전사 원가 구성비율 |
| M2 | GroupedBarChart | `<BarChart>` + 다중 `<Bar>` | 산정 방식별 배부 금액 비교 |
| M3 | HorizontalBarChart | `<BarChart layout="vertical">` | 프로젝트별 표준원가 배분 |
| M4 | WaterfallChart | `<BarChart>` + 커스텀 Bar | 표준→차이요인→실제 분해 |
| M4 | DivergingBarChart | `<BarChart>` + 양/음 Bar | 프로젝트별 F/U 방향 비교 |
| M5 | GroupedBarChart | `<BarChart>` + 다중 `<Bar>` | 본부별 매출·원가·공헌이익 |
| M5 | ScatterChart | `<ScatterChart>` | 프로젝트 수익성 분포 (매출×이익률) |

### 5.3 색상 규칙

```typescript
// lib/constants.ts
export const COLORS = {
  favorable: '#10B981',   // 유리(F) — 초록
  unfavorable: '#EF4444', // 불리(U) — 빨강
  neutral: '#6B7280',     // 중립 — 회색

  // 본부 색상
  departments: ['#3B82F6', '#8B5CF6', '#F59E0B', '#06B6D4', '#EC4899'],

  // 차트 시리즈
  series: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],

  // 등급 색상
  gradeA: '#10B981',  // 이익률 40%↑
  gradeB: '#F59E0B',  // 20~40%
  gradeC: '#EF4444',  // 20%↓
};
```

---

## 6. API 호출 구조

### 6.1 BFF 프록시 (API Route)

```typescript
// src/app/api/[...path]/route.ts — catch-all 프록시
export async function GET(req: NextRequest) {
  const backendUrl = `${process.env.API_BASE_URL}${req.nextUrl.pathname}${req.nextUrl.search}`;
  const res = await fetch(backendUrl);
  return Response.json(await res.json(), { status: res.status });
}
```

### 6.2 클라이언트 API 래퍼

```typescript
// src/lib/api.ts
export async function fetchApi<T>(path: string, params?: Record<string, string>): Promise<T> {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  const res = await fetch(`/api${path}${query}`);
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  return res.json();
}
```

---

## 7. 금액 포맷·UX 규칙

```typescript
// src/lib/format.ts
export function formatKRW(amount: number): string {
  return new Intl.NumberFormat('ko-KR').format(amount) + '원';
}

export function formatRate(rate: number): string {
  return rate.toFixed(1) + '%';
}

export function judgementColor(judgement: 'F' | 'U'): string {
  return judgement === 'F' ? COLORS.favorable : COLORS.unfavorable;
}
```

| 규칙 | 적용 |
|---|---|
| 금액 | `120,000,000원` (천 단위 쉼표 + 원) |
| 비율 | `39.6%` (소수 1자리) |
| F/U 판정 | 초록(F)/빨강(U) 배지 |
| 벤치 인력 | 가동률 80% 미만 → 주의 아이콘 표시 |
| 데스크톱 | 1280px+ 기본 지원 |

---

## 8. Dockerfile

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
ENV HOSTNAME=0.0.0.0
CMD ["node", "server.js"]
```

> `next.config.js`에서 `output: 'standalone'` 설정 필수

---

## 9. 페이지-API-차트 매핑 요약

| 페이지 | Backend API | 차트 타입 |
|---|---|---|
| 전사 요약 `/` | executive, margin, profit | KPI 카드 + Grouped Bar + Scatter |
| 원가 집계 `/cost` | cost/staff, project, department, total | Stacked Bar + Pie |
| 내부대체가액 `/transfer` | transfer/pool, simulation | Grouped Bar |
| 표준원가 배분 `/standard` | standard/allocation, compare | Horizontal Bar + Grouped Bar |
| 원가 요인 분석 `/variance` | variance/labor, overhead, budget, summary | Waterfall + Diverging + Horizontal Bar |
| 성과 요인 분석 `/performance` | performance/margin, utilization, profit | Grouped Bar + Horizontal + Scatter |
| 기준 데이터 `/master` | departments, employees, projects, ... | DataTable |
| 거래 데이터 `/transaction` | timesheets, project-direct-costs, ... | DataTable + Modal |
| 설정 `/settings` | standard-costs | DataTable (수정 가능) |

---

> **다음 단계**: Phase 1 구현 — Backend/Frontend 빈 프로젝트 생성 + Docker 빌드 확인
