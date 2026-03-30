import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../../../components/LoginForm';
import layoutStyles from '../../../app/layout/AppLayout.module.css';
import { useAuth } from '../AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, markAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/quotation', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLoginSuccess = () => {
    markAuthenticated();
    navigate('/quotation', { replace: true });
  };

  return (
    <div className={layoutStyles.shell}>
      <header className={layoutStyles.header}>
        <h1 className={layoutStyles.title}>Travel Insurance Quotation System</h1>
        <p className={layoutStyles.subtitle}>Get instant quotes for your travel insurance needs</p>
      </header>

      <main className={layoutStyles.content}>
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      </main>

      <footer className={layoutStyles.footer}>
        <p>Travel Insurance Quotation Demo System</p>
        <p>Built with Laravel 13 + React 19 + Vite</p>
      </footer>
    </div>
  );
};

export default LoginPage;