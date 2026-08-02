---
name: Executive Bridge
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f4'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#43474e'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f0f1f1'
  outline: '#74777f'
  outline-variant: '#c4c6cf'
  surface-tint: '#476083'
  primary: '#000613'
  on-primary: '#ffffff'
  primary-container: '#001f3f'
  on-primary-container: '#6f88ad'
  inverse-primary: '#afc8f0'
  secondary: '#5a5f62'
  on-secondary: '#ffffff'
  secondary-container: '#dce0e4'
  on-secondary-container: '#5e6367'
  tertiary: '#000511'
  on-tertiary: '#ffffff'
  tertiary-container: '#0e1f33'
  on-tertiary-container: '#77879f'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d4e3ff'
  primary-fixed-dim: '#afc8f0'
  on-primary-fixed: '#001c3a'
  on-primary-fixed-variant: '#2f486a'
  secondary-fixed: '#dfe3e7'
  secondary-fixed-dim: '#c3c7cb'
  on-secondary-fixed: '#171c1f'
  on-secondary-fixed-variant: '#43474b'
  tertiary-fixed: '#d3e4fe'
  tertiary-fixed-dim: '#b7c8e1'
  on-tertiary-fixed: '#0b1c30'
  on-tertiary-fixed-variant: '#38485d'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style

The design system is centered on the concept of "Efficient Professionalism." It targets high-stakes B2B interactions where clarity and trust are paramount. The aesthetic is a refined blend of **Minimalism** and **Modern Corporate** standards, prioritizing legibility and cognitive ease.

The interface should feel expansive and high-end, achieved through generous whitespace and a restricted color palette. Every element exists to facilitate a connection between event organizers and sponsors, removing visual noise to focus on data, profiles, and partnership opportunities. The emotional response is one of calm confidence, reliability, and modern efficiency.

## Colors

The palette is anchored by **Deep Navy Blue**, representing stability and corporate authority. This is used for primary actions, navigation headers, and key brand moments.

- **Primary (#001F3F):** Used for buttons, active states, and primary icons.
- **Secondary / Accent (#F0F4F8):** A subtle "Ice Blue" used for background sectioning, hover states on cards, and subtle progress indicators.
- **Text / Slate (#64748B):** Soft Slate Gray is used for body copy and metadata to reduce visual vibration against the white background.
- **Neutral (#FFFFFF):** The canvas. Pure white is used for the base layer and card surfaces to maximize the "premium" feel.

## Typography

The design system utilizes **Inter** exclusively to maintain a systematic, utilitarian, and clean appearance. The typeface's tall x-height ensures excellent readability in data-heavy marketplace views.

- **Headlines:** Use tighter letter spacing and semi-bold weights to create a strong visual anchor.
- **Body:** Standard weight with generous line height (1.5x - 1.6x) to facilitate comfortable reading of sponsorship proposals.
- **Labels:** Used for tags, table headers, and small UI descriptors. Small labels use a slightly heavier weight and subtle tracking for clarity at small scales.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy for desktop to maintain a premium, editorial feel, transitioning to a fluid model for mobile devices.

- **Desktop:** 12-column grid with a 1280px max-width. Use 24px gutters to give elements room to breathe. 
- **Internal Spacing:** All padding and margins should follow an 8px linear scale (8, 16, 24, 32, 48, 64).
- **Alignment:** Left-aligned content is preferred for forms and lists to maintain a structured, professional vertical rhythm. Center alignment should be reserved for marketing hero sections.

## Elevation & Depth

This design system avoids heavy shadows, instead using **Tonal Layers** and **Low-contrast Outlines** to define hierarchy.

- **Level 0 (Base):** Background color (#FFFFFF or #F0F4F8).
- **Level 1 (Cards/Surface):** White surface with a 1px solid border (#E2E8F0). No shadow.
- **Level 2 (Hover/Active):** White surface with a very soft, diffused ambient shadow (0px 4px 20px rgba(0, 31, 63, 0.05)).
- **Interactive Elements:** Use subtle "Ice Blue" (#F0F4F8) background fills to indicate depth and hover states on buttons or list items.

## Shapes

The shape language is "Soft Professional." We avoid the clinical feel of sharp corners while steering clear of overly playful "bubbly" aesthetics.

- **Standard Components:** Buttons, input fields, and small cards use a **8px (0.5rem)** radius.
- **Large Containers:** Main content areas and modal overlays use a **16px (1rem)** radius.
- **Icons:** Use a 2px stroke width with slightly rounded terminals to match the UI's geometry.

## Components

### Buttons
- **Primary:** Deep Navy Blue background, White text. 8px border radius.
- **Secondary:** Transparent background, 1px Deep Navy Blue border, Deep Navy Blue text.
- **Ghost:** Transparent background, Slate Gray text. Used for less important actions.

### Input Fields
- White background, 1px border (#E2E8F0). On focus, the border changes to Deep Navy Blue with a 2px subtle Ice Blue outer glow.
- Labels sit above the field in `label-md` style.

### Cards
- Used for event listings and sponsor profiles. 
- 1px border (#E2E8F0), 16px corner radius.
- Inner padding should be 24px to ensure a premium, spacious feel.

### Chips & Tags
- Used for industry categories (e.g., "Tech", "Healthcare"). 
- Soft Ice Blue (#F0F4F8) background with Deep Navy Blue text in `label-sm`.

### Data Tables
- Clean, no vertical lines. 1px horizontal dividers.
- Header row uses a Subtle Ice Blue background with `label-sm` text weight.

### Progress Indicators
- For "Sponsorship Completion" or "Onboarding." Use thin, 4px height bars with rounded ends.