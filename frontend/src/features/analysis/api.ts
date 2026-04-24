import { fetchApi } from '@/lib/api';
import type {
  CostAggregation, TransferPricing, PricingMethod, CostDriver,
  StandardCostData, VarianceAnalysisData,
} from './types';

export async function getCostAggregation(): Promise<CostAggregation> {
  return fetchApi<CostAggregation>('/analysis/cost');
}

export async function getTransferPricing(method: PricingMethod, driver: CostDriver): Promise<TransferPricing[]> {
  return fetchApi<TransferPricing[]>('/analysis/transfer', { method, driver });
}

export async function getStandardCost(driver: CostDriver): Promise<StandardCostData> {
  return fetchApi<StandardCostData>('/analysis/standard', { driver });
}

export async function getVarianceAnalysis(): Promise<VarianceAnalysisData> {
  return fetchApi<VarianceAnalysisData>('/analysis/variance');
}
