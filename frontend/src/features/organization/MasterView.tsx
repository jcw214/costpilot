'use client';

import { useState } from 'react';
import TabGroup from '@/components/ui/TabGroup';
import DepartmentTab from './components/DepartmentTab';
import EmployeeTab from './components/EmployeeTab';
import ProjectTab from './components/ProjectTab';
import JobGradeTab from './components/JobGradeTab';
import ProjectTypeTab from './components/ProjectTypeTab';
import DataUploadModal from '@/components/ui/DataUploadModal';

const TABS = [
  { key: 'departments', label: '본부', icon: '🏢' },
  { key: 'employees', label: '인력', icon: '👤' },
  { key: 'projects', label: '프로젝트', icon: '📁' },
  { key: 'jobGrades', label: '직급', icon: '🏅' },
  { key: 'projectTypes', label: '프로젝트 유형', icon: '📋' },
];

export default function MasterView() {
  const [activeTab, setActiveTab] = useState('departments');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const currentTabLabel = TABS.find((t) => t.key === activeTab)?.label || '';

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">기준 데이터</h1>
          <p className="page-subtitle">본부, 인력, 프로젝트, 직급, 유형 기준 데이터 조회</p>
        </div>
        <button 
          onClick={() => setIsUploadOpen(true)}
          style={{
            background: 'var(--accent)', color: 'white', border: 'none', 
            padding: '8px 16px', borderRadius: '6px', fontWeight: 600, 
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)'
          }}
        >
          <span>📥</span> 데이터 업로드
        </button>
      </div>
      
      <TabGroup tabs={TABS} activeKey={activeTab} onChange={setActiveTab} />
      
      {activeTab === 'departments' && <DepartmentTab />}
      {activeTab === 'employees' && <EmployeeTab />}
      {activeTab === 'projects' && <ProjectTab />}
      {activeTab === 'jobGrades' && <JobGradeTab />}
      {activeTab === 'projectTypes' && <ProjectTypeTab />}

      <DataUploadModal 
        title={currentTabLabel}
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />
    </>
  );
}
