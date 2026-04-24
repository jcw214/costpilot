import PerformanceView from '@/features/dashboard/components/PerformanceView';

export default function PerformancePage() {
  return (
    <>
      <div className="page-header">
        <h1 className="page-title">성과 요인 분석</h1>
        <p className="page-subtitle">본부·프로젝트 수익성과 인력 가동률 분석</p>
      </div>
      <PerformanceView />
    </>
  );
}
