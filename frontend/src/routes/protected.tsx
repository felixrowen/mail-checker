import { Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { LoadingFallback } from "@/components/LoadingFallback";
import { Layout } from "@/components/Layout";

const Dashboard = lazy(() => import("@/pages/dashboard"));
const HistoryPage = lazy(() => import("@/pages/history"));

export const protectedRoutes = [
  {
    path: "/",
    element: (
      <Layout>
        <Suspense fallback={<LoadingFallback />}>
          <Dashboard />
        </Suspense>
      </Layout>
    ),
  },
  {
    path: "/history",
    element: (
      <Layout>
        <Suspense fallback={<LoadingFallback />}>
          <HistoryPage />
        </Suspense>
      </Layout>
    ),
  },
  { path: "*", element: <Navigate to="/" replace /> },
];
