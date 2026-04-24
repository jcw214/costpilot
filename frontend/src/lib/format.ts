/**
 * 금액 포맷: 120000000 → "120,000,000원"
 */
export function formatKRW(amount: number): string {
  return new Intl.NumberFormat('ko-KR').format(amount) + '원';
}

/**
 * 금액 요약: 120000000 → "1.2억"
 */
export function formatKRWShort(amount: number): string {
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (absAmount >= 100_000_000) {
    return `${sign}${(absAmount / 100_000_000).toFixed(1)}억`;
  }
  if (absAmount >= 10_000) {
    return `${sign}${(absAmount / 10_000).toFixed(0)}만`;
  }
  return `${sign}${absAmount.toLocaleString('ko-KR')}원`;
}

/**
 * 비율 포맷: 39.583 → "39.6%"
 */
export function formatRate(rate: number): string {
  return rate.toFixed(1) + '%';
}

/**
 * F/U 판정 색상
 */
export function judgementColor(judgement: 'F' | 'U'): string {
  return judgement === 'F' ? '#10B981' : '#EF4444';
}

/**
 * F/U 판정 라벨
 */
export function judgementLabel(judgement: 'F' | 'U'): string {
  return judgement === 'F' ? '유리(F)' : '불리(U)';
}
