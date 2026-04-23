'use client';

import styles from './TabGroup.module.css';

interface Tab {
  key: string;
  label: string;
  icon?: string;
}

interface TabGroupProps {
  tabs: Tab[];
  activeKey: string;
  onChange: (key: string) => void;
}

export default function TabGroup({ tabs, activeKey, onChange }: TabGroupProps) {
  return (
    <div className={styles.tabGroup}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`${styles.tab} ${activeKey === tab.key ? styles.active : ''}`}
          onClick={() => onChange(tab.key)}
        >
          {tab.icon && <span className={styles.tabIcon}>{tab.icon}</span>}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
