# Lumora Product Specification

> **STATUS:** AUTHORITATIVE PRODUCT TARGET  
> **OWNS:** Product definition, user value, product concepts, journeys, scope, and product boundaries.  
> **DOES NOT OWN:** Current implementation status, database details, API mechanics, or coding rules. See `LUMORA_ARCHITECTURE_SPECIFICATION.md` and `LUMORA_ENGINEERING_CONSTITUTION.md`.  
> **IMPLEMENTATION TRUTH:** Code, migrations, and executable tests establish what exists today. This document defines the intended target.

## 1. Executive definition

Lumora is a private, shared **Life and Responsibility Operating System**. It helps people, families, teams, organizations, and trusted service providers know:

- what exists;
- what needs to happen;
- who may see it;
- who may act on it;
- what already happened; and
- what requires attention next.

Lumora is not fundamentally a medicine, grocery, plant, notes, tasks, company, AI, or chat application. Those are useful experiences built on one coherent platform.

## 2. Vision, mission, and product thesis

**Vision:** Make important life and work responsibilities reliably remembered, safely shared, and easy to act on without exposing private context.

**Mission:** Replace fragmented notes, lists, reminders, documents, and hand-offs with calm, trustworthy coordination around the things users actually own, care for, or must do.

**Thesis:** Feature aggregation is not differentiation. Lumora becomes valuable when an item, its responsibility, its access rules, its evidence, and its history remain connected over time. A family should not wonder whether a dose was already recorded, whether milk is already on the list, or who owns a repair. A team should not need a separate system for the object, work order, attachment, and execution history.

## 3. Product principles

1. **Trust before delight.** Correctness, privacy, and safe completion outrank animation, AI, chat, and gamification.
2. **Objects are durable context.** A responsibility should not lose the item, people, files, or history that explain it.
3. **Responsibilities are first-class.** An object is not an action.
4. **Private by default where appropriate.** Sharing is explicit and reversible.
5. **Simple first interaction.** Users add a real item in seconds; advanced configuration is progressive disclosure.
6. **Reusable platform, tailored experience.** The storage and access foundation is universal; quick-add and detail UI can be specialized.
7. **Optional systems degrade safely.** Search, notifications, AI, chat, analytics, and gamification never decide core truth.
8. **No category worship.** Do not build separate foundational systems for plants, medicine, tasks, or companies.

## 4. Target users and personas

| Persona | Primary need | Initial Lumora value |
|---|---|---|
| Individual | Remember and organize private responsibilities | Fast capture, personal reminders, calm Today view |
| Household organizer | Coordinate bills, groceries, care, and documents | Shared responsibilities with ownership and history |
| Family member / child | Receive clear assigned work while preserving privacy | My actions, permitted shared lists, private notes |
| Caregiver | Safely record important recurring care | Clear due/completed state and immutable execution history |
| Team member | Complete work without browsing unrelated work | Assigned responsibilities, scoped access, hand-off |
| Manager | Know what needs attention and what was completed | Team views, approvals, exceptions, audit trail |
| Service provider | Receive limited work instructions and submit evidence | Temporary work-order access, photos, completion notes |

## 5. Core problems Lumora solves

- Important context is fragmented across messaging, notes, reminders, paper, and memory.
- Multiple people repeat work because nobody knows it was already completed.
- Household or team coordination often forces people to expose unrelated private information.
- Recurring responsibilities lose history and accountability.
- Generic productivity tools are either too simple for real-world coordination or too complex to configure.

## 6. The four product foundations

```text
Object          = what exists
Responsibility  = what needs to happen
Access          = who can see or act
History         = what happened, by whom, and when
```

Capabilities such as reminders, search, attachments, notifications, sharing, gamification, chat, AI, and integrations operate around these foundations.

## 7. Universal Object Model

Every object has a stable identity, workspace ownership, type identity, lifecycle, revision, title, access policy, timestamps, relationships, and history anchor. Object types use a namespaced `typeKey`; the platform must not branch on a fixed list of categories.

### 7.1 Object definitions

An Object Definition describes what an object type can represent: fields, allowed capabilities, validation, display metadata, and version. Definitions are controlled platform or trusted workspace configuration, not arbitrary executable code.

### 7.2 Templates

A Template is a practical starting configuration. It may select a definition, defaults, quick-add fields, starter responsibilities, suggested views, and allowed capabilities. A template never owns a user's data after instantiation.

### 7.3 Custom objects

Users may eventually create controlled custom objects with text, number, date, checkbox, select, URL, file, relationship, and reminder fields. They may not execute arbitrary code, define unrestricted automation, or bypass access policies. Custom objects must remain compatible with core search, history, attachments, visibility, and responsibilities.

### 7.4 Specialized domain experiences

Medicine, finance, complex schedules, high-volume records, and external integrations may need specialized rules and UI. They remain attached to the universal object, but may use a typed sidecar when safety, integrity, or query requirements justify it.

## 8. Universal Responsibility Model

A Responsibility belongs to an object or a small related set of objects. It expresses a thing to do, not the thing itself.

Minimum common information:

- title and linked object;
- status;
- due time or schedule;
- assigned people and allowed actors;
- priority and criticality; and
- execution history.

Optional information includes claim, recurrence, evidence, notes, approval, escalation, location, dependencies, and handover.

### 8.1 Responsibility lifecycle

```text
Scheduled → Due → Claimed / In Progress → Completed
                    ↘ Blocked / Skipped / Cancelled
Due → Overdue
Completed → Needs Review only when policy requires it
```

### 8.2 Critical responsibilities

