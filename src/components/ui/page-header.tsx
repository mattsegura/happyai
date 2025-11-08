import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from './logo';

interface PageHeaderProps {
  theme?: 'blue' | 'purple' | 'pink' | 'sky';
}

const themeColors = {
  blue: {
    gradient: 'from-sky-500 to-blue-600',
    hoverGradient: 'hover:from-sky-600 hover:to-blue-700',
  },
  purple: {
    gradient: 'from-purple-500 to-indigo-600',
    hoverGradient: 'hover:from-purple-600 hover:to-indigo-700',
  },
  pink: {
    gradient: 'from-pink-500 to-purple-600',
    hoverGradient: 'hover:from-pink-600 hover:to-purple-700',
  },
  sky: {
    gradient: 'from-cyan-500 to-sky-600',
    hoverGradient: 'hover:from-cyan-600 hover:to-sky-700',
  },
};

export function PageHeader({ theme = 'blue' }: PageHeaderProps) {
  const colors = themeColors[theme];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700"
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Logo />

          {/* Back to Home Button */}
          <Link to="/">
            <motion.button
              whileHover={{ scale: 1.05, x: -2 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r ${colors.gradient} ${colors.hoverGradient} text-white font-semibold shadow-lg hover:shadow-xl transition-all`}
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}

