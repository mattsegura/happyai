import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Profile } from '../lib/supabase';
import { mockCurrentUser, mockCurrentTeacher } from '../lib/mockData';

type User = {
  id: string;
  email: string;
};

type Session = {
  user: User;
};

type AuthError = {
  message: string;
};

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  role: 'student' | 'teacher';
  signUp: (email: string, password: string, fullName: string, role: 'student' | 'teacher') => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string, role: 'student' | 'teacher') => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const SESSION_STORAGE_KEY = 'hapi_mock_session';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type PersistedSession = {
  user: User;
  profile: Profile;
  role: 'student' | 'teacher';
};

const readPersistedSession = (): PersistedSession | null => {
  if (typeof window === 'undefined') return null;

  try {
    const stored = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as PersistedSession) : null;
  } catch (error) {
    console.warn('[AuthContext] Failed to parse persisted session', error);
    return null;
  }
};

const persistSession = (session: PersistedSession) => {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch (error) {
    console.warn('[AuthContext] Failed to persist session', error);
  }
};

const clearPersistedSession = () => {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (error) {
    console.warn('[AuthContext] Failed to clear session', error);
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<'student' | 'teacher'>('student');

  const refreshProfile = async () => {
    await new Promise(resolve => setTimeout(resolve, 300));

    if (!user || !profile) return;

    const updatedProfile = {
      ...profile,
      updated_at: new Date().toISOString(),
    };

    setProfile(updatedProfile);
    persistSession({ user, profile: updatedProfile, role });
  };

  useEffect(() => {
    const hydrateSession = async () => {
      const storedSession = readPersistedSession();

      if (storedSession) {
        setUser(storedSession.user);
        setProfile(storedSession.profile);
        setSession({ user: storedSession.user });
        setRole(storedSession.role);
      }

      setLoading(false);
    };

    hydrateSession();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, userRole: 'student' | 'teacher') => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const baseProfile = userRole === 'teacher' ? mockCurrentTeacher : mockCurrentUser;
    const mockUser: User = {
      id: baseProfile.id,
      email,
    };

    const profileData: Profile = {
      ...baseProfile,
      email,
      full_name: fullName,
      updated_at: new Date().toISOString(),
    };

    setUser(mockUser);
    setProfile(profileData);
    setSession({ user: mockUser });
    setRole(userRole);
    persistSession({ user: mockUser, profile: profileData, role: userRole });

    return { error: null };
  };

  const signIn = async (email: string, password: string, userRole: 'student' | 'teacher') => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const baseProfile = userRole === 'teacher' ? mockCurrentTeacher : mockCurrentUser;
    const mockUser: User = {
      id: baseProfile.id,
      email,
    };

    const profileData: Profile = {
      ...baseProfile,
      email,
      updated_at: new Date().toISOString(),
    };

    setUser(mockUser);
    setProfile(profileData);
    setSession({ user: mockUser });
    setRole(userRole);
    persistSession({ user: mockUser, profile: profileData, role: userRole });

    return { error: null };
  };

  const signOut = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    setUser(null);
    setProfile(null);
    setSession(null);
    setRole('student');
    clearPersistedSession();
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
