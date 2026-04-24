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

/** 권한 계층 (숫자가 낮을수록 높은 권한) */
export const ROLE_HIERARCHY: Record<string, number> = {
  ROLE_ADMIN: 0,
  ROLE_DIRECTOR: 1,
  ROLE_PM: 2,
  ROLE_USER: 3,
};

/** 네비게이션 메뉴 (minRole: 해당 메뉴에 접근 가능한 최소 권한 레벨) */
export const NAV_ITEMS = [
  { label: '대시보드', href: '/', icon: '📊', minRole: 'ROLE_USER' },
  { label: '원가 집계', href: '/cost', icon: '💰', minRole: 'ROLE_PM' },
  { label: '내부대체가액', href: '/transfer', icon: '🔄', minRole: 'ROLE_DIRECTOR' },
  { label: '표준원가 배분', href: '/standard', icon: '📐', minRole: 'ROLE_DIRECTOR' },
  { label: '원가 요인 분석', href: '/variance', icon: '🔍', minRole: 'ROLE_DIRECTOR' },
  { label: '성과 요인 분석', href: '/performance', icon: '📈', minRole: 'ROLE_DIRECTOR' },
  { label: '기준 데이터', href: '/master', icon: '🗂️', minRole: 'ROLE_PM' },
  { label: '거래 데이터', href: '/transaction', icon: '📝', minRole: 'ROLE_PM' },
  { label: '설정', href: '/settings', icon: '⚙️', minRole: 'ROLE_ADMIN' },
] as const;

/** 특정 역할이 메뉴에 접근 가능한지 확인 */
export function hasAccess(userRole: string, minRole: string): boolean {
  const userLevel = ROLE_HIERARCHY[userRole] ?? 99;
  const requiredLevel = ROLE_HIERARCHY[minRole] ?? 0;
  return userLevel <= requiredLevel;
}
