import { Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

/**
 * AIChatHub - Router component for AI Chat
 * Redirects /dashboard/ai-chat to last used AI or Academic Tutor by default
 */
export function AIChatHub() {
  const location = useLocation();

  useEffect(() => {
    // Store last visited AI chat path
    if (location.pathname.includes('/ai-chat/')) {
      localStorage.setItem('lastAIChat', location.pathname);
    }
  }, [location.pathname]);

  // Get last used AI chat or default to tutor
  const lastAIChat = localStorage.getItem('lastAIChat') || '/dashboard/ai-chat/tutor';

  // If we're exactly on /dashboard/ai-chat, redirect to last used or tutor
  if (location.pathname === '/dashboard/ai-chat') {
    return <Navigate to={lastAIChat} replace />;
  }

  return null;
}

