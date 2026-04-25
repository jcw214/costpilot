# CostPilot

> 프로젝트 기반 서비스 기업을 위한 원가/관리회계 통합 대시보드

인력·프로젝트·본부 단위의 원가 집계, 내부대체가액 산정, 표준원가 배분, 원가/성과 요인 분석을 하나의 시스템에서 수행합니다. 배부 기준이나 가격 정책을 변경하면 관련 분석 결과가 즉시 재계산되어 실시간 시뮬레이션을 제공합니다.

## 주요 기능

| 모듈 | 설명 |
|---|---|
| **대시보드** | 매출·총원가·이익률·가동률 KPI + 본부별 공헌이익 차트 |
| **원가 집계** | 전사→본부→프로젝트→인력 4단계 Drill-Down |
| **내부대체가액** | 가격정책 × 배부기준 실시간 시뮬레이션 |
| **표준원가 배분** | 직급별 표준시급·유형별 표준공수 기반 표준 vs 실제 비교 |
| **원가 요인 분석** | 임률·능률·예산·조업도 3분법 차이 분석 |
| **성과 요인 분석** | 본부 수익성, 프로젝트 이익률, 인력 가동률 |
| **기준 데이터** | 본부·인력·프로젝트·직급 마스터 관리 (✏️ 실제시급, 계약매출, 표준시급 수정 가능) |
| **설정** | 표준원가 기준표(참조), 가격 정책 배율·활성화 관리 |

## 기술 스택

| 계층 | 기술 |
|---|---|
| Frontend | Next.js 14 (TypeScript), Recharts, CSS Modules |
| Backend | Spring Boot 3.4 (Java 21), JPA, Hexagonal Architecture |
| Database | PostgreSQL 17 |
| Infra | Docker Compose, GitHub Actions (self-hosted runner) |

## 프로젝트 구조

```
costpilot/
├── docs/                     # 설계 문서 6종
├── backend/                  # Spring Boot API
│   └── src/main/java/com/costpilot/
│       ├── organization/     # 본부·인력·프로젝트 (Hexagonal)
│       ├── analysis/         # 원가 집계·내부대체·표준원가·차이 분석
│       ├── budget/           # 표준원가율
│       ├── dashboard/        # KPI·성과 분석
│       └── global/           # 보안(JWT), 예외 처리, 초기 데이터
├── frontend/                 # Next.js 대시보드
│   ├── src/app/              # 9개 페이지 (App Router)
│   ├── src/components/       # 공통 UI (SortableTable, LoadingSpinner, HelpPanel 등)
│   ├── src/features/         # 도메인별 기능 모듈
│   └── src/lib/              # API, 포맷, 도움말 콘텐츠
├── docker-compose.yml        # 운영 배포
└── .github/workflows/        # CI/CD 자동 배포
```

## 설계 문서

[`docs/`](docs/) 폴더에서 전체 설계 문서를 확인할 수 있습니다.

| 문서 | 내용 |
|---|---|
| [01_project_plan.md](docs/01_project_plan.md) | 프로젝트 기획서 |
| [02_requirements_spec.md](docs/02_requirements_spec.md) | 요구사항 명세서 |
| [03_erd.md](docs/03_erd.md) | ERD |
| [04_api_spec.md](docs/04_api_spec.md) | API 명세서 |
| [05_backend_architecture.md](docs/05_backend_architecture.md) | 백엔드 아키텍처 |
| [06_frontend_architecture.md](docs/06_frontend_architecture.md) | 프론트엔드 아키텍처 |

## 실행 방법

```bash
# 환경변수 설정
cp .env.example .env   # DB_USERNAME, DB_PASSWORD 등 수정

# 로컬 개발
docker compose -f docker-compose.local.yml up -d
# → http://localhost:3033

# 프로덕션 배포
docker compose up --build -d
```

## 확장 로드맵

| 우선순위 | 기능 |
|---|---|
| 🔴 높음 | 엑셀 업로드 (템플릿 → 유효성 검증 → 벌크 등록) |
| 🔴 높음 | 대시보드 기간 동적 설정 |
| 🟡 보통 | 역할 기반 접근 제어 (RBAC) |
| 🟡 보통 | 거래 데이터 인라인 CRUD |
| 🟢 낮음 | 다국어 지원 |