Critical responsibilities—such as medicine administration, safety inspections, payments, or regulated work—must create an immutable execution record and reject duplicate completion. Lumora records completion and warns about conflicts; it does not provide medical advice or invent medical decisions.

## 9. Access and history model

Access and responsibility are separate. A person can complete a permitted action without viewing another person's private notes. Supported conceptual scopes are:

- Private;
- Selected people;
- Team;
- Workspace; and
- Temporary external access.

History records important state changes and executions with actor, time, reason, and relevant evidence. It is not a social feed; it is product memory and accountability.

## 10. Workspace experiences

| Workspace | Product defaults |
|---|---|
| Personal | Private capture, personal Today view, private notes and reminders |
| Family | Shared household responsibilities, selected-person privacy, caregiver-safe actions |
| Team | Assigned work, scoped collaboration, project/equipment templates |
| Organization | Teams, work orders, approvals, limits, audit requirements |
| Service provider | Temporary, least-privilege access to assigned work only |

Workspace type changes defaults, roles, templates, UI, limits, and available policies. It does not create a separate platform.

## 11. Core experiences

### Personal

Private notes, reminders, projects, documents, and routines. The default home answers: “What needs my attention now?”

### Family

Shared groceries, care routines, chores, bills, documents, and selected-person responsibilities. A child can complete a permitted action without seeing unrelated family data. Household activity is useful only when privacy remains trustworthy.

### Team and organization

Work orders, equipment, inspections, approvals, evidence, teams, and hand-offs use the same responsibility model. This is future expansion, not launch scope.

### Service provider

A cleaner, plumber, electrician, or gardener receives a narrow, time-limited work order. They do not receive broad workspace visibility.

## 12. Quick-add and specialized UI philosophy

Quick-add captures the minimum useful data. Grocery entry may be title and quantity; medicine may ask name, dose, and schedule; a work order may ask title, location, and priority. The same API and object core remain underneath.

Dynamic forms may help with long-tail objects. They must not be the only UI: common templates deserve curated, fast, accessible experiences.

## 13. Product capabilities

| Capability | Product role | Failure behavior |
|---|---|---|
| Search | Find context quickly | Object operations continue; index can rebuild |
| Timeline/history | Explain what happened | Core truth survives delayed projection |
| Reminders | Make responsibility visible at the right time | Schedule/execution retried; object remains correct |
| Notifications | Reach people outside active app use | Delivery failure does not undo action |
| Attachments | Preserve evidence and context | Pending/failed upload is explicit |
| Sharing | Coordinate safely | Access changes are immediate and auditable |
| Gamification | Celebrate healthy routines | Never changes correctness |
| Chat | Keep conversation attached to context | Future optional module |
| AI | Assist capture, search, summaries | Future optional module |

## 14. Search, timeline, reminders, notifications, attachments, and sharing

Search returns bounded, authorized projections. Timeline/history is paginated and records meaningful change, not every UI interaction. Reminders schedule responsibility occurrences rather than duplicating object data. Notifications protect lock-screen privacy and permit user-level controls. Attachments use secure, scoped access and lazy loading. Sharing is explicit, revocable, auditable, and least-privilege.

## 15. Gamification

Gamification is opt-in and reacts to completed responsibilities. It may include points, streaks, badges, challenges, household progress, visual celebrations, and personal goals. It must never pressure sensitive health actions, expose private data, decide permissions, or alter a completed responsibility.

## 16. Future chat, AI, localization, and subscriptions

Chat begins later with object and responsibility threads, then workspace announcements and private conversations when justified. AI is optional, consent-aware, permission-aware, auditable, replaceable, and isolated from core product operations. Localization uses user/workspace preferences and translation resources; domain logic never branches on a human language. Subscription concepts use server-side entitlements for capabilities, member limits, storage, integrations, and advanced automation.

## 17. Core user journeys

### First value

```text
Install → select personal/family goal → add one real item in seconds
→ attach a reminder or share it → see it in Today → return because Lumora remembered context
```

### Critical completion

```text
Due responsibility → authorized actor completes → server atomically records execution
→ other permitted actors see completed state → history explains who did it and when
```

### Shared work

```text
Member adds/claims responsibility → others receive scoped update → completion/evidence recorded
→ overdue or blocked work escalates according to policy
```

## 18. Graceful degradation

Core data must remain available when optional systems fail. Search failure cannot prevent object creation. Timeline failure cannot undo a responsibility completion. Notification, AI, chat, integration, analytics, and gamification failures must be visible and recoverable without corrupting core records.

## 19. Product boundaries and what Lumora is not

Lumora is not a clinical decision system, payment processor, replacement calendar, social network, chat clone, generic no-code platform, arbitrary automation engine, or mandatory AI assistant. It may integrate with those categories later, but must remain a trusted coordination system first.

## 20. Future evolution and risks

The launch wedge is private and shared household continuity: quick capture, responsibilities, reliable reminders, history, and privacy. Expansion to teams, organizations, and service providers reuses the same foundation. The greatest risks are scope dilution, over-configuration, weak privacy, unreliable reminders, notification fatigue, and trying to compete on feature count rather than connected context.

## 21. Rules for future product work

1. Explain product value in user language, never architecture jargon.
2. Make one real action useful before offering configuration.
3. Preserve private and shared life in the same workspace without forced visibility.
4. Add object types through definitions, templates, capabilities, and curated UX—not parallel platforms.
5. Add specialized sidecars only for genuine domain requirements.
6. Make critical actions correct before making them delightful.
7. Treat AI, chat, gamification, analytics, and integrations as optional enhancements.
