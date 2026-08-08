# Lumora Icon Platform Constitution & Architectural Specification

> **MILESTONE**: Phase 5 — Component #2: Icon Platform & Visual Quality Recovery  
> **STATUS**: Approved Specification — Ready for Implementation  
> **GOAL**: Establish a production-grade, zero-rewrites Icon Platform and visual quality recovery framework for Lumora Life Operating System without destabilizing existing token or typography foundations.

---

## 1. Executive Summary & Foundational Principles

Lumora is a Universal Object Platform (Everything is an Object: Notes, Reminders, Tasks, Events, Documents, Collections). Icons in Lumora are not decorative embellishments or standalone vector assets; they are **semantic functional affordances** and **visual anchors** for human perception.

### Non-Negotiable Architectural Rules
1. **Zero Direct Vendor Coupling**: Application screens and domain components MUST NEVER directly import vendor icon sets (e.g. `@expo/vector-icons/FontAwesome`, `lucide-react-native`, `react-native-vector-icons`). Icons must be consumed exclusively via the Lumora Icon Primitive (`<Icon name="..." />`).
2. **Metadata-Driven Core & Extension Registries**: Core icons are registered in a closed, strongly-typed semantic registry (`CORE_REGISTRY`: `Record<SemanticIconName, IconRegistryEntry>`). Dynamic domain-specific icons are registered in a controlled extension registry (`EXTENSION_REGISTRY`) governed strictly by the `ext:${string}` namespace (`ExtensionIconName`). Raw arbitrary strings are forbidden.
3. **Strict Theme Token Consumption**: Icons MUST NOT accept raw hex colors (e.g. `#111827`, `#5B7FFF`) or hardcode color maps inside UI components. All coloring is governed by semantic icon tokens resolved dynamically via `@lumora/theme`.
4. **No Raw Numeric Stroke Width Props**: Public API MUST NOT expose `strokeWidth?: number`. Stroke weight is governed semantically via `strokeWeight?: IconStrokeWeight` (`auto` | `thin` | `regular` | `strong`).
5. **Optical Alignment & Touch Target Isolation**: An icon's visual bounding box is separate from its interactive touch target. Minimum interactive hit areas are enforced via container tokens without inflating optical glyph dimensions.
6. **Zero Architecture Redesign**: The existing `@lumora/theme` token engine, `@lumora/ui` Typography primitive, Motion Engine, and Viewport Provider remain intact and serve as the single source of truth.

---

## 2. Visual Design Debt Audit (Phase 1 Findings)

A comprehensive audit of the running application (`apps/mobile/app/(tabs)/index.tsx`, `two.tsx`, `_layout.tsx`, and `design-system.tsx`) revealed key visual areas requiring structured recovery:

### Visual Debt Matrix

| Dimension | Current State Deficit | Impact | Required Icon Platform Recovery |
| :--- | :--- | :--- | :--- |
| **1. Optical Spacing** | Ad-hoc padding (`paddingVertical: 24`, `marginRight: 16`) and fixed numeric margins between icons and labels. | Visually misaligned headers, cramped navigation items, inconsistent vertical rhythms. | Enforce tokenized spacing scales (`xs: 4px`, `sm: 8px`, `md: 12px`) with optical baseline alignment rules for all Icon + Typography pairs. |
| **2. Surface Hierarchy** | Flat background cards resting on canvas with insufficient contrast between surface layers (`surface` vs `surfaceElevated`). | Interfaces lack material depth, feeling flat and unlayered. | Introduce subtle elevation contrast, glassmorphism overlays, and border opacity refinement for icon containers. |
| **3. Shadow Softness** | Shadows lack subtle primary tinting for interactive floating elements in light mode. | Floating actions look detached and harsh rather than elevated. | Use semantic elevated tokens (`SemanticShadowMap`) with soft primary glow for floating action icons. |
| **4. Border Visibility** | Inconsistent border opacities across light and dark modes. | Borders appear stark on dark mode and barely visible on high-contrast devices. | Enforce tokenized border strokes for icon containers (`border.subtle`, `border.strong`). |
| **5. Primary Blue Dominance** | Solid Aurora Blue used for interactive buttons, badges, and headers simultaneously. | "Blue fatigue"; active states compete visually with primary action buttons. | Restrict solid Aurora Blue to key primary CTAs. Subordinate icons use neutral text secondary/muted fills with tinted background surfaces. |
| **6. Card Depth & Elevation** | Cards feel rectangular and heavy due to uniform 16px corner radii without optical border adjustments. | Lack of visual rhythm across grid layouts. | Pair icon anchors with card surface layers using tokenized material elevation (`Canvas` → `Card` → `Floating`). |
| **7. Button Proportions** | Primary dev playground buttons use fixed text containers with no visual icon anchors. | Low visual scannability and uneven touch feedback. | Standardize icon-lead and icon-trail button layouts with strict touch target boundaries. |
| **8. Typography-to-Surface** | Typography resting directly on surfaces without optical lead icon pairing for scannability. | Walls of text on Home and Timeline screens. | Introduce semantic visual icon anchors beside section headers and title categories. |
| **9. Icon-to-Text Alignment** | Line 11 of `_layout.tsx` relies on `marginBottom: -3` for FontAwesome mathematical centering compensation. | Dirty hacks; breaks when text sizes change or optical scales respond to tablet/desktop. | Implement automated optical baseline alignment profiles within the `<Icon>` primitive wrapper. |
| **10. Touch Target Proportions** | Tab bar icons in `_layout.tsx` have non-enforced touch boundaries, relying on default tab hit boxes. | High mis-tap risk on mobile devices. | Guarantee minimum 44×44px (Compact) / 48×48px (Medium/Expanded) touch target wrapper. |
| **11. Light/Dark Consistency** | Inconsistent icon contrast when switching between Light, Dark, AMOLED, and High Contrast modes. | Text/icon contrast drops below WCAG requirements in dark/AMOLED. | Enforce dynamic semantic color resolution (`icon.primary` resolves via `theme.colors.textPrimary`). |
| **12. Tablet/Desktop Scaling** | Icons remain fixed 24px across phone (375px) and desktop (1600px) viewports. | Icons look tiny and lost on tablet/desktop views. | Contextual responsive icon sizing based on `useViewport()` with explicit prop override authority. |

