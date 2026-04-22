# 📋 백엔드 아키텍처: CostPilot

> **작성일**: 2026-04-22  
> **작성자**: 정찬우  
> **아키텍처**: Hexagonal (Ports & Adapters) + 도메인 기반 패키지

---

## 1. 아키텍처 개요

### 1.1 헥사고날 아키텍처 원칙

```
              [Inbound Adapter]              [Outbound Adapter]
              REST Controller                JPA Repository
                    │                              ▲
                    ▼                              │
              [Inbound Port]               [Outbound Port]
              UseCase 인터페이스           Repository 인터페이스
                    │                              ▲
                    └──────► Domain ◄──────────────┘
                         (Entity, Service)
```

- **Domain**: 비즈니스 로직 핵심. 프레임워크 비의존
- **Port**: UseCase(in) / Repository(out) 인터페이스
- **Adapter**: Controller(in) / JpaRepository(out) 구현체

### 1.2 BFF 구조와 네트워크 격리

```
[브라우저] ──HTTPS──► [Next.js (BFF)] ──Docker 내부망──► [Spring Boot] ──JDBC──► [PostgreSQL]
                      Port 3033                         Port 8033              Port 5533
                      (외부 노출)                       (내부 전용)             (내부 전용)
```

- **Backend는 외부에 직접 노출되지 않음** → Next.js API Routes가 프록시
- Frontend가 세션/인증 관리 담당, Backend는 순수 비즈니스 API에 집중

---

## 2. 도메인 구성

### 2.1 역할자

| 역할 | 설명 | 접근 범위 |
|---|---|---|
| **관리자** | 시스템 유일 사용자 | 모든 도메인 전체 접근 |

> 단일 역할이므로 인증/인가 모듈은 생략. 확장 시 Spring Security + RBAC 추가 가능.

### 2.2 도메인 모듈 구성 (기능 단위)

```
costpilot-backend
│
├── global              ← 공통 (설정, 예외, DataInitializer)
│
├── organization        ← 조직·인사 마스터 데이터 (Read Only)
│   (Department, JobGrade, Employee, ProjectType, Project)
│
├── timesheet           ← 공수 관리 — 핵심 거래 입력 (Full CRUD)
│   (Timesheet)
│
├── expense             ← 비용 관리 — 외주비·간접비 (Full CRUD)
│   (OutsourcingCost, OverheadCost)
│
├── budget              ← 예산·표준원가 관리 (CRUD / CRU)
│   (Budget, StandardCost)
│
└── analysis            ← 분석 엔진 — M1~M5 (엔티티 없음, GET 전용)
    ├── cost            ← M1 원가 집계
    ├── transfer        ← M2 내부대체가액
    ├── standard        ← M3 표준원가 배분
    ├── variance        ← M4 원가 요인 분석
    └── performance     ← M5 성과 요인 분석
```

| 도메인 | 역할 | 엔티티 | API |
|---|---|---|---|
| **organization** | 조직 구조·인력 기준 정보 | Department, JobGrade, Employee, ProjectType, Project | GET (+PATCH 표준시급) |
| **timesheet** | 누가 어디에 몇 시간 투입했는지 | Timesheet | Full CRUD |
| **expense** | 프로젝트 외주비, 지원본부 간접비 | OutsourcingCost, OverheadCost | Full CRUD |
| **budget** | 프로젝트 예산, 유형별 표준 공수 | Budget, StandardCost | CRUD / PATCH |
| **analysis** | 위 데이터를 조합·계산하는 분석 엔진 | 없음 | GET 전용 |

> timesheet(실적·공수) / expense(실적·비용) / budget(계획·기준) / analysis(조합·계산) — 성격이 다른 데이터를 각각 분리

---

## 3. 패키지 구조

