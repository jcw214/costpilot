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
