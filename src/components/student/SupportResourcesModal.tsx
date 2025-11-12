import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  X, Heart, Phone, MessageCircle, Users, Book, 
  Brain, Wind, Smile, ExternalLink, ArrowRight 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SupportResourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const crisisResources = [
  {
    name: 'National Suicide Prevention Lifeline',
    phone: '988',
    description: '24/7 free and confidential support',
    availability: 'Available 24/7',
  },
  {
    name: 'Crisis Text Line',
    phone: 'Text HOME to 741741',
    description: 'Free 24/7 support via text message',
    availability: 'Available 24/7',
  },
  {
    name: 'SAMHSA National Helpline',
    phone: '1-800-662-4357',
    description: 'Treatment referral and information service',
    availability: 'Available 24/7',
  },
];

const campusResources = [
  {
    name: 'University Counseling Center',
    description: 'Professional mental health services for students',
    hours: 'Mon-Fri, 9am-5pm',
    location: 'Student Services Building, Room 210',
    phone: '(555) 123-4567',
  },
  {
    name: 'Student Health Center',
    description: 'Medical and wellness services',
    hours: 'Mon-Fri, 8am-6pm',
    location: 'Health Sciences Building',
    phone: '(555) 123-4568',
  },
  {
    name: 'Academic Success Center',
    description: 'Tutoring, study skills, and academic coaching',
    hours: 'Mon-Sat, 9am-9pm',
    location: 'Library, 3rd Floor',
    phone: '(555) 123-4569',
  },
  {
    name: 'Peer Support Groups',
    description: 'Connect with other students facing similar challenges',
    hours: 'Various times weekly',
    location: 'Student Union, Room 305',
    phone: '(555) 123-4570',
  },
];

const quickTools = [
  {
    name: 'Guided Breathing',
    description: 'Quick stress relief exercise',
    icon: Wind,
    color: 'from-blue-500 to-cyan-500',
    action: 'breathing',
  },
  {
    name: 'Wellbeing Coach',
    description: 'Talk to your AI wellbeing coach',
    icon: Heart,
    color: 'from-pink-500 to-rose-500',
    action: 'coach',
  },
  {
    name: 'Mood Check-in',
    description: 'Track how you\'re feeling',
    icon: Smile,
    color: 'from-purple-500 to-violet-500',
    action: 'mood',
  },
];

export function SupportResourcesModal({ isOpen, onClose }: SupportResourcesModalProps) {
  const navigate = useNavigate();

  const handleQuickToolClick = (action: string) => {
    switch (action) {
      case 'breathing':
        // Could open breathing exercise modal or navigate
        alert('Opening guided breathing exercise...');
        break;
      case 'coach':
        onClose();
        navigate('/dashboard/ai-chat/coach');
        break;
      case 'mood':
        alert('Opening mood check-in...');
        break;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-4xl my-8 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Heart className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Support & Resources</h2>
                  <p className="text-sm opacity-90">We're here to help you succeed</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Quick Tools */}
            <div>
              <h3 className="font-semibold text-lg text-foreground mb-3 flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                Quick Wellbeing Tools
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {quickTools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <button
                      key={tool.action}
                      onClick={() => handleQuickToolClick(tool.action)}
                      className={cn(
                        'p-4 rounded-xl border border-border hover:border-primary/50 transition-all text-left group',
                        'hover:shadow-lg'
                      )}
                    >
                      <div className={cn('w-10 h-10 rounded-lg bg-gradient-to-r flex items-center justify-center mb-3', tool.color)}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <p className="font-semibold text-foreground mb-1">{tool.name}</p>
                      <p className="text-xs text-muted-foreground mb-2">{tool.description}</p>
                      <div className="flex items-center gap-1 text-xs text-primary font-medium">
                        <span>Open</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Crisis Resources */}
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-800">
              <div className="flex items-start gap-3 mb-4">
                <Phone className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg text-red-900 dark:text-red-100 mb-1">
                    Crisis Support - Available 24/7
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    If you're in crisis or need immediate support, please reach out:
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                {crisisResources.map((resource, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-white dark:bg-gray-900 border border-red-200 dark:border-red-800"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-semibold text-foreground mb-1">{resource.name}</p>
                        <p className="text-sm text-muted-foreground mb-2">{resource.description}</p>
                        <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                          {resource.availability}
                        </p>
                      </div>
                      <a
                        href={`tel:${resource.phone.replace(/\D/g, '')}`}
                        className="flex-shrink-0 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm flex items-center gap-2"
                      >
                        <Phone className="w-4 h-4" />
                        {resource.phone}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Campus Resources */}
            <div>
              <h3 className="font-semibold text-lg text-foreground mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Campus Resources
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {campusResources.map((resource, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-border hover:border-primary/50 transition-all hover:shadow-md"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-foreground">{resource.name}</h4>
                      <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{resource.description}</p>
                    <div className="space-y-1 text-xs">
                      <p className="text-foreground">
                        <span className="font-medium">Hours:</span> {resource.hours}
                      </p>
                      <p className="text-foreground">
                        <span className="font-medium">Location:</span> {resource.location}
                      </p>
                      <a
                        href={`tel:${resource.phone.replace(/\D/g, '')}`}
                        className="text-primary hover:underline font-medium flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" />
                        {resource.phone}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Online Resources */}
            <div>
              <h3 className="font-semibold text-lg text-foreground mb-3 flex items-center gap-2">
                <Book className="w-5 h-5 text-primary" />
                Online Resources
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { name: 'Mental Health America', url: 'https://www.mhanational.org' },
                  { name: 'Active Minds', url: 'https://www.activeminds.org' },
                  { name: 'The Jed Foundation', url: 'https://jedfoundation.org' },
                  { name: 'Headspace for Students', url: 'https://www.headspace.com/students' },
                ].map((resource, idx) => (
                  <a
                    key={idx}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-lg border border-border hover:border-primary/50 transition-all hover:shadow-md flex items-center justify-between group"
                  >
                    <span className="font-medium text-foreground text-sm">{resource.name}</span>
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </a>
                ))}
              </div>
            </div>

            {/* Important Notice */}
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-900 dark:text-blue-100 font-medium mb-1">
                    Remember: It's okay to ask for help
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Your mental health and wellbeing are just as important as your academic success. 
                    These resources are here to support you, and using them is a sign of strength, not weakness.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border bg-muted/30 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

