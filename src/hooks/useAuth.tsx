
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
    // Check for existing authenticated user on mount
    const currentUser = authService.getCurrentUser();
    if (currentUser && authService.isAuthenticated()) {
      setUser(currentUser);
    }
    // No demo user creation - require real authentication
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
    try {
      authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if there's an error, clear the local state
      authService.logout();
      setUser(null);
    }
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
