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

export interface Feedback {
  error: string;
  fix: string;
}

export interface SpfLookup {
  type: string;
  domain: string;
  mechanism: string;
}

export interface SpfResult {
  record: string;
  status: string;
  lookups: SpfLookup[];
  message: string;
  lookup_count: number;
  feedback?: Feedback;
}

export interface DkimRecord {
  record: string;
  selector: string;
}

export interface DkimResult {
  status: string;
  message: string;
  records: DkimRecord[];
  feedback?: Feedback;
}

export interface DmarcResult {
  status: string;
  message: string;
  feedback?: Feedback;
}

export interface MailEchoResult {
  status: string;
  message: string;
  feedback?: Feedback;
}

export interface CheckResultData {
  spf: SpfResult;
  dkim: DkimResult;
  dmarc: DmarcResult;
  mail_echo: MailEchoResult;
}

export interface CheckResult {
  id: string;
  domain: string;
  result: CheckResultData;
  userId: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}
