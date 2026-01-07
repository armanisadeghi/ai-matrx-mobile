/**
 * AI Matrx Mobile - Auth Provider
 * Manages authentication state throughout the app
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { 
  AuthContextValue, 
  AuthState, 
  LoginCredentials, 
  RegisterCredentials, 
  AuthError 
} from '@/types/auth';

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({
        user: session?.user ?? null,
        session,
        isLoading: false,
        isAuthenticated: !!session,
      });
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setState({
          user: session?.user ?? null,
          session,
          isLoading: false,
          isAuthenticated: !!session,
        });
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign in with email and password
  const signIn = useCallback(async (credentials: LoginCredentials): Promise<{ error: AuthError | null }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        return { 
          error: { 
            message: error.message, 
            code: error.code 
          } 
        };
      }

      return { error: null };
    } catch (err) {
      return { 
        error: { 
          message: 'An unexpected error occurred',
          code: 'UNKNOWN'
        } 
      };
    }
  }, []);

  // Sign up with email and password
  const signUp = useCallback(async (credentials: RegisterCredentials): Promise<{ error: AuthError | null }> => {
    try {
      const { error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            full_name: credentials.fullName,
          },
        },
      });

      if (error) {
        return { 
          error: { 
            message: error.message, 
            code: error.code 
          } 
        };
      }

      return { error: null };
    } catch (err) {
      return { 
        error: { 
          message: 'An unexpected error occurred',
          code: 'UNKNOWN'
        } 
      };
    }
  }, []);

  // Sign out
  const signOut = useCallback(async (): Promise<void> => {
    await supabase.auth.signOut();
  }, []);

  // Reset password
  const resetPassword = useCallback(async (email: string): Promise<{ error: AuthError | null }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'aimatrx://reset-password',
      });

      if (error) {
        return { 
          error: { 
            message: error.message, 
            code: error.code 
          } 
        };
      }

      return { error: null };
    } catch (err) {
      return { 
        error: { 
          message: 'An unexpected error occurred',
          code: 'UNKNOWN'
        } 
      };
    }
  }, []);

  // Update password
  const updatePassword = useCallback(async (newPassword: string): Promise<{ error: AuthError | null }> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { 
          error: { 
            message: error.message, 
            code: error.code 
          } 
        };
      }

      return { error: null };
    } catch (err) {
      return { 
        error: { 
          message: 'An unexpected error occurred',
          code: 'UNKNOWN'
        } 
      };
    }
  }, []);

  const value: AuthContextValue = {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth context
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
