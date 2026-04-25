import styles from './ErrorState.module.css';

interface ErrorStateProps {
  message?: string;
}

export default function ErrorState({ message = '데이터를 불러올 수 없습니다.' }: ErrorStateProps) {
  return (
    <div className={styles.error}>
      <span className={styles.icon}>⚠️</span>
      <span>{message}</span>
    </div>
  );
}
