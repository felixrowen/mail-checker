import axiosInstance from "@/lib/axios";
import { AxiosError } from "axios";
import type {
  LoginInput,
  RegisterInput,
  User,
  AuthResponse,
  CreateCheckInput,
  CheckResult,
  ApiResponse,
} from "./types";
import { API_URL } from "./config";

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof AxiosError) {
    return error.response?.data?.message || error.message || fallback;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
};

export const authApi = {
  register: async (input: RegisterInput): Promise<ApiResponse<User>> => {
    try {
      const response = await axiosInstance.post(API_URL.AUTH.REGISTER, input);
      return response.data;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, "Registration failed"));
    }
  },

  login: async (input: LoginInput): Promise<ApiResponse<AuthResponse>> => {
    try {
      const response = await axiosInstance.post(API_URL.AUTH.LOGIN, input);
      return response.data;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, "Login failed"));
    }
  },
};

export const checkApi = {
  checkDomain: async (
    input: CreateCheckInput
  ): Promise<ApiResponse<CheckResult>> => {
    try {
      const response = await axiosInstance.post(API_URL.CHECK.CREATE, input);
      return response.data;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, "Failed to check domain"));
    }
  },

  getCheckHistory: async (): Promise<ApiResponse<CheckResult[]>> => {
    try {
      const response = await axiosInstance.get(API_URL.CHECK.HISTORY);
      return response.data;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, "Failed to fetch check history"));
    }
  },
};