---

## 3. Icon Platform Experience Specification

### A. Icon Philosophy
Lumora icons are **calm, precise, lightweight, premium, recognizable, consistent, accessible, and platform-aware**.

- **Calm & Unobtrusive**: Icons serve as functional visual cues, not decorative distractions.
- **Stroke Precision**: Clean geometry based on a 24×24px grid governed by semantic stroke weights (`thin`: 1.25px, `regular`: 1.75px, `strong`: 2.25px).
- **Platform Neutral**: Works seamlessly across Expo (iOS / Android) and React Native Web.

### B. Icon Visual Language & Semantic Stroke Weight
1. **Grid & Geometry**: Standard 24×24px viewport box with 2px inner padding.
2. **Semantic Stroke System**:
   ```typescript
   export type IconStrokeWeight = 'auto' | 'thin' | 'regular' | 'strong';
   ```
   - `auto` (Default): Automatically resolves stroke weight based on semantic size, theme contrast mode, and accessibility context (`sm`/`md` → 1.75px, `lg`/`xl` → 2.0px, High Contrast → 2.25px).
   - `thin`: 1.25px stroke weight for delicate display viewports.
   - `regular`: 1.75px standard production stroke weight.
   - `strong`: 2.25px bold stroke weight for high-emphasis or accessibility modes.
   - **No Raw Numbers**: `strokeWidth?: number` is STRICTLY PROHIBITED in the public API.
3. **Fill & Contextual Selected Behavior**:
   - **Default Inactive**: Mapped to `icon.muted` or `icon.secondary` with `strokeWeight="auto"` and transparent fill.
   - **Selected State**: Mapped to `icon.primary` (or `icon.brand` for primary tabs) with subtle contextual surface/tint where appropriate.
   - **Container Rule**: Filled background pills are NOT automatically applied to selected icons. Filled containers are reserved exclusively for components whose specific layout specification explicitly calls for them (e.g. FABs or active segmented controls).

### C. Icon Size System (Initial Geometric Contract)
Semantic icon dimensions represent the initial geometric contract. Actual visual balance must be validated in the Design System Playground against real Typography roles:

| Semantic Size Token | Geometric Dimension | Default Resolved Stroke | Intended Usage | Contextual Scaling Rule |
| :--- | :--- | :--- | :--- | :--- |
| `xs` | **14 × 14 px** | 1.5 px | Inline badges, metadata, helper text, status dots | Constant 14px across viewports |
| `sm` | **18 × 18 px** | 1.75 px | Dense list items, table rows, compact chips | Scales to 20px on Tablet/Desktop |
| `md` | **22 × 22 px** | 1.75 px | Standard body text pairing, form field leads, buttons | Scales to 24px on Tablet/Desktop |
| `lg` | **26 × 26 px** | 2.0 px | Section headers, card main icons, bottom tab navigation | Scales to 28px on Tablet/Desktop |
| `xl` | **32 × 32 px** | 2.25 px | Modal headers, feature hero cards, empty states | Scales to 36px on Tablet/Desktop |
| `display` | **44 × 44 px** | 2.5 px | Splash hero illustrations, onboarding primary anchors | Scales to 52px on Tablet/Desktop |

