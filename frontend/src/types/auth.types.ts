export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

export interface LoginResult {
  success: boolean;
  user: AuthUser;
  token: string;
}

export interface RegisterResult {
  success: boolean;
  data: AuthUser;
}

/** Backend response envelope */
export interface AuthResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  metadata?: {
    token?: string;
  };
}
