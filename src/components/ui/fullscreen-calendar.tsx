"use client"

import * as React from "react"
import {
  add,
  eachDayOfInterval,
  format,
  getDay,
  isEqual,
  isSameDay,
  isSameMonth,
  isToday,
  startOfWeek,
} from "date-fns"

import { cn } from "@/lib/utils"

interface Event {
  id: number
  name: string
  time: string
  datetime: string
  color?: string
}

interface CalendarData {
  day: Date
  events: Event[]
}

interface FullScreenCalendarProps {
  data: CalendarData[]
}

const colStartClasses = [
  "",
  "col-start-2",
  "col-start-3",
  "col-start-4",
  "col-start-5",
  "col-start-6",
  "col-start-7",
]

export function FullScreenCalendar({ data }: FullScreenCalendarProps) {
  // Set today as July 30, 2025
  const today = new Date(2025, 6, 30) // Month is 0-indexed, so 6 = July
  const [selectedDay, setSelectedDay] = React.useState(today)
  // Fixed to August 2025
  const firstDayCurrentMonth = new Date(2025, 7, 1) // Month is 0-indexed, so 7 = August

  // Show only 4 weeks starting from the first week of August
  const startDate = startOfWeek(firstDayCurrentMonth);
  const days = eachDayOfInterval({
    start: startDate,
    end: add(startDate, { days: 27 }), // 4 weeks = 28 days
  })

  return (
    <div className="flex flex-1 flex-col">
      {/* Calendar Header */}
      <div className="flex flex-col space-y-4 p-4 md:flex-row md:items-center md:justify-between md:space-y-0 lg:flex-none">
        <div className="flex flex-auto">
          <div className="flex items-center gap-4">
            <div className="hidden w-20 flex-col items-center justify-center rounded-lg border bg-muted p-0.5 md:flex">
              <h1 className="p-1 text-xs uppercase text-muted-foreground">
                JUL
              </h1>
              <div className="flex w-full items-center justify-center rounded-lg border bg-background p-0.5 text-lg font-bold">
                <span>30</span>
              </div>
            </div>
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold text-foreground">
                August, 2025
              </h2>
              <p className="text-sm text-muted-foreground">
                Aug 1, 2025 - Aug 31, 2025
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="lg:flex lg:flex-auto lg:flex-col">
        {/* Calendar Days */}
        <div className="flex text-xs leading-6 lg:flex-auto">
          <div className="hidden w-full border-x lg:grid lg:grid-cols-7 lg:grid-rows-4">
            {days.map((day, dayIdx) => (
              <div
                key={dayIdx}
                onClick={() => setSelectedDay(day)}
                className={cn(
                  dayIdx === 0 && colStartClasses[getDay(day)],
                  !isEqual(day, selectedDay) &&
                    !isToday(day) &&
                    !isSameMonth(day, firstDayCurrentMonth) &&
                    "text-muted-foreground",
                  "relative flex flex-col border-b border-r hover:bg-muted focus:z-10 cursor-pointer",
                  !isEqual(day, selectedDay) && "hover:bg-accent/75",
                  isToday(day) && "ring-2 ring-inset ring-sky-400 bg-sky-50/30 dark:bg-sky-950/30",
                )}
              >
                <header className="flex items-center justify-between p-2.5">
                  <button
                    type="button"
                    className={cn(
                      isEqual(day, selectedDay) && "text-primary-foreground",
                      !isEqual(day, selectedDay) &&
                        !isToday(day) &&
                        isSameMonth(day, firstDayCurrentMonth) &&
                        "text-foreground",
                      !isEqual(day, selectedDay) &&
                        !isToday(day) &&
                        !isSameMonth(day, firstDayCurrentMonth) &&
                        "text-muted-foreground",
                      isEqual(day, selectedDay) &&
                        isToday(day) &&
                        "border-none bg-primary",
                      isEqual(day, selectedDay) &&
                        !isToday(day) &&
                        "bg-foreground",
                      (isEqual(day, selectedDay) || isToday(day)) &&
                        "font-semibold",
                      "flex h-7 w-7 items-center justify-center rounded-full text-xs hover:border",
                    )}
                  >
                    <time dateTime={format(day, "yyyy-MM-dd")}>
                      {format(day, "d")}
                    </time>
                  </button>
                </header>
                <div className="flex-1 flex items-center justify-center p-1">
                  {data
                    .filter((event) => isSameDay(event.day, day))
                    .map((day) => (
                      <div key={day.day.toString()} className="w-full h-full flex items-center justify-center">
                        {day.events.slice(0, 1).map((event) => (
                          <div
                            key={event.id}
                            className={cn(
                              "w-full h-full flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 p-3 text-xs leading-tight shadow-md hover:shadow-lg transition-all",
                              event.color || "bg-muted/50"
                            )}
                          >
                            <p className="font-bold leading-tight text-center">
                              {event.name}
                            </p>
                            <p className="leading-none font-semibold text-center opacity-90">
                              {event.time}
                            </p>
                          </div>
                        ))}
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>

          <div className="isolate grid w-full grid-cols-7 grid-rows-4 border-x lg:hidden">
            {days.map((day, dayIdx) => (
              <button
                onClick={() => setSelectedDay(day)}
                key={dayIdx}
                type="button"
                className={cn(
                  isEqual(day, selectedDay) && "text-primary-foreground",
                  !isEqual(day, selectedDay) &&
                    !isToday(day) &&
                    isSameMonth(day, firstDayCurrentMonth) &&
                    "text-foreground",
                  !isEqual(day, selectedDay) &&
                    !isToday(day) &&
                    !isSameMonth(day, firstDayCurrentMonth) &&
                    "text-muted-foreground",
                  (isEqual(day, selectedDay) || isToday(day)) &&
                    "font-semibold",
                  "flex h-14 flex-col border-b border-r px-3 py-2 hover:bg-muted focus:z-10",
                  isToday(day) && "ring-2 ring-inset ring-sky-400 bg-sky-50/30 dark:bg-sky-950/30",
                )}
              >
                <time
                  dateTime={format(day, "yyyy-MM-dd")}
                  className={cn(
                    "ml-auto flex size-6 items-center justify-center rounded-full",
                    isEqual(day, selectedDay) &&
                      isToday(day) &&
                      "bg-primary text-primary-foreground",
                    isEqual(day, selectedDay) &&
                      !isToday(day) &&
                      "bg-primary text-primary-foreground",
                  )}
                >
                  {format(day, "d")}
                </time>
                {data.filter((date) => isSameDay(date.day, day)).length > 0 && (
                  <div>
                    {data
                      .filter((date) => isSameDay(date.day, day))
                      .map((date) => (
                        <div
                          key={date.day.toString()}
                          className="-mx-0.5 mt-auto flex flex-wrap-reverse"
                        >
                          {date.events.map((event) => (
                            <span
                              key={event.id}
                              className="mx-0.5 mt-1 h-1.5 w-1.5 rounded-full bg-muted-foreground"
                            />
                          ))}
                        </div>
                      ))}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

