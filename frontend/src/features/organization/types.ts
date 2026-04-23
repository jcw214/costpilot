/** 본부 */
export interface Department {
  id: number;
  name: string;
  type: '수익' | '지원';
  employeeCount: number;
}

/** 직급 */
export interface JobGrade {
  id: number;
  code: string;
  name: string;
  standardHourlyRate: number;
}

/** 인력 */
export interface Employee {
  id: number;
  name: string;
  departmentName: string;
  jobGradeCode: string;
  jobGradeName: string;
  hourlyRate: number;
  standardHourlyRate: number;
}

/** 프로젝트 유형 */
export interface ProjectType {
  id: number;
  name: string;
}

/** 프로젝트 */
export interface Project {
  id: number;
  name: string;
  departmentName: string;
  projectTypeName: string;
  status: '진행중' | '완료';
  contractAmount: number;
  startDate: string;
  endDate: string;
}
