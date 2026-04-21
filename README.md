# CostPilot

> 프로젝트 기반 서비스 기업을 위한 원가/관리회계 통합 대시보드 시스템

인력, 프로젝트, 본부, 전사 단위의 **원가 집계**, **내부대체가액 산정**, **표준원가 배분**, **원가/성과 요인 분석**을 수행합니다.

## 주요 기능

| 모듈 | 설명 |
|---|---|
| **원가 집계** | 인력→프로젝트→본부→전사 4단계 Drill-Down 원가 조회 |
| **내부대체가액** | 지원본부 Cost Pool의 원가/시장가/협의가 기준 배부 시뮬레이션 |
| **표준원가 배분** | 직급별 표준시급·유형별 표준공수 기반 배분 및 실제 비교 |
| **원가 요인 분석** | 직접노무비(임률·능률) / 간접원가(예산·능률·조업도) 차이 분석 |
| **성과 요인 분석** | 본부별 공헌이익, 인력 가동률, 프로젝트 수익성 등급 |

## 기술 스택

| 계층 | 기술 |
|---|---|
| Frontend | Next.js 14 (TypeScript) + Recharts |
| Backend | Spring Boot 3.x (Java 21) + JPA |
| Database | PostgreSQL 17 |
| Infra | Docker Compose, GitHub Actions CI/CD |

## 운영 환경

- 5개 본부 (수익 3 + 지원 2)
- 20개 프로젝트 동시 수행
- 80명 인력 Mock Data

## 실행 방법

```bash
# 1. 환경변수 설정
cp .env.example .env
# .env 파일의 DB_USERNAME, DB_PASSWORD 등을 수정

# 2. 실행
docker compose up --build -d


costpilot/
├── .agents/rules/          # 설계 문서
│   ├── 01_project_plan.md
│   ├── 02_requirements_spec.md
│   ├── 03_erd.md
│   └── 04_api_spec.md
├── backend/                # Spring Boot API 서버
├── frontend/               # Next.js 대시보드
├── docker-compose.yml      # 운영 배포
├── docker-compose.local.yml # 로컬 개발
└── .github/workflows/      # CI/CD