> **Contextual Size Authority Rule**: `useViewport()` determines default contextual sizes for un-sized icons in navigation/toolbars. When an explicit `size` prop is provided on `<Icon size="..." />`, it is strictly authoritative.

### D. Touch Targets & Interaction Boundaries
Visual icon size and interactive touch target size are strictly separated.

1. **Touch Target Token Rules**:
   - `TouchTarget.minimum` = **44 × 44 dp** (Minimum for Compact phone viewports).
   - `TouchTarget.comfortable` = **48 × 48 dp** (Recommended for Medium/Expanded touch viewports).
   - `TouchTarget.pointer` = **32 × 32 px** (For desktop pointer viewports with visible hover states).
2. **Container Behavior**:
   - Interactive icons automatically wrap the SVG glyph inside an accessible pressable hit area without layout shift.
   - Visual feedback occurs within the touch target boundary, preserving the inner optical glyph geometry.

### E. Foundational Semantic Icon Registry Scope
Initial implementation focuses on a high-quality foundational set across 6 core domains:

```typescript
export type SemanticIconName =
  // Navigation
  | 'nav.home'
  | 'nav.timeline'
  | 'nav.settings'
  | 'nav.back'
  | 'nav.forward'
  | 'nav.close'
  | 'nav.menu'
  | 'nav.more'
  // Actions
  | 'action.add'
  | 'action.edit'
  | 'action.delete'
  | 'action.search'
  | 'action.filter'
  | 'action.share'
  // Universal Objects
  | 'object.task'
  | 'object.note'
  | 'object.reminder'
  | 'object.event'
  | 'object.collection'
  // Status
  | 'status.success'
  | 'status.warning'
  | 'status.error'
  | 'status.info'
  // Settings & Security
  | 'settings.gear'
  | 'settings.theme'
  | 'security.user'
  | 'security.lock';
```

> **Strict Typing & Namespace Rule**:
> 1. `SemanticIconName` MUST NOT include a `| string` escape hatch. Extensibility is achieved via `registerIcon(...)`.
> 2. Security domain icons use `security.user` and `security.lock` (semantic security identity). `system.*` namespace is reserved strictly for system mechanics (`system.info`, `system.loading`, `system.error`).

### F. Icon Variant Architecture (Future Extension Framework)
```typescript
export type IconVariant = 'default' | 'filled' | 'duotone' | 'compact';
```
- `default`: Clean outline stroke representation (Production baseline).
- `filled`: Solid shape fill for high-emphasis active states (Future capability).
- `duotone`: Two-tone stroke + opacity fill for rich dashboard viewports (Future capability).

### G. Icon Theming & Tokenized Disabled Opacity
Icons MUST NOT contain raw hex or RGBA values inside UI components or token tables. Colors resolve exclusively through `@lumora/theme`:

| Semantic Icon Token Key | Resolved Theme Token Path | Description |
| :--- | :--- | :--- |
| `icon.primary` | `theme.colors.textPrimary` | Primary high-emphasis icons |
| `icon.secondary` | `theme.colors.textSecondary` | Secondary medium-emphasis icons |
| `icon.muted` | `theme.colors.textMuted` | Low-emphasis, inactive state icons |
| `icon.disabled` | `theme.colors.textMuted` + `theme.tokens.disabledOpacity` | Tokenized disabled state |
| `icon.brand` | `theme.colors.primary` | Lumora Aurora Blue brand emphasis |
| `icon.accent` | `theme.colors.accent` | Lumora Aurora Violet accent highlight |
| `icon.inverse` | `theme.colors.surface` | High contrast on primary colored backgrounds |
| `icon.success` | `theme.colors.success` | Positive status indicator icons |
| `icon.warning` | `theme.colors.warning` | Warning alert indicator icons |
| `icon.danger` | `theme.colors.danger` | Destructive or error indicator icons |

> **Disabled Opacity Token**: Opacity for disabled state is governed by `theme.tokens.disabledOpacity` (default `0.38`), allowing high-contrast and accessibility modes to override opacity cleanly.

### H. Optical Alignment & Profiling
Mathematical vertical centering `(lineHeight - iconSize) / 2` provides the baseline geometric calculation, but does NOT solve optical alignment by itself.

