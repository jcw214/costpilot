import { fetchApi } from '@/lib/api';
import { TimeEntry, DirectExpense, OverheadExpense } from './types';

export const transactionApi = {
  getTimeEntries: () => fetchApi<TimeEntry[]>('/timesheets'),
  getDirectExpenses: () => fetchApi<DirectExpense[]>('/project-direct-costs'),
  getOverheadExpenses: () => fetchApi<OverheadExpense[]>('/overhead-costs'),
};
