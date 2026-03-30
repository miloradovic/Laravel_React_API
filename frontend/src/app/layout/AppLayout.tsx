import { Outlet } from 'react-router-dom';
import PageFooter from '../../components/PageFooter';
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

      <PageFooter />
    </div>
  );
};

export default AppLayout;