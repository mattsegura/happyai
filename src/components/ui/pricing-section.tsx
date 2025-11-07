"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TimelineContent } from "@/components/ui/timeline-animation";
import NumberFlow from "@number-flow/react";
import { GraduationCap, Users, Building2, CheckCheck, Brain, Calendar, Heart, TrendingUp, BarChart3, Shield, Bell, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Student",
    description:
      "Personal AI companion for academic success and emotional wellbeing",
    price: 20,
    yearlyPrice: 200,
    buttonText: "Get Started",
    buttonVariant: "outline" as const,
    icon: <GraduationCap size={24} />,
    features: [
      { text: "Personalized AI assistant", icon: <Brain size={20} /> },
      { text: "Smart calendar & workload forecasting", icon: <Calendar size={20} /> },
      { text: "Daily mood pulse tracker", icon: <Heart size={20} /> },
    ],
    detailedFeatures: {
      "Core Features": [
        "Personalized AI assistant for emotional and academic guidance",
        "AI tutor for study planning and performance improvement",
        "Smart calendar with workload forecasting and study rhythm insights",
        "Daily mood pulse and emotional tracker",
        "Academic focus and risk indicators for each course",
      ],
      "Academic Intelligence": [
        "Live grade tracking and progress trends",
        "Upcoming assignments and deadlines view",
        "Mood-to-grade correlation charts",
        "Class participation and engagement overview",
      ],
      "Emotional Wellbeing": [
        "Mood variability and trajectory charts",
        "Burnout and wellbeing alerts",
        "AI summaries showing emotional and academic growth over time",
      ],
      "Engagement & Gamification": [
        "Streak tracking and participation points",
        "Class ranks and badge achievements",
        "Scoreboards per class (limited version)",
      ],
      "Productivity Tools": [
        "AI calendar buddy (Google Calendar integration)",
        "Daily to-do list combining pulses, assignments, and events",
      ],
    },
  },
  {
    name: "Teacher",
    description:
      "Comprehensive classroom insights with free access for all your students",
    price: 599,
    yearlyPrice: 1000,
    priceLabel: "semester",
    buttonText: "Get Started",
    buttonVariant: "default" as const,
    popular: true,
    icon: <Users size={24} />,
    features: [
      { text: "All student features included", icon: <GraduationCap size={20} /> },
      { text: "Class-level AI insights & reports", icon: <BarChart3 size={20} /> },
      { text: "At-risk student detection", icon: <Bell size={20} /> },
    ],
    detailedFeatures: {
      "Core Features": [
        "Full access to all student-plan tools",
        "Class-level AI 'Echo' reports and weekly summaries",
        "AI teaching assistant for instant data queries and insights",
        "At-risk student detection ('Care Alerts')",
      ],
      "Academic Intelligence": [
        "Class grade distributions and trends",
        "Assignment balance reports across semesters",
        "Student participation and submission dashboards",
        "AI stress calendar to understand workload across classes",
      ],
      "Emotional & Engagement Insights": [
        "Real-time class sentiment tracking",
        "Emotional recovery and low-mood alerts",
        "Mood-to-performance correlations per class",
        "Positive sentiment ratio and class wellbeing index",
      ],
      "Communication & Connection": [
        "SafeBox anonymous feedback with AI moderation",
        "Hapi Moments (peer and teacher recognition system)",
        "Office hours and 1-on-1 meeting tracking",
      ],
      "AI-Driven Tools": [
        "Weekly and monthly AI summaries for each class",
        "Student-specific AI briefs with personalized insights",
        "AI-based recommendations for scheduling and engagement",
      ],
    },
  },
  {
    name: "Enterprise",
    description:
      "Institution-wide analytics and unlimited access for administrators",
    price: null,
    priceLabel: "Contact Sales",
    buttonText: "Contact Sales",
    buttonVariant: "outline" as const,
    icon: <Building2 size={24} />,
    features: [
      { text: "Full Canvas LMS integration", icon: <Shield size={20} /> },
      { text: "Institution-wide analytics", icon: <TrendingUp size={20} /> },
      { text: "Custom AI reports", icon: <Sparkles size={20} /> },
    ],
    detailedFeatures: {
      "Core Capabilities": [
        "Full Canvas LMS integration (institution-wide)",
        "API-level access for all teachers, students, and departments",
        "Unlimited data history and timeframe selection",
      ],
      "Institutional Analytics": [
        "Grade and sentiment distribution reports across departments",
        "Submission rates, lateness, and grading turnaround metrics",
        "Performance trends by department or grade level",
        "AI-detected correlations between mood and academic change",
      ],
      "Wellbeing & Risk Management": [
        "Emotional and academic risk heatmaps",
        "Cross-risk index (students flagged both emotionally and academically)",
        "Early warning and success indices (school-wide)",
        "Engagement forecasts and trend modeling",
      ],
      "Teacher & Department Insights": [
        "Teacher engagement scores and feedback rates",
        "Most/least engaged classes and departments",
        "Teacher support index (sentiment vs workload balance)",
      ],
      "AI & Reporting": [
        "Weekly AI executive reports summarizing institution health",
        "Top emotional and academic risk drivers",
        "Sentiment and engagement heatmaps by time of semester",
        "AI-generated 'Wellness to Performance' correlation reports",
      ],
      "System & Integration": [
        "Multi-department data dashboards",
        "LTI launch and assignment import tracking",
        "Institutional configuration and permission controls",
        "Custom AI summaries per department or campus",
      ],
    },
  },
];

