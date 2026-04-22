export default function HomePage() {
  return (
    <>
      <div className="page-header">
        <h1 className="page-title">전사 경영 성과 요약</h1>
        <p className="page-subtitle">파일럿솔루션(주) · 2026년 1분기</p>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">전사 매출</div>
          <div className="kpi-value">—</div>
          <div className="kpi-sub">Backend 연동 대기</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">전사 총원가</div>
          <div className="kpi-value">—</div>
          <div className="kpi-sub">Backend 연동 대기</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">영업이익률</div>
          <div className="kpi-value">—</div>
          <div className="kpi-sub">Backend 연동 대기</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">평균 가동률</div>
          <div className="kpi-value">—</div>
          <div className="kpi-sub">Backend 연동 대기</div>
        </div>
      </div>

      <div className="chart-container">
        <h2 className="chart-title">본부별 공헌이익</h2>
        <div className="placeholder">
          <span className="placeholder-icon">📊</span>
          <span>Backend API 연동 후 차트가 표시됩니다</span>
        </div>
      </div>

      <div className="chart-container">
        <h2 className="chart-title">프로젝트 수익성 분포</h2>
        <div className="placeholder">
          <span className="placeholder-icon">📈</span>
          <span>Backend API 연동 후 차트가 표시됩니다</span>
        </div>
      </div>
    </>
  );
}
