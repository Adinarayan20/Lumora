# Lumora Design System Specification

> **STATUS**: Authoritative Design System Specification  
> **LAST RECONCILED**: 2026-08-10  

---

## 1. Token System & HSL Theme Palettes

All colors resolve through `@lumora/theme`. Zero hardcoded hex colors allowed in components.

### Theme Modes:
1. `LightThemeColors`: Soft neutral background, dark text, Aurora Blue primary (`#1E6091`).
2. `DarkThemeColors`: Deep slate background (`#0B0F19`), high contrast white text, glowing primary (`#3A86FF`).
3. `AmoledThemeColors`: Pure black canvas (`#000000`), OLED energy-optimized contrast.
4. `HighContrastThemeColors`: WCAG AAA compliant max-contrast theme (`#FFFFFF` on `#000000`).

---

## 2. Typography & Spacing Tokens

- **Font Scale**: `xs` (12px), `sm` (14px), `md` (16px), `lg` (18px), `xl` (22px), `display` (32px), `hero` (44px).
- **Spacing Scale**: `xs` (4px), `sm` (8px), `md` (12px), `lg` (16px), `xl` (24px), `xxl` (32px).
- **Touch Target Boundaries**: Minimum 44 × 44 dp for compact viewports; 48 × 48 dp for comfortable viewports.

---

## 3. UI / Data Independence Boundary

Design tokens, component variants, card elevations, and motion curves are presentation-only. Changing design system specifications MUST NEVER require database schema modifications.
