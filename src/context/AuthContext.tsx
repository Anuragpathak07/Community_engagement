
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { getStorageItem, setStorageItem, removeStorageItem, clearUserStorage } from '@/utils/storage';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'teacher' | 'admin';
} | null;

type AuthContextType = {
  user: User;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Local storage key for user data
const USER_STORAGE_KEY = 'current_user';
const USERS_COLLECTION_KEY = 'users';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true); // Start as loading
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user is already logged in on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        
        // If on login page, redirect to dashboard
        if (location.pathname === '/login') {
          navigate('/dashboard');
        }
      } catch (err) {
        console.error('Error parsing stored user data:', err);
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    }
    
    // Authentication check complete
    setIsLoading(false);
  }, [navigate, location.pathname]);

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user && location.pathname !== '/login') {
      navigate('/login');
    }
  }, [user, isLoading, navigate, location.pathname]);

  // Sign up a new user
  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if email already exists
      const existingUsers = localStorage.getItem(USERS_COLLECTION_KEY);
      const users = existingUsers ? JSON.parse(existingUsers) : [];
      
      if (users.some((u: any) => u.email === email)) {
        setError('Email already exists');
        setIsLoading(false);
        return;
      }
      
      // Create new user
      const newUser = {
        id: `user_${Date.now()}`,
        name,
        email,
        password, // In a real app, this would be hashed
        role: 'teacher' as const
      };
      
      // Save to "users" collection
      users.push(newUser);
      localStorage.setItem(USERS_COLLECTION_KEY, JSON.stringify(users));
      
      // Automatically log in the new user
      const loggedInUser = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      };
      
      setUser(loggedInUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedInUser));
      
      toast.success('Account created successfully');
      navigate('/dashboard');
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Signup error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Login a user
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // First check in the saved users
      const savedUsers = localStorage.getItem(USERS_COLLECTION_KEY);
      if (savedUsers) {
        const users = JSON.parse(savedUsers);
        const foundUser = users.find((u: any) => u.email === email && u.password === password);
        
        if (foundUser) {
          const loggedInUser = {
            id: foundUser.id,
            name: foundUser.name,
            email: foundUser.email,
            role: foundUser.role as 'teacher' | 'admin'
          };
          setUser(loggedInUser);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedInUser));
          navigate('/dashboard');
          return;
        }
      }
      
      // If not found in saved users, check demo accounts
      if (email === 'admin@school.com' && password === 'password') {
        const newUser = {
          id: 'admin_1',
          name: 'Admin User',
          email: 'admin@school.com',
          role: 'admin' as const
        };
        setUser(newUser);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
        navigate('/dashboard');
      } else if (email === 'teacher@school.com' && password === 'password') {
        const newUser = {
          id: 'teacher_1',
          name: 'Teacher User',
          email: 'teacher@school.com',
          role: 'teacher' as const
        };
        setUser(newUser);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
        navigate('/dashboard');
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const value = {
    user,
    login,
    signup,
    logout,
    isLoading,
    error
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
