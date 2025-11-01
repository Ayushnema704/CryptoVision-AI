"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface UserData {
  email: string;
  credits: number;
  isPremium: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  signup: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  useCredit: () => Promise<boolean>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

const FREE_USER_CREDITS = 6; // Free users get 6 credits
const PREMIUM_USER_CREDITS = 999999; // Unlimited for premium users

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (uid: string) => {
    try {
      // Fetch user data from Flask backend
      const response = await fetch(`${API_BASE_URL}/api/users/${uid}`);
      const data = await response.json();
      
      if (data.success && data.user) {
        setUserData({
          email: data.user.email,
          credits: data.user.credits,
          isPremium: data.user.isPremium,
          createdAt: data.user.createdAt,
        });
      } else {
        // Create new user if doesn't exist
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        const createResponse = await fetch(`${API_BASE_URL}/api/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: uid,
            email: currentUser?.email || '',
          }),
        });
        const createData = await createResponse.json();
        
        if (createData.success && createData.user) {
          setUserData({
            email: createData.user.email,
            credits: createData.user.credits,
            isPremium: createData.user.isPremium,
            createdAt: createData.user.createdAt,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Use default data as fallback
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUserData({
        email: currentUser?.email || '',
        credits: FREE_USER_CREDITS,
        isPremium: false,
        createdAt: new Date().toISOString(),
      });
    }
  };

  const refreshUserData = async () => {
    if (user) {
      await fetchUserData(user.id);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setUserData(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signup = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    // Create user in backend database
    if (data.user) {
      await fetch(`${API_BASE_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: data.user.id,
          email: data.user.email || email,
        }),
      });
    }
  };

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  const loginWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;

    // User creation in backend will be handled by the auth state change listener
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUserData(null);
  };

  const useCredit = async (): Promise<boolean> => {
    if (!user || !userData) {
      console.log('⚠️ useCredit: No user or userData');
      return false;
    }

    // Premium users have unlimited predictions
    if (userData.isPremium) {
      console.log('✅ useCredit: Premium user, unlimited credits');
      return true;
    }

    // Check if user has enough credits (need 3 credits per prediction)
    if (userData.credits < 3) {
      console.log('❌ useCredit: Not enough credits (need 3, have', userData.credits, ')');
      return false;
    }

    try {
      console.log('🔄 useCredit: Calling API...', `${API_BASE_URL}/api/users/${user.id}/credits`);
      console.log('🔍 useCredit: User ID:', user.id);
      console.log('🔍 useCredit: Current credits:', userData.credits);
      
      // Call backend API to use credit
      const response = await fetch(`${API_BASE_URL}/api/users/${user.id}/credits`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
      });
      
      console.log('📡 useCredit: Response status:', response.status);
      console.log('📡 useCredit: Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ useCredit: HTTP error:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('📥 useCredit: Response data:', JSON.stringify(data, null, 2));
      
      if (data.success && data.user) {
        // Update local state with new credits
        setUserData({
          ...userData,
          credits: data.user.credits,
        });
        console.log('✅ useCredit: Credits updated to', data.user.credits);
        return true;
      }
      
      console.log('⚠️ useCredit: API returned success=false', data);
      return false;
    } catch (error: any) {
      console.error('❌ useCredit: Error caught:', error.message);
      console.error('❌ useCredit: Full error:', error);
      
      // Don't use fallback - let user know there's an error
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    userData,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout,
    useCredit,
    refreshUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
