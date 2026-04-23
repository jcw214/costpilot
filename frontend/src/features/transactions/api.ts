import { apiClient } from '@/lib/api';
import { TimeEntry, DirectExpense, OverheadExpense } from './types';

export const transactionApi = {
  getTimeEntries: () => apiClient.get<TimeEntry[]>('/timesheets'),
  getDirectExpenses: () => apiClient.get<DirectExpense[]>('/project-direct-costs'),
  getOverheadExpenses: () => apiClient.get<OverheadExpense[]>('/overhead-costs'),
};
