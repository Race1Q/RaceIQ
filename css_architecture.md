# RaceIQ CSS Architecture Plan - Phase 2

**Objective:** To establish a scalable and maintainable CSS architecture that prevents common issues like style conflicts and code duplication, enabling the team to work efficiently and consistently.

---

## Step 1: Establish a Scalable File Structure

To keep our styles organized, we will adopt a dedicated `styles` directory within `frontend/src/`. This structure clearly separates styles based on their scope and purpose.

**Proposed Directory Structure:**
` ` `
frontend/
└── src/
    ├── components/
    │   └── Button/
    │       ├── Button.tsx
    │       └── Button.module.css
    ├── pages/
    │   └── Drivers/
    │       ├── Drivers.tsx
    │       └── Drivers.module.css
    └── styles/
        ├── base/
        │   ├── _reset.css
        │   ├── variables.css
        │   └── global.css
        └── utils/
            └── animations.css

` ` `

**Action:** Create the `src/styles` directory and the subdirectories (`base`, `utils`). Move and rename existing global styles into this structure.

---

## Step 2: Create a "Design Tokens" File

This is our **single source of truth** for all design-related values. No more hard-coded hex values or pixel sizes scattered across files.

**Action:**

1.  Create the file `src/styles/base/variables.css`.
2.  Populate it with our core design properties using CSS Custom Properties.
3.  Import it at the very top of `src/styles/base/global.css` (or your main entry CSS file like `index.css`).

**Example `variables.css`:**
/_ src/styles/base/variables.css _/
:root {
/_ Colors _/
--color-primary-red: #e10600;
--color-background-dark: #0a0a0a;
--color-surface-gray: #1a1a1a;
--color-text-light: #ffffff;
--color-text-muted: #888888;
--color-accent-green: #00ff00;

/_ Font Families _/
--font-primary: 'Exo 2', sans-serif;
--font-display: 'Orbitron', sans-serif;

/_ Spacing (Base 8px scale) _/
--space-1: 0.5rem; /_ 8px _/
--space-2: 1rem; /_ 16px _/
--space-3: 1.5rem; /_ 24px _/
--space-4: 2rem; /_ 32px _/

/_ Border Radius _/
--border-radius-sm: 4px;
--border-radius-md: 8px;
--border-radius-lg: 12px;
}

**Team Directive:** Everyone on the team **must** use these variables for styling.

- **Do:** `color: var(--color-primary-red);`
- **Don't:** `color: #e10600;`

---

## Step 3: Adopt Component-Scoped Styling with CSS Modules

This is the key to preventing style collisions. By using the `.module.css` extension, Vite automatically makes our class names unique to the component they are imported in.

**How It Works:**
A class named `.title` in `Header.module.css` might become `Header_title__aB3x1`, which will never conflict with another `.title` class elsewhere.

**Action:**

1.  Rename all existing component and page-specific stylesheets from `.css` to `.module.css`.
    - Example: `Drivers.css` -> `Drivers.module.css`.
2.  Update the import and usage in the corresponding `.tsx` file.

**Example Transformation:**

**Before (in `Drivers.tsx`):**
import './Drivers.css';
// ...
return <div className="driver-card">...</div>;

**After (in `Drivers.tsx`):**
import styles from './Drivers.module.css';
// ...
return <div className={styles.driverCard}>...</div>;

---

## Step 4: Go-Forward Plan & Team Rules

To maintain consistency, the entire team will adhere to the following rules for all new development:

1.  **New Components Get Their Own Module**: Every new component must have its own `ComponentName.module.css` file.
2.  **Use Design Tokens**: Always use `var(--variable-name)` from `variables.css` for all colors, fonts, and spacing.
3.  **No More Inline Styles**: The `style={{...}}` prop is forbidden, except for rare cases of dynamic values that CSS can't handle (e.g., calculated positions).
4.  **Global Styles are for Globals Only**: Only truly global, application-wide styles (like `body` typography or CSS resets) belong in `src/styles/base/global.css`.
5.  **Favor Composition**: Build complex components by combining smaller components, each with its own scoped styles.

By implementing this architecture, we ensure that as RaceIQ grows, our CSS codebase remains clean, predictable, and easy for everyone to contribute to.
