# Lumora Product Vision & Core Platform Philosophy

> **STATUS**: Authoritative Product Vision Statement  
> **LAST RECONCILED**: 2026-08-10  

---

## 1. Why Lumora Exists

Lumora is NOT a collection of standalone productivity tools (a separate todo app, a separate notes app, a separate habit tracker, a separate medicine reminder).

**Lumora is an AI-ready Personal Life Operating System built upon a Universal Object Model.**

Human life is interconnected: a medical prescription connects to a reminder, a pharmacy visit task, a doctor's note, an insurance document, and a recurring habit. Conventional software fragments human life into isolated app silos. Lumora unifies human life by treating **Everything as an Object**.

---

## 2. Non-Negotiable Product Principles

1. **Universal Object Inheritance**: Every piece of information created in Lumora automatically inherits all platform capabilities: Identity, Metadata, History & Audit, Relationships, Reminders, Attachments, Tags, Search, and AI Consumer Entry Points.
2. **Metadata Before Code**: Introducing a new object type (e.g. `VehicleMaintenance`, `PlantCare`, `GroceryList`) MUST NEVER require a new database table, new backend service, or schema migration. It is purely metadata-driven.
3. **UI / Data Independence**: Presentation changes (colors, fonts, layout density, tab order, animations, themes) MUST NEVER require changes to backend persistence schemas.
4. **Data Permanence**: User data survives forever while UI, APIs, and AI integrations evolve.
5. **AI as Consumer, Not Owner**: AI features consume platform events and data passively. The platform remains 100% functional without AI.
