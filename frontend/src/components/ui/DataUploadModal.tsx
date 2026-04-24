'use client';

import styles from './DataUploadModal.module.css';

interface DataUploadModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function DataUploadModal({ title, isOpen, onClose }: DataUploadModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>📥 {title} — 데이터 업로드</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.content}>
          <div className={styles.comingSoon}>
            <div className={styles.comingSoonIcon}>🚧</div>
            <h3 className={styles.comingSoonTitle}>추후 구현 예정</h3>
            <p className={styles.comingSoonDesc}>
              실무 데이터를 엑셀 파일(.xlsx)로 일괄 업로드할 수 있는 기능입니다.
              <br />
              현재는 개발 중이며, 향후 업데이트를 통해 제공될 예정입니다.
            </p>
            <div className={styles.featureList}>
              <div className={styles.featureItem}>
                <span className={styles.featureIcon}>📄</span>
                <span>템플릿 양식에 맞춘 엑셀 파일 업로드</span>
              </div>
              <div className={styles.featureItem}>
                <span className={styles.featureIcon}>🔄</span>
                <span>기존 데이터와의 중복 처리 (건너뛰기 / 덮어쓰기)</span>
              </div>
              <div className={styles.featureItem}>
                <span className={styles.featureIcon}>✅</span>
                <span>업로드 전 데이터 유효성 검증</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>
  );
}
