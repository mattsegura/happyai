import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import {
  BarChart3,
  Brain,
  ShieldCheck,
  Users,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Target,
  ArrowLeft,
  GraduationCap,
  HeartHandshake,
  LineChart,
  Sparkles,
  Clock,
  Award,
  Lightbulb,
  Zap,
  Activity
} from 'lucide-react';
import { PageHeader } from '../ui/page-header';
import { DonutChart } from '../ui/donut-chart';
import { RetentionStatsCard } from '../ui/retention-stats-card';
import { InstitutionalMetricsDashboard } from '../ui/institutional-metrics-dashboard';
import { Footer } from '../ui/footer';
import { cn } from '../../lib/utils';

export function EnterpriseFeaturesPage() {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  // Real data: Why students drop out (70%+ cite these as primary reasons)
  const dropoutReasonsData = [
    { value: 38, color: "#dc2626", label: "Stress & Burnout" },
    { value: 32, color: "#ea580c", label: "Time Management" },
    { value: 30, color: "#ca8a04", label: "Lack of Motivation" },
  ];

  const totalReasons = dropoutReasonsData.reduce((sum, d) => sum + d.value, 0);
  const activeReason = dropoutReasonsData.find((segment) => segment.label === hoveredSegment);
  const displayValue = activeReason?.value ?? 100;
  const displayLabel = activeReason?.label ?? "70%+ of Dropouts";

  // Real data: Academic vs Emotional reasons (30% drop out for these reasons)
  const [hoveredCause, setHoveredCause] = useState<string | null>(null);
  const dropoutCausesData = [
    { value: 50, color: "#6366f1", label: "Academic Challenges" },
    { value: 50, color: "#8b5cf6", label: "Emotional Distress" },
  ];

  const totalCauses = dropoutCausesData.reduce((sum, d) => sum + d.value, 0);
  const activeCause = dropoutCausesData.find((segment) => segment.label === hoveredCause);
  const displayCauseValue = activeCause?.value ?? 30;
  const displayCauseLabel = activeCause?.label ?? "30% of Dropouts";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-slate-950 dark:via-indigo-950/20 dark:to-purple-950/20">
      <PageHeader theme="purple" />

      {/* Hero Section - Professional & Data-Driven */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-8 max-w-5xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-900 shadow-sm"
          >
            <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">Enterprise Solutions for Higher Education</span>
          </motion.div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
            <span className="text-slate-900 dark:text-white">Institutional Excellence</span>
            <br />
            <span className="text-slate-900 dark:text-white">Through </span>
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Student Success
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl mx-auto">
            Data-driven insights that transform retention, optimize resources, and align institutional outcomes with strategic goals.
          </p>
        </motion.div>
      </section>

      {/* The National Challenge - Hero Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            The National Retention Challenge
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Understanding the scale of the issue facing higher education today
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[
            {
              stat: '39%',
              label: 'of U.S. undergraduates fail to complete their degree within 8 years',
              source: 'Education Data Initiative, 2024',
              color: 'from-red-500 to-orange-600',
              icon: AlertTriangle
            },
            {
              stat: '30%',
              label: 'of college students drop out for academic or emotional reasons',
              source: 'American Institutes for Research, 2023',
              color: 'from-orange-500 to-amber-600',
              icon: HeartHandshake
            },
            {
              stat: '$16.5B',
              label: 'lost annually by U.S. universities in tuition, grants, and recruitment',
              source: 'AIR, 2022',
              color: 'from-amber-500 to-yellow-600',
              icon: DollarSign
            },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-3xl opacity-90 group-hover:opacity-100 transition-opacity" />
              <div className="relative p-8 rounded-3xl border border-slate-200 dark:border-slate-700 group-hover:border-slate-300 dark:group-hover:border-slate-600 transition-all">
                <div className={cn("w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-6", item.color)}>
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <p className={cn("text-5xl md:text-6xl font-bold bg-gradient-to-br bg-clip-text text-transparent mb-4", item.color)}>
                  {item.stat}
                </p>
                <p className="text-base font-medium text-slate-700 dark:text-slate-300 mb-3 leading-relaxed">{item.label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 italic">{item.source}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Critical Insight Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-slate-900 to-indigo-900 dark:from-slate-800 dark:to-indigo-800 rounded-2xl p-8 text-center shadow-xl"
        >
          <p className="text-2xl md:text-3xl font-bold text-white mb-2">
            Recruiting a new student costs <span className="text-amber-400">5–6× more</span> than retaining an existing one
          </p>
          <p className="text-sm text-slate-300 mt-3">EAB, 2021</p>
        </motion.div>
      </section>

      {/* Understanding the Why - Interactive Charts */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-full border border-indigo-200 dark:border-indigo-800 mb-6">
            <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">Student Departure Drivers</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Why Students Leave
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Research identifies clear patterns—and opportunities for intervention
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Chart 1: Primary Reasons (70%+ cite these) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-700"
          >
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Primary Dropout Factors
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                70%+ of students cite these as primary reasons for leaving
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500 italic mt-2">
                Gallup & Lumina Foundation, 2022
              </p>
            </div>
            
            <div className="flex justify-center mb-8">
              <DonutChart
                data={dropoutReasonsData}
                size={300}
                strokeWidth={50}
                animationDuration={1.8}
                animationDelayPerSegment={0.2}
                highlightOnHover={true}
                centerContent={
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={displayLabel}
                      initial={{ opacity: 0, scale: 0.8, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: -10 }}
                      transition={{ 
                        duration: 0.3,
                        ease: [0.4, 0, 0.2, 1]
                      }}
                      className="flex flex-col items-center justify-center text-center px-4"
                    >
                      <p className="text-slate-600 dark:text-slate-400 text-xs font-medium mb-2 leading-tight">
                        {displayLabel}
                      </p>
                      <p className="text-6xl font-bold text-slate-900 dark:text-white">
                        {displayValue}%
                      </p>
                    </motion.div>
                  </AnimatePresence>
                }
                onSegmentHover={(segment) => setHoveredSegment(segment?.label || null)}
              />
            </div>

            <div className="space-y-3">
              {dropoutReasonsData.map((segment, index) => (
                <motion.div
                  key={segment.label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 2.2 + index * 0.1, duration: 0.3 }}
                  whileHover={{ 
                    scale: 1.03,
                    x: 4,
                    transition: { duration: 0.2, ease: "easeOut" }
                  }}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl cursor-pointer",
                    hoveredSegment === segment.label 
                      ? "bg-slate-100 dark:bg-slate-700 shadow-lg" 
                      : "bg-slate-50 dark:bg-slate-800/50 shadow-sm"
                  )}
                  onMouseEnter={() => setHoveredSegment(segment.label)}
                  onMouseLeave={() => setHoveredSegment(null)}
                >
                  <div className="flex items-center space-x-3">
                    <motion.span
                      className="h-4 w-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: segment.color }}
                      animate={{
                        scale: hoveredSegment === segment.label ? 1.3 : 1,
                        boxShadow: hoveredSegment === segment.label 
                          ? `0 0 12px ${segment.color}` 
                          : `0 0 0px ${segment.color}`
                      }}
                      transition={{ duration: 0.2 }}
                    />
                    <span className="text-base font-semibold text-slate-900 dark:text-white">
                      {segment.label}
                    </span>
                  </div>
                  <span className="text-lg font-bold text-slate-700 dark:text-slate-300">
                    {segment.value}%
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Chart 2: Academic vs Emotional (30% split) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-700"
          >
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Root Causes of Departure
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                30% of students leave for these preventable reasons
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500 italic mt-2">
                American Institutes for Research, 2023
              </p>
            </div>
            
            <div className="flex justify-center mb-8">
              <DonutChart
                data={dropoutCausesData}
                size={300}
                strokeWidth={50}
                animationDuration={1.8}
                animationDelayPerSegment={0.3}
                highlightOnHover={true}
                centerContent={
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={displayCauseLabel}
                      initial={{ opacity: 0, scale: 0.8, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: -10 }}
                      transition={{ 
                        duration: 0.3,
                        ease: [0.4, 0, 0.2, 1]
                      }}
                      className="flex flex-col items-center justify-center text-center px-4"
                    >
                      <p className="text-slate-600 dark:text-slate-400 text-xs font-medium mb-2 leading-tight">
                        {displayCauseLabel}
                      </p>
                      <p className="text-6xl font-bold text-slate-900 dark:text-white">
                        {displayCauseValue}%
                      </p>
                    </motion.div>
                  </AnimatePresence>
                }
                onSegmentHover={(segment) => setHoveredCause(segment?.label || null)}
              />
            </div>

            <div className="space-y-3">
              {dropoutCausesData.map((segment, index) => (
                <motion.div
                  key={segment.label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 2.4 + index * 0.1, duration: 0.3 }}
                  whileHover={{ 
                    scale: 1.03,
                    x: 4,
                    transition: { duration: 0.2, ease: "easeOut" }
                  }}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl cursor-pointer",
                    hoveredCause === segment.label 
                      ? "bg-indigo-50 dark:bg-indigo-900/20 shadow-lg" 
                      : "bg-slate-50 dark:bg-slate-800/50 shadow-sm"
                  )}
                  onMouseEnter={() => setHoveredCause(segment.label)}
                  onMouseLeave={() => setHoveredCause(null)}
                >
                  <div className="flex items-center space-x-3">
                    <motion.span
                      className="h-4 w-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: segment.color }}
                      animate={{
                        scale: hoveredCause === segment.label ? 1.3 : 1,
                        boxShadow: hoveredCause === segment.label 
                          ? `0 0 12px ${segment.color}` 
                          : `0 0 0px ${segment.color}`
                      }}
                      transition={{ duration: 0.2 }}
                    />
                    <span className="text-base font-semibold text-slate-900 dark:text-white">
                      {segment.label}
                    </span>
                  </div>
                  <span className="text-lg font-bold text-slate-700 dark:text-slate-300">
                    {segment.value}%
                  </span>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
              <p className="text-sm font-semibold text-purple-900 dark:text-purple-200 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Both academic and emotional wellbeing require monitoring
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Financial Opportunity */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-full border border-green-200 dark:border-green-800 mb-6">
            <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-semibold text-green-700 dark:text-green-300">Financial Impact Analysis</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            The ROI of Retention
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Small improvements in retention create significant financial outcomes
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr,400px] gap-8 items-start">
          {/* Left: Financial Impact Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                metric: '$1M–$5M',
                description: 'Additional annual revenue per 1% increase in student retention for mid-to-large universities',
                source: 'Chronicle of Higher Education, 2022',
                icon: TrendingUp,
                color: 'from-green-500 to-emerald-600'
              },
              {
                metric: '$9,000–$15,000',
                description: 'Average net tuition revenue lost per student who drops out before graduation',
                source: 'IPEDS, 2023',
                icon: AlertTriangle,
                color: 'from-red-500 to-orange-600'
              },
              {
                metric: '$57,000',
                description: 'Lifetime tuition and fees lost per non-completer over their expected enrollment period',
                source: 'Education Data Initiative, 2023',
                icon: Target,
                color: 'from-amber-500 to-yellow-600'
              },
              {
                metric: '25%',
                description: 'of state funding tied to retention, progression, and graduation rates in performance-based models',
                source: 'SHEEO, 2023',
                icon: Award,
                color: 'from-indigo-500 to-purple-600'
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-2xl transition-all duration-300"
              >
                <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4 group-hover:scale-110 transition-transform", item.color)}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mb-3">{item.metric}</p>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-3">{item.description}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 italic">{item.source}</p>
              </motion.div>
            ))}
          </div>

          {/* Right: Retention Performance Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:sticky lg:top-8"
          >
            <RetentionStatsCard
              title="Example Performance"
              timeFrame="2023-2024"
              impact={{
                percentage: 61,
                change: 5,
                changePeriod: "vs. prior year"
              }}
              subStats={[
                { value: "2,847", label: "students", subLabel: "total enrollment" },
                { value: "46%", label: "grad rate", subLabel: "4-year cohort" },
              ] as [any, any]}
              ranking={{
                place: "Top 15%",
                category: "retention improvement nationally",
                icon: <Award className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              }}
              trend={{
                title: "5-Year Retention Trend",
                bars: [
                  { level: 0.5 }, { level: 0.52 }, { level: 0.55 }, { level: 0.56 },
                  { level: 0.57 }, { level: 0.58 }, { level: 0.59 }, { level: 0.60 },
                  { level: 0.61 }, { level: 0.65 }, { level: 0.68 }, { level: 0.70 },
                  { level: 0.72 }, { level: 0.75 }, { level: 0.78 }, { level: 0.80 },
                  { level: 0.82 }, { level: 0.85 }, { level: 0.88 }, { level: 0.90 },
                ],
                label: "↑ Growing retention with targeted interventions"
              }}
              className="shadow-2xl"
            />
          </motion.div>
        </div>
      </section>

      {/* The Gap in Current Systems */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-full border border-amber-200 dark:border-amber-800 mb-6">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">Current State Assessment</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            The Intervention Gap
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Most institutions lack the tools to act on early warning signs
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              stat: '1:400',
              label: 'Average student-to-advisor ratio limits individualized intervention',
              source: 'NACADA, 2022',
              icon: Users
            },
            {
              stat: '37%',
              label: 'of institutions have automated systems tracking emotional wellbeing with academics',
              source: 'EDUCAUSE, 2022',
              icon: BarChart3
            },
            {
              stat: '81%',
              label: 'of administrators cite data fragmentation preventing effective student monitoring',
              source: 'Tyton Partners, 2022',
              icon: AlertTriangle
            },
            {
              stat: '28%',
              label: 'of public institutions report high satisfaction with current early-alert systems',
              source: 'EDUCAUSE, 2023',
              icon: Target
            },
            {
              stat: '58%',
              label: 'of students say better guidance or feedback would have helped them stay enrolled',
              source: 'Gallup, 2023',
              icon: HeartHandshake
            },
            {
              stat: '46%',
              label: 'median 4-year graduation rate in U.S., compared to 70%+ in peer OECD countries',
              source: 'OECD, 2023',
              icon: GraduationCap
            },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-amber-200 dark:border-amber-900/30"
            >
              <item.icon className="w-10 h-10 text-amber-600 dark:text-amber-400 mb-4" />
              <p className="text-4xl font-bold text-slate-900 dark:text-white mb-3">{item.stat}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">{item.label}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 italic">{item.source}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Evidence-Based Solutions */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-full border border-indigo-200 dark:border-indigo-800 mb-6">
            <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">Research-Backed Interventions</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            What the Data Shows Works
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Proven strategies that improve outcomes when implemented effectively
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              impact: '2.2×',
              title: 'More likely to graduate',
              detail: 'Students who engage with academic planners or study assistants',
              source: 'NCES, 2023',
              color: 'from-green-500 to-emerald-600'
            },
            {
              impact: '31%',
              title: 'Higher academic performance',
              detail: 'Students receiving consistent emotional check-ins',
              source: 'Inside Higher Ed, 2023',
              color: 'from-blue-500 to-cyan-600'
            },
            {
              impact: '60%',
              title: 'Faster intervention',
              detail: 'Faculty response time with predictive at-risk alerts',
              source: 'EDUCAUSE Review, 2022',
              color: 'from-purple-500 to-indigo-600'
            },
            {
              impact: '10-15%',
              title: 'Higher pass rates',
              detail: 'Courses using predictive analytics for early alerts',
              source: 'McKinsey Education, 2023',
              color: 'from-indigo-500 to-purple-600'
            },
            {
              impact: '25%',
              title: 'Reduction in attrition',
              detail: 'Interventions targeting both emotional and academic signals',
              source: 'AIR, 2021',
              color: 'from-emerald-500 to-green-600'
            },
            {
              impact: '42%',
              title: 'On-time submissions',
              detail: 'Students receiving AI-powered nudges and personalized reminders',
              source: 'Georgia State University, 2022',
              color: 'from-cyan-500 to-blue-600'
            },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-2xl transition-all duration-300"
            >
              <div className={cn("absolute top-0 left-0 w-2 h-full rounded-l-2xl bg-gradient-to-b", item.color)} />
              <div className="pl-4">
                <p className={cn("text-4xl font-bold bg-gradient-to-br bg-clip-text text-transparent mb-2", item.color)}>
                  {item.impact}
                </p>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">{item.detail}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 italic">{item.source}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Real-Time Engagement Tracking */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-slate-50 dark:from-indigo-950/20 dark:via-purple-950/10 dark:to-slate-950">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Engagement Dashboard */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <InstitutionalMetricsDashboard
              title="Real-Time Engagement"
              metrics={{
                totalEngagement: 71.4,
                stats: [
                  { label: "High", value: 42, color: "bg-green-500" },
                  { label: "Medium", value: 29, color: "bg-yellow-500" },
                  { label: "At-Risk", value: 23, color: "bg-red-500" },
                  { label: "Inactive", value: 6, color: "bg-slate-400" },
                ]
              }}
              departments={{
                count: 18,
                items: [
                  { id: "1", name: "Engineering", avatarUrl: "https://i.pravatar.cc/150?u=eng" },
                  { id: "2", name: "Business", avatarUrl: "https://i.pravatar.cc/150?u=bus" },
                  { id: "3", name: "Sciences", avatarUrl: "https://i.pravatar.cc/150?u=sci" },
                  { id: "4", name: "Arts", avatarUrl: "https://i.pravatar.cc/150?u=art" },
                ]
              }}
              cta={{
                text: "Track cross-departmental success",
                buttonText: "View Analytics",
                onButtonClick: () => {}
              }}
            />
          </motion.div>

          {/* Right: Context & Description */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full border border-indigo-300 dark:border-indigo-800">
              <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">Platform Capabilities</span>
            </div>

            <h2 className="text-4xl font-bold text-slate-900 dark:text-white">
              Unified Cross-Departmental Insights
            </h2>

            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              Hapi consolidates engagement data across all departments, providing institutional leadership with a comprehensive view of student success patterns in real time.
            </p>

            <div className="space-y-4">
              {[
                {
                  stat: "71.4%",
                  label: "Overall engagement rate tracked automatically",
                  icon: CheckCircle2,
                  color: "text-green-600 dark:text-green-400"
                },
                {
                  stat: "18",
                  label: "Departments monitored with unified metrics",
                  icon: Users,
                  color: "text-indigo-600 dark:text-indigo-400"
                },
                {
                  stat: "23%",
                  label: "At-risk students identified for early intervention",
                  icon: AlertTriangle,
                  color: "text-amber-600 dark:text-amber-400"
                },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-start gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  <div className={cn("w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0", item.color)}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{item.stat}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{item.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* How Hapi Enables This - Clean, Simple */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-full border border-purple-200 dark:border-purple-800 mb-6">
            <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">The Hapi Platform</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Unified Academic & Emotional Intelligence
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto">
            Hapi consolidates fragmented data streams into actionable insights, enabling the interventions research shows work—at scale
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {[
            {
              title: 'Real-Time Early Alerts',
              description: 'Predictive models analyze academic performance, engagement patterns, and emotional wellbeing to flag at-risk students weeks earlier than traditional methods.',
              icon: AlertTriangle,
              features: ['Unified academic + emotional metrics', 'Automated faculty notifications', 'Intervention tracking']
            },
            {
              title: 'Student Engagement Tools',
              description: 'AI-powered study planning, personalized nudges, emotional check-ins, and 24/7 support that keep students connected and motivated.',
              icon: Sparkles,
              features: ['Daily emotional pulse tracking', 'Personalized study strategies', 'Proactive assignment reminders']
            },
            {
              title: 'Institutional Analytics',
              description: 'Executive dashboards tracking retention, progression, and performance-based funding metrics in real time.',
              icon: BarChart3,
              features: ['Cohort performance tracking', 'Funding compliance monitoring', 'ROI measurement']
            },
            {
              title: 'Seamless Integration',
              description: 'Native Canvas LMS integration pulls course data, assignments, grades, and engagement automatically—no manual data entry.',
              icon: Zap,
              features: ['Zero setup friction', 'Real-time data synchronization', 'Cross-platform compatibility']
            },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{item.description}</p>
                </div>
              </div>
              <ul className="space-y-2">
                {item.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA - Professional */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 rounded-3xl p-12 md:p-16 overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl" />

          <div className="relative text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
              Transform Retention Into Revenue
            </h2>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto leading-relaxed">
              See how Hapi's unified platform can help your institution reduce attrition, improve outcomes, and optimize for performance-based funding.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-5 bg-white text-indigo-600 font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Schedule a Demo
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-5 bg-indigo-500/20 backdrop-blur-sm text-white font-bold text-lg rounded-xl border-2 border-white/30 hover:bg-indigo-500/30 transition-all"
              >
                Download Research Brief
              </motion.button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
