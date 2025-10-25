import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import type { Profile } from '../lib/supabase';

type UserRole = 'student' | 'teacher' | 'admin';

type AuthError = {
  message: string;
};

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  role: UserRole;
  signUp: (email: string, password: string, fullName: string, role: UserRole) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole>('student');

  // Fetch user profile from Supabase
  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    console.log('[Auth] Fetching profile for userId:', userId);

    try {
      // Reduced timeout to 3 seconds
      const timeoutPromise = new Promise<null>((resolve) => {
        setTimeout(() => {
          console.warn('[Auth] Profile fetch timeout after 3 seconds');
          resolve(null);
        }, 3000);
      });

      const fetchPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
        .then(({ data, error }) => {
          if (error) {
            console.error('[Auth] Error fetching profile:', error);
            return null;
          }
          console.log('[Auth] Profile fetched successfully:', data);
          return data as Profile;
        });

      const result = await Promise.race([fetchPromise, timeoutPromise]);
      return result;
    } catch (err) {
      console.error('[Auth] Exception fetching profile:', err);
      return null;
    }
  };

  // Refresh profile data
  const refreshProfile = async () => {
    if (!user) return;

    const profileData = await fetchProfile(user.id);
    if (profileData) {
      setProfile(profileData);
      setRole(profileData.role as UserRole);
    }
  };

  // Initialize auth state
  useEffect(() => {
    let mounted = true;
    let authStateInitialized = false;

    // Reduced safety timeout - force loading to false after 5 seconds
    const safetyTimeout = setTimeout(() => {
      if (!authStateInitialized && mounted) {
        console.error('[Auth] SAFETY TIMEOUT: Forcing loading to false after 5 seconds');
        setLoading(false);
      }
    }, 5000);

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event: any, currentSession: any) => {
      if (!mounted) return;

      console.log('[Auth] Auth state changed:', _event, 'Session:', currentSession ? 'exists' : 'null');

      // Handle INITIAL_SESSION to complete loading
      if (_event === 'INITIAL_SESSION') {
        console.log('[Auth] Initial session event received');
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          try {
            const profileData = await fetchProfile(currentSession.user.id);
            if (mounted) {
              setProfile(profileData);
              setRole((profileData?.role as UserRole) || 'student');
            }
          } catch (err) {
            console.error('[Auth] Error fetching profile:', err);
            if (mounted) {
              setProfile(null);
              setRole('student');
            }
          }
        } else {
          if (mounted) {
            setProfile(null);
            setRole('student');
          }
        }

        // Mark auth as initialized and stop loading
        if (mounted && !authStateInitialized) {
          console.log('[Auth] Initial session processed, setting loading to false');
          authStateInitialized = true;
          setLoading(false);
          clearTimeout(safetyTimeout);
        }
      }
      // Ignore SIGNED_IN during initialization (it fires before INITIAL_SESSION and causes issues)
      else if (_event === 'SIGNED_IN' && !authStateInitialized) {
        console.log('[Auth] Ignoring SIGNED_IN during initialization, waiting for INITIAL_SESSION');
      }
      // Handle other auth events after initialization (SIGNED_IN, SIGNED_OUT, etc.)
      else if (authStateInitialized) {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          try {
            const profileData = await fetchProfile(currentSession.user.id);
            if (mounted) {
              setProfile(profileData);
              setRole((profileData?.role as UserRole) || 'student');
            }
          } catch (err) {
            console.error('[Auth] Error in auth state change profile fetch:', err);
            if (mounted) {
              setProfile(null);
              setRole('student');
            }
          }
        } else {
          if (mounted) {
            setProfile(null);
            setRole('student');
          }
        }
      }
    });

    return () => {
      mounted = false;
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, []);

  // Sign up new user
  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    userRole: UserRole
  ) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: userRole,
          },
        },
      });

      if (error) {
        return { error: { message: error.message } };
      }

      // Profile will be auto-created by the trigger
      // The auth state change listener will fetch it automatically
      return { error: null };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : 'An error occurred during sign up',
        },
      };
    }
  };

  // Sign in existing user
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: { message: error.message } };
      }

      // Profile will be fetched by the auth state change listener
      return { error: null };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : 'An error occurred during sign in',
        },
      };
    }
  };

  // Sign out
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
    setRole('student');
  };

  const value = {
    user,
    profile,
    session,
    loading,
    role,
    signUp,
    signIn,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
