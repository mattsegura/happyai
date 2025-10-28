import * as React from "react"
import { cn } from "../../lib/utils"

export interface DashboardShowcaseProps {
  /** Dashboard screenshot URL (light theme) */
  dashboardImage: string
  /** Dashboard screenshot URL (dark theme) - optional */
  dashboardImageDark?: string
  /** Alt text for the image */
  altText?: string
  className?: string
}

export function DashboardShowcase({
  dashboardImage,
  dashboardImageDark,
  altText = "Hapi AI Dashboard",
  className,
}: DashboardShowcaseProps) {
  return (
    <section className={cn("relative overflow-hidden bg-white dark:bg-transparent py-2.5 lg:py-3", className)}>
      {/* Background gradient effects - subtle */}
      <div aria-hidden className="absolute inset-0 pointer-events-none isolate opacity-30 hidden lg:block">
        <div className="w-[35rem] h-[80rem] absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(var(--primary)/0.08)_0,hsla(var(--primary)/0.02)_50%,transparent_80%)]" />
        <div className="h-[80rem] absolute right-0 top-0 w-56 rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(var(--accent)/0.06)_0,hsla(var(--accent)/0.02)_80%,transparent_100%)]" />
      </div>

      {/* Main content */}
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Gradient mask that fades to transparent at bottom */}
        <div className="[mask-image:linear-gradient(to_bottom,black_50%,transparent_100%)]">
          {/* 3D Perspective container */}
          <div className="[perspective:1200px]">
            {/* Apply horizontal skew and add margin for better centering */}
            <div className="-mr-24 pl-24 lg:-mr-56 lg:pl-56">
              {/* Rotate on X axis to tilt toward viewer */}
              <div className="[transform:rotateX(20deg)]">
                {/* Apply subtle skew for 3D effect */}
                <div className="relative lg:h-[44rem] skew-x-[0.36rad]">
                  {/* Light theme image */}
                  <img
                    className="relative z-[2] w-full h-auto rounded-[--radius] border border-border shadow-2xl dark:hidden"
                    src={dashboardImage}
                    alt={altText}
                    width={2880}
                    height={2074}
                  />
                  
                  {/* Dark theme image (if provided) */}
                  {dashboardImageDark && (
                    <img
                      className="relative z-[2] w-full h-auto rounded-[--radius] border border-border shadow-2xl hidden dark:block"
                      src={dashboardImageDark}
                      alt={altText}
                      width={2880}
                      height={2074}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

