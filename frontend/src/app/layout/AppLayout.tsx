import { Outlet } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import { useAuth } from '../../features/auth/AuthContext';
import styles from './AppLayout.module.css';

const AppLayout = () => {
  const { logout } = useAuth();

  return (
    <div className={styles.shell}>
      <PageHeader
        actions={
          <button onClick={logout} className={styles.logoutButton}>
            Logout
          </button>
        }
      />

      <main className={styles.content}>
        <Outlet />
      </main>

      <footer className={styles.footer}>
        <p>Travel Insurance Quotation Demo System</p>
        <p>Built with Laravel 12 + React 19 + Vite</p>
      </footer>
    </div>
  );
};

export default AppLayout;