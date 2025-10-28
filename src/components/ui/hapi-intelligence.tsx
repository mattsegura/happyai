import { Brain, Sparkles, Zap, Target, TrendingUp, Shield, AlertTriangle, TrendingDown, Heart } from "lucide-react";
import { Button } from "./button";
import DisplayCards from "./display-cards";
import type { DisplayCardProps } from "./display-cards";

export interface HapiIntelligenceProps {
  onCtaClick?: () => void;
}

export function HapiIntelligence({ onCtaClick }: HapiIntelligenceProps) {
  const capabilities = [
    {
      icon: Brain,
      title: "Context-Aware Analysis",
      description: "Understands patterns across mood, behavior, and academic performance"
    },
    {
      icon: Target,
      title: "Predictive Insights",
      description: "Identifies at-risk students before issues escalate"
    },
    {
      icon: TrendingUp,
      title: "Adaptive Learning",
      description: "Continuously improves from every interaction and outcome"
    },
    {
      icon: Shield,
      title: "Privacy-First Design",
      description: "Built with student data protection at its core"
    }
  ];

  const insightCards: DisplayCardProps[] = [
    {
      icon: <AlertTriangle className="w-4 h-4 text-amber-300" />,
      title: "At-Risk Alert",
      description: "3 students need attention",
      date: "Real-time",
      iconClassName: "text-amber-500",
      titleClassName: "text-amber-500",
      className: "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      icon: <TrendingDown className="w-4 h-4 text-red-300" />,
      title: "Engagement Drop",
      description: "Class 4B showing 15% decline",
      date: "This week",
      iconClassName: "text-red-500",
      titleClassName: "text-red-500",
      className: "[grid-area:stack] translate-x-16 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      icon: <Heart className="w-4 h-4 text-green-300" />,
      title: "Wellbeing Boost",
      description: "Morning check-ins +22%",
      date: "Today",
      iconClassName: "text-green-500",
      titleClassName: "text-green-500",
      className: "[grid-area:stack] translate-x-32 translate-y-20 hover:translate-y-10",
    },
  ];

  return (
    <section id="intelligence" className="relative overflow-hidden bg-slate-50 dark:bg-slate-900 py-24 sm:py-32">
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header and AI Insights - Side by Side Layout */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-20">
          {/* Left: Title and Description */}
          <div className="text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">Powered by AI</span>
              <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>

            {/* Main heading with gradient */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400 bg-clip-text text-transparent">
                Hapi Intelligence
              </span>
            </h2>

            {/* Description */}
            <p className="text-xl text-slate-700 dark:text-slate-300 leading-relaxed mb-8">
              The engine behind Hapi—transforming millions of data points into insight that helps schools truly understand their students.
            </p>

            {/* AI Insights Subheading */}
            <div className="mb-6">
              <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-3">
                AI Insights in Action
              </h3>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Real-time intelligence that surfaces the moments that matter most
              </p>
            </div>
          </div>

          {/* Right: Display Cards */}
          <div className="flex justify-center lg:justify-start">
            <DisplayCards cards={insightCards} />
          </div>
        </div>

        {/* Capabilities Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {capabilities.map((capability, index) => {
            const Icon = capability.icon;
            return (
              <div
                key={capability.title}
                className="group relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Hover glow effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-20 blur transition duration-500" />
                
                {/* Card content */}
                <div className="relative h-full bg-white dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 transition-all duration-300 group-hover:border-purple-500/50 group-hover:transform group-hover:-translate-y-1 shadow-sm">
                  <div className="flex flex-col items-center text-center gap-4">
                    {/* Icon */}
                    <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30">
                      <Icon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {capability.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {capability.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mb-12">
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-2">
              99.7%
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Accuracy Rate</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-blue-600 dark:from-pink-400 dark:to-blue-400 bg-clip-text text-transparent mb-2">
              &lt;100ms
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Response Time</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
              24/7
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Always Learning</div>
          </div>
        </div>
      </div>
    </section>
  );
}

