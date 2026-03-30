import { Outlet } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import styles from './AppLayout.module.css';

const AppLayout = () => {
  const { logout } = useAuth();

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <h1 className={styles.title}>Travel Insurance Quotation System</h1>
        <p className={styles.subtitle}>Get instant quotes for your travel insurance needs</p>
        <div className={styles.actions}>
          <button onClick={logout} className={styles.logoutButton}>
            Logout
          </button>
        </div>
      </header>

      <main className={styles.content}>
        <Outlet />
      </main>

      <footer className={styles.footer}>
        <p>Travel Insurance Quotation Demo System</p>
        <p>Built with Laravel 13 + React 19 + Vite</p>
      </footer>
    </div>
  );
};

export default AppLayout;