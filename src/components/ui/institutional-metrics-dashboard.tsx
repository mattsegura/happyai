import * as React from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Filter, Users, TrendingUp, Zap, ArrowRight } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "./button";
import { Card, CardContent } from "./card";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

interface MetricStat {
  label: string;
  value: number;
  color: string;
}

interface Department {
  id: string;
  name: string;
  avatarUrl: string;
}

interface InstitutionalMetricsDashboardProps {
  title?: string;
  metrics: {
    totalEngagement: number;
    stats: MetricStat[];
  };
  departments: {
    count: number;
    items: Department[];
  };
  cta: {
    text: string;
    buttonText: string;
    onButtonClick: () => void;
  };
  onFilterClick?: () => void;
  className?: string;
}

const AnimatedNumber = ({ value }: { value: number }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest * 10) / 10);

  React.useEffect(() => {
    const controls = animate(count, value, {
      duration: 1.5,
      ease: "easeOut",
    });
    return controls.stop;
  }, [value, count]);

  return <motion.span>{rounded}</motion.span>;
};

export const InstitutionalMetricsDashboard = React.forwardRef<
  HTMLDivElement,
  InstitutionalMetricsDashboardProps
>(({ 
  title = "Institutional Metrics",
  metrics,
  departments,
  cta,
  onFilterClick,
  className 
}, ref) => {
  
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const hoverTransition = { type: "spring", stiffness: 300, damping: 15 };

  return (
    <motion.div
      ref={ref}
      className={cn("w-full max-w-2xl p-6 bg-card text-card-foreground rounded-2xl border shadow-xl", className)}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{title}</h2>
        <Button variant="ghost" size="icon" onClick={onFilterClick} aria-label="Filter metrics">
          <Filter className="w-5 h-5" />
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <motion.div 
          variants={itemVariants} 
          whileHover={{ scale: 1.03, y: -5 }}
          transition={hoverTransition}
        >
          <Card className="h-full p-4 overflow-hidden rounded-xl">
            <CardContent className="p-2">
              <div className="flex items-center justify-between mb-4">
                <p className="font-medium text-muted-foreground">Student Engagement</p>
                <TrendingUp className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="mb-4">
                <span className="text-4xl font-bold">
                  <AnimatedNumber value={metrics.totalEngagement} />
                </span>
                <span className="ml-1 text-muted-foreground">%</span>
              </div>
              <div className="w-full h-2 mb-2 overflow-hidden rounded-full bg-muted flex">
                {metrics.stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    className={cn("h-full", stat.color)}
                    initial={{ width: 0 }}
                    animate={{ width: `${stat.value}%` }}
                    transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                {metrics.stats.map((stat) => (
                  <div key={stat.label} className="flex items-center gap-1.5">
                    <span className={cn("w-2 h-2 rounded-full", stat.color)}></span>
                    <span>{stat.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          whileHover={{ scale: 1.03, y: -5 }}
          transition={hoverTransition}
        >
          <Card className="h-full p-4 overflow-hidden rounded-xl bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800">
            <CardContent className="p-2">
              <div className="flex items-center justify-between mb-4">
                <p className="font-medium text-indigo-900 dark:text-indigo-200">Departments</p>
                <Users className="w-5 h-5 text-indigo-900 dark:text-indigo-200" />
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-indigo-950 dark:text-indigo-50">
                   <AnimatedNumber value={departments.count} />
                </span>
                <span className="ml-1 text-indigo-800 dark:text-indigo-300">active</span>
              </div>
              <div className="flex -space-x-2">
                {departments.items.slice(0, 4).map((dept, index) => (
                  <motion.div
                    key={dept.id}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                    whileHover={{ scale: 1.2, zIndex: 10, y: -2 }}
                  >
                    <Avatar className="border-2 border-indigo-100 dark:border-indigo-900">
                      <AvatarImage src={dept.avatarUrl} alt={dept.name} />
                      <AvatarFallback>{dept.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div 
        variants={itemVariants} 
        whileHover={{ scale: 1.02 }}
        transition={hoverTransition}
        className="mt-4"
      >
         <div className="flex items-center justify-between p-4 rounded-xl bg-muted/60">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-background">
                  <Zap className="w-5 h-5 text-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">{cta.text}</p>
            </div>
            <Button onClick={cta.onButtonClick} className="shrink-0">
                {cta.buttonText}
                <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
         </div>
      </motion.div>
    </motion.div>
  );
});

InstitutionalMetricsDashboard.displayName = "InstitutionalMetricsDashboard";

