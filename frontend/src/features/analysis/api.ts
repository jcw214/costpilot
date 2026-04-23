import { fetchApi } from '@/lib/api';
import type { CostAggregation, TransferPricing, PricingMethod } from './types';

export async function getCostAggregation(): Promise<CostAggregation> {
  return fetchApi<CostAggregation>('/analysis/cost');
}

export async function getTransferPricing(method: PricingMethod): Promise<TransferPricing[]> {
  return fetchApi<TransferPricing[]>('/analysis/transfer', { method });
}
