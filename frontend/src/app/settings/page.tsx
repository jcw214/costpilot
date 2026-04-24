import SettingsView from '@/features/dashboard/components/SettingsView';

export default function SettingsPage() {
  return (
    <>
      <div className="page-header">
        <h1 className="page-title">설정</h1>
        <p className="page-subtitle">표준공수 기준 조회 및 수정</p>
      </div>
      <SettingsView />
    </>
  );
}