```
backend/src/main/java/com/costpilot/
├── CostPilotApplication.java
│
├── global/
│   ├── config/
│   │   ├── WebConfig.java
│   │   └── DataInitializer.java
│   ├── exception/
│   │   ├── GlobalExceptionHandler.java
│   │   └── ResourceNotFoundException.java
│   └── dto/
│       └── ErrorResponse.java
│
├── organization/                          ← 조직·인사
│   ├── domain/
│   │   ├── Department.java
│   │   ├── JobGrade.java
│   │   ├── Employee.java
│   │   ├── ProjectType.java
│   │   └── Project.java
│   ├── application/
│   │   ├── port/
│   │   │   ├── in/OrganizationQueryUseCase.java
│   │   │   └── out/
│   │   │       ├── DepartmentRepository.java
│   │   │       ├── EmployeeRepository.java
│   │   │       ├── ProjectRepository.java
│   │   │       ├── ProjectTypeRepository.java
│   │   │       └── JobGradeRepository.java
│   │   └── service/OrganizationQueryService.java
│   └── adapter/
│       ├── in/web/
│       │   ├── DepartmentController.java
│       │   ├── EmployeeController.java
│       │   ├── ProjectController.java
│       │   ├── ProjectTypeController.java
│       │   ├── JobGradeController.java
│       │   └── dto/
│       │       ├── EmployeeResponse.java
│       │       └── ProjectResponse.java
│       └── out/persistence/
│           └── (JpaRepository 구현체 5개)
│
├── timesheet/                             ← 공수 관리
│   ├── domain/Timesheet.java
│   ├── application/
│   │   ├── port/
│   │   │   ├── in/TimesheetUseCase.java
│   │   │   └── out/TimesheetRepository.java
│   │   └── service/TimesheetService.java
│   └── adapter/
│       ├── in/web/
│       │   ├── TimesheetController.java
│       │   └── dto/TimesheetRequest.java
│       └── out/persistence/TimesheetJpaRepository.java
│
├── expense/                               ← 비용 관리
│   ├── domain/
│   │   ├── OutsourcingCost.java
│   │   └── OverheadCost.java
│   ├── application/
│   │   ├── port/
│   │   │   ├── in/
│   │   │   │   ├── OutsourcingCostUseCase.java
│   │   │   │   └── OverheadCostUseCase.java
│   │   │   └── out/
│   │   │       ├── OutsourcingCostRepository.java
│   │   │       └── OverheadCostRepository.java
│   │   └── service/
│   │       ├── OutsourcingCostService.java
│   │       └── OverheadCostService.java
│   └── adapter/
│       ├── in/web/
│       │   ├── OutsourcingCostController.java
│       │   ├── OverheadCostController.java
│       │   └── dto/
│       │       ├── OutsourcingCostRequest.java
│       │       └── OverheadCostRequest.java
│       └── out/persistence/
│           ├── OutsourcingCostJpaRepository.java
│           └── OverheadCostJpaRepository.java
│
├── budget/                                ← 예산·표준원가
│   ├── domain/
│   │   ├── Budget.java
│   │   └── StandardCost.java
│   ├── application/
│   │   ├── port/
│   │   │   ├── in/
│   │   │   │   ├── BudgetUseCase.java
│   │   │   │   └── StandardCostUseCase.java
│   │   │   └── out/
│   │   │       ├── BudgetRepository.java
│   │   │       └── StandardCostRepository.java
│   │   └── service/
│   │       ├── BudgetService.java
│   │       └── StandardCostService.java
│   └── adapter/
│       ├── in/web/
│       │   ├── BudgetController.java
│       │   ├── StandardCostController.java
│       │   └── dto/BudgetRequest.java
│       └── out/persistence/
│           ├── BudgetJpaRepository.java
│           └── StandardCostJpaRepository.java
│
└── analysis/                              ← 분석 엔진 (M1~M5)
    ├── cost/                              ← M1 원가 집계
    │   ├── application/
    │   │   ├── port/in/CostAnalysisUseCase.java
    │   │   └── service/CostAnalysisService.java
    │   └── adapter/in/web/
    │       ├── CostAnalysisController.java
    │       └── dto/ (CostStaffResponse, CostProjectResponse ...)
    │
    ├── transfer/                          ← M2 내부대체가액
    │   ├── application/
    │   │   ├── port/in/TransferAnalysisUseCase.java
    │   │   └── service/TransferAnalysisService.java
    │   └── adapter/in/web/
    │       ├── TransferAnalysisController.java
    │       └── dto/ (TransferSimulationResponse ...)
    │
    ├── standard/                          ← M3 표준원가 배분
    │   ├── application/
    │   │   ├── port/in/StandardAnalysisUseCase.java
    │   │   └── service/StandardAnalysisService.java
    │   └── adapter/in/web/
    │       ├── StandardAnalysisController.java
    │       └── dto/ (StandardCompareResponse ...)
    │
    ├── variance/                          ← M4 원가 요인 분석
    │   ├── application/
    │   │   ├── port/in/VarianceAnalysisUseCase.java
    │   │   └── service/VarianceAnalysisService.java
    │   └── adapter/in/web/
    │       ├── VarianceAnalysisController.java
    │       └── dto/ (VarianceLaborResponse, VarianceOverheadResponse ...)
    │
    └── performance/                       ← M5 성과 요인 분석
        ├── application/
        │   ├── port/in/PerformanceAnalysisUseCase.java
        │   └── service/PerformanceAnalysisService.java
        └── adapter/in/web/
            ├── PerformanceAnalysisController.java
            └── dto/ (PerformanceMarginResponse, ExecutiveSummaryResponse ...)
```

