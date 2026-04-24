// ── Dashboard: 전사 요약 ──────────────────────────────────
export interface DepartmentContribution {
  departmentName: string;
  revenue: number;
  cost: number;
  contribution: number;
}

export interface ProjectProfitability {
  projectName: string;
  departmentName: string;
  contractAmount: number;
  actualCost: number;
  profit: number;
  profitRate: number;
}

export interface DashboardSummary {
  totalRevenue: number;
  totalCost: number;
  operatingMarginRate: number;
  averageUtilization: number;
  departmentContributions: DepartmentContribution[];
  projectProfitabilities: ProjectProfitability[];
}

// ── Performance: 성과 요인 분석 ───────────────────────────
export interface DepartmentPerformance {
  departmentName: string;
  revenue: number;
  cost: number;
  profit: number;
  profitRate: number;
  employeeCount: number;
  avgUtilization: number;
}

export interface ProjectPerformance {
  projectName: string;
  departmentName: string;
  contractAmount: number;
  laborCost: number;
  directExpense: number;
  totalCost: number;
  profit: number;
  profitRate: number;
  totalHours: number;
}

export interface EmployeeUtilization {
  employeeName: string;
  departmentName: string;
  jobGradeName: string;
  totalHours: number;
  standardHours: number;
  utilizationRate: number;
}

export interface PerformanceData {
  departmentPerformances: DepartmentPerformance[];
  projectPerformances: ProjectPerformance[];
  employeeUtilizations: EmployeeUtilization[];
}

// ── Settings: 표준원가기준 ────────────────────────────────
export interface StandardCostRateSetting {
  id: number;
  projectTypeName: string;
  jobGradeName: string;
  standardHourlyRate: number;
  standardHours: number;
  standardCost: number;
}

// ── Settings: 가격 정책 ───────────────────────────────────
export interface PricingMethodSetting {
  id: number;
  code: string;
  displayName: string;
  multiplier: number;
  enabled: boolean;
}

// ── Settings: 배부 기준 ───────────────────────────────────
export interface CostDriverSetting {
  id: number;
  code: string;
  displayName: string;
  description: string;
  enabled: boolean;
}
