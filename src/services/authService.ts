import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isEmailVerified: boolean;
  profilePicture?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  investmentExperience: 'beginner' | 'intermediate' | 'advanced';
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  investmentGoals: string[];
  monthlyIncome?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    user: User;
  };
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

class AuthService {
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, data);
    
    if (response.data.success) {
      localStorage.setItem('auth_token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, data);
    
    if (response.data.success) {
      localStorage.setItem('auth_token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  }

  logout(): void {
    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      // Clear any other auth-related data
      localStorage.removeItem('refresh_token');
      sessionStorage.clear(); // Clear session storage as well
    } catch (error) {
      console.error('Error during logout:', error);
      // Force clear everything we can
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (clearError) {
        console.error('Error clearing storage:', clearError);
      }
    }
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  async getProfile(): Promise<{ success: boolean; data: { user: User } }> {
    const response = await axios.get(`${API_BASE_URL}/users/profile`);
    return response.data;
  }

  async updateProfile(data: Partial<User>): Promise<{ success: boolean; data: { user: User } }> {
    const response = await axios.put(`${API_BASE_URL}/users/profile`, data);
    
    if (response.data.success) {
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  }
}

export default new AuthService();
