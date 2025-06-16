import { config } from "./config";
import storage from "@/utils/storage.ts";

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
}

export interface AuthResponse {
  id: string;
  email: string;
  token?: string;
}

export interface CreateCheckInput {
  domain: string;
}

export interface CheckResultDetail {
  status: string;
  message: string;
}

export interface CheckResultData {
  spf: CheckResultDetail;
  dkim: CheckResultDetail;
  dmarc: CheckResultDetail;
  mail_echo: CheckResultDetail;
}

export interface CheckResult {
  id: string;
  domain: string;
  result: CheckResultData;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export const authApi = {
  register: async (input: RegisterInput): Promise<ApiResponse<User>> => {
    const response = await fetch(`${config.apiBaseUrl}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Registration failed");
    }

    return response.json();
  },

  login: async (input: LoginInput): Promise<ApiResponse<AuthResponse>> => {
    const response = await fetch(`${config.apiBaseUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Login failed");
    }

    return response.json();
  },
};

export const checkApi = {
  checkDomain: async (
    input: CreateCheckInput
  ): Promise<ApiResponse<CheckResult>> => {
    const token = storage.getAuthToken();
    const response = await fetch(`${config.apiBaseUrl}/check`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to check domain");
    }

    return response.json();
  },

  getCheckHistory: async (): Promise<ApiResponse<CheckResult[]>> => {
    const token = storage.getAuthToken();
    const response = await fetch(`${config.apiBaseUrl}/check/history`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch check history");
    }

    return response.json();
  },
};
