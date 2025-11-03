"use client"

import { Users, GraduationCap } from "lucide-react"
import { cn } from "../../lib/utils"

interface SectionToggleProps {
  isStudents: boolean
  onToggle: () => void
  className?: string
}

export function SectionToggle({ isStudents, onToggle, className }: SectionToggleProps) {
  return (
    <div
      className={cn(
        "flex w-16 h-8 p-1 rounded-full cursor-pointer transition-all duration-300",
        isStudents 
          ? "bg-sky-500 border border-sky-400" 
          : "bg-blue-500 border border-blue-400",
        className
      )}
      onClick={onToggle}
      role="button"
      tabIndex={0}
      aria-label={isStudents ? "Switch to Teachers" : "Switch to Students"}
    >
      <div className="flex justify-between items-center w-full">
        <div
          className={cn(
            "flex justify-center items-center w-6 h-6 rounded-full transition-transform duration-300",
            isStudents 
              ? "transform translate-x-0 bg-white shadow-md" 
              : "transform translate-x-8 bg-white shadow-md"
          )}
        >
          {isStudents ? (
            <GraduationCap 
              className="w-4 h-4 text-sky-600" 
              strokeWidth={2}
            />
          ) : (
            <Users 
              className="w-4 h-4 text-blue-600" 
              strokeWidth={2}
            />
          )}
        </div>
        <div
          className={cn(
            "flex justify-center items-center w-6 h-6 rounded-full transition-transform duration-300",
            isStudents 
              ? "bg-transparent" 
              : "transform -translate-x-8"
          )}
        >
          {isStudents ? (
            <Users 
              className="w-4 h-4 text-white/70" 
              strokeWidth={2}
            />
          ) : (
            <GraduationCap 
              className="w-4 h-4 text-white/70" 
              strokeWidth={2}
            />
          )}
        </div>
      </div>
    </div>
  )
}

