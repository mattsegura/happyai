// Example of how to use different Spline scenes in your landing page
// You can replace the scene URLs with your own Spline designs

export const SPLINE_SCENES = {
  // Main hero scene - could be an abstract educational environment
  HERO: "https://prod.spline.design/6Wc1Z2B6aHD8Z3h4/scene.splinecode",
  
  // Student-focused scene - could show a student dashboard or study environment
  STUDENT: "https://prod.spline.design/6Wc1Z2B6aHD8Z3h4/scene.splinecode",
  
  // Teacher-focused scene - could show analytics or classroom management
  TEACHER: "https://prod.spline.design/6Wc1Z2B6aHD8Z3h4/scene.splinecode",
  
  // Background scene - subtle animation for sections
  BACKGROUND: "https://prod.spline.design/6Wc1Z2B6aHD8Z3h4/scene.splinecode"
} as const;

// Usage examples:
// <SplineScene scene={SPLINE_SCENES.HERO} className="w-full h-96" />
// <SplineScene scene={SPLINE_SCENES.STUDENT} className="w-full h-64" />
// <SplineScene scene={SPLINE_SCENES.TEACHER} className="w-full h-80" />
