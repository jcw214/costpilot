import StandardView from '@/features/analysis/components/StandardView';

export default function StandardPage() {
  return (
    <>
      <div className="page-header">
        <h1 className="page-title">표준원가 배분</h1>
        <p className="page-subtitle">직급별 표준시급 · 유형별 표준공수 기반 배분 및 표준 vs. 실제 비교</p>
      </div>
      <div className="chart-container">
        <StandardView />
      </div>
    </>
  );
}
