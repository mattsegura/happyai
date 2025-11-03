import { motion } from "framer-motion";
import { ReactNode, RefObject } from "react";
import { cn } from "@/lib/utils";

interface TimelineContentProps {
  as?: React.ElementType;
  animationNum: number;
  timelineRef: RefObject<HTMLElement>;
  customVariants?: any;
  className?: string;
  children: ReactNode;
}

export function TimelineContent({
  as: Component = "div",
  animationNum,
  timelineRef,
  customVariants,
  className,
  children,
  ...props
}: TimelineContentProps) {
  const variants = customVariants || {
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

  return (
    <motion.div
      custom={animationNum}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={variants}
      className={cn(className)}
      {...props}
    >
      <Component>{children}</Component>
    </motion.div>
  );
}

