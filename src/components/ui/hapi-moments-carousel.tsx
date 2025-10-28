"use client";

import { useState } from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import {
  Heart,
  TrendingUp,
  Smile,
  Lightbulb,
  Users,
  Target,
  Rocket,
  Trophy,
} from "lucide-react";

interface HapiMoment {
  id: number;
  message: string;
  icon: React.ElementType;
  color: string;
  points?: number;
  timeAgo: string;
}

const hapiMoments: HapiMoment[] = [
  {
    id: 1,
    message: "Jessica thanked you for giving her a pen today",
    icon: Heart,
    color: "from-rose-400 to-pink-500",
    points: 5,
    timeAgo: "2m ago",
  },
  {
    id: 2,
    message: "Morning Pulse Completed",
    icon: Smile,
    color: "from-sky-400 to-blue-500",
    points: 10,
    timeAgo: "8m ago",
  },
  {
    id: 3,
    message: "Class pulse created on how photosynthesis",
    icon: Lightbulb,
    color: "from-emerald-400 to-teal-500",
    timeAgo: "15m ago",
  },
  {
    id: 4,
    message: "You are now 3rd place on the leaderboard",
    icon: Trophy,
    color: "from-amber-400 to-yellow-500",
    points: 50,
    timeAgo: "23m ago",
  },
  {
    id: 5,
    message: "Sent a thank you to Dylan for helping you study",
    icon: Users,
    color: "from-violet-400 to-purple-500",
    points: 5,
    timeAgo: "1h ago",
  },
  {
    id: 6,
    message: "1-1 meeting with Mrs. Williams Completed",
    icon: Target,
    color: "from-blue-400 to-indigo-500",
    points: 15,
    timeAgo: "2h ago",
  },
  {
    id: 7,
    message: "Congratulations on getting Level 15",
    icon: Rocket,
    color: "from-fuchsia-400 to-pink-500",
    points: 100,
    timeAgo: "3h ago",
  },
  {
    id: 8,
    message: "Your grade improved by 10%",
    icon: TrendingUp,
    color: "from-green-400 to-emerald-500",
    points: 25,
    timeAgo: "5h ago",
  },
];

export function HapiMomentsCarousel() {
  const [api, setApi] = useState<CarouselApi>();
  
  const autoplayPlugin = Autoplay({
    delay: 3000,
    stopOnInteraction: false,
    stopOnMouseEnter: false,
  });

  return (
    <section id="moments" className="py-20 sm:py-24 bg-white dark:bg-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col gap-10">
          {/* Strong Title */}
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Celebrating <span className="bg-gradient-to-r from-sky-400 to-blue-600 bg-clip-text text-transparent">Hapi Moments</span>
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Every student's journey is filled with meaningful breakthroughs. Watch as Hapi AI recognizes and celebrates the moments that matter.
            </p>
          </div>

          {/* Carousel */}
          <Carousel 
            setApi={setApi} 
            className="w-full"
            plugins={[autoplayPlugin]}
            opts={{
              loop: true,
              align: "start",
            }}
          >
            <CarouselContent>
              {hapiMoments.map((moment) => {
                const Icon = moment.icon;
                return (
                  <CarouselItem className="basis-full sm:basis-1/2 lg:basis-1/3" key={moment.id}>
                    <div className="p-2">
                      <div className="group relative flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 min-h-[140px]">
                        {/* Hapi AI branding */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 text-white shadow-sm">
                            <Smile className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">Hapi AI</div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400">{moment.timeAgo}</div>
                          </div>
                          {/* Points badge */}
                          {moment.points && (
                            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 border border-amber-200 dark:border-amber-800">
                              <span className="text-xs font-bold text-amber-700 dark:text-amber-400">+{moment.points}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Notification content */}
                        <div className="flex items-start gap-3 flex-1">
                          {/* Icon */}
                          <div className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br ${moment.color} text-white shadow-sm`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          
                          {/* Message */}
                          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed flex-1 pt-1">
                            {moment.message}
                          </p>
                        </div>
                        
                        {/* Subtle bottom accent */}
                        <div className={`absolute bottom-0 left-0 right-0 h-1 rounded-b-xl bg-gradient-to-r ${moment.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                      </div>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </section>
  );
}

