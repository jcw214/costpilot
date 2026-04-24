'use client';

import { useState } from 'react';
import TabGroup from '@/components/ui/TabGroup';
import TimeEntryTab from './components/TimeEntryTab';
import DirectExpenseTab from './components/DirectExpenseTab';
import OverheadExpenseTab from './components/OverheadExpenseTab';
import DataUploadModal from '@/components/ui/DataUploadModal';

export default function TransactionView() {
  const [activeTab, setActiveTab] = useState('timesheets');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const tabs = [
    { key: 'timesheets', label: '투입 공수' },
    { key: 'direct-costs', label: '직접경비(외주비 등)' },
    { key: 'overhead-costs', label: '간접경비(운영비 등)' },
  ];

  const currentTabLabel = tabs.find((t) => t.key === activeTab)?.label || '';

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">거래 데이터</h1>
          <p className="page-subtitle">투입 공수, 외주비, 간접비, 예산 데이터 확인 및 업로드</p>
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

      <div className="chart-container">
        <TabGroup tabs={tabs} activeKey={activeTab} onChange={setActiveTab} />
        
        <div style={{ marginTop: '1.5rem' }}>
          {activeTab === 'timesheets' && <TimeEntryTab />}
          {activeTab === 'direct-costs' && <DirectExpenseTab />}
          {activeTab === 'overhead-costs' && <OverheadExpenseTab />}
        </div>
      </div>

      <DataUploadModal 
        title={currentTabLabel}
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />
    </>
  );
}
