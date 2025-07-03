
import { useState, useEffect, createContext, useContext } from 'react';
import authService, { User } from '@/services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, userData?: any) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing user on mount
    // For demo purposes, create a mock user if none exists
    const currentUser = authService.getCurrentUser();
    if (currentUser && authService.isAuthenticated()) {
      setUser(currentUser);
    } else {
      // Create a demo user for testing without backend
      const demoUser: User = {
        id: 'demo-user-1',
        firstName: 'Demo',
        lastName: 'User',
        email: 'demo@aiser.ai',
        isEmailVerified: true,
        investmentExperience: 'intermediate' as const,
        riskTolerance: 'moderate' as const,
        investmentGoals: ['growth', 'retirement'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setUser(demoUser);
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      if (response.success) {
        setUser(response.data.user);
        return { error: null };
      }
      return { error: { message: 'Login failed' } };
    } catch (error: any) {
      return { error: { message: error.response?.data?.error || 'Login failed' } };
    }
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      const { firstName, lastName } = userData || {};
      const response = await authService.register({ 
        firstName: firstName || '', 
        lastName: lastName || '', 
        email, 
        password 
      });
      
      if (response.success) {
        setUser(response.data.user);
        return { error: null };
      }
      return { error: { message: 'Registration failed' } };
    } catch (error: any) {
      return { error: { message: error.response?.data?.error || 'Registration failed' } };
    }
  };

  const signOut = async () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
