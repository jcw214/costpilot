import DashboardView from '@/features/dashboard/components/DashboardView';

export default function HomePage() {
  return (
    <>
      <div className="page-header">
        <h1 className="page-title">전사 경영 성과 요약</h1>
        <p className="page-subtitle">파일럿솔루션(주) · 2026년 1분기</p>
      </div>
      <DashboardView />
    </>
  );
}
