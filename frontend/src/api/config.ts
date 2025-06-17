export const config = {
  apiBaseUrl:
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1",
};

export const API_URL = {
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
  },
  CHECK: {
    CREATE: "/check",
    HISTORY: "/check/history",
  },
} as const;
