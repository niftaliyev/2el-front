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
  profilePhoto?: string;
  balance?: number;
  packageBalance?: number;
  bonusBalance?: number;
  adLimit?: number;
  userType?: string;
  hasStore?: boolean;
  roles: string[];
  serviceDiscountPercentage?: number;
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
