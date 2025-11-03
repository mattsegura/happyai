import { Brain, Sparkles, Zap, Target, TrendingUp, Shield } from "lucide-react";

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

  return (
    <section id="intelligence" className="relative overflow-hidden bg-[#FFFDF8] dark:bg-slate-900 py-24 sm:py-32">
      <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-8">
        {/* Header and Video - Side by Side Layout */}
        <div className="grid lg:grid-cols-[0.85fr,1.15fr] gap-6 lg:gap-10 items-start mb-20">
          {/* Left: Title and Description */}
          <div className="text-left pt-2">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500/10 to-blue-500/10 border border-sky-500/30 px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span className="text-sm font-semibold text-sky-700 dark:text-sky-300">Powered by AI</span>
              <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>

            {/* Main heading with gradient */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-sky-400 via-blue-500 to-sky-600 dark:from-sky-400 dark:via-blue-400 dark:to-sky-500 bg-clip-text text-transparent">
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

          {/* Right: App Preview Video */}
          <div className="w-full flex items-start justify-end pt-2">
            <div className="relative w-full rounded-lg overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-[0.5px] border-gray-300/30 dark:border-gray-600 bg-white dark:bg-slate-800">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-auto block"
              >
                <source src="/app-preview.mp4" type="video/mp4" />
              </video>
            </div>
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
                <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-500 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-20 blur transition duration-500" />

                {/* Card content */}
                <div className="relative h-full bg-white dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 transition-all duration-300 group-hover:border-sky-500/50 group-hover:transform group-hover:-translate-y-1 shadow-sm">
                  <div className="flex flex-col items-center text-center gap-4">
                    {/* Icon */}
                    <div className="p-3 rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-500/20 border border-sky-500/30">
                      <Icon className="w-6 h-6 text-sky-600 dark:text-sky-400" />
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
      </div>
    </section>
  );
}

