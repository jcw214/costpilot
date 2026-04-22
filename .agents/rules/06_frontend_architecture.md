# 📋 프론트엔드 아키텍처: CostPilot

> **작성일**: 2026-04-22  
> **작성자**: 정찬우  
> **프레임워크**: Next.js 14 (App Router, TypeScript)  
> **차트**: Recharts

---

## 1. BFF 프록시 구조

```
[브라우저]
    │  모든 요청은 Next.js로
    ▼
[Next.js (Port 3033)]
    ├── 페이지 렌더링 (SSR/CSR)
    ├── /app/api/** → Backend 프록시 (BFF)
    │     fetch("http://backend:8033/api/...")
    │     ↑ Docker 내부망, 외부 접근 불가
    └── 세션/인증 관리 (확장 시)
```

- 브라우저는 **Next.js만 알고**, Spring Boot URL을 직접 모름
- API Route에서 Backend 응답을 그대로 전달하거나 가공 가능
- Backend 장애 시 프론트에서 에러 핸들링 가능

### BFF 프록시 구현 (Catch-All Route)

```typescript
// app/api/[...path]/route.ts
const BACKEND_URL = process.env.BACKEND_URL || "http://backend:8033";

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join("/");
  const searchParams = request.nextUrl.searchParams.toString();
  const url = `${BACKEND_URL}/api/${path}${searchParams ? `?${searchParams}` : ""}`;

  const res = await fetch(url);
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

// POST, PUT, DELETE도 동일 패턴
```

---

## 2. 페이지 구성

### 2.1 레이아웃

```
┌────────────┬────────────────────────────────┐
│  사이드바    │       콘텐츠 영역               │
│            │  ┌─────────────────────────┐   │
│  전사 요약   │  │  필터 바 (기간/본부)      │   │
│  ─────────  │  └─────────────────────────┘   │
│  원가 집계   │  ┌─────────────────────────┐   │
│  내부대체    │  │  KPI 카드 영역            │   │
│  표준 배분   │  └─────────────────────────┘   │
│  원가 요인   │  ┌─────────────────────────┐   │
│  성과 요인   │  │  차트 영역               │   │
│  ─────────  │  └─────────────────────────┘   │
│  데이터관리   │  ┌─────────────────────────┐   │
│   공수 입력  │  │  데이터 테이블            │   │
│   비용 관리  │  └─────────────────────────┘   │
│   예산 관리  │                                │
└────────────┴────────────────────────────────┘
```

### 2.2 라우트 구성

| 경로 | 페이지 | 기능 모듈 | 주요 차트 |
|---|---|---|---|
| `/` | 전사 요약 (홈) | PERF-EXEC | KPI 카드 8개 |
| `/cost` | 원가 집계 | M1 | Stacked Bar, Pie |
| `/transfer` | 내부대체가액 | M2 | Grouped Bar |
| `/standard` | 표준원가 배분 | M3 | Horizontal Bar |
| `/variance` | 원가 요인 분석 | M4 | Waterfall, Diverging Bar |
| `/performance` | 성과 요인 분석 | M5 | Grouped Bar, Scatter |
| `/data/timesheets` | 공수 관리 | CRUD | 테이블 |
| `/data/expenses` | 비용 관리 | CRUD | 테이블 |
| `/data/budgets` | 예산·표준원가 | CRUD | 테이블 |

---

## 3. 디렉토리 구조

```
frontend/
├── app/
│   ├── layout.tsx                    ← 루트 레이아웃 (사이드바 포함)
│   ├── page.tsx                      ← 전사 요약 (홈)
│   │
│   ├── cost/page.tsx                 ← 원가 집계
│   ├── transfer/page.tsx             ← 내부대체가액
│   ├── standard/page.tsx             ← 표준원가 배분
│   ├── variance/page.tsx             ← 원가 요인 분석
│   ├── performance/page.tsx          ← 성과 요인 분석
│   │
│   ├── data/
│   │   ├── timesheets/page.tsx       ← 공수 관리 (CRUD)
│   │   ├── expenses/page.tsx         ← 비용 관리 (CRUD)
│   │   └── budgets/page.tsx          ← 예산·표준원가 (CRUD)
│   │
│   ├── api/
│   │   └── [...path]/route.ts        ← BFF 프록시 (Catch-All)
│   │
│   └── globals.css
│
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx               ← 사이드바 내비게이션
│   │   ├── ContentHeader.tsx         ← 페이지 타이틀 + 필터 바
│   │   └── KpiCard.tsx               ← KPI 카드 컴포넌트
│   │
│   ├── chart/                        ← Recharts 래퍼 컴포넌트
│   │   ├── StackedBarChart.tsx       ← M1 원가 구성
│   │   ├── GroupedBarChart.tsx        ← M2 방식별 비교, M5 공헌이익
│   │   ├── HorizontalBarChart.tsx    ← M3 배분 결과, M5 가동률
│   │   ├── WaterfallChart.tsx        ← M4 차이 요인 분해
│   │   ├── DivergingBarChart.tsx     ← M4 유리(F)/불리(U) 비교
│   │   ├── PieChart.tsx              ← M1 원가 구성비
│   │   └── ScatterChart.tsx          ← M5 수익성 분포
│   │
│   ├── table/                        ← 데이터 테이블
│   │   ├── DataTable.tsx             ← 공통 테이블 (정렬/페이지네이션)
│   │   └── CrudModal.tsx             ← 등록/수정 모달
│   │
│   └── filter/
│       ├── DateRangeFilter.tsx       ← 기간 선택 (월/분기)
│       ├── DepartmentFilter.tsx      ← 본부 선택
│       └── FilterBar.tsx             ← 필터 조합 바
│
├── hooks/                            ← 커스텀 훅
│   ├── useApi.ts                     ← API 호출 공통 훅 (fetch wrapper)
│   ├── useFilter.ts                  ← 필터 상태 관리
│   └── useCrud.ts                    ← CRUD 작업 공통 훅
│
├── types/                            ← TypeScript 타입 정의
│   ├── organization.ts               ← Department, Employee, Project ...
│   ├── cost.ts                       ← Timesheet, OutsourcingCost ...
│   ├── budget.ts                     ← Budget, StandardCost
│   └── analysis.ts                   ← CostStaffResponse, VarianceLaborResponse ...
│
├── lib/
│   └── format.ts                     ← 금액 포맷 (천 단위 쉼표), 날짜 포맷
│
├── next.config.ts
├── tsconfig.json
├── package.json
└── Dockerfile
```

