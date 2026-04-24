import VarianceView from '@/features/analysis/components/VarianceView';

export default function VariancePage() {
  return (
    <>
      <div className="page-header">
        <h1 className="page-title">원가 요인 분석</h1>
        <p className="page-subtitle">직접노무비(임률·능률) / 간접원가(예산·능률·조업도) 차이 분석</p>
      </div>
      <div className="chart-container">
        <VarianceView />
      </div>
    </>
  );
}
