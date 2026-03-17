import axiosInstance from '@/lib/axios';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  RefreshTokenResponse,
  User,
} from '@/types/auth';

class AuthService {
  /**
   * Login user with email and password
   */
  async login(credentials: LoginRequest): Promise<User> {
    const response = await axiosInstance.post<AuthResponse>('/auth/login', credentials);

    // Store tokens and user data
    if (response.data) {
      this.setAuthData(response.data);
      return response.data.user;
    }

    throw new Error('Invalid login response');
  }

  /**
   * Register new user
   */
  async register(userData: RegisterRequest): Promise<User> {
    const response = await axiosInstance.post<AuthResponse>('/auth/register', userData);

    // Store tokens and user data
    if (response.data) {
      this.setAuthData(response.data);
      return response.data.user;
    }

    throw new Error('Invalid register response');
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await axiosInstance.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API response
      this.clearAuthData();
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await axiosInstance.post<RefreshTokenResponse>('/auth/refresh', {
      refreshToken,
    });

    // Update tokens
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);

      // Update refresh token if provided
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
    }

    return response.data;
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    const response = await axiosInstance.get<User>('/auth/me');

    // Update user data in localStorage
    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    }

    throw new Error('Failed to get current user');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * Get access token from localStorage
   */
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }

  /**
   * Get refresh token from localStorage
   */
  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refreshToken');
  }

  /**
   * Get user data from localStorage
   */
  getUser(): User | null {
    if (typeof window === 'undefined') return null;

    const userStr = localStorage.getItem('user');
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  /**
   * Store auth data in localStorage
   */
  private setAuthData(data: AuthResponse): void {
    if (typeof window === 'undefined') return;

    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
  }

  /**
   * Clear auth data from localStorage
   */
  private clearAuthData(): void {
    if (typeof window === 'undefined') return;

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
}

// Export singleton instance
export const authService = new AuthService();
