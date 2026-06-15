import axiosInstance from '@/lib/axios';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  AuthUser,
  RefreshTokenRequest,
  RefreshTokenResponse,
} from '@/types/auth';

class AuthService {
  /** Login */
  async login(credentials: LoginRequest): Promise<AuthUser> {
    const response = await axiosInstance.post<AuthResponse>('/auth/login', credentials);
    if (response.data) {
      this.setAuthData(response.data, credentials.rememberMe);
      return response.data.user;
    }
    throw new Error('Invalid login response');
  }

  /** Register */
  async register(userData: RegisterRequest): Promise<void> {
    await axiosInstance.post('/auth/register', userData);
  }

  /** Logout */
  async logout(): Promise<void> {
    const refreshToken = this.getRefreshToken();
    try {
      if (refreshToken) {
        await axiosInstance.post('/auth/logout', { refreshToken });
      }
    } catch {
      // ignore
    } finally {
      this.clearAuthData();
    }
  }

  /** Refresh access token */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await axiosInstance.post<RefreshTokenResponse>('/auth/refresh', {
      refreshToken,
    } as RefreshTokenRequest);

    if (response.data.accessToken) {
      if (localStorage.getItem('accessToken')) {
        localStorage.setItem('accessToken', response.data.accessToken);
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
      } else {
        sessionStorage.setItem('accessToken', response.data.accessToken);
        if (response.data.refreshToken) {
          sessionStorage.setItem('refreshToken', response.data.refreshToken);
        }
      }
    }
    return response.data;
  }

  /** Get current authenticated user profile from server */
  async getCurrentUser(): Promise<AuthUser> {
    const response = await axiosInstance.get<AuthUser>('/auth/me');
    if (response.data) {
      const storage = localStorage.getItem('accessToken') ? localStorage : sessionStorage;
      storage.setItem('user', JSON.stringify(response.data));
      return response.data;
    }
    throw new Error('Failed to get current user');
  }

  /** Change Password */
  async changePassword(data: any): Promise<void> {
    await axiosInstance.post('/auth/change-password', data);
  }

  /** Request password reset email */
  async forgotPassword(email: string): Promise<void> {
    await axiosInstance.post('/auth/forgot-password', { email });
  }

  /** Reset password with token */
  async resetPassword(data: any): Promise<void> {
    await axiosInstance.post('/auth/reset-password', data);
  }

  /** Check if authenticated */
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
  }

  getUser(): AuthUser | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  private setAuthData(data: AuthResponse, rememberMe: boolean = false): void {
    if (typeof window === 'undefined') return;
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('accessToken', data.accessToken);
    storage.setItem('refreshToken', data.refreshToken);
    storage.setItem('user', JSON.stringify(data.user));
  }

  private clearAuthData(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('user');
  }
}

export const authService = new AuthService();
