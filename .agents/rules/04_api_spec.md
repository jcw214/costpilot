# 📋 API 명세서

> **프로젝트명**: CostPilot — 원가/관리회계 통합관리 시스템  
> **문서 버전**: v1.1  
> **작성일**: 2026-04-22  
> **작성자**: 정찬우  
> **Base URL**: `/api`  
> **Content-Type**: `application/json`

---

## 1. API 구조 개요

```
/api
├── /departments          ← 기준 데이터 (Read Only)
├── /employees
├── /projects
├── /project-types
├── /job-grades           ← 표준시급 수정 가능
│
├── /timesheets           ← 거래 데이터 (Full CRUD)
├── /outsourcing-costs
├── /overhead-costs
├── /budgets
├── /standard-costs       ← 표준공수 수정 가능
│
└── /analysis             ← 분석 API (조회 전용, 실시간 계산)
    ├── /cost             ← M1 원가 집계
    ├── /transfer         ← M2 내부대체가액
    ├── /standard         ← M3 표준원가 배분
    ├── /variance         ← M4 원가 요인 분석
    └── /performance      ← M5 성과 요인 분석
```

---

## 2. 기준 데이터 API (Read Only)

| Method | Endpoint | 설명 | Query Params (선택) |
|---|---|---|---|
| GET | `/api/departments` | 본부 목록 | `?type=수익` |
| GET | `/api/employees` | 인력 목록 | `?departmentId=&jobGradeId=` |
| GET | `/api/projects` | 프로젝트 목록 | `?departmentId=&status=진행중` |
| GET | `/api/project-types` | 유형 목록 | — |
| GET | `/api/job-grades` | 직급 목록 | — |
| PATCH | `/api/job-grades/{id}` | 표준시급 수정 | — |

**대표 Response (GET /api/employees)**:
```json
[
  {
    "id": 1, "name": "김철수",
    "departmentName": "솔루션개발본부",
    "jobGradeCode": "G3", "jobGradeName": "과장/선임",
    "hourlyRate": 47000, "standardHourlyRate": 45000
  }
]
```

**PATCH /api/job-grades/{id} Request**:
```json
{ "standardHourlyRate": 48000 }
```

> 표준시급 수정 시 차이 분석(VAR-LABOR) 결과가 연동 변경된다.

---

## 3. 거래 데이터 API (Full CRUD)

### CRUD 공통 패턴

모든 거래 데이터는 동일한 CRUD 패턴을 따른다:

| Method | Endpoint 패턴 | 설명 |
|---|---|---|
| GET | `/api/{resource}` | 목록 조회 (Query Params로 필터) |
| POST | `/api/{resource}` | 신규 등록 → 201 반환 |
| PUT | `/api/{resource}/{id}` | 전체 수정 |
| DELETE | `/api/{resource}/{id}` | 삭제 |

### 3.1 투입 공수 (timesheets)

**GET Query**: `?employeeId=&projectId=&startDate=&endDate=`

```json
// POST/PUT Request Body
{ "employeeId": 1, "projectId": 1, "workDate": "2026-01-15", "hours": 8.0 }

// GET Response
[{
  "id": 1, "employeeId": 1, "employeeName": "김철수",
  "projectId": 1, "projectName": "A은행 차세대 시스템 구축",
  "workDate": "2026-01-15", "hours": 8.0
}]
```

### 3.2 외주비 (outsourcing-costs)

**GET Query**: `?projectId=&startDate=&endDate=`

```json
// POST/PUT Request Body
{ "projectId": 1, "vendorName": "ABC소프트", "description": "UI 개발 외주",
  "amount": 30000000, "costDate": "2026-02-01" }
```

### 3.3 간접비 (overhead-costs)

**GET Query**: `?departmentId=&costMonth=`

```json
// POST/PUT Request Body
{ "departmentId": 4, "costCategory": "운영비",
  "amount": 15000000, "costMonth": "2026-01-01" }
```

### 3.4 예산 (budgets)

```json
// POST/PUT Request Body
{ "projectId": 1, "budgetAmount": 350000000,
  "fiscalYear": 2026, "fiscalQuarter": 1 }
```

### 3.5 표준공수 (standard-costs) — GET + PATCH만 지원

```json
// GET Response
[{ "id": 1, "projectTypeName": "SI 신규개발 (대형)",
   "jobGradeCode": "G3", "jobGradeName": "과장/선임", "standardHours": 2000.0 }]

// PATCH Request Body
{ "standardHours": 2200.0 }
```

