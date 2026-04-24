# 📋 API 명세서

> **프로젝트명**: CostPilot | **Base URL**: `/api` | **Content-Type**: `application/json`

---

## 1. API 구조 개요
* **기준 데이터 (R, U)**: `/departments`, `/employees`, `/projects`, `/project-types`, `/job-grades`
* **거래 데이터 (CRUD)**: `/timesheets`, `/project-direct-costs`, `/overhead-costs`, `/budgets`, `/standard-costs`
* **분석 API (R)**: `/analysis/cost` (M1), `/analysis/transfer` (M2), `/analysis/standard` (M3), `/analysis/variance` (M4), `/analysis/performance` (M5)

---

## 2. 기준 데이터 API (Read Only, 부분 Update)

### GET `/api/departments`
- **Query**: `?type=수익` (선택)
- **Response**: `[ { "id": 1, "name": "솔루션개발본부", "type": "수익", "employeeCount": 30 } ]`

### GET `/api/employees`
- **Query**: `?departmentId=1&jobGradeId=3` (선택)
- **Response**: `[ { "id": 1, "name": "김철수", "departmentName": "솔루션개발본부", "jobGradeCode": "G3", "jobGradeName": "과장/선임", "hourlyRate": 47000, "standardHourlyRate": 45000 } ]`

### GET `/api/projects`
- **Query**: `?departmentId=1&status=진행중` (선택)
- **Response**: `[ { "id": 1, "name": "A은행 차세대", "departmentName": "솔루션개발본부", "projectTypeName": "SI 신규개발 (대형)", "status": "진행중", "contractAmount": 800000000, "startDate": "2026-01-06", "endDate": "2026-06-30" } ]`

### GET `/api/project-types`
- **Response**: `[ { "id": 1, "name": "SI 신규개발 (대형)" } ]`

### GET & PATCH `/api/job-grades`
- **GET Response**: `[ { "id": 3, "code": "G3", "name": "과장/선임", "standardHourlyRate": 45000 } ]`
- **PATCH `/api/job-grades/{id}` Body**: `{ "standardHourlyRate": 48000 }` (수정 시 차이 분석 연동)

---

## 3. 거래 데이터 API (Full CRUD)
> 모든 거래 API는 `GET`(목록), `POST`(등록), `PUT /{id}`(수정), `DELETE /{id}`(삭제) 지원.

### 3.1 투입 공수 (`/api/timesheets`)
- **GET Query**: `?employeeId=1&projectId=1&startDate=2026-01-01&endDate=2026-03-31`
- **POST/PUT Body**: `{ "employeeId": 1, "projectId": 1, "activityType": "개발", "workDate": "2026-01-15", "hours": 8.0 }`
- **GET Response**: `[ { "id": 1, "employeeId": 1, "employeeName": "김철수", "projectId": 1, "projectName": "A은행 차세대", "activityType": "개발", "workDate": "2026-01-15", "hours": 8.0 } ]`

### 3.2 프로젝트 직접비 (`/api/project-direct-costs`)
- **GET Query**: `?projectId=1&startDate=2026-01-01&endDate=2026-03-31`
- **POST/PUT Body**: `{ "projectId": 1, "costType": "외주비", "vendorName": "ABC소프트", "description": "UI 개발", "amount": 30000000, "costDate": "2026-02-01" }`

### 3.3 간접비 (`/api/overhead-costs`)
- **GET Query**: `?departmentId=4&costMonth=2026-01-01`
- **POST/PUT Body**: `{ "departmentId": 4, "costCategory": "운영비", "amount": 15000000, "costMonth": "2026-01-01" }`

### 3.4 예산 (`/api/budgets`)
- **POST/PUT Body**: `{ "projectId": 1, "budgetAmount": 350000000, "fiscalYear": 2026, "fiscalQuarter": 1 }`

### 3.5 표준공수 (`/api/standard-costs`)
- **PATCH `/{id}` Body**: `{ "standardHours": 2200.0 }`
- **GET Response**: `[ { "id": 1, "projectTypeName": "SI 신규개발 (대형)", "jobGradeName": "과장/선임", "standardHours": 2000.0 } ]`

---

