import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

export function useRouter() {
  const navigate = useNavigate();

  const router = useMemo(
    () => ({
      back: () => navigate(-1),
      forward: () => navigate(1),
      reload: () => window.location.reload(),
      push: (href: string, queryParams?: Record<string, string>) => {
        const url = new URL(href, window.location.origin);
        if (queryParams) {
          Object.entries(queryParams).forEach(([key, value]) => {
            url.searchParams.set(key, value);
          });
        }
        navigate(url.pathname + url.search);
      },
      replace: (href: string, queryParams?: Record<string, string>) => {
        const url = new URL(href, window.location.origin);
        if (queryParams) {
          Object.entries(queryParams).forEach(([key, value]) => {
            url.searchParams.set(key, value);
          });
        }
        navigate(url.pathname + url.search, { replace: true });
      },
    }),
    [navigate]
  );

  return router;
}
