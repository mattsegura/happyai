'use client'

import { Suspense, lazy } from 'react'
import { cn } from '../../lib/utils'

const Spline = lazy(() => import('@splinetool/react-spline'))

export interface SplineSceneProps {
  /** The Spline scene URL to load */
  scene: string
  /** Additional CSS classes to apply to the container */
  className?: string
  /** Custom fallback component to show while loading */
  fallback?: React.ReactNode
}

export function SplineScene({ 
  scene, 
  className,
  fallback = (
    <div className="w-full h-full flex items-center justify-center bg-muted/50 rounded-lg">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm text-muted-foreground">Loading 3D scene...</span>
      </div>
    </div>
  )
}: SplineSceneProps) {
  return (
    <Suspense fallback={fallback}>
      <Spline
        scene={scene}
        className={cn("w-full h-full", className)}
      />
    </Suspense>
  )
}
