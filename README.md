# CostPilot

> 프로젝트 기반 서비스 기업을 위한 원가/관리회계 통합 대시보드

## 왜 엑셀이 아닌 시스템인가

엑셀은 계산 도구이고, CostPilot은 **의사결정 도구**입니다.

- **연쇄 재계산** — 배부 기준을 "인원수"에서 "매출액"으로 바꾸면, 엑셀에서는 관련 시트 5~6개를 수동 수정해야 합니다. CostPilot은 버튼 하나로 내부대체가액 → 표준원가 → 차이 분석까지 즉시 재계산합니다.
- **시뮬레이션** — 가격정책(원가/시장/협의) × 배부기준(인원수/매출액/투입공수)의 조합을 실시간 전환하며 본부별 부담 변화를 비교할 수 있습니다.
- **데이터 무결성** — 수정 가능한 필드를 핵심 4종으로 제한하여, 조직 규모가 커져도 엑셀 파일 하나의 실수로 전사 보고서가 틀어지는 문제를 원천 차단합니다.
- **접근성** — 웹 기반이므로 동시 접속이 가능하고, 향후 역할별 권한 분리(경영진은 조회, 관리자는 수정)로 확장할 수 있습니다.

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
├── docker-compose.local.yml  # 로컬 개발
└── .github/workflows/        # CI/CD 자동 배포
```

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

## 설계 결정

### 데이터 수정 범위를 제한한 이유

엔티티 간 연관관계(Employee → Department/JobGrade, Project → Department/ProjectType)가 깊어, 무분별한 Create/Delete는 데이터 무결성을 해칠 수 있습니다. **분석 결과에 직접 영향을 미치는 핵심 필드 4종**만 인라인 수정을 허용합니다.

| 수정 가능 항목 | 위치 | 영향 |
|---|---|---|
| 직급별 **표준시급** | 기준 데이터 → 직급 | 표준원가 기준, 차이 분석 |
| 직원 **실제시급** | 기준 데이터 → 인력 | 원가 집계, 임률차이 |
| 프로젝트 **계약매출** | 기준 데이터 → 프로젝트 | 이익률, 대시보드 KPI |
| 가격 정책 **배율** | 설정 → 가격 정책 | 내부대체가액 시뮬레이션 |

### 반응형 웹 & 공통 컴포넌트

- **768px 이하**: 사이드바 → 햄버거 메뉴 전환, 그리드 → 1열 배치, 테이블 → 가로 스크롤
- **로딩/에러 상태**: `LoadingSpinner`, `ErrorState` 공통 컴포넌트로 전 페이지 일관성 유지
- **정렬**: 모든 목록에 `SortableTable` 적용. 직급 열은 가나다 순이 아닌 **직급 체계 순서**(사원→대리→과장→차장→부장)로 정렬

### 인앱 도움말

각 페이지의 ❓ 아이콘으로 해당 화면에 특화된 가이드를 열 수 있습니다. 어떤 데이터가 수정 가능한지, 분석 로직이 어떻게 동작하는지를 실제 UI 용어와 동기화하여 안내합니다.

## 확장 로드맵

| 우선순위 | 기능 |
|---|---|
| 🔴 높음 | 엑셀 업로드 (템플릿 → 유효성 검증 → 벌크 등록) |
| 🔴 높음 | 대시보드 기간 동적 설정 (하드코딩 → 환경변수) |
| 🟡 보통 | 역할 기반 접근 제어 (RBAC) |
| 🟡 보통 | 거래 데이터 인라인 CRUD |
| 🟢 낮음 | PDF 리포트 내보내기, 다국어 지원 |
