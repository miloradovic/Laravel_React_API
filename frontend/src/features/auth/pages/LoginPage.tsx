import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageFooter from '../../../components/PageFooter';
import LoginForm from '../../../components/LoginForm';
import PageHeader from '../../../components/PageHeader';
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
      <PageHeader />

      <main className={layoutStyles.content}>
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      </main>

      <PageFooter />
    </div>
  );
};

export default LoginPage;