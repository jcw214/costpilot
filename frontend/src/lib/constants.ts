/** 색상 팔레트 */
export const COLORS = {
  favorable: '#10B981',
  unfavorable: '#EF4444',
  neutral: '#6B7280',

  departments: ['#3B82F6', '#8B5CF6', '#F59E0B', '#06B6D4', '#EC4899'],

  series: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'],

  gradeA: '#10B981',
  gradeB: '#F59E0B',
  gradeC: '#EF4444',
} as const;

/**
 * [추후 확장 가능] 권한 계층 — 역할별 메뉴 접근 제어가 필요할 때 활성화
 *
 * export const ROLE_HIERARCHY: Record<string, number> = {
 *   ROLE_ADMIN: 0,    // 시스템 관리자
 *   ROLE_DIRECTOR: 1, // 경영진/본부장
 *   ROLE_PM: 2,       // 프로젝트 관리자
 *   ROLE_USER: 3,     // 일반 사용자
 * };
 */

/** 네비게이션 메뉴 — 로그인한 모든 사용자에게 전체 메뉴 노출 */
export const NAV_ITEMS = [
  { label: '대시보드', href: '/', icon: '📊' },
  { label: '원가 집계', href: '/cost', icon: '💰' },
  { label: '내부대체가액', href: '/transfer', icon: '🔄' },
  { label: '표준원가 배분', href: '/standard', icon: '📐' },
  { label: '원가 요인 분석', href: '/variance', icon: '🔍' },
  { label: '성과 요인 분석', href: '/performance', icon: '📈' },
  { label: '기준 데이터', href: '/master', icon: '🗂️' },
  { label: '거래 데이터', href: '/transaction', icon: '📝' },
  { label: '설정', href: '/settings', icon: '⚙️' },
] as const;
