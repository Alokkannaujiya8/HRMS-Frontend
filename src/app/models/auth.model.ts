export type UserRole = 'Admin' | 'HR' | 'Employee';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  role: UserRole;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  role: UserRole;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
  role?: UserRole;
}

export interface RegisterResponse {
  message?: string;
}
