package com.costpilot.auth.domain;

public enum RoleType {
    ROLE_ADMIN,      // 시스템 관리자: 모든 기능 접근
    ROLE_DIRECTOR,   // 경영진/본부장: 대시보드 + 분석 전체
    ROLE_PM,         // 프로젝트 관리자: 프로젝트 관련 조회
    ROLE_USER        // 일반 사용자: 본인 데이터만 조회
}
