import styles from './PageFooter.module.css';

const PageFooter = () => {
  return (
    <footer className={styles.footer}>
      <p>Travel Insurance Quotation Demo System</p>
      <p>Built with Laravel 13 + React 19 + Vite</p>
    </footer>
  );
};

export default PageFooter;
