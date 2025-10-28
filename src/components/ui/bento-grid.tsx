import { ReactNode } from "react";
import { ArrowRightIcon } from "@radix-ui/react-icons";

import { cn } from "../../lib/utils";
import { Button } from "./button";

const BentoGrid = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "grid w-full auto-rows-[28rem] grid-cols-3 gap-6",
        className,
      )}
    >
      {children}
    </div>
  );
};

const BentoCard = ({
  name,
  className,
  background,
  Icon,
  description,
  href,
  cta,
}: {
  name: string;
  className: string;
  background: ReactNode;
  Icon: any;
  description: string;
  href: string;
  cta?: string;
}) => (
  <div className={cn("relative group col-span-3", className)}>
    {/* Rainbow glow effect behind card on hover */}
    <div className="absolute -inset-1 bg-gradient-to-r from-red-500 via-yellow-500 through-green-500 via-blue-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-75 blur-xl transition-opacity duration-500 -z-10" />
    
    <div
      key={name}
      className={cn(
        "relative flex flex-col justify-between overflow-hidden rounded-xl h-full",
        // light styles
        "bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
        // dark styles
        "transform-gpu dark:bg-black dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]",
      )}
    >
      <div>{background}</div>
    <div className="pointer-events-none z-10 flex transform-gpu flex-col gap-1 p-5 transition-all duration-300 group-hover:-translate-y-10">
      <Icon className="h-10 w-10 origin-left transform-gpu text-neutral-700 dark:text-neutral-300 transition-all duration-300 ease-in-out group-hover:scale-75" />
      <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
        {name}
      </h3>
      <p className="max-w-lg text-sm leading-relaxed text-neutral-600 dark:text-neutral-400 overflow-hidden">{description}</p>
    </div>

    {cta && (
      <div
        className={cn(
          "pointer-events-none absolute bottom-0 flex w-full translate-y-10 transform-gpu flex-row items-center p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100",
        )}
      >
        <Button variant="ghost" asChild size="sm" className="pointer-events-auto">
          <a href={href}>
            {cta}
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </div>
    )}
    <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-black/[.03] group-hover:dark:bg-neutral-800/10" />
    </div>
  </div>
);

export { BentoCard, BentoGrid };

