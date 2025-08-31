# About Page — Manual Test Checklist

## Load & Stability
- [ ] Page renders without crashing (no blank screen)
- [ ] Browser console has no errors/warnings

## Hero
- [ ] Title shows: "Beyond the Finish Line"
- [ ] Subtitle shows
- [ ] Background image loads (no broken image icon)

## "What We Offer" (Features)
- [ ] Section heading: "What We Offer"
- [ ] Exactly 3 feature cards render
- [ ] Each card has icon, title, and description
- [ ] Card hover elevates (shadow + translateY)

## "The Team"
- [ ] Section heading: "The Team"
- [ ] Exactly 6 team members render (names + roles)
- [ ] Cards are evenly spaced on desktop
- [ ] On small screens, grid wraps cleanly (no overlap/cut-off)

## "Powered By"
- [ ] Section heading: "Powered By"
- [ ] Tech items visible: React, NestJS, Supabase, Auth0, OpenF1 API
- [ ] For items with logos: images render and use correct `alt`
- [ ] For OpenF1 API (no logo): icon renders (no console error)

## Navigation & Consistency
- [ ] Page uses site font/colors (consistent with Home)
- [ ] Header/footer links work as expected; logo returns to Home

## Accessibility
- [ ] All images have alt text (except purely decorative)
- [ ] You can Tab through interactive elements in a logical order
- [ ] Text contrast is readable on dark background

## Responsive (DevTools device toolbar)
- [ ] ~768px: headings shrink; grid reflows (no overflow)
- [ ] ~480px: typography scales; nothing clipped off-screen
