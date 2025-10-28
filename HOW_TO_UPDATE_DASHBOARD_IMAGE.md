# How to Update the Dashboard Showcase Image

## Quick Steps

1. **Save your screenshot** to the `public` folder:
   ```
   /Users/nicolasdooman/Desktop/happyai/public/admin-dashboard.png
   ```

2. **Update the image path** in `src/components/landing/LandingPage.tsx`:
   
   Find this line (around line 148):
   ```tsx
   dashboardImage="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2940&auto=format&fit=crop"
   ```
   
   Replace it with:
   ```tsx
   dashboardImage="/admin-dashboard.png"
   ```

3. **Optional: Add dark mode version**:
   - Save dark mode screenshot as: `public/admin-dashboard-dark.png`
   - Add the dark version prop:
   ```tsx
   <DashboardShowcase
     dashboardImage="/admin-dashboard.png"
     dashboardImageDark="/admin-dashboard-dark.png"
     altText="Hapi AI Platform Administration - System Monitoring, User Management, and Analytics"
   />
   ```

## Screenshot Tips

For the best 3D floating effect:
- **Resolution**: 2880x2074px or similar wide aspect ratio
- **Format**: PNG for best quality
- **Content**: Full dashboard view showing stats, charts, and interface
- **Background**: Light background (or transparent) works best with the current theme

## Current Setup

The component now displays a beautiful 3D floating effect with:
- ✅ 20-degree X-axis rotation (tilts toward viewer)
- ✅ Subtle skew for depth
- ✅ Gradient mask that fades to transparent
- ✅ Proper perspective and centering
- ✅ Shadow and border for polish
- ✅ Responsive design

The effect matches the reference design you provided!