1. **Optical Correction Strategy**:
   - Baseline calculation: `geometricOffset = (lineHeight - iconSize) / 2`.
   - Optical correction profiles are applied where required based on glyph mass category.
   - Validation is performed in `/design-system` against live typography roles.
   - Screen-level negative margins (e.g. `marginBottom: -3`) are STRICTLY PROHIBITED.

### I. Icon + Typography Relationship Matrix

| Typography Role | Paired Icon Size | Optical Gap Token | Alignment Mode |
| :--- | :--- | :--- | :--- |
| `Display XL` / `Display L` | `display` (44px) | `md` (12px) | Cap-Height Profile |
| `Hero` / `Headline` | `xl` (32px) | `sm` (8px) | Center Baseline Profile |
| `Title Large` / `Title Medium` | `lg` (26px) | `sm` (8px) | Center Baseline Profile |
| `Title Small` / `Section Header` | `md` (22px) | `sm` (8px) | Cap-Height Profile |
| `Body Large` / `Body` / `BodyStrong` | `md` (22px) | `xs` (4px) or `sm` (8px) | Cap-Height Profile |
| `Body Small` / `Label Large` | `sm` (18px) | `xs` (4px) | Center Baseline Profile |
| `Label` / `Caption` / `Metadata` | `xs` (14px) | `xs` (4px) | Baseline Alignment Profile |
| `Button` | `md` (22px) | `sm` (8px) | Center Control Profile |

### J. Motion Engine Integration (Semantic Icon Motion)
Icons MUST NOT use card motion primitives (`MotionEngine.cardLift()`). Motion routes directly to Motion Engine semantic icon primitives:

1. **Semantic Motion Contract**:
   - `iconPress`: Touch compression feedback (`MotionEngine.press()`).
   - `iconHover`: Subtle optical emphasis on pointer hover.
   - `iconStateChange`: Crossfade or spring rotation for state toggles.
   - `iconAppear`: Fade-in scale transition on mount.
   - `iconLoading`: Continuous progress rotation.
2. **Restraint & Validation**:
   - Motion values are candidates subject to visual verification in `/design-system`.
   - Motion must remain calm, subtle, and accessibility-aware.

### K. Reduced Motion (Mandatory Accessibility Rule)
When reduced motion is enabled (`AccessibilityInfo.isReduceMotionEnabled` / CSS `prefers-reduced-motion`):
- Continuous rotational loops are disabled.
- Interactive scale transitions are minimized or removed.
- State morphing transitions are replaced with crossfades.
- Essential interaction feedback is preserved while removing decorative motion.

### L. Accessibility Behavior Rules (Automated Component Contract)
The `<Icon>` primitive automatically determines accessibility requirements based on its props:

1. **Interactive Icon Button (`onPress` provided)**:
   - Evaluates to `interactive` mode.
   - Automatically applies `accessibilityRole="button"`.
   - Requires `accessibilityLabel` (TypeScript warning/error if omitted on interactive icon buttons).
2. **Decorative Icon (`onPress` omitted + paired with visible text)**:
   - Evaluates to `decorative` mode.
   - Automatically hides icon from assistive screen readers (`accessibilityElementsHidden={true}`, `importantForAccessibility="no-hide-descendants"`).
3. **Standalone Informational Icon (`onPress` omitted + standalone UI status)**:
   - Applies `accessibilityRole="image"` with explicit `accessibilityLabel`.

### M. RTL Directional Behavior
1. **Auto-Mirrored Icons**: Directional arrows (`nav.back`, `nav.forward`, `action.share`) mirror horizontally (`scaleX: -1`) when `I18nManager.isRTL` is true.
2. **Non-Mirrored Icons**: Symmetric icons (`settings.gear`, `object.task`, `security.lock`, `action.search`, `status.success`) NEVER mirror in RTL layouts.

### N. Responsive Viewport Adaptation
- Contextual defaults from `useViewport()`:
  - **Compact (Phone, < 600px)**: Default navigation size `md` (22px), `44 × 44 dp` hit area.
  - **Medium / Expanded (Tablet, 600px – 1199px)**: Default toolbar size `lg` (26px), `48 × 48 dp` hit area.
  - **Large / Ultra (Desktop, ≥ 1200px)**: Default nav size `md` (22px), `36 × 36 px` pointer target.
- **Explicit Size Authority**: When an explicit `size` prop is provided (e.g. `<Icon size="xl" />`), it strictly overrides contextual viewport defaults.

---

## 4. Icon Anti-Patterns

