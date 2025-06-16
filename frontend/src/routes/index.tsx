import storage from "@/utils/storage.ts";
import { useRoutes } from "react-router-dom";
import { protectedRoutes } from "@/routes/protected.tsx";
import { publicRoutes } from "@/routes/public.tsx";

export const AppRoutes = () => {
  const authToken = storage.getAuthToken();

  const routes = authToken ? protectedRoutes : publicRoutes;
  const element = useRoutes([...routes]);
  return element;
};