---

## 4. 분석 API (실시간 계산, GET 전용)

> 모든 분석 API는 **GET 메서드**만 지원한다.  
> 별도 테이블에 저장하지 않고, 거래 데이터를 실시간으로 조합·계산하여 반환한다.  
> **공통 Query Parameters**: `?startDate=2026-01-01&endDate=2026-03-31` (기간 필터)

### 4.1 [M1] 원가 집계 — /api/analysis/cost

#### GET /api/analysis/cost/staff — 인력별 원가 (COST-STAFF)

추가 파라미터: `&departmentId=1`

```json
[{
  "employeeId": 1, "employeeName": "김철수",
  "departmentName": "솔루션개발본부", "jobGradeName": "과장/선임",
  "totalHours": 480.0, "hourlyRate": 47000, "totalLaborCost": 22560000,
  "projects": [
    { "projectName": "A은행 차세대", "hours": 320.0, "cost": 15040000 }
  ]
}]
```

#### GET /api/analysis/cost/project — 프로젝트별 원가 (COST-PROJECT)

```json
[{
  "projectId": 1, "projectName": "A은행 차세대 시스템 구축",
  "directLaborCost": 150000000, "outsourcingCost": 30000000,
  "allocatedOverhead": 25000000, "totalCost": 205000000,
  "contractAmount": 800000000, "profitRate": 74.4
}]
```

#### GET /api/analysis/cost/department — 본부별 원가 (COST-DEPT)

```json
[{
  "departmentName": "솔루션개발본부", "type": "수익", "projectCount": 8,
  "totalDirectCost": 180000000, "totalOverhead": 50000000,
  "totalCost": 230000000, "totalRevenue": 500000000
}]
```

#### GET /api/analysis/cost/total — 전사 원가 총괄 (COST-TOTAL)

```json
{
  "totalRevenue": 1200000000, "totalCost": 725000000,
  "operatingProfitRate": 39.6, "costRate": 60.4,
  "costBreakdown": {
    "directLabor": 450000000, "outsourcing": 60000000, "overhead": 215000000
  }
}
```

---

### 4.2 [M2] 내부대체가액 — /api/analysis/transfer

#### GET /api/analysis/transfer/pool — Cost Pool 조회 (TRANSFER-POOL)

```json
[{
  "departmentName": "경영지원본부",
  "laborCost": 80000000, "operatingCost": 40000000, "totalCostPool": 120000000
}]
```

#### GET /api/analysis/transfer/simulation — 시뮬레이션 (TRANSFER-SIM)

추가 파라미터: `&method=원가기준&driver=인원수`
- `method`: `원가기준` | `시장가격기준` (+ `&marketPremiumRate=1.2`) | `협의가격` (+ `&targetMarginRate=0.1`)
- `driver`: `인원수` | `매출비율` | `투입공수`

```json
{
  "method": "원가기준", "driver": "인원수",
  "supportDepartments": [
    { "name": "경영지원본부", "costPool": 120000000 },
    { "name": "기술인프라본부", "costPool": 95000000 }
  ],
  "allocation": [
    { "departmentName": "솔루션개발본부", "driverRatio": 0.50, "allocatedAmount": 107500000 },
    { "departmentName": "시스템운영본부", "driverRatio": 0.30, "allocatedAmount": 64500000 },
    { "departmentName": "컨설팅사업본부", "driverRatio": 0.20, "allocatedAmount": 43000000 }
  ],
  "totalAllocated": 215000000
}
```

---

### 4.3 [M3] 표준원가 배분 — /api/analysis/standard

#### GET /api/analysis/standard/allocation — 배분 결과 (STD-ALLOC)

추가 파라미터: `&driver=인원수`

```json
[{
  "projectId": 1, "projectName": "A은행 차세대 시스템 구축",
  "standardDirectCost": 320000000, "allocatedOverhead": 50000000,
  "totalStandardCost": 370000000
}]
```

#### GET /api/analysis/standard/compare — 표준 vs. 실제 (STD-COMPARE)

```json
[{
  "projectId": 1, "projectName": "A은행 차세대 시스템 구축",
  "standardCost": 370000000, "actualCost": 385000000,
  "variance": 15000000, "varianceRate": 4.1, "judgement": "U"
}]
```

> `judgement`: `"F"` (유리, 실제 < 표준) / `"U"` (불리, 실제 > 표준)

---

