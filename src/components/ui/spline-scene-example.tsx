// Example usage of SplineScene component
import { SplineScene } from '../components/ui'

export function ExampleSplineUsage() {
  return (
    <div className="w-full h-96">
      <SplineScene 
        scene="https://prod.spline.design/6Wc1Z2B6aHD8Z3h4/scene.splinecode"
        className="rounded-lg border"
      />
    </div>
  )
}

// With custom fallback
export function SplineWithCustomFallback() {
  return (
    <div className="w-full h-96">
      <SplineScene 
        scene="https://prod.spline.design/6Wc1Z2B6aHD8Z3h4/scene.splinecode"
        className="rounded-lg border"
        fallback={
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-foreground">Loading 3D Experience</h3>
              <p className="text-sm text-muted-foreground mt-2">Please wait while we prepare your interactive scene...</p>
            </div>
          </div>
        }
      />
    </div>
  )
}
