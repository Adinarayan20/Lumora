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

## 2. Foundational Semantic Icon Registry Scope

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

---

## 3. UI / Data Independence Boundary

Icon names, registries, typography pairings, stroke weight resolve logic, and touch target paddings are presentation-only constructs and MUST NEVER require backend database modifications.
