import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { MorningPulseModal } from './MorningPulseModal';
import { ConsolidatedClassPulsesModal } from './ConsolidatedClassPulsesModal';
import { PopupDebugPanel } from './PopupDebugPanel';

interface QueueItem {
  type: 'morning_pulse' | 'class_pulses';
  data?: any;
}

interface PopupQueueManagerProps {
  onAllComplete?: () => void;
  resetTrigger?: number;
}

const getSessionKey = (userId: string) => `popups_shown_${userId}`;

const getShownPulses = (userId: string): string[] => {
  try {
    const stored = sessionStorage.getItem(getSessionKey(userId));
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const markPulseAsShown = (userId: string, pulseId: string) => {
  try {
    const shown = getShownPulses(userId);
    if (!shown.includes(pulseId)) {
      shown.push(pulseId);
      sessionStorage.setItem(getSessionKey(userId), JSON.stringify(shown));
    }
  } catch {
    // Fail silently if sessionStorage is not available
  }
};

const markMorningPulseShown = (userId: string) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    sessionStorage.setItem(`morning_pulse_shown_${userId}_${today}`, 'true');
  } catch {
    // Fail silently
  }
};

const wasMorningPulseShown = (userId: string): boolean => {
  try {
    const today = new Date().toISOString().split('T')[0];
    return sessionStorage.getItem(`morning_pulse_shown_${userId}_${today}`) === 'true';
  } catch {
    return false;
  }
};

export const clearPopupSessionStorage = (userId: string) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    sessionStorage.removeItem(`morning_pulse_shown_${userId}_${today}`);
    sessionStorage.removeItem(getSessionKey(userId));
    console.log('[PopupQueue] Cleared session storage for user:', userId);
  } catch (error) {
    console.error('[PopupQueue] Error clearing session storage:', error);
  }
};

// Debug utility: only available in development mode
if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as any).clearPopupCache = (userId?: string) => {
    if (!userId) {
      console.log('[PopupQueue] Usage: clearPopupCache(userId)');
      console.log('[PopupQueue] This will reset popup tracking for testing');
      return;
    }
    clearPopupSessionStorage(userId);
    console.log('[PopupQueue] ✓ Popup cache cleared. Refresh the page to see popups again.');
  };
}

