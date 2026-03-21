// ================================
// AUTH TYPES (matches DTOs/Auth)
// ================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
}

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  balance?: number;
  userType?: string;
  roles: string[];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUser;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

// Keep old User alias for compatibility
export type User = AuthUser;
