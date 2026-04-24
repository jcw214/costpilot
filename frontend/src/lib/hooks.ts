'use client';

import useSWR, { SWRConfiguration } from 'swr';

/**
 * 범용 데이터 페칭 함수 (SWR fetcher)
 */
async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `API Error: ${res.status}`);
  }
  return res.json();
}

/**
 * SWR 기반 범용 데이터 패칭 훅
 *
 * @example
 * const { data, error, isLoading } = useFetch<CostAggregation>('/api/analysis/cost');
 */
export function useFetch<T>(
  path: string | null,
  config?: SWRConfiguration,
) {
  return useSWR<T>(
    path ? `/api${path}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
      ...config,
    },
  );
}

/**
 * 파라미터를 포함하는 SWR 훅
 *
 * @example
 * const { data } = useFetchWithParams<TransferPricing[]>('/analysis/transfer', { method: 'COST', driver: 'HEADCOUNT' });
 */
export function useFetchWithParams<T>(
  path: string | null,
  params?: Record<string, string>,
  config?: SWRConfiguration,
) {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  const key = path ? `/api${path}${query}` : null;
  return useSWR<T>(key, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 5000,
    ...config,
  });
}