## 4. 분석 API (실시간 계산, 조회 전용)
> 공통 Query: `startDate`, `endDate`

### 4.1 [M1] 원가 집계 (`/api/analysis/cost`)
- **GET `/staff`**
  ```json
  [ {
    "employeeId": 1, "employeeName": "김철수", "departmentName": "솔루션개발본부", "totalHours": 480.0, "hourlyRate": 47000, "totalLaborCost": 22560000,
    "projects": [ { "projectName": "A은행 차세대", "hours": 320.0, "cost": 15040000 } ]
  } ]
  ```
- **GET `/project`**
  ```json
  [ {
    "projectId": 1, "projectName": "A은행 차세대", "departmentName": "솔루션개발본부",
    "directLaborCost": 150000000, "projectDirectCost": 30000000, "allocatedOverhead": 25000000,
    "totalCost": 205000000, "contractAmount": 800000000, "profitRate": 74.4
  } ]
  ```
- **GET `/department`**: 본부별 총 직접원가/간접원가/매출 집계.
- **GET `/total`**: 전사 매출/원가/영업이익/비용구성비(Breakdown) 집계.

### 4.2 [M2] 내부대체가액 (`/api/analysis/transfer`)
- **GET `/pool`**: 지원본부별 Cost Pool(`laborCost`, `operatingCost`) 조회.
- **GET `/simulation`** (Query: `method=원가기준`, `driver=인원수`)
  ```json
  {
    "method": "원가기준", "driver": "인원수",
    "allocation": [ { "departmentName": "솔루션개발본부", "driverValue": 30, "driverRatio": 0.50, "allocatedAmount": 107500000 } ],
    "totalAllocated": 215000000
  }
  ```

### 4.3 [M3] 표준원가 배분 (`/api/analysis/standard`)
- **GET `/allocation`** (Query: `driver=인원수`)
  ```json
  [ { "projectId": 1, "projectName": "A은행 차세대", "standardDirectCost": 320000000, "allocatedOverhead": 50000000, "totalStandardCost": 370000000 } ]
  ```
- **GET `/compare`**: 프로젝트별 표준원가(`standardCost`) vs 실제원가(`actualCost`) 비교 및 판정(`judgement`: "F"/"U").

### 4.4 [M4] 원가 요인 분석 (`/api/analysis/variance`)
- **GET `/labor`**
  ```json
  {
    "projectId": 1, "standardLaborCost": 320000000, "actualLaborCost": 335000000, "totalVariance": 15000000,
    "rateVariance": { "amount": 3000000, "judgement": "U" },
    "efficiencyVariance": { "amount": 12000000, "judgement": "U" },
    "byGrade": [ { "gradeName": "과장/선임", "rateVariance": 4600000, "efficiencyVariance": 13500000 } ]
  }
  ```
- **GET `/overhead`**: 총 간접비 차이 및 `spendingVariance`, `efficiencyVariance`, `volumeVariance` 요인 분석.
- **GET `/budget`**: 프로젝트별 `budgetAmount`, `actualSpent`, 소진율(`burnRate`) 계산.
- **GET `/summary`**: 프로젝트별 총 차이금액 및 주 요인(`mainFactor`) 종합.

### 4.5 [M5] 성과 요인 분석 (`/api/analysis/performance`)
- **GET `/margin`**
  ```json
  [ { "departmentName": "솔루션개발본부", "revenue": 500000000, "directCost": 200000000, "transferPrice": 80000000, "contributionMargin": 220000000, "contributionMarginRate": 44.0 } ]
  ```
- **GET `/utilization`**: 본부별/직급별 평균 가동률 및 벤치(Bench) 인력 목록.
- **GET `/profit`**: 프로젝트별 매출/총원가/이익률 및 등급(A/B/C) 산출.
- **GET `/executive`**: 전사 영업이익률, 주의 요망 프로젝트 수 등 경영진 대시보드 지표.

---

## 5. 공통 규칙
- **에러 응답**: `{ "status": 400, "error": "Bad Request", "message": "필수 파라미터 누락" }`
- **날짜 형식**: `YYYY-MM-DD` (ISO 8601)
- **금액 단위**: 원(KRW) 정수형 (프론트엔드에서 쉼표 포맷팅 수행)
