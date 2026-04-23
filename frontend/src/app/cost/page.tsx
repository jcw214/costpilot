import CostView from '@/features/analysis/components/CostView';

export default function CostPage() {
  return (
    <>
      <div className="page-header">
        <h1 className="page-title">원가 집계</h1>
        <p className="page-subtitle">인력→프로젝트→본부→전사 4단계 Drill-Down 원가 조회</p>
      </div>
      <div className="chart-container">
        <CostView />
      </div>
    </>
  );
}
