# TODO for Fixing Notifications Dropdown Hiding Issue (Portal Implementation)

## Steps from Approved Plan
- [x] Edit `src/components/notifications/NotificationCenter.tsx`:
  - Import `createPortal` from `react-dom` and `useRef` from `react`.
  - Add a ref to the bell button.
  - When `isOpen` is true, render the backdrop and dropdown panel using `createPortal` to `document.body` to avoid parent overflow clipping and stacking contexts.
  - Keep fixed positioning (right-4 top-20) for alignment relative to viewport.
  - Ensure z-index remains high (z-[99999] for backdrop, z-[100000] for panel) but now global.
- [ ] Test the fix: Run `npm run dev`, navigate to dashboard, click bell icon on desktop (md+ breakpoint), verify dropdown appears on top without hiding behind components.
- [ ] Update TODO.md: Mark edit as complete and test as done.
- [ ] If mobile issues: Adjust positioning for small screens or add responsive checks.

## Followup Steps
- [ ] Run linter (`npm run lint`) to ensure no errors.
- [ ] If portal causes alignment issues, calculate dynamic position using button ref's bounding rect.

**Status**: In progress
