---
name: Apex Pulse
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#5a4136'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#8e7164'
  outline-variant: '#e2bfb0'
  surface-tint: '#a04100'
  primary: '#a04100'
  on-primary: '#ffffff'
  primary-container: '#ff6b00'
  on-primary-container: '#572000'
  inverse-primary: '#ffb693'
  secondary: '#00677e'
  on-secondary: '#ffffff'
  secondary-container: '#00d2fd'
  on-secondary-container: '#005669'
  tertiary: '#0062a1'
  on-tertiary: '#ffffff'
  tertiary-container: '#059eff'
  on-tertiary-container: '#003357'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbcc'
  primary-fixed-dim: '#ffb693'
  on-primary-fixed: '#351000'
  on-primary-fixed-variant: '#7a3000'
  secondary-fixed: '#b4ebff'
  secondary-fixed-dim: '#3cd7ff'
  on-secondary-fixed: '#001f27'
  on-secondary-fixed-variant: '#004e5f'
  tertiary-fixed: '#d0e4ff'
  tertiary-fixed-dim: '#9ccaff'
  on-tertiary-fixed: '#001d35'
  on-tertiary-fixed-variant: '#00497b'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  stats-number:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 32px
  xl: 48px
  container-max: 1440px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style
The design system is engineered for high-performance gym management, prioritizing efficiency, energy, and professional rigor. The aesthetic is **Corporate / Modern** with a **High-Contrast** edge to reflect the physical intensity of a fitness environment within a structured administrative framework.

The target audience consists of gym owners and administrators who require rapid data density and clear calls to action. The UI evokes a sense of "active readiness"—it is clean and clinical enough for serious business operations, yet punctuated by aggressive accents that mirror the vitality of the fitness industry. We utilize heavy whitespace to ensure focus, paired with high-impact color hits to guide the user's eye to performance metrics and growth opportunities.

## Colors
The palette is anchored by a high-visibility **Bold Orange** (#FF6B00), used strategically for primary actions and status indicators that require immediate attention. **Electric Blue** (#00D4FF) serves as a secondary accent for data visualization, secondary navigation, and informative highlights, creating a "cool-to-warm" contrast that keeps the dashboard feeling dynamic.

The neutral scale is rooted in a crisp **Off-White** (#F8F9FA) background to reduce eye strain during long administrative sessions. Typography and structural borders use a deep **Near-Black** (#1A1A1A) to ensure WCAG AA compliance and maintain a sharp, professional bite. Success, warning, and error states should utilize the primary and secondary accents where applicable, or traditional semantic colors filtered through a high-saturation lens.

## Typography
This design system relies exclusively on **Inter** to provide a systematic, utilitarian, and highly legible experience. The type hierarchy is designed for "glanceability"—administrators should be able to process membership counts and revenue figures instantly.

We employ tight letter spacing on larger headings to create a sense of density and strength. **Stats-number** is a specialized role for dashboard widgets, emphasizing numerical data. All labels use an uppercase transformation with slight tracking to differentiate them from body copy, acting as clear signposts for metadata and form fields.

## Layout & Spacing
The layout follows a **Fluid Grid** model with a maximum container width of 1440px. The spacing rhythm is built on a 4px baseline, ensuring all components align to a consistent mathematical scale.

- **Desktop:** 12-column grid with 24px gutters. Dashboard widgets typically span 3, 4, or 6 columns.
- **Tablet:** 8-column grid with 16px gutters.
- **Mobile:** 4-column grid with 16px margins. 

The vertical rhythm is tight (24px between related sections) to maximize information density above the fold. Use "md" (24px) for standard padding within cards and containers to maintain a spacious but professional feel.

## Elevation & Depth
To maintain a modern, flat aesthetic that emphasizes performance, this design system avoids heavy shadows. Depth is primarily conveyed through **Tonal Layers** and **Low-Contrast Outlines**.

- **Level 0 (Background):** #F8F9FA.
- **Level 1 (Cards/Containers):** Pure #FFFFFF with a 1px solid border in #E5E7EB.
- **Level 2 (Hover States/Modals):** A very soft, neutral-tinted shadow (0px 4px 12px rgba(0, 0, 0, 0.05)) to suggest interactivity or temporary overlay.

High-energy elements (like primary buttons) do not use shadows but instead use high-saturation color fills and slight scaling transforms on hover to provide tactile feedback.

## Shapes
The shape language is "Soft-Mechanical." A uniform **8px (0.5rem)** corner radius is applied to cards, buttons, and input fields. This provides a approachable modern feel without losing the "professional grid" structure necessary for an admin dashboard.

Small UI elements like checkboxes use a **4px** radius, while status chips and badges utilize a **Full Pill** shape to distinguish them from interactive buttons.

## Components
- **Buttons:** Primary buttons use the Bold Orange fill with white text. They are fixed-height (44px) for a substantial feel. Secondary buttons use a 1px #1A1A1A border with dark text.
- **Input Fields:** Use a 1px #E5E7EB border that shifts to 2px Bold Orange on focus. Labels sit directly above the field using the `label-md` style.
- **Cards:** White background, 8px radius, 1px light gray border. Use for grouping dashboard metrics and membership lists.
- **Chips/Badges:** For status (e.g., "Active", "Late"), use high-contrast fills with the secondary Electric Blue or semantic colors (Green/Red), always in the Pill shape.
- **Lists:** Data tables should use the `body-md` type role with 1px horizontal dividers and generous 16px vertical cell padding.
- **Progress Bars:** Use for "Gym Capacity" or "Goal Tracking," utilizing the Electric Blue for the fill and a light gray for the track.