import { useState } from 'react';
import { LoginPage } from './LoginPage';
import { SignupPage } from './SignupPage';

export function AuthGate() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
  };

  return mode === 'login' ? (
    <LoginPage onToggleMode={toggleMode} />
  ) : (
    <SignupPage onToggleMode={toggleMode} />
  );
}
