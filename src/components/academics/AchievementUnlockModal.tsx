/**
 * Achievement Unlock Modal
 *
 * Celebratory modal that appears when a user unlocks an achievement.
 * Features confetti animation and achievement details.
 */

import { useEffect, useState } from 'react';
import { Trophy, X, Sparkles } from 'lucide-react';
import type { Achievement } from '@/lib/gamification/achievementTracker';

interface AchievementUnlockModalProps {
  achievement: Achievement;
  onClose: () => void;
}

const tierColors = {
  bronze: {
    gradient: 'from-amber-700 via-amber-600 to-amber-900',
    glow: 'bg-amber-500',
    text: 'text-amber-100'
  },
  silver: {
    gradient: 'from-gray-400 via-gray-300 to-gray-600',
    glow: 'bg-gray-400',
    text: 'text-gray-100'
  },
  gold: {
    gradient: 'from-yellow-400 via-yellow-300 to-yellow-600',
    glow: 'bg-yellow-400',
    text: 'text-yellow-100'
  },
  platinum: {
    gradient: 'from-cyan-400 via-blue-400 to-blue-600',
    glow: 'bg-cyan-400',
    text: 'text-cyan-100'
  }
};

export function AchievementUnlockModal({ achievement, onClose }: AchievementUnlockModalProps) {
  const [showConfetti, setShowConfetti] = useState(true);
  const [animate, setAnimate] = useState(false);

  const tierStyle = tierColors[achievement.tier];

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setAnimate(true), 50);

    // Hide confetti after 3 seconds
    const timer = setTimeout(() => setShowConfetti(false), 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      {/* Confetti */}
      {showConfetti && <Confetti />}

      {/* Modal */}
      <div
        className={`relative bg-gradient-to-br ${tierStyle.gradient} rounded-3xl p-8 max-w-md w-full text-white shadow-2xl transform transition-all duration-500 ${
          animate ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
        }`}
      >
        {/* Glow effect */}
        <div className={`absolute inset-0 ${tierStyle.glow} opacity-20 rounded-3xl blur-3xl animate-pulse`}></div>

        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10 overflow-hidden rounded-3xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-2xl -ml-24 -mb-24"></div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="relative z-10 text-center">
          {/* Trophy icon with sparkles */}
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 animate-ping opacity-75">
              <Trophy className="w-20 h-20 mx-auto" />
            </div>
            <Trophy className="w-20 h-20 mx-auto relative" />
            <Sparkles className="w-8 h-8 absolute -top-2 -right-2 animate-pulse" />
            <Sparkles className="w-6 h-6 absolute -bottom-2 -left-2 animate-pulse delay-75" />
          </div>

          {/* Achievement Unlocked Text */}
          <h2 className="text-3xl font-black mb-2 tracking-tight animate-in slide-in-from-bottom-4 duration-500">
            Achievement Unlocked!
          </h2>

          {/* Achievement icon */}
          <div className="text-8xl mb-4 animate-in zoom-in duration-700 delay-150">
            {achievement.icon}
          </div>

          {/* Achievement name */}
          <h3 className="text-2xl font-bold mb-2 animate-in slide-in-from-bottom-4 duration-500 delay-200">
            {achievement.name}
          </h3>

          {/* Tier badge */}
          <div className="inline-block px-4 py-1 rounded-full bg-white/20 text-sm font-bold uppercase tracking-wider mb-4 animate-in zoom-in duration-500 delay-300">
            {achievement.tier}
          </div>

          {/* Description */}
          <p className="text-lg opacity-90 mb-6 animate-in slide-in-from-bottom-4 duration-500 delay-400">
            {achievement.description}
          </p>

          {/* Points earned */}
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-6 animate-in slide-in-from-bottom-4 duration-500 delay-500">
            <div className="text-5xl font-black mb-2">
              +{achievement.points_reward}
            </div>
            <div className="text-sm font-semibold opacity-90 uppercase tracking-wider">
              Points Earned
            </div>
          </div>

          {/* Continue button */}
          <button
            onClick={onClose}
            className="w-full bg-white/90 hover:bg-white text-gray-900 font-bold py-4 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg animate-in slide-in-from-bottom-4 duration-500 delay-600"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CONFETTI COMPONENT
// ============================================================================

function Confetti() {
  const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 3}s`,
    backgroundColor: [
      '#FFD700', // Gold
      '#FF69B4', // Pink
      '#00CED1', // Turquoise
      '#FF6347', // Tomato
      '#9370DB', // Purple
      '#32CD32', // Lime
      '#FF4500', // Orange
      '#1E90FF'  // Blue
    ][Math.floor(Math.random() * 8)]
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confettiPieces.map(piece => (
        <div
          key={piece.id}
          className="absolute w-2 h-2 opacity-80 animate-confetti"
          style={{
            left: piece.left,
            top: '-10%',
            backgroundColor: piece.backgroundColor,
            animationDelay: piece.animationDelay,
            animationDuration: `${2 + Math.random() * 2}s`
          }}
        />
      ))}
      <style>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti linear forwards;
        }
      `}</style>
    </div>
  );
}
