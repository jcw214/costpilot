import { fetchApi, mutateApi } from '@/lib/api';
import type { Department, Employee, Project, ProjectType, JobGrade } from './types';

// ── 본부 ──────────────────────────────────────────────────
export async function getDepartments(type?: string): Promise<Department[]> {
  const params: Record<string, string> = {};
  if (type) params.type = type;
  return fetchApi<Department[]>('/departments', params);
}

// ── 인력 ──────────────────────────────────────────────────
export async function getEmployees(
  departmentId?: string,
  jobGradeId?: string,
): Promise<Employee[]> {
  const params: Record<string, string> = {};
  if (departmentId) params.departmentId = departmentId;
  if (jobGradeId) params.jobGradeId = jobGradeId;
  return fetchApi<Employee[]>('/employees', params);
}

// ── 프로젝트 ──────────────────────────────────────────────
export async function getProjects(
  departmentId?: string,
  status?: string,
): Promise<Project[]> {
  const params: Record<string, string> = {};
  if (departmentId) params.departmentId = departmentId;
  if (status) params.status = status;
  return fetchApi<Project[]>('/projects', params);
}

// ── 프로젝트 유형 ─────────────────────────────────────────
export async function getProjectTypes(): Promise<ProjectType[]> {
  return fetchApi<ProjectType[]>('/project-types');
}

// ── 직급 ──────────────────────────────────────────────────
export async function getJobGrades(): Promise<JobGrade[]> {
  return fetchApi<JobGrade[]>('/job-grades');
}

export async function updateJobGradeRate(
  id: number,
  standardHourlyRate: number,
): Promise<JobGrade> {
  return mutateApi<JobGrade>(`/job-grades/${id}`, 'PATCH', { standardHourlyRate });
}

export async function updateEmployeeHourlyRate(
  id: number,
  hourlyRate: number,
): Promise<Employee> {
  return mutateApi<Employee>(`/employees/${id}`, 'PATCH', { hourlyRate });
}

export async function updateProjectContractAmount(
  id: number,
  contractAmount: number,
): Promise<Project> {
  return mutateApi<Project>(`/projects/${id}`, 'PATCH', { contractAmount });
}
