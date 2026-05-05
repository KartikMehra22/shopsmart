import Skeleton from './ui/Skeleton';
import styles from './PageLoader.module.css';

export default function PageLoader() {
  return (
    <div className={styles.wrap} aria-busy="true" aria-label="Loading page">
      <Skeleton variant="text" height={32} width="40%" className={styles.mb} />
      <div className={styles.grid}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} variant="card" height={320} />
        ))}
      </div>
    </div>
  );
}
