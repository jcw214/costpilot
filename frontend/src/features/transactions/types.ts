export interface TimeEntry {
  id: number;
  employeeId: number;
  employeeName: string;
  projectId: number;
  projectName: string;
  activityType: string;
  workDate: string;
  hours: number;
}

export interface DirectExpense {
  id: number;
  projectId: number;
  projectName: string;
  costType: string;
  vendorName: string;
  description: string;
  amount: number;
  costDate: string;
}

export interface OverheadExpense {
  id: number;
  departmentId: number;
  departmentName: string;
  costCategory: string;
  amount: number;
  costMonth: string;
}