---

## 4. 도메인 간 의존성

```
analysis/cost        ──► timesheet (TimesheetRepository)
                     ──► expense   (OutsourcingCostRepository, OverheadCostRepository)
                     ──► organization (EmployeeRepository)

analysis/transfer    ──► expense   (OverheadCostRepository)
                     ──► organization (DepartmentRepository, EmployeeRepository, ProjectRepository)
                     ──► timesheet (TimesheetRepository)

analysis/standard    ──► budget    (StandardCostRepository)
                     ──► organization (JobGradeRepository)

analysis/variance    ──► timesheet (TimesheetRepository)
                     ──► organization (EmployeeRepository, JobGradeRepository)
                     ──► budget    (StandardCostRepository, BudgetRepository)

analysis/performance ──► organization (ProjectRepository, DepartmentRepository)
                     ──► analysis/cost (CostAnalysisUseCase 재사용)
                     ──► analysis/transfer (TransferAnalysisUseCase 재사용)
```

> **규칙**: 화살표는 단방향. analysis → 다른 도메인만 허용. 역방향 의존 금지.

---

## 5. 핵심 분석 로직 (의사코드)

### VAR-LABOR (직접노무비 차이 분석)

```java
// variance/application/service/VarianceAnalysisService.java
public VarianceLaborResponse analyzeLaborVariance(Long projectId, LocalDate start, LocalDate end) {
    // 1. timesheetRepo → 프로젝트 투입 데이터 직급별 GROUP BY
    // 2. employeeRepo → 실제 임률 (hourlyRate)
    // 3. jobGradeRepo → 표준 임률 (standardHourlyRate)
    // 4. standardCostRepo → 표준 공수 (standardHours)
    // 5. 직급별 차이 계산:
    //    rateVariance      = (actualRate - standardRate) × actualHours
    //    efficiencyVariance = (actualHours - standardHours) × standardRate
    //    judgement          = variance > 0 ? "U" : "F"
}
```

### TRANSFER-SIM (내부대체가액 시뮬레이션)

```java
// transfer/application/service/TransferAnalysisService.java
public TransferSimulationResponse simulate(String method, String driver, ...) {
    // 1. overheadCostRepo → Cost Pool (지원본부 비용 합계)
    // 2. Driver 산출: 인원수 | 매출비율 | 투입공수
    // 3. driverRatio = 해당 본부 Driver / 전체 수익본부 Driver
    // 4. method별 배부:
    //    원가기준     → costPool × driverRatio
    //    시장가격기준 → costPool × driverRatio × marketPremiumRate
    //    협의가격     → costPool × (1 + targetMarginRate) × driverRatio
}
```

---

## 6. 인프라 설정

### application.yml

```yaml
spring:
  datasource:
    url: jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5533}/${DB_NAME:costpilot}
    username: ${DB_USERNAME:?DB_USERNAME 미설정}
    password: ${DB_PASSWORD:?DB_PASSWORD 미설정}
  jpa:
    hibernate:
      ddl-auto: update
    open-in-view: false
    properties:
      hibernate:
        default_batch_fetch_size: 100

server:
  port: ${BACKEND_PORT:8033}
```

### Dockerfile

```dockerfile
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY . .
RUN ./gradlew bootJar --no-daemon

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8033
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### DataInitializer

```java
@Component @RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    @Override @Transactional
    public void run(String... args) {
        if (departmentRepository.count() > 0) return;
        // 순서: departments → jobGrades → projectTypes → employees
        //       → projects → standardCosts → timesheets
        //       → outsourcingCosts → overheadCosts → budgets
    }
}
```

---

## 7. 요청 흐름 예시

```
[브라우저]  GET /api/analysis/variance/labor?projectId=1
    │
    ▼
[Next.js BFF]  /app/api/analysis/variance/labor/route.ts
  → fetch("http://backend:8033/api/analysis/variance/labor?projectId=1")
    │
    ▼
[variance/VarianceAnalysisController]
  → varianceAnalysisUseCase.analyzeLaborVariance(...)
    │
    ▼
[variance/VarianceAnalysisService]
  → timesheetRepo (timesheet 도메인)      → 실제 투입시간
  → employeeRepo (organization 도메인)    → 실제 임률
  → jobGradeRepo (organization 도메인)    → 표준 임률
  → standardCostRepo (budget 도메인)      → 표준 공수
  → 직급별 임률차이/능률차이 계산
    │
    ▼
[JSON 응답] → Next.js → 브라우저
```

---

> **다음 단계**: `06_frontend_architecture.md` — 프론트엔드 아키텍처 작성
