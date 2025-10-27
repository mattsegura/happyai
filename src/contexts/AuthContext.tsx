import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { setUserContext, clearUserContext } from '../lib/errorHandler';
import { AUTH_CONFIG } from '../lib/config';
import type { User, Session } from '@supabase/supabase-js';
import type { Profile, University } from '../lib/supabase';

// Only log in development mode
const DEBUG = import.meta.env.DEV;

type UserRole = 'student' | 'teacher' | 'admin' | 'super_admin';

type AuthError = {
  message: string;
};

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  role: UserRole;
  university: University | null;
  universityId: string | null;
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
  const [university, setUniversity] = useState<University | null>(null);
  const [universityId, setUniversityId] = useState<string | null>(() => {
    return localStorage.getItem('university_id');
  });

  // Initialize role from localStorage to prevent role flickering
  const [role, setRole] = useState<UserRole>(() => {
    const cachedRole = localStorage.getItem('user_role');
    return (cachedRole as UserRole) || 'student';
  });

  // Update role with caching to prevent role loss
  const updateRole = (newRole: UserRole) => {
    setRole(newRole);
    localStorage.setItem('user_role', newRole);
  };

  // Clear cached role
  const clearRole = () => {
    setRole('student');
    localStorage.removeItem('user_role');
  };

  // Update university with caching
  const updateUniversity = (newUniversity: University | null) => {
    setUniversity(newUniversity);
    setUniversityId(newUniversity?.id || null);
    if (newUniversity) {
      localStorage.setItem('university_id', newUniversity.id);
    } else {
      localStorage.removeItem('university_id');
    }
  };

  // Clear university cache
  const clearUniversity = () => {
    setUniversity(null);
    setUniversityId(null);
    localStorage.removeItem('university_id');
  }

  // Fetch university data
  const fetchUniversity = async (universityId: string): Promise<University | null> => {
    if (DEBUG) console.log('[Auth] Fetching university for ID:', universityId);

    try {
      const { data, error } = await supabase
        .from('universities')
        .select('*')
        .eq('id', universityId)
        .single();

      if (error) {
        if (DEBUG) console.error('[Auth] Error fetching university:', error);
        return null;
      }

      if (DEBUG) console.log('[Auth] University fetched successfully:', data);
      return data as University;
    } catch (err) {
      if (DEBUG) console.error('[Auth] Exception fetching university:', err);
      return null;
    }
  };

  // Fetch user profile from Supabase
  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    if (DEBUG) console.log('[Auth] Fetching profile for userId:', userId);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (DEBUG) console.error('[Auth] Error fetching profile:', error);
        return null;
      }

      if (DEBUG) console.log('[Auth] Profile fetched successfully:', data);
      return data as Profile;
    } catch (err) {
      if (DEBUG) console.error('[Auth] Exception fetching profile:', err);
      return null;
    }
  };

  // Refresh profile data
  const refreshProfile = async () => {
    if (!user) return;

    const profileData = await fetchProfile(user.id);
    if (profileData) {
      setProfile(profileData);
      if (profileData.role) {
        updateRole(profileData.role as UserRole);
      }

      // Fetch and update university data
      if (profileData.university_id) {
        const universityData = await fetchUniversity(profileData.university_id);
        if (universityData) {
          updateUniversity(universityData);
        }
      }

      // Set user context for error tracking with university
      setUserContext(profileData.id, profileData.email, profileData.role, profileData.university_id);
    }
  };

  // Initialize auth state
  useEffect(() => {
    let mounted = true;
    let authStateInitialized = false;

    // Safety timeout - force loading to false as last resort
    // Configurable via VITE_AUTH_TIMEOUT environment variable
    const safetyTimeout = setTimeout(() => {
      if (!authStateInitialized && mounted) {
        if (DEBUG) console.error(`[Auth] SAFETY TIMEOUT: Forcing loading to false after ${AUTH_CONFIG.SAFETY_TIMEOUT}ms`);
        setLoading(false);
        authStateInitialized = true; // Prevent further timeouts
      }
    }, AUTH_CONFIG.SAFETY_TIMEOUT);

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event: any, currentSession: any) => {
      if (!mounted) return;

      if (DEBUG) console.log('[Auth] Auth state changed:', _event, 'Session:', currentSession ? 'exists' : 'null');

      // Handle INITIAL_SESSION to complete loading
      if (_event === 'INITIAL_SESSION') {
        if (DEBUG) console.log('[Auth] Initial session event received');
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          try {
            const profileData = await fetchProfile(currentSession.user.id);
            if (mounted && profileData) {
              setProfile(profileData);
              if (profileData.role) {
                // Successfully fetched role - update and cache it
                updateRole(profileData.role as UserRole);
              }

              // Fetch and update university data
              if (profileData.university_id) {
                const universityData = await fetchUniversity(profileData.university_id);
                if (mounted && universityData) {
                  updateUniversity(universityData);
                }
              }

              // Set user context for error tracking with university
              setUserContext(profileData.id, profileData.email, profileData.role, profileData.university_id);
              // If profile fetch fails, keep existing cached role
              // Don't reset to 'student' - prevents role flickering
            }
          } catch (err) {
            if (DEBUG) console.error('[Auth] Error fetching profile:', err);
            // Keep existing role on error - don't reset to 'student'
            // This prevents admin users from seeing student UI on network issues
            if (mounted) {
              setProfile(null);
            }
          }
        } else {
          // User logged out - clear everything
          if (mounted) {
            setProfile(null);
            clearRole();
            clearUniversity();
            clearUserContext(); // Clear error tracking context
          }
        }

        // Mark auth as initialized and stop loading
        if (mounted && !authStateInitialized) {
          if (DEBUG) console.log('[Auth] Initial session processed, setting loading to false');
          authStateInitialized = true;
          setLoading(false);
          clearTimeout(safetyTimeout);
        }
      }
      // Ignore SIGNED_IN during initialization (it fires before INITIAL_SESSION and causes issues)
      else if (_event === 'SIGNED_IN' && !authStateInitialized) {
        if (DEBUG) console.log('[Auth] Ignoring SIGNED_IN during initialization, waiting for INITIAL_SESSION');
      }
      // Handle other auth events after initialization (SIGNED_IN, SIGNED_OUT, etc.)
      else if (authStateInitialized) {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          try {
            const profileData = await fetchProfile(currentSession.user.id);
            if (mounted && profileData) {
              setProfile(profileData);
              if (profileData.role) {
                // Successfully fetched role - update and cache it
                updateRole(profileData.role as UserRole);
              }

              // Fetch and update university data
              if (profileData.university_id) {
                const universityData = await fetchUniversity(profileData.university_id);
                if (mounted && universityData) {
                  updateUniversity(universityData);
                }
              }

              // Set user context for error tracking with university
              setUserContext(profileData.id, profileData.email, profileData.role, profileData.university_id);
              // If profile fetch fails, keep existing cached role
            }
          } catch (err) {
            if (DEBUG) console.error('[Auth] Error in auth state change profile fetch:', err);
            // Keep existing role on error - prevents role flickering
            if (mounted) {
              setProfile(null);
            }
          }
        } else {
          // User logged out - clear everything
          if (mounted) {
            setProfile(null);
            clearRole();
            clearUniversity();
            clearUserContext(); // Clear error tracking context
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
      if (DEBUG) console.log('[Auth] Starting signup for:', { email, fullName, role: userRole });

      const { data, error } = await supabase.auth.signUp({
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
        console.error('[Auth] Signup error:', error);
        return { error: { message: error.message } };
      }

      if (DEBUG) console.log('[Auth] Signup successful, user ID:', data?.user?.id);

      // Profile will be auto-created by the trigger
      // The auth state change listener will fetch it automatically
      return { error: null };
    } catch (error) {
      console.error('[Auth] Signup exception:', error);
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
    clearRole();
    clearUniversity();
    clearUserContext(); // Clear error tracking context
  };

  const value = {
    user,
    profile,
    session,
    loading,
    role,
    university,
    universityId,
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
