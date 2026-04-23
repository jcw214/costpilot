'use client';

import { useState } from 'react';
import TabGroup from '@/components/ui/TabGroup';
import DepartmentTab from './components/DepartmentTab';
import EmployeeTab from './components/EmployeeTab';
import ProjectTab from './components/ProjectTab';
import JobGradeTab from './components/JobGradeTab';
import ProjectTypeTab from './components/ProjectTypeTab';

const TABS = [
  { key: 'departments', label: '본부', icon: '🏢' },
  { key: 'employees', label: '인력', icon: '👤' },
  { key: 'projects', label: '프로젝트', icon: '📁' },
  { key: 'jobGrades', label: '직급', icon: '🏅' },
  { key: 'projectTypes', label: '프로젝트 유형', icon: '📋' },
];

export default function MasterView() {
  const [activeTab, setActiveTab] = useState('departments');

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">기준 데이터</h1>
        <p className="page-subtitle">본부, 인력, 프로젝트, 직급, 유형 기준 데이터 조회</p>
      </div>
      <TabGroup tabs={TABS} activeKey={activeTab} onChange={setActiveTab} />
      {activeTab === 'departments' && <DepartmentTab />}
      {activeTab === 'employees' && <EmployeeTab />}
      {activeTab === 'projects' && <ProjectTab />}
      {activeTab === 'jobGrades' && <JobGradeTab />}
      {activeTab === 'projectTypes' && <ProjectTypeTab />}
    </>
  );
}