const PricingSwitch = ({ onSwitch }: { onSwitch: (value: string) => void }) => {
  const [selected, setSelected] = useState("0");

  const handleSwitch = (value: string) => {
    setSelected(value);
    onSwitch(value);
  };

  return (
    <div className="flex justify-center">
      <div className="relative z-50 mx-auto flex w-fit rounded-full bg-neutral-50 border border-gray-200 p-1">
        <button
          onClick={() => handleSwitch("0")}
          className={`relative z-10 w-fit sm:h-12 h-10 rounded-full sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors ${
            selected === "0"
              ? "text-white"
              : "text-muted-foreground hover:text-black"
          }`}
        >
          {selected === "0" && (
            <motion.span
              layoutId={"switch"}
              className="absolute top-0 left-0 sm:h-12 h-10 w-full rounded-full border-4 shadow-sm shadow-blue-600 border-blue-600 bg-gradient-to-t from-blue-500 via-blue-400 to-blue-600"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative">Monthly</span>
        </button>

        <button
          onClick={() => handleSwitch("1")}
          className={`relative z-10 w-fit sm:h-12 h-8 flex-shrink-0 rounded-full sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors ${
            selected === "1"
              ? "text-white"
              : "text-muted-foreground hover:text-black"
          }`}
        >
          {selected === "1" && (
            <motion.span
              layoutId={"switch"}
              className="absolute top-0 left-0 sm:h-12 h-10 w-full rounded-full border-4 shadow-sm shadow-blue-600 border-blue-600 bg-gradient-to-t from-blue-500 via-blue-400 to-blue-600"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative flex items-center gap-2">
            Yearly
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-black">
              Best Value
            </span>
          </span>
        </button>
      </div>
    </div>
  );
};

export default function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);
  const pricingRef = useRef<HTMLDivElement>(null);

  const revealVariants = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.2,
        duration: 0.5,
      },
    }),
    hidden: {
      filter: "blur(10px)",
      y: -20,
      opacity: 0,
    },
  };

  const togglePricingPeriod = (value: string) =>
    setIsYearly(Number.parseInt(value) === 1);

  return (
    <div id="pricing" className="px-4 py-20 mx-auto relative bg-white dark:bg-background" ref={pricingRef}>
      <div
        className="absolute top-0 left-[10%] right-[10%] w-[80%] h-full z-0"
        style={{
          backgroundImage: `
        radial-gradient(circle at center, #206ce8 0%, transparent 70%)
      `,
          opacity: 0.15,
          mixBlendMode: "multiply",
        }}
      />

      <div className="text-center mb-8 max-w-3xl mx-auto relative z-10">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6">
          Simple, <span className="bg-gradient-to-r from-sky-400 to-blue-600 bg-clip-text text-transparent">transparent pricing</span>
        </h2>

        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
          Choose the plan that fits your needs. All plans include access to our core features.
        </p>
      </div>

      <TimelineContent
        as="div"
        animationNum={3}
        timelineRef={pricingRef}
        customVariants={revealVariants}
      >
        <PricingSwitch onSwitch={togglePricingPeriod} />
      </TimelineContent>

      <div className="grid md:grid-cols-3 max-w-7xl gap-6 py-8 mx-auto relative z-10">
        {plans.map((plan, index) => (
          <TimelineContent
            key={plan.name}
            as="div"
            animationNum={4 + index}
            timelineRef={pricingRef}
            customVariants={revealVariants}
          >
            <Card
              className={`relative h-full flex flex-col ${
                plan.popular ? "ring-2 ring-blue-500 bg-blue-50/50 dark:bg-blue-950/20" : "bg-white dark:bg-slate-900"
              }`}
            >
              <CardHeader className="text-left">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-500/20 border border-sky-500/30">
                    {plan.icon}
                  </div>
                  {plan.popular && (
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  )}
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                  {plan.name}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{plan.description}</p>
                <div className="flex items-baseline">
                  {plan.price !== null ? (
                    <>
                      <span className="text-4xl font-bold text-slate-900 dark:text-white">
                        $
                        <NumberFlow
                          value={isYearly ? plan.yearlyPrice : plan.price}
                          className="text-4xl font-bold"
                        />
                      </span>
                      <span className="text-slate-600 dark:text-slate-400 ml-2">
                        /{isYearly ? "year" : (plan.priceLabel || "month")}
                      </span>
                    </>
                  ) : (
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">
                      {plan.priceLabel}
                    </span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-0 flex-1 flex flex-col">
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <span className="text-sky-600 dark:text-sky-400 mt-0.5 mr-3 flex-shrink-0">
                        {feature.icon}
                      </span>
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full mt-auto hover:border-sky-500 hover:text-sky-600 transition-all">
                      Learn More
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[90vw] w-full h-[90vh] p-0 gap-0 bg-white dark:bg-slate-900 overflow-hidden">
                    <div className="h-full flex flex-col">
                      {/* Elegant Header */}
                      <div className="px-8 pt-8 pb-6 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950 dark:to-blue-950 border border-sky-200 dark:border-sky-800">
                              {plan.icon}
                            </div>
                            <div>
                              <DialogTitle className="text-2xl font-semibold text-slate-900 dark:text-white mb-1">
                                {plan.name} Plan
                              </DialogTitle>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                {plan.description}
                              </p>
                            </div>
                          </div>
                          {plan.popular && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                              Most Popular
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-baseline gap-2">
                            {plan.price !== null ? (
                              <>
                                <span className="text-4xl font-semibold text-slate-900 dark:text-white">
                                  $<NumberFlow value={isYearly ? plan.yearlyPrice : plan.price} className="text-4xl font-semibold" />
                                </span>
                                <span className="text-base text-slate-600 dark:text-slate-400">
                                  /{isYearly ? "year" : (plan.priceLabel || "month")}
                                </span>
                              </>
                            ) : (
                              <span className="text-2xl font-semibold text-slate-900 dark:text-white">
                                {plan.priceLabel}
                              </span>
                            )}
                          </div>
                          <Button
                            className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white px-8 h-11 shadow-sm hover:shadow-md transition-all"
                          >
                            {plan.buttonText}
                          </Button>
                        </div>
                      </div>

                      {/* Features Content - Scrollable but clean */}
                      <div className="flex-1 overflow-y-auto px-8 py-6">
                        <div className="grid md:grid-cols-3 gap-6 max-w-7xl mx-auto">
                          {Object.entries(plan.detailedFeatures).map(([category, features]) => (
                            <div key={category} className="space-y-3">
                              <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                                <CheckCheck className="h-4 w-4 text-sky-500" />
                                {category}
                              </h4>
                              <ul className="space-y-2">
                                {features.map((feature: string, idx: number) => (
                                  <li key={idx} className="flex items-start gap-2 group">
                                    <div className="h-1.5 w-1.5 rounded-full bg-sky-500 mt-1.5 flex-shrink-0" />
                                    <span className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                      {feature}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </TimelineContent>
        ))}
      </div>
    </div>
  );
}