❌ **Never** import vendor icon packages directly into application screens.  
❌ **Never** use emojis as primary UI icons.  
❌ **Never** hardcode raw hex or RGBA color strings inside UI components.  
❌ **Never** expose raw numeric `strokeWidth` in the public API (use `strokeWeight?: IconStrokeWeight`).  
❌ **Never** use arbitrary numeric icon sizes or stroke weights.  
❌ **Never** use negative margin hacks (e.g. `marginBottom: -3`) to force optical alignment.  
❌ **Never** automatically place every icon inside a colored pill container.  
❌ **Never** map `icon.accent` to `theme.colors.info`.  
❌ **Never** mix `system.user` and `security.user` naming.  
❌ **Never** use card motion primitives (`cardLift`) for icon interaction.  
❌ **Never** create interactive icon buttons (`onPress`) without an `accessibilityLabel`.  
❌ **Never** mirror symmetric non-directional icons in RTL layouts.  
❌ **Never** bypass the centralized semantic Icon registry.  
❌ **Never** add a `| string` escape hatch to `SemanticIconName`.

---

## 5. Future-Proof Design System Contract (Phase 3)

The Icon Platform acts as a foundational primitive for upcoming Lumora UI components (Buttons, Cards, Inputs, Navigation Rails, Tab Bars, Universal Objects). It exposes clear prop contracts (`iconLeft`, `iconRight`, `leadIcon`, `prefixIcon`, `suffixIcon`) without implementing those components prematurely.

---

## 6. Design Review Platform Integration Plan (Phase 4)

In `/design-system` (`apps/mobile/app/design-system.tsx`), a dedicated **Icons Tab** will be added featuring a structured inspection dashboard:

### Icon Inspection Panel Layout
```
┌────────────────────────────────────────────────────────────────────────┐
│ ICON INSPECTION PANEL                                                  │
│                                                                        │
│ name: action.search       resolved size: 22px     theme: Light        │
│ size: md                  stroke: regular         viewport: Compact    │
│ color: icon.primary       target: 44 × 44 dp      mode: Interactive    │
│                                                                        │
│                       [ VISUAL ICON RENDER ]                           │
│                                                                        │
│ [DEFAULT]  [SELECTED]  [DISABLED]  [PRESSED]  [LOADING]  [RTL MIRROR]  │
└────────────────────────────────────────────────────────────────────────┘
```

1. **Foundational Registry Showcase**: Grid of all 26 initial semantic icons with interactive selection.
2. **Icon + Typography Alignment Matrix**: Live pairing against all 34 typography roles.
3. **Theme & High Contrast Inspector**: Real-time rendering across Light, Dark, AMOLED, and High Contrast.
4. **Touch Target Boundary Debugger**: Visual 44px / 48px hit area overlays.
5. **State & Motion Tester**: Toggles for Default, Selected, Disabled, Pressed, Loading, and Reduced Motion.

---

## 7. Implementation Plan & File Structure (Phase 5 Handshake)

```
packages/
  theme/
    src/
      tokens/
        icons.json                     [NEW] -> Semantic icon tokens (sizes, hit targets, gaps, disabledOpacity)
      generated/
        tokens.ts                      [MODIFY] -> Export icon token interfaces, stroke weights & maps
  ui/
    src/
      primitives/
        icon/                          [NEW]
          Icon.tsx                     [NEW] -> Core Icon Primitive component
          Icon.types.ts                [NEW] -> Strict types (IconStrokeWeight, SemanticIconName, etc.)
          Icon.styles.ts               [NEW] -> Layout, touch target, and optical styles
          Icon.registry.ts             [NEW] -> Semantic icon registry mapping to @expo/vector-icons
          Icon.test.tsx                [NEW] -> Comprehensive unit test suite
          index.ts                     [NEW] -> Public export surface
      index.ts                         [MODIFY] -> Re-export Icon Primitive
apps/
  mobile/
    app/
      (tabs)/
        _layout.tsx                    [MODIFY] -> Replace FontAwesome direct imports with <Icon />
      design-system.tsx                [MODIFY] -> Add Icons tab to live review platform
```

### Existing Dependency Provider
- Uses `@expo/vector-icons: ^15.0.3` (already installed in `apps/mobile/package.json`) internally within `Icon.registry.ts`. Zero new package installations required.

---

## 8. Final Approval Sign-off Block

```
[X] Architectural Reviewer Approval
[X] Senior Experience Engineer Approval
[X] Motion & Accessibility Audit Approval
```

**STATUS**: SPECIFICATION APPROVED — READY FOR COMPONENT #2 IMPLEMENTATION
