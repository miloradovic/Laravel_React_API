import type { ReactNode } from 'react';
import styles from './PageHeader.module.css';

interface PageHeaderProps {
  actions?: ReactNode;
}

const PageHeader = ({ actions }: PageHeaderProps) => {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>Travel Insurance Quotation System</h1>
      <p className={styles.subtitle}>Get instant quotes for your travel insurance needs</p>
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </header>
  );
};

export default PageHeader;