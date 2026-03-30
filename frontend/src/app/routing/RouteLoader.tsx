import styles from './RouteLoader.module.css';

const RouteLoader = () => (
  <div className={styles.loadingPage}>
    <div className={styles.loading}>Loading...</div>
  </div>
);

export default RouteLoader;