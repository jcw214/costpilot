'use client';

import { useState } from 'react';
import TabGroup from '@/components/ui/TabGroup';
import TimeEntryTab from './components/TimeEntryTab';
import DirectExpenseTab from './components/DirectExpenseTab';
import OverheadExpenseTab from './components/OverheadExpenseTab';

export default function TransactionView() {
  const [activeTab, setActiveTab] = useState('timesheets');

  const tabs = [
    { id: 'timesheets', label: '투입 공수' },
    { id: 'direct-costs', label: '직접경비(외주비 등)' },
    { id: 'overhead-costs', label: '간접경비(운영비 등)' },
  ];

  return (
    <div>
      <TabGroup tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      
      <div style={{ marginTop: '1.5rem' }}>
        {activeTab === 'timesheets' && <TimeEntryTab />}
        {activeTab === 'direct-costs' && <DirectExpenseTab />}
        {activeTab === 'overhead-costs' && <OverheadExpenseTab />}
      </div>
    </div>
  );
}
