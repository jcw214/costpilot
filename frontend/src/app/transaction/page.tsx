import TransactionView from '@/features/transactions/TransactionView';

export default function TransactionPage() {
  return (
    <>
      <div className="page-header">
        <h1 className="page-title">거래 데이터</h1>
        <p className="page-subtitle">투입 공수, 외주비, 간접비, 예산 데이터 확인</p>
      </div>
      <div className="chart-container">
        <TransactionView />
      </div>
    </>
  );
}
