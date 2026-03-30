import { lazy, Suspense, type ReactNode } from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';
import AppLayout from './layout/AppLayout';
import RequireAuth from './routing/RequireAuth';
import RouteLoader from './routing/RouteLoader';

const LoginPage = lazy(() => import('../features/auth/pages/LoginPage'));
const QuotationPage = lazy(() => import('../features/quotation/pages/QuotationPage'));

const withRouteSuspense = (node: ReactNode) => (
  <Suspense fallback={<RouteLoader />}>{node}</Suspense>
);

export const appRouter = createBrowserRouter([
  {
    path: '/login',
    element: withRouteSuspense(<LoginPage />),
  },
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/',
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/quotation" replace />,
          },
          {
            path: 'quotation',
            element: withRouteSuspense(<QuotationPage />),
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);