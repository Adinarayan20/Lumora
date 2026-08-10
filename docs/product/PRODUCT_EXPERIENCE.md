# Lumora Product Experience Blueprint

> **STATUS**: Visual & UX Experience Directions  
> **LAST RECONCILED**: 2026-08-10  

---

## 1. UX Experience Directions & Principles

1. **Fluid & Organic Motion**: Micro-animations guide human attention during state changes (e.g. object creation, tab switches, sheet expansions). Motion MUST NOT introduce artificial delay or exceed 60fps budgets.
2. **Material Glassmorphism & Elevation**: Surfaces layer logically from Canvas (Level 0) to Surface Cards (Level 1) to Floating Controls (Level 2).
3. **Calm Aesthetic**: Visual hierarchy uses curated HSL color themes (`LightTheme`, `DarkTheme`, `AmoledTheme`, `HighContrastTheme`). No arbitrary inline colors.
4. **Touch Target Boundaries**: Interactive controls enforce minimum 44px (Compact) / 48px (Medium) touch target boundaries across mobile devices.
5. **UI / Data Independence Boundary**: All visual design specs, layout variations, component states, and theme tokens are presentation-only constructs and MUST NEVER alter backend persistence contracts.
