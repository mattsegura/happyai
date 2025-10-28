import { Sparkles, Heart, TrendingUp, Smile, Award, BookOpen, Users, Brain } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface HapiMoment {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

export interface HapiMomentsProps {
  moments?: HapiMoment[];
  className?: string;
}

const defaultMoments: HapiMoment[] = [
  {
    id: 1,
    title: 'Emotional Breakthroughs',
    description: 'When students identify and articulate their feelings for the first time',
    icon: Heart,
    color: 'from-pink-400 to-rose-500',
  },
  {
    id: 2,
    title: 'Academic Victories',
    description: 'Celebrating grade improvements and assignment completion streaks',
    icon: TrendingUp,
    color: 'from-sky-400 to-blue-500',
  },
  {
    id: 3,
    title: 'Wellbeing Wins',
    description: 'Students reporting reduced stress and improved mood over time',
    icon: Smile,
    color: 'from-amber-400 to-orange-500',
  },
  {
    id: 4,
    title: 'Growth Milestones',
    description: 'Tracking progress in emotional intelligence and self-awareness',
    icon: Award,
    color: 'from-purple-400 to-violet-500',
  },
  {
    id: 5,
    title: 'Learning Insights',
    description: 'Discovering connections between mood, productivity, and success',
    icon: BookOpen,
    color: 'from-emerald-400 to-teal-500',
  },
  {
    id: 6,
    title: 'Community Support',
    description: 'Teachers intervening at the right time to support struggling students',
    icon: Users,
    color: 'from-indigo-400 to-blue-500',
  },
  {
    id: 7,
    title: 'Pattern Recognition',
    description: 'AI identifying trends that lead to personalized recommendations',
    icon: Brain,
    color: 'from-cyan-400 to-sky-500',
  },
  {
    id: 8,
    title: 'Success Stories',
    description: 'Real transformations in student confidence and academic performance',
    icon: Sparkles,
    color: 'from-yellow-400 to-amber-500',
  },
];

export function HapiMoments({ moments = defaultMoments, className }: HapiMomentsProps) {
  return (
    <section id="moments" className={cn("py-24 sm:py-32 bg-white dark:bg-slate-950", className)}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-base font-semibold leading-7 text-sky-600">
            Hapi Moments
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Every day is full of meaningful moments
          </p>
          <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-400">
            Hapi captures and celebrates the small victories, breakthroughs, and growth that matter most in education
          </p>
        </div>

        {/* Moments Grid */}
        <div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {moments.map((moment, index) => {
            const Icon = moment.icon;
            return (
              <div
                key={moment.id}
                className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-lg border border-slate-200 dark:border-slate-800 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {/* Gradient background on hover */}
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300",
                  moment.color
                )} />
                
                {/* Icon */}
                <div className={cn(
                  "inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br mb-4 shadow-md",
                  moment.color
                )}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  {moment.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {moment.description}
                </p>

                {/* Decorative corner accent */}
                <div className={cn(
                  "absolute -right-2 -bottom-2 w-16 h-16 rounded-full bg-gradient-to-br opacity-10 blur-xl group-hover:opacity-20 transition-opacity duration-300",
                  moment.color
                )} />
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mx-auto mt-16 max-w-2xl text-center">
          <p className="text-base text-slate-600 dark:text-slate-400">
            Join thousands of students and educators who are creating their own Hapi Moments every day
          </p>
        </div>
      </div>
    </section>
  );
}

