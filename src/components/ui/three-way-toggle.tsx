"use client"

import { Users, GraduationCap, Building2 } from "lucide-react"
import { cn } from "../../lib/utils"

interface ThreeWayToggleProps {
  activeMode: 'students' | 'teachers' | 'enterprise'
  onChange: (mode: 'students' | 'teachers' | 'enterprise') => void
  className?: string
}

export function ThreeWayToggle({ activeMode, onChange, className }: ThreeWayToggleProps) {
  return (
    <div
      className={cn(
        "inline-flex p-1 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700",
        className
      )}
      role="tablist"
    >
      {/* Students */}
      <button
        onClick={() => onChange('students')}
        className={cn(
          "flex items-center gap-2 px-6 py-2 rounded-full transition-all duration-300 font-semibold text-sm",
          activeMode === 'students'
            ? "bg-sky-500 text-white shadow-lg"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
        )}
        role="tab"
        aria-selected={activeMode === 'students'}
      >
        <GraduationCap className="w-4 h-4" />
        <span>Students</span>
      </button>

      {/* Teachers */}
      <button
        onClick={() => onChange('teachers')}
        className={cn(
          "flex items-center gap-2 px-6 py-2 rounded-full transition-all duration-300 font-semibold text-sm",
          activeMode === 'teachers'
            ? "bg-blue-500 text-white shadow-lg"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
        )}
        role="tab"
        aria-selected={activeMode === 'teachers'}
      >
        <Users className="w-4 h-4" />
        <span>Teachers</span>
      </button>

      {/* Enterprise */}
      <button
        onClick={() => onChange('enterprise')}
        className={cn(
          "flex items-center gap-2 px-6 py-2 rounded-full transition-all duration-300 font-semibold text-sm",
          activeMode === 'enterprise'
            ? "bg-purple-500 text-white shadow-lg"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
        )}
        role="tab"
        aria-selected={activeMode === 'enterprise'}
      >
        <Building2 className="w-4 h-4" />
        <span>Enterprise</span>
      </button>
    </div>
  )
}


