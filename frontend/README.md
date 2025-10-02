# RaceIQ Frontend

A responsive Formula 1 data visualization application built with React, Chakra UI, and TypeScript.

## Responsive Design Patterns

### Breakpoints
The application uses custom breakpoints defined in `src/styles/theme.ts`:
- `base`: 0px (mobile-first)
- `xs`: 320px (small phones)
- `sm`: 480px (large phones)
- `md`: 768px (tablets)
- `lg`: 1024px (laptops)
- `xl`: 1280px (desktops)
- `2xl`: 1536px (large desktops)

### Layout Components

#### LayoutContainer
Responsive container with consistent max-width and padding:
```tsx
<LayoutContainer maxW="1400px">
  {/* Content */}
</LayoutContainer>
```

#### PageShell
Page-level wrapper with safe area support:
```tsx
<PageShell>
  {/* Page content */}
</PageShell>
```

#### ResponsiveTable
Table wrapper with horizontal scroll on mobile:
```tsx
<ResponsiveTable>
  <Thead>
    <Tr>
      <Th>Column 1</Th>
      <Th>Column 2</Th>
    </Tr>
  </Thead>
  <Tbody>
    {/* Table rows */}
  </Tbody>
</ResponsiveTable>
```

#### ResponsiveMedia
Responsive media component for images and videos:
```tsx
<ResponsiveMedia 
  src="/image.jpg" 
  alt="Description"
  aspectRatio="16/9"
  objectFit="cover"
/>
```

### Responsive Patterns

#### Chakra UI Responsive Props
Use Chakra's responsive object syntax:
```tsx
<Box
  p={{ base: 4, md: 6, lg: 8 }}
  fontSize={{ base: 'sm', md: 'md', lg: 'lg' }}
  display={{ base: 'block', md: 'flex' }}
>
```

#### Grid Layouts
Use SimpleGrid for responsive grids:
```tsx
<SimpleGrid 
  columns={{ base: 1, sm: 2, md: 3, lg: 4 }} 
  gap={{ base: 4, md: 6 }}
>
```

#### Navigation
- Desktop: Full sidebar navigation
- Mobile: Hamburger menu with drawer
- Tablet: Adaptive layout based on screen size

#### Tables and Data
- Wrap tables in `ResponsiveTable` for horizontal scroll
- Use responsive column counts
- Implement touch-friendly interactions

#### Images and Media
- Always use `maxW="100%"` and `h="auto"`
- Implement responsive aspect ratios
- Use `objectFit="contain"` for proper scaling

### Mobile Considerations

#### Touch Targets
- Minimum 44px touch targets
- Adequate spacing between interactive elements
- Touch-friendly form controls

#### Safe Areas
- Use CSS custom properties for safe area insets
- Support for notched devices and foldables
- Proper viewport height handling with `svh` units

#### Performance
- Lazy loading for images
- Optimized bundle sizes
- Efficient re-renders on mobile

### Testing Checklist

#### Device Testing
- [ ] iPhone SE (375px)
- [ ] iPhone 12/13/14 (390px)
- [ ] iPhone 12/13/14 Pro Max (428px)
- [ ] iPad (768px)
- [ ] iPad Pro (1024px)
- [ ] Galaxy Fold (280px/717px)
- [ ] Desktop (1280px+)

#### Functionality Testing
- [ ] Navigation works on all screen sizes
- [ ] Tables scroll horizontally on mobile
- [ ] Forms are usable on touch devices
- [ ] Images scale properly
- [ ] No horizontal scroll except for tables
- [ ] Touch targets are adequate size

#### Performance Testing
- [ ] Page load times on 3G
- [ ] Smooth scrolling on mobile
- [ ] No layout shifts
- [ ] Efficient memory usage

### Common Issues and Solutions

#### Fixed Widths
❌ Avoid:
```tsx
<Box w="300px" h="200px">
```

✅ Use:
```tsx
<Box w={{ base: 'full', md: '300px' }} h={{ base: 'auto', md: '200px' }}>
```

#### Overflow Issues
❌ Avoid:
```tsx
<Box overflow="hidden">
  <Table minW="800px">
```

✅ Use:
```tsx
<ResponsiveTable>
  <Table minW="800px">
```

#### Mobile Navigation
❌ Avoid:
```tsx
<HStack display={{ base: 'none', md: 'flex' }}>
```

✅ Use:
```tsx
<HStack display={{ base: 'none', md: 'flex' }}>
  {/* Desktop nav */}
</HStack>
<IconButton display={{ base: 'flex', md: 'none' }}>
  {/* Mobile menu button */}
</IconButton>
```

### Development Guidelines

1. **Mobile-First**: Start with mobile design and enhance for larger screens
2. **Progressive Enhancement**: Add features for larger screens
3. **Touch-Friendly**: Ensure all interactions work on touch devices
4. **Performance**: Optimize for mobile networks and devices
5. **Accessibility**: Maintain accessibility across all screen sizes

### Resources

- [Chakra UI Responsive Props](https://chakra-ui.com/docs/styled-system/responsive-styles)
- [CSS Grid Layout](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout)
- [Flexbox Guide](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)
- [Touch Target Guidelines](https://web.dev/accessible-tap-targets/)