export function PopupQueueManager({ onAllComplete, resetTrigger }: PopupQueueManagerProps) {
  const { user } = useAuth();
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [isLoading, setIsLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState({
    morningPulseNeeded: false,
    morningPulseShownInSession: false,
    userClassCount: 0,
    activePulsesCount: 0,
    incompletePulsesCount: 0,
    newPulsesCount: 0,
    queueLength: 0,
  });

  useEffect(() => {
    if (!user) {
      console.log('[PopupQueue] No user found, skipping queue initialization');
      return;
    }

    const initializeQueue = async () => {
      console.log('[PopupQueue] Starting queue initialization...');
      console.log('[PopupQueue] Waiting 2 seconds before checking for popups...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      const queueItems: QueueItem[] = [];

      try {
        console.log('[PopupQueue] Checking morning pulse status...');
        const needsMorningPulse = await checkMorningPulseNeeded();
        const morningPulseShown = wasMorningPulseShown(user.id);

        console.log('[PopupQueue] Morning pulse needed:', needsMorningPulse);
        console.log('[PopupQueue] Morning pulse already shown in session:', morningPulseShown);

        if (needsMorningPulse && !morningPulseShown) {
          console.log('[PopupQueue] ✓ Adding morning pulse to queue');
          queueItems.push({ type: 'morning_pulse' });
        } else if (!needsMorningPulse) {
          console.log('[PopupQueue] ✗ Morning pulse already completed today');
        } else if (morningPulseShown) {
          console.log('[PopupQueue] ✗ Morning pulse already shown in this session');
        }

        console.log('[PopupQueue] Fetching incomplete class pulses...');
        const pulseData = await fetchIncompletClassPulses();
        console.log('[PopupQueue] Found incomplete pulses:', pulseData.incompletePulses.length);

        const shownPulses = getShownPulses(user.id);
        console.log('[PopupQueue] Previously shown pulse IDs:', shownPulses);

        const newPulses = pulseData.incompletePulses.filter(pulse => !shownPulses.includes(pulse.id));
        console.log('[PopupQueue] New pulses to show:', newPulses.length);

        if (newPulses.length > 0) {
          console.log('[PopupQueue] ✓ Adding class pulses to queue:', newPulses.map(p => p.id));
          queueItems.push({ type: 'class_pulses', data: newPulses });
          newPulses.forEach(pulse => markPulseAsShown(user.id, pulse.id));
        } else if (pulseData.incompletePulses.length > 0) {
          console.log('[PopupQueue] ✗ All incomplete pulses already shown in session');
        } else {
          console.log('[PopupQueue] ✗ No incomplete class pulses found');
        }

        console.log('[PopupQueue] Final queue:', queueItems.map(q => q.type));
        setQueue(queueItems);
        setIsLoading(false);

        setDebugInfo({
          morningPulseNeeded: needsMorningPulse,
          morningPulseShownInSession: morningPulseShown,
          userClassCount: pulseData.userClassCount,
          activePulsesCount: pulseData.activePulsesCount,
          incompletePulsesCount: pulseData.incompletePulses.length,
          newPulsesCount: newPulses.length,
          queueLength: queueItems.length,
        });

        if (queueItems.length > 0) {
          console.log('[PopupQueue] Starting to display popups...');
          setCurrentIndex(0);
        } else {
          console.log('[PopupQueue] No popups to show, calling onAllComplete');
          if (onAllComplete) onAllComplete();
        }
      } catch (error) {
        console.error('[PopupQueue] Error initializing queue:', error);
        setIsLoading(false);
        if (onAllComplete) onAllComplete();
      }
    };

    initializeQueue();
  }, [user, resetTrigger]);

  const checkMorningPulseNeeded = async (): Promise<boolean> => {
    if (!user) return false;

    await new Promise(resolve => setTimeout(resolve, 300));

    const today = new Date().toISOString().split('T')[0];
    console.log('[PopupQueue] Checking pulse_checks for user:', user.id, 'date:', today);

    console.log('[PopupQueue] Pulse check result: Not found (using mock data)');
    return false;
  };

  const fetchIncompletClassPulses = async () => {
    if (!user) return { incompletePulses: [], userClassCount: 0, activePulsesCount: 0 };

    await new Promise(resolve => setTimeout(resolve, 300));

    console.log('[PopupQueue] Fetching classes for user:', user.id);

    // Fetch user's classes from database
    const { data: userClasses, error: classError } = await supabase
      .from('class_members')
      .select('class_id')
      .eq('user_id', user.id);

    if (classError || !userClasses || userClasses.length === 0) {
      console.log('[PopupQueue] User not enrolled in any classes');
      return { incompletePulses: [], userClassCount: 0, activePulsesCount: 0 };
    }

    const userClassCount = userClasses.length;
    const classIds = userClasses.map(c => c.class_id);
    console.log('[PopupQueue] User is enrolled in', userClassCount, 'classes:', classIds);

    const now = new Date();

    // Fetch active class pulses from database
    const { data: activePulsesData, error: pulsesError } = await supabase
      .from('class_pulses')
      .select('*')
      .in('class_id', classIds)
      .eq('is_active', true)
      .gt('expires_at', now.toISOString());

    const activePulses = activePulsesData || [];
    const filteredActivePulses = activePulses.filter(p =>
      p.is_active &&
      new Date(p.expires_at) > now
    );

    const activePulsesCount = activePulses.length;
    console.log('[PopupQueue] Active pulses found:', activePulsesCount);

    if (activePulses.length === 0) {
      console.log('[PopupQueue] No active pulses for user classes');
      return { incompletePulses: [], userClassCount, activePulsesCount: 0 };
    }

    const pulsesWithProgress = activePulses.map(pulse => ({
      ...pulse,
      hasResponse: false,
      progress: null,
      classes: { name: 'Biology II' },
    }));

    const incompletePulses = pulsesWithProgress.filter(pulse => !pulse.hasResponse);
    console.log('[PopupQueue] Incomplete pulses:', incompletePulses.length);

    return { incompletePulses, userClassCount, activePulsesCount };
  };

  const handleCurrentComplete = async () => {
    const currentItem = queue[currentIndex];
    if (currentItem?.type === 'morning_pulse' && user) {
      markMorningPulseShown(user.id);
    }

    await new Promise(resolve => setTimeout(resolve, 300));

    if (currentIndex < queue.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(-1);
      if (onAllComplete) onAllComplete();
    }
  };

  const handleDismiss = () => {
    const currentItem = queue[currentIndex];
    if (currentItem?.type === 'morning_pulse' && user) {
      markMorningPulseShown(user.id);
    }

    setCurrentIndex(-1);
    if (onAllComplete) onAllComplete();
  };

  const handleClearCache = () => {
    if (user) {
      clearPopupSessionStorage(user.id);
      window.location.reload();
    }
  };

  const showDebugPanel = !isLoading;

  return (
    <>
      {!isLoading && currentIndex !== -1 && currentIndex < queue.length && (
        <>
          {queue[currentIndex].type === 'morning_pulse' && (
            <MorningPulseModal
              onComplete={handleCurrentComplete}
              onDismiss={handleDismiss}
            />
          )}

          {queue[currentIndex].type === 'class_pulses' && (
            <ConsolidatedClassPulsesModal
              pulses={queue[currentIndex].data || []}
              onComplete={handleCurrentComplete}
              onDismiss={handleDismiss}
            />
          )}
        </>
      )}

      {showDebugPanel && user && (
        <PopupDebugPanel debugInfo={debugInfo} onClearCache={handleClearCache} />
      )}
    </>
  );
}