---

## 4. 컴포넌트 설계

### 4.1 공통 패턴

모든 분석 페이지는 동일한 구조를 따른다:

```tsx
// 분석 페이지 공통 패턴 (예: cost/page.tsx)
export default function CostPage() {
  const { filters, setFilters } = useFilter();
  const { data, loading } = useApi("/api/analysis/cost/project", filters);

  return (
    <>
      <ContentHeader title="원가 집계">
        <FilterBar filters={filters} onChange={setFilters} />
      </ContentHeader>

      <KpiCardRow data={summaryData} />
      <StackedBarChart data={data} />
      <DataTable columns={columns} data={data} />
    </>
  );
}
```

### 4.2 CRUD 페이지 패턴

```tsx
// data/timesheets/page.tsx
export default function TimesheetsPage() {
  const { items, create, update, remove } = useCrud("/api/timesheets");

  return (
    <>
      <ContentHeader title="공수 관리">
        <Button onClick={() => openModal("create")}>신규 등록</Button>
      </ContentHeader>

      <DataTable columns={columns} data={items}
        onEdit={(row) => openModal("edit", row)}
        onDelete={(row) => remove(row.id)}
      />
      <CrudModal fields={fields} onSubmit={create | update} />
    </>
  );
}
```

### 4.3 차트-데이터 매핑

| 차트 컴포넌트 | 사용 페이지 | API 소스 | 시각화 |
|---|---|---|---|
| StackedBarChart | `/cost` | `/analysis/cost/project` | 직접인건비/외주비/간접비 적층 |
| PieChart | `/cost` | `/analysis/cost/total` | 전사 원가 구성비율 |
| GroupedBarChart | `/transfer` | `/analysis/transfer/simulation` | 산정 방식별 배부액 비교 |
| HorizontalBarChart | `/standard` | `/analysis/standard/allocation` | 프로젝트별 표준원가 배분 |
| WaterfallChart | `/variance` | `/analysis/variance/labor` | 표준→임률차이→능률차이→실제 |
| DivergingBarChart | `/variance` | `/analysis/variance/summary` | F/U 방향 비교 |
| GroupedBarChart | `/performance` | `/analysis/performance/margin` | 본부별 매출·원가·공헌이익 |
| ScatterChart | `/performance` | `/analysis/performance/profit` | 매출규모 × 이익률 분포 |

### 4.4 색상 규칙

| 의미 | 색상 | 용도 |
|---|---|---|
| 유리(F, Favorable) | `#10B981` (초록) | 차이 분석 긍정 |
| 불리(U, Unfavorable) | `#EF4444` (빨강) | 차이 분석 부정 |
| 등급 A | `#3B82F6` (파랑) | 우수 프로젝트 |
| 등급 B | `#F59E0B` (노랑) | 보통 프로젝트 |
| 등급 C | `#EF4444` (빨강) | 주의 프로젝트 |

---

## 5. 핵심 훅 설계

### useApi (API 호출 공통 훅)

```typescript
function useApi<T>(endpoint: string, params?: FilterParams) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const query = new URLSearchParams(params).toString();
    fetch(`/api/${endpoint}?${query}`)  // Next.js BFF 프록시 경유
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [endpoint, params]);

  return { data, loading };
}
```

### useCrud (CRUD 공통 훅)

```typescript
function useCrud<T>(endpoint: string) {
  const { data: items, refetch } = useApi<T[]>(endpoint);

  const create = async (body: Partial<T>) => {
    await fetch(`/api/${endpoint}`, { method: "POST", body: JSON.stringify(body) });
    refetch();
  };
  const update = async (id: number, body: Partial<T>) => { /* PUT */ };
  const remove = async (id: number) => { /* DELETE */ };

  return { items, create, update, remove };
}
```

---

## 6. Dockerfile

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/.next ./.next
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
EXPOSE 3033
CMD ["npm", "start"]
```

---

> **다음 단계**: 소스 코드 구현 시작
