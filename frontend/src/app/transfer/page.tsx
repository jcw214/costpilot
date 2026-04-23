import TransferView from '@/features/analysis/components/TransferView';

export default function TransferPage() {
  return (
    <>
      <div className="page-header">
        <h1 className="page-title">내부대체가액 산정</h1>
        <p className="page-subtitle">지원본부 Cost Pool의 원가/시장가/협의가 기준 배부 시뮬레이션</p>
      </div>
      <div className="chart-container">
        <TransferView />
      </div>
    </>
  );
}
