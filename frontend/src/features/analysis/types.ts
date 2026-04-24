// ── M1: 원가 집계 ─────────────────────────────────────────
export interface EmployeeCost {
  employeeName: string;
  hours: number;
  laborCost: number;
}

export interface ProjectCost {
  projectName: string;
  directExpense: number;
  laborCost: number;
  totalProjectCost: number;
  employees: EmployeeCost[];
}

export interface DepartmentCost {
  departmentName: string;
  totalCost: number;
  projects: ProjectCost[];
}

export interface CostAggregation {
  companyTotalCost: number;
  departments: DepartmentCost[];
}

// ── M2: 내부대체가액 ──────────────────────────────────────
export interface Allocation {
  revenueDepartmentName: string;
  driverRatio: number;
  allocatedAmount: number;
}

export interface TransferPricing {
  supportDepartmentName: string;
  totalOverheadCost: number;
  pricingMethod: string;
  costDriver: string;
  allocations: Allocation[];
}

export type PricingMethod = 'COST' | 'MARKET' | 'NEGOTIATED';
export type CostDriver = 'HEADCOUNT' | 'REVENUE' | 'LABOR_HOURS';

// ── M3: 표준원가 배분 ────────────────────────────────────
export interface StandardRate {
  projectTypeName: string;
  jobGradeName: string;
  standardHourlyRate: number;
  standardHours: number;
  standardCost: number;
}

export interface ProjectAllocation {
  projectName: string;
  departmentName: string;
  standardCost: number;
  allocatedOverhead: number;
  totalStandardCost: number;
}

export interface ProjectComparison {
  projectName: string;
  departmentName: string;
  standardCost: number;
  actualCost: number;
  variance: number;
  varianceRate: number;
  verdict: string;
}

export interface StandardCostData {
  standardRates: StandardRate[];
  projectAllocations: ProjectAllocation[];
  comparisons: ProjectComparison[];
}

// ── M4: 원가 요인 분석 ───────────────────────────────────
export interface LaborVariance {
  projectName: string;
  departmentName: string;
  standardLaborCost: number;
  actualLaborCost: number;
  rateVariance: number;
  rateVerdict: string;
  efficiencyVariance: number;
  efficiencyVerdict: string;
  totalVariance: number;
  totalVerdict: string;
}

export interface OverheadVariance {
  actualOverhead: number;
  budgetedOverhead: number;
  spendingVariance: number;
  spendingVerdict: string;
  efficiencyVariance: number;
  efficiencyVerdict: string;
  volumeVariance: number;
  volumeVerdict: string;
  totalVariance: number;
  totalVerdict: string;
}

export interface BudgetConsumption {
  projectName: string;
  departmentName: string;
  budgetAmount: number;
  actualSpent: number;
  consumptionRate: number;
  status: string;
}

export interface VarianceSummary {
  projectName: string;
  departmentName: string;
  totalVariance: number;
  verdict: string;
  rateVariance: number;
  efficiencyVariance: number;
  overheadVariance: number;
}

export interface VarianceAnalysisData {
  laborVariances: LaborVariance[];
  overheadVariance: OverheadVariance;
  budgetConsumptions: BudgetConsumption[];
  summaries: VarianceSummary[];
}
