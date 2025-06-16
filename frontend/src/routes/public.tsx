import { Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { LoadingFallback } from '@/components/LoadingFallback';

const LoginPage = lazy(() => import('@/pages/auth/Login'));
const RegisterPage = lazy(() => import('@/pages/auth/Register'));

export const publicRoutes = [
  {
    path: '/',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <LoginPage />
      </Suspense>
    )
  },
  {
    path: '/login',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <LoginPage />
      </Suspense>
    )
  },
  {
    path: '/register',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <RegisterPage />
      </Suspense>
    )
  },
  { path: '*', element: <Navigate to="/login" /> }
];