### 4.4 [M4] 원가 요인 분석 — /api/analysis/variance

#### GET /api/analysis/variance/labor — 직접노무비 차이 (VAR-LABOR)

추가 파라미터: `&projectId=1`

```json
{
  "projectName": "A은행 차세대 시스템 구축",
  "totalVariance": 15000000,
  "rateVariance": { "amount": 3000000, "judgement": "U" },
  "efficiencyVariance": { "amount": 12000000, "judgement": "U" },
  "byGrade": [{
    "gradeName": "과장/선임",
    "standardRate": 45000, "actualRate": 47000,
    "standardHours": 2000, "actualHours": 2300,
    "rateVariance": 4600000, "efficiencyVariance": 13500000
  }]
}
```

#### GET /api/analysis/variance/overhead — 간접원가 차이 (VAR-OVERHEAD)

```json
{
  "totalOverheadVariance": 8000000,
  "spendingVariance": { "amount": 3000000, "judgement": "U" },
  "efficiencyVariance": { "amount": 2000000, "judgement": "U" },
  "volumeVariance": { "amount": 3000000, "judgement": "U" }
}
```

#### GET /api/analysis/variance/budget — 예산 소진율 (VAR-BUDGET)

```json
[{
  "projectName": "A은행 차세대 시스템 구축",
  "budgetAmount": 350000000, "actualSpent": 285000000,
  "burnRate": 81.4, "remaining": 65000000
}]
```

#### GET /api/analysis/variance/summary — 차이 종합 (VAR-SUMMARY)

```json
[{
  "projectName": "A은행 차세대",
  "totalVariance": 15000000, "varianceRate": 4.1,
  "judgement": "U", "mainFactor": "노무능률차이"
}]
```

---

### 4.5 [M5] 성과 요인 분석 — /api/analysis/performance

#### GET /api/analysis/performance/margin — 공헌이익 (PERF-MARGIN)

```json
[{
  "departmentName": "솔루션개발본부",
  "revenue": 500000000, "directCost": 200000000,
  "transferPrice": 80000000,
  "contributionMargin": 220000000, "contributionMarginRate": 44.0
}]
```

#### GET /api/analysis/performance/utilization — 가동률 (PERF-UTIL)

```json
{
  "period": { "months": 3, "availableHoursPerMonth": 176 },
  "byDepartment": [{ "departmentName": "솔루션개발본부", "avgUtilization": 85.2 }],
  "benchEmployees": [{ "name": "박벤치", "utilization": 62.5 }]
}
```

> 벤치(Bench): 가동률 80% 미만 인력

#### GET /api/analysis/performance/profit — 수익성 분포 (PERF-PROFIT)

```json
[{
  "projectName": "A은행 차세대",
  "revenue": 800000000, "totalCost": 385000000,
  "profitRate": 51.9, "grade": "A"
}]
```

> 등급: A(이익률 40%↑) / B(20~40%) / C(20%↓)

#### GET /api/analysis/performance/executive — 전사 요약 (PERF-EXEC)

```json
{
  "totalRevenue": 1200000000, "totalCost": 725000000,
  "operatingProfitRate": 39.6, "costRate": 60.4,
  "avgUtilization": 82.3,
  "topDepartment": { "name": "솔루션개발본부", "marginRate": 44.0 },
  "cautionProjectCount": 3, "overBudgetProjectCount": 2
}
```

---

## 5. 공통 사항

| 항목 | 규칙 |
|---|---|
| 에러 응답 | `{"status": 400, "error": "Bad Request", "message": "..."}` |
| HTTP 상태 | 200(성공), 201(생성), 400(잘못된 요청), 404(없음), 500(서버 오류) |
| 날짜 형식 | ISO 8601: `"2026-01-15"` |
| 금액 단위 | 원(KRW) 정수. Frontend에서 천 단위 쉼표 포맷팅 |

## 6. API 요약

| 구분 | 수 | 대상 |
|---|---|---|
| 기준 데이터 (R) | 5 | departments, employees, projects, project-types, job-grades |
| 설정 수정 (U) | 2 | job-grades PATCH, standard-costs PATCH |
| CRUD | 16 | timesheets×4, outsourcing-costs×4, overhead-costs×4, budgets×4 |
| 분석 | 12 | cost(4), transfer(2), standard(2), variance(4), performance(4) |
| **합계** | **35** | |

---

> **다음 단계**: `05_architecture.md` — 시스템 아키텍처 다이어그램
