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
