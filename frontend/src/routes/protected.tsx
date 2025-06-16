import { Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { LoadingFallback } from "@/components/LoadingFallback";
import { Layout } from "@/components/Layout";

const Dashboard = lazy(() => import("@/pages/dashboard"));

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
  { path: "*", element: <Navigate to="/" replace /> },
];
