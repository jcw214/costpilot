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

/** 네비게이션 메뉴 */
export const NAV_ITEMS = [
  { label: '전사 요약', href: '/', icon: '📊' },
  { label: '원가 집계', href: '/cost', icon: '💰' },
  { label: '내부대체가액', href: '/transfer', icon: '🔄' },
  { label: '표준원가 배분', href: '/standard', icon: '📐' },
  { label: '원가 요인 분석', href: '/variance', icon: '🔍' },
  { label: '성과 요인 분석', href: '/performance', icon: '📈' },
  { label: '기준 데이터', href: '/master', icon: '🗂️' },
  { label: '거래 데이터', href: '/transaction', icon: '📝' },
  { label: '설정', href: '/settings', icon: '⚙️' },
] as const;
