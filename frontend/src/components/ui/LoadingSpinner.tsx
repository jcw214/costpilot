import styles from './LoadingSpinner.module.css';

interface LoadingSpinnerProps {
  text?: string;
  fullHeight?: boolean;
}

export default function LoadingSpinner({ text = '데이터를 불러오는 중...', fullHeight = false }: LoadingSpinnerProps) {
  return (
    <div className={`${styles.loading} ${fullHeight ? styles.fullHeight : ''}`}>
      <div className={styles.spinner} />
      {text && <span>{text}</span>}
    </div>
  );
}
