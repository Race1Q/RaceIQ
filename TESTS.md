# Testing Checklist

---

## About Page — Manual Test Checklist
This checklist is for manual, human-driven testing of the About page.

### Load & Stability
- [ ] Page renders without crashing (no blank screen)  
- [ ] Browser console has no errors/warnings  

### Hero
- [ ] Title shows: “Beyond the Finish Line”  
- [ ] Subtitle shows  
- [ ] Background image loads (no broken image icon)  

### "What We Offer" (Features)
- [ ] Section heading: "What We Offer"  
- [ ] Exactly 3 feature cards render  
- [ ] Each card has icon, title, and description  
- [ ] Card hover elevates (shadow + translateY)  

### "The Team"
- [ ] Section heading: "The Team"  
- [ ] Exactly 6 team members render (names + roles)  
- [ ] Cards are evenly spaced on desktop  
- [ ] On small screens, grid wraps cleanly (no overlap/cut-off)  

### "Powered By"
- [ ] Section heading: "Powered By"  
- [ ] Tech items visible: React, NestJS, Supabase, Auth0, OpenF1 API  
- [ ] For items with logos: images render and use correct alt  
- [ ] For OpenF1 API (no logo): icon renders (no console error)  

### Navigation & Consistency
- [ ] Page uses site font/colors (consistent with Home)  
- [ ] Header/footer links work as expected; logo returns to Home  

### Accessibility
- [ ] All images have alt text (except purely decorative)  
- [ ] You can Tab through interactive elements in a logical order  
- [ ] Text contrast is readable on dark background  

### Responsive (DevTools device toolbar)
- [ ] ~768px: headings shrink; grid reflows (no overflow)  
- [ ] ~480px: typography scales; nothing clipped off-screen  

---

## Drivers Page — Automated Test Checklist
This checklist outlines the automated tests you have implemented for the Drivers page. All of these tests are running successfully and are an integral part of your continuous integration and development process.

**Drivers.test.tsx**
- [x] **Loading and Success State**: The component shows a loading spinner initially and then successfully renders team tabs and driver cards after a successful API fetch.  
- [x] **Filtering Functionality**: Clicking a team tab correctly filters the displayed driver cards and updates the active tab's styling.  
- [x] **Error Handling**: When the API fetch fails, the component renders an error message and triggers a toast notification with the correct information.  
- [x] **Empty State Handling**: The component correctly renders a "No drivers found." message when the API returns an empty list of drivers.  

---

## Admin Page — Automated Test Checklist
The Admin page is mostly static UI, so automated tests focus on structure and CSS class consistency.

**Admin.test.tsx**
- [x] **Main Title and Section**: Renders the "Admin Dashboard" title and "System Overview" heading.  
- [x] **Statistics Grid**: Renders exactly 4 stat cards with the correct titles, values, and subtitles.  
- [x] **Admin Tools**: Renders the Quick Actions card with 3 action buttons: *Refresh Data Cache*, *View System Logs*, and *Manage Users*.  
- [x] **Recent Activity**: Renders the Recent Activity list with exactly 5 items.  
- [x] **Admin Features**: Renders the Admin Features section with one title and two description paragraphs, each using the correct `adminFeaturesDescription` class.  

---
