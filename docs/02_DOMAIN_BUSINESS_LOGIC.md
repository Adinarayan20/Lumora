# Lumora Domain & Business Logic Specification

> **STATUS:** AUTHORITATIVE DOMAIN CONTRACT
> **OWNS:** The exact meaning of every domain concept, invariants, state transitions, business rules, lifecycle semantics, domain relationships, correctness guarantees, and domain-level edge cases.
> **DOES NOT OWN:** Product intent, user value, or scope (owned by `01_PRODUCT_VISION.md`, referenced not redefined here); persistence strategy, indexing, provider mechanics, deployment topology (owned by `03_SYSTEM_ARCHITECTURE.md` / `04_DATA_SECURITY_RELIABILITY.md`).
> **AUTHORITY:** Per `00_DOCUMENTATION_INDEX.md`. Where this document and `01` appear to overlap, `01` is authoritative on *why* and *what the user experiences*; this document is authoritative on *exact meaning, rules, and correctness*. Neither redefines the other's territory.

---

## 1. Purpose and Scope

This document exists so a senior engineering team can implement and test Lumora's business rules without inventing missing behavior. It defines domain concepts precisely enough to write correct code and correct tests directly from it. It does not specify database schemas, API shapes, or provider integrations — those belong to `03` and `04`.

## 2. How to Read This Document

- **Domain Rule** — a statement of meaning or correctness that must hold regardless of implementation. These are binding.
- *(Implementation detail — deferred to 03/04)* — an explicit marker used wherever a decision belongs to a later document. This document states the *constraint* the implementation must satisfy, not the mechanism.
- **OPEN DECISION** — a callout block used wherever the product has not yet decided something. Engineers must not silently resolve these; they must be raised back to the appropriate owning document.
- Every major concept ends with a **Testable Rules** subsection in Given/When/Then form, covering both valid and invalid behavior.

## 3. Core Domain Concepts — Classification

| Concept | Classification | Meaning in one line |
|---|---|---|
| Object | CORE | The thing that exists and matters; always present. |
| Access | CORE | Governs visibility and action authority; always present, private by default. |
| History | CORE | The authoritative, permanent record of meaningful change; always present. |
| Notes / Attributes | OPTIONAL | Free-form detail attached to an Object. |
| Attachment | OPTIONAL | A file linked to an Object. |
| Responsibility | OPTIONAL | What needs to happen around an Object, if anything. |
| Schedule | OPTIONAL | Part of a Responsibility; defines when it is due. |
| Occurrence | DERIVED | A specific due instance produced by a Schedule; not independently created. |
| Execution | OPTIONAL to exist, CORE-guaranteed once it exists | The immutable record of what happened for one Occurrence. |
| Notification | OPTIONAL | An alerting layer on top of a Responsibility; never implied by a Schedule. |
| Item | OPTIONAL | A lightweight entry inside a List-shaped Object. |
| Template | CONFIGURATION (not user data, not domain state) | Authored starter content; independent of any Object once selected. |
| Custom Object | N/A — not a separate concept | An Object with no Template reference. Uses identical domain mechanics. |
| Workspace | CORE | The context (Personal, later Family) an Object belongs to. |
| Grant | CORE (V1) | Reversible, explicit extension of visibility/action authority. |
| Transfer | FUTURE | Permanent change of ownership; not specified in this document beyond naming it. |

---

## 4. Object

### 4.1 Definition
**Domain Rule:** An Object is the platform's single representation of anything a user or workspace wants to track. Every Object has: a stable identity, a workspace it belongs to, an owner, private-by-default Access, and an automatically-maintained History. Nothing about an Object's meaning or guarantees depends on what it represents — a Plant and a Vehicle are the same kind of thing at the domain level (Category Label handling: Section 12).

### 4.2 Identity
**Domain Rule:** An Object's identity is permanent from creation and never reused. Once assigned, it is never transferred to a different Object, and a deleted Object's identity is never recycled for a new, unrelated Object. This is what allows History to remain a trustworthy record over the Object's entire lifetime, including after archival or deletion.

### 4.3 Lifecycle

| State | Meaning | Reversible? |
|---|---|---|
| Active | Normal state — fully visible per Access rules, fully functional. | — |
| Archived | User-initiated. Hidden from default views (e.g., Today, default lists). No data loss — History, Attachments, Responsibilities remain fully intact. | Yes — can return to Active at any time. |
| Deleted (ordinary) | User-initiated. Removed from all product surfaces immediately. Underlying data, including History, is retained through a recovery window before permanent purge. | Yes, within the recovery window. |
| Erased (account/legal) | A distinct, rare operation tied to an explicit legal right (e.g., a right-to-erasure request), governed by policy outside this document's scope. Not part of ordinary product flows. | No. |

**Domain Rule — Archive/Delete effect on Responsibilities (made fully explicit):** while an Object is Archived or within its Deleted recovery window, its Responsibilities behave as **Paused** (Section 5.9): no new Occurrences are generated, and no Notifications fire. Explicitly, by composition with Section 5.2's Pause rules: existing History and past Executions are entirely untouched; no backlog of "missed" Occurrences is generated for the Archived/Deleted period (mirroring 5.2's rule that a paused window's occurrences never existed in the first place); Responsibility assignments are preserved unchanged throughout. Restoring the Object to Active resumes future Occurrence generation exactly as an explicit Resume would. If a Deleted Object's recovery window expires and the deletion becomes permanent, its Responsibilities transition to **Cancelled** at that point. History created before deletion is unaffected.

**Domain Rule — an already-due Occurrence is not retroactively suppressed by a later Archive/Delete (closes a real gap):** the pause-style suppression above applies only to Occurrences that would have been newly *generated* during the Archived/Deleted window — it never applies retroactively to an Occurrence that already existed and was already due (resolved or still Pending) *before* the Archive/Delete action took effect. Such an Occurrence continues to evaluate normally under the ordinary Missed/Corrected derivation (5.9, 33) regardless of the Object's later lifecycle state — deletion is a forward-looking suppression of future generation, never a retroactive freeze of a fact that was already real. Concretely: an Occurrence due Monday 10:00, still unresolved when the Object is Deleted at Monday 11:00, is correctly Missed by Tuesday even while the Object remains Deleted — restoring the Object on Wednesday reveals that true, unaltered status rather than a frozen or erased one.

**Domain Rule — Archive/Delete effect on Access (new; closes a prior gap):** Archiving or Deleting an Object is a **lifecycle state change only** — it never mutates Ownership, Grants, or Responsibility assignments. While Deleted, the Object is inaccessible to everyone (per "removed from all product surfaces," above) regardless of who held a Grant beforehand, but this is a visibility consequence of the Deleted state itself, not a revocation of any individual Grant. Restoring the Object returns **exactly the pre-deletion Access configuration** — every Grant that existed before deletion is in effect again immediately, with no manual re-granting required. Treating deletion as if it were an implicit access-revocation operation would be a modeling error: deletion and access are independent axes, and this rule keeps them that way.

> **Resolved:** the ordinary Deletion recovery window is **30 days** (`01_PRODUCT_VISION.md` Section 31) — a product/UX decision, not a legal retention policy. **Remaining OPEN DECISION:** legal/policy-driven retention or erasure requirements governing the terminal Erased state are still out of scope for this document and are not invented here.

### 4.4 Ownership and Workspace Membership
**Domain Rule:** Every Object has exactly one Owner and belongs to exactly one Workspace at a time. Ownership determines who may grant/revoke Access (Section 8) and who may permanently delete the Object. Workspace membership determines who is even eligible to be considered for Access (Section 9.5) — it is necessary but never sufficient on its own.

### 4.5 Access
Full definition in Section 8. Domain rule referenced here: an Object is private to its Owner from the instant it is created, with no configuration step required to achieve that state.

### 4.6 History
Full definition in Section 7. Domain rule referenced here: History begins recording from the instant of creation and cannot be disabled by any user action.

### 4.7 Notes / Attributes
**Domain Rule:** Free-form detail attached to an Object (text, structured fields suggested by a Template, or user-added fields on a Custom Object). Optional; absence has no effect on any other capability. A change to Notes/Attributes that the product considers meaningful (Section 7.2) produces a History record; incidental changes (e.g., a draft autosave) do not.

### 4.8 Attachments
**Domain Rule:** An Attachment belongs to exactly one Object and inherits that Object's Access scope — an Attachment is never independently more or less visible than the Object it belongs to. Removing an Attachment does not affect the Object's other data or its History integrity; the removal itself is recorded as a History event (Section 7.2).

### 4.9 Optional Capability Attachment/Detachment
**Domain Rule:** Adding an optional capability (Responsibility, Attachment, Items) to an existing Object never requires re-creating the Object and never affects previously recorded History. Removing/disabling an optional capability (e.g., cancelling a Responsibility, deleting an Attachment) never removes the Object's core guarantees and never deletes History that already exists describing that capability's past state.

**Domain Rule — capability system failure:** if a system supporting an optional capability fails (e.g., attachment storage is unavailable), the Object itself remains valid, visible, and usable. The failure is scoped and visible to that capability only. See Section 19 for the full failure-isolation model.

### 4.10 Object State Machine

| From | To | Trigger | Actor requirement | History implication |
|---|---|---|---|---|
| (none) | Active | Creation | Any authenticated user, within a Workspace they belong to | "Object created" record |
| Active | Archived | Explicit archive action | Owner only for V1 (see note below) | "Object archived" record |
| Archived | Active | Explicit restore action | Owner only for V1 | "Object restored" record |
| Active/Archived | Deleted | Explicit delete action | Owner only | "Object deleted" record |
| Deleted (within window) | Active | Explicit restore action | Owner only | "Object restored" record |
| Deleted (window expired) | Erased | Purge (system) or legal request | System / policy | Governed outside this document (OPEN DECISION, 4.3) |

**Invalid transitions:** Erased → any other state (terminal). Deleted (window expired, already purged) → Active (impossible; data no longer exists).

> **Note on "Owner only for V1":** an earlier draft of this table referenced "a workspace role with edit authority" for Archive/Restore — an undefined concept, since no role model beyond Owner exists yet (`01_PRODUCT_VISION.md` explicitly scopes Family role defaults as NEXT/future work). Rather than let architecture invent a role system to fill that gap, this document restricts Archive/Restore to Owner only until a real Family authority model is specified. The same correction applies everywhere else this undefined concept appeared — see Sections 8.5.1, 8.6, 8.7, 8.8.

### 4.11 Testable Rules — Object

- **Given** a newly created Object, **when** no further action is taken, **then** it is visible only to its Owner and has exactly one History record ("created").
- **Given** an Object with no Responsibility, Attachments, or Items, **when** queried, **then** it remains a fully valid Object — absence of optional capabilities is never an error state.
- **Given** an Archived Object, **when** its Owner restores it, **then** all Responsibilities resume generating Occurrences exactly as if never paused, and no History is lost.
- **Given** a Deleted Object within its recovery window, **when** restored, **then** its identity, History, and all optional-capability data are intact. *(Invalid: restoring a Deleted Object after its recovery window has expired — this must fail, since the data has been purged.)*

---

## 5. Responsibility → Schedule → Occurrence → Execution → Notification

### 5.1 Conceptual Chain and Cardinality
**Domain Rule:** `Object → Responsibility → Schedule → Occurrence → Execution`, with an optional `Notification` layered on Responsibility. For V1, a **Responsibility belongs to exactly one Object.** Multi-object Responsibilities (e.g., one responsibility spanning two related objects) are explicitly a FUTURE possibility, not an open ambiguity — see Section 20.

### 5.2 Responsibility — Definition and Lifecycle
**Domain Rule:** A Responsibility expresses what needs to happen around its Object — it is not the Object, and it is not any single act of doing it. It always has: a title, a status, an assignee set (who is expected/allowed to act — may be a single person or several), and, if scheduled, a Schedule.

| State | Meaning |
|---|---|
| Active | Generating Occurrences (if scheduled) or otherwise in effect. |
| Paused | Temporarily suspended. No new Occurrences are generated while paused. Resumable. |
| Cancelled | Permanently ended. No future Occurrences will ever be generated again. Terminal — not resumable; a new Responsibility must be created if the user wants this again. |

**Domain Rule — Pause is not retroactive:** an Occurrence already due at the moment a Responsibility is paused remains in whatever state it was in (still completable/skippable) unless the user explicitly acts on it. Occurrences that would have fallen within the paused window are **never generated at all** — they are not "missed," because they were never due; pausing suppresses their existence entirely.

**Domain Rule — Cancel vs. Pause boundary:** Cancel is deliberately terminal and Pause is deliberately resumable. These are not two strengths of the same action — they represent two different user intentions ("I'm done with this" vs. "stop for now"), per `01_PRODUCT_VISION.md` Section 23, and must be offered as distinct actions, never merged.

### 5.3 Schedule
**Domain Rule:** A Schedule defines the rule by which a Responsibility's due instances (Occurrences) are produced. Supported recurrence shapes: one-time (no recurrence — a single due instant), daily, weekly, monthly, **every-N-months**, **yearly / every-N-years**, every-N-days, specific weekdays, and multiple due times within a single day (e.g., three times daily). A Schedule is always evaluated in an explicit timezone; a due instant is a specific moment in time, not an ambiguous local time. *(Exact timezone storage/conversion mechanics are deferred to 03/04; the domain rule is only that ambiguity is never acceptable — every due instant must resolve unambiguously.)* Full domain semantics for calendar-month/year recurrence, day-of-month rollover, DST, and canonical timezone are defined in Section 32 — this section names the supported shapes; Section 32 governs their precise behavior.

**Domain Rule — editing an active Schedule (tightened):** an edit to a Responsibility's Schedule affects only Occurrences not yet due at the moment of the edit. This applies regardless of whether an already-due Occurrence has been resolved or is still unresolved/Pending — **an Occurrence that is already due at the moment of the edit keeps its original due instant unchanged either way.** The edit never rewrites the identity or due instant of any Occurrence already due, resolved or not. If a user wants to change one specific individual Occurrence without editing the standing Schedule, that is exactly what the Occurrence Override mechanism (Section 26) already provides — no second, competing occurrence-editing mechanism is introduced here.

### 5.4 Occurrence
**Domain Rule:** An Occurrence is one specific due instance produced by a Responsibility's Schedule. Its identity is **deterministic**: it is derived from (a) which Responsibility it belongs to, and (b) which scheduled due point in time it represents. Two requests referring to "this Responsibility's 8:00 AM instance today" — regardless of which device, which person, or how many times the request is retried — must always resolve to the exact same Occurrence, never two different ones.

*(Whether Occurrences are pre-computed and stored ahead of time, or computed on demand from the Schedule when needed, is an implementation decision belonging to `03`/`04`. The domain rule is only that Occurrence identity is deterministic, stable, and addressable — not how it is stored.)*

**Domain Rule — one Occurrence, independent of others:** each due instance produced by a Schedule is an independent fact. Acting on one Occurrence (completing, skipping) has **zero effect** on any other Occurrence, including other Occurrences of the same Responsibility on the same calendar day. This is the precise rule that makes the medicine example correct — see Section 5.13.

### 5.5 Execution
**Domain Rule:** An Execution is the immutable record that a specific Occurrence was acted upon, by a specific actor, at a specific time, with one of two outcomes: **Completed** or **Skipped**. Execution records, once created, are not edited or deleted through ordinary product flows.

**Domain Rule — cardinality (both directions):**
- One Occurrence has **at most one ACTIVE** Execution. A second completion attempt against an already-executed Occurrence does not create a second Execution — it must return the existing fact (Section 5.10). "Active" accounts for the Correction mechanism (Section 23): a corrected Execution remains permanently in History but is no longer the Occurrence's current, active fact.
- One Execution always refers to **exactly one** Occurrence — an Execution can never be interpreted as satisfying more than one Occurrence, even for the same Responsibility.

> **Resolved** (previously flagged here for `01`): `01_PRODUCT_VISION.md` Section 32 now specifies a short, user-facing Correction Window. Section 23 of this document defines its exact domain mechanics. Execution remains immutable in the sense that matters — no past fact is ever edited or deleted — but an active Execution can be voided by an explicit Correction within the window.

### 5.6 Notification
**Domain Rule:** Notification is an optional layer on Responsibility. A Schedule existing does not imply a Notification will be sent — this must always be an explicit, separate choice. Full domain semantics in Section 13.

### 5.7 Occurrence / Execution State Machine

| Occurrence status | Meaning | How reached |
|---|---|---|
| Pending | Due instant has not yet passed; no Execution exists, or a prior Execution was Corrected before due time passed. | Default state once an Occurrence's due instant is defined by the Schedule. |
| Completed | An active Execution exists with outcome Completed. | Actor completes it (on time or late — see 5.9). |
| Skipped | An active Execution exists with outcome Skipped. | Actor explicitly skips it. |
| Missed | Due instant has passed; no Execution has ever existed for this Occurrence. | **Derived**, not a stored transition — see 5.9. |
| Corrected | Due instant has passed; an Execution existed but was voided by a Correction, and no new Execution has been created since. | **Derived**, not a stored transition — see 5.9 and Section 33. |

**Invalid transitions:** Completed → Skipped or Skipped → Completed (an Execution, once created, is never overwritten to a different outcome — correcting a mistake uses the Correction mechanism defined in Section 23, never a silent status change). Pending → Missed and Missed → Corrected are not real transitions either; both Missed and Corrected are computed read-time facts, never stored states (5.9, Section 33).

### 5.8 Recurrence Editing
Covered in 5.3. Restated as a rule for clarity: **past is immutable, future is editable.**

### 5.9 Missed, Late, Skipped, Paused, Cancelled — Precise Distinctions

- **Missed** — **Domain Rule:** an Occurrence whose due instant has passed with **no Execution ever having existed** against it. This is a **derived status**, computed by comparing the current time to the Occurrence's due instant and checking for the total absence of any Execution history — it is never a separately stored field that could drift out of sync with that definition. *(Whether this is computed at read time or precomputed by a background process for efficiency is an implementation decision, 03/04; the domain rule fixes the definition, not the mechanism.)*
- **Corrected — new, distinct from Missed:** **Domain Rule:** an Occurrence whose due instant has passed, for which an Execution **did** exist at some point but was voided by a Correction (Section 23), and for which no new Execution has been created since. This is deliberately **not** the same derived status as Missed — the two represent materially different facts (never engaged with, versus engaged with and then undone), and collapsing them would misrepresent the Occurrence's actual history, which is exactly the failure this distinction exists to prevent. Corrected is computed identically to Missed in spirit (derived, never stored) but consults the full Execution/Correction history rather than only the current absence of an active Execution. If the due instant has **not yet** passed when a Correction is applied, the Occurrence is simply Pending, not Corrected — the distinction only matters once the ordinary Pending window has closed, since before that point Pending is already accurate and non-misleading on its own. See Section 33 for the full decision record.
- **Completed late** — **Domain Rule:** not a separate status. Derived by comparing an Execution's `completed at` timestamp to the Occurrence's due instant. A Completed Execution is a Completed Execution regardless of timing; "late" is descriptive metadata, not a different outcome.
- **Skipped** — an explicit actor decision, recorded as an Execution with outcome Skipped (5.5). Distinct from Missed, which involves no actor decision at all.
- **Paused** — Responsibility-level (5.2), not Occurrence-level. Suppresses generation of future Occurrences; does not retroactively affect Occurrences already due.
- **Cancelled** — Responsibility-level (5.2), terminal. Existing Executions and History are preserved; no future Occurrences are ever generated again.

### 5.10 Concurrent Completion
**Domain Rule:** when two completion attempts race for the same Occurrence, exactly one succeeds in creating the Execution. The other must resolve to the same outcome as a duplicate request (5.12) — "already completed, by [actor], at [time]" — never a raw error and never a second Execution. This is the same underlying rule as duplicate completion and offline completion (5.11, 5.12), viewed under timing pressure rather than as a distinct case. *(The precise locking/transaction mechanism that guarantees exactly-one-winner is 03/04's responsibility; the domain rule is the outcome guarantee itself.)*

### 5.11 Offline Completion
**Domain Rule:** because Occurrence identity is deterministic (5.4) and Execution creation is idempotent per Occurrence (5.5, 5.12), a completion constructed while offline and submitted later produces exactly the same correct outcome as if submitted live — no offline-specific domain logic is required beyond the idempotency guarantee that already exists for every other trigger of this rule. *(Local storage, sync protocol, and conflict UI belong to 03/04 — explicitly not designed here.)*

### 5.12 Duplicate Completion
**Domain Rule:** the same underlying idempotency guarantee as 5.10/5.11: submitting a completion request for an Occurrence that already has an Execution must not create a second Execution and must not change the recorded outcome. The system returns the original, existing fact. **Concurrent completion, offline-replayed completion, and accidental duplicate submission are the same domain rule, illustrated three ways — not three separate requirements.**

### 5.13 Worked Example — Medicine (the correctness test)

> **Given** a Medicine Object with a Responsibility "Take medicine," Schedule = three times daily (08:00, 14:00, 20:00), for August 12.
> **When** the 08:00 dose is completed by the user,
> **Then** exactly one Execution exists, referencing exactly the 08:00 Occurrence, with outcome Completed. The 14:00 and 20:00 Occurrences remain Pending, entirely unaffected.
>
> **When** 14:00 passes with no action taken, and it is now 15:00,
> **Then** the 14:00 Occurrence is Missed (derived per 5.9) — visible to the user as missed, not silently absent. The 08:00 Execution and the 20:00 Pending Occurrence are unaffected by this.
>
> **When** the 20:00 dose is completed,
> **Then** a third, independent Execution is created for the 20:00 Occurrence. At end of day: three Occurrences, two Executions (08:00 Completed, 20:00 Completed), one Missed (14:00) — three separate, independently true facts, exactly as required.
>
> **Invalid outcome (must never happen):** completing the 08:00 dose marks 14:00 or 20:00 as Completed, or reduces the day to a single "medicine: done" flag. This is precisely the failure mode this entire chain of definitions (5.1–5.12) exists to prevent.

### 5.14 Worked Example — Plant
> **Given** a Plant Object with a Responsibility "Water plant," Schedule = every 3 days.
> **When** the current Occurrence is completed on day 3,
> **Then** the next Occurrence's due instant is day 6, computed from the Schedule — not from the completion timestamp (5.3's "future is editable, past is immutable" applies to Schedule edits, not to ordinary recurrence advancement, which always follows the original Schedule rule).
>
> A future richer Plant-specific presentation (e.g., a dedicated plant page showing watering streaks) consumes exactly this same Responsibility/Occurrence/Execution/History data — see Section 12. No domain change is required to build it.

### 5.15 Testable Rules — Responsibility/Occurrence/Execution
- **Given** a Responsibility with three daily Occurrences, **when** one is completed, **then** the other two remain Pending. *(Invalid: completing one changes the status of another.)*
- **Given** an Occurrence with due instant in the past and no Execution, **when** queried, **then** it reports as Missed. *(Invalid: it silently disappears from any view that lists due/overdue items.)*
- **Given** two simultaneous completion requests for the same Occurrence, **when** both are processed, **then** exactly one Execution exists and both requesters observe a consistent "completed by X at T" outcome. *(Invalid: two Executions exist, or one request errors without resolving to the true state.)*
- **Given** a Paused Responsibility, **when** the pause window ends and it is Resumed, **then** no Occurrences are retroactively created for the paused period, and future Occurrences resume per the original Schedule. *(Invalid: a backlog of "missed" Occurrences appears for the paused window.)*
- **Given** a Cancelled Responsibility, **when** queried, **then** its past Executions and History remain fully intact and it never produces another Occurrence. *(Invalid: cancelling deletes past Execution records.)*

---

## 6. List-Shaped Objects and Items

### 6.1 Definition and Boundary
**Domain Rule:** A List-shaped Object is an ordinary Object (Section 4) that has the Items capability attached. Items are **lightweight child records**, not a second Object system. An Item has no Object-equivalent identity, no independent Access, no independent History, and no Responsibility of its own.

### 6.2 Item Semantics
**Domain Rule:** An Item supports exactly: text, checked state, quantity, unit, and ordering. Nothing else. This boundary is deliberate and must not be extended by adding fields that would let an Item start behaving like an Object.

### 6.3 Concurrent Editing
**Domain Rule:** two people checking off *different* Items on the same shared list, at the same time, must never overwrite each other's change. Each Item's state changes independently of every other Item on the same list — this is the same class of correctness guarantee as Execution idempotency (5.10–5.12), applied to a different concept: a shared mutable collection where individual entries must be independently addressable and independently updatable. *(The precise mechanism — e.g., updating one entry without touching the others — is 03/04's concern; the domain rule is the outcome: no two concurrent, distinct-Item edits ever collide.)*

### 6.4 Graduation Path
**Domain Rule:** if an Item's needs grow to require its own Responsibility, its own History, or its own Access rules, it must be **promoted to a full Object** — never given those capabilities while remaining an Item. This is the explicit boundary that prevents Items from regrowing into a second universal system. Promotion is a one-way, user-initiated action (e.g., "turn this into its own tracked thing"); it is not automatic and not implied by any Item field.

### 6.5 Item State Machine
| From | To | Trigger |
|---|---|---|
| Unchecked | Checked | User action |
| Checked | Unchecked | User action (fully reversible, unlike Execution) |
| (any) | Removed | User action; no History implication (Section 7.3) |

> **Resolved** (`01_PRODUCT_VISION.md` Section 34): a completed List resets its Items in place by default — every Item's checked state returns to Unchecked, ready for reuse. **Domain Rule (boundary made explicit):** the List-shaped Object's own History (Section 7) records a summary "list completed" event at the moment of reset (per 7.2/7.3's parent-level-only rule) — and the record is **exactly and only** that: a bare fact of the form "list completed at time T, by actor X." It explicitly does **not** include a per-item snapshot, purchased/not-purchased counts, or any other item-level detail — including that detail would quietly turn List History into a second, parallel historical system for Items, which Section 6.1's boundary specifically forbids. If per-trip shopping history with item-level detail is genuinely wanted later, that need is met by promoting the relevant use case to a full Object (per the Item graduation path, 6.4) — never by enriching List History itself. A user may separately Archive a specific List instance (the ordinary Object Archive action, Section 4.3) and start a new one if they want a specific trip's contents preserved as its own persistent Object — a general-purpose action, not new List-specific machinery.

### 6.6 Testable Rules — Items
- **Given** a shared Grocery List with Items Milk and Bread, **when** two different people check off Milk and Bread at the same moment, **then** both changes persist independently. *(Invalid: one checkmark overwrites the other, or only one survives.)*
- **Given** an Item, **when** queried for its own History, **then** none exists independently — only the parent List-shaped Object's own History (Section 7) may reference item-level activity if the product considers it meaningful.
- **Given** a user wants per-item reminders, **when** they attempt to add a Responsibility to an Item, **then** this is not possible — the correct path is promoting that Item to a full Object (6.4).

---

## 7. History

### 7.1 Definition
**Domain Rule:** History is the authoritative record of meaningful change to an Object, durable for the lifetime of the Object — never optional, never disabled, and never allowed to lag behind the fact it describes in a way that could show an inconsistent state to the user. "Durable for the lifetime of the Object" is a deliberately precise phrase, not "permanent" in an unqualified sense: History survives every ordinary lifecycle state (Active, Archived, Deleted-within-window) and is only affected by the Object's own terminal Erased state (7.7) — the same lifecycle boundary that governs the Object itself, not a separate, stronger promise that would contradict Erasure's existence. **History is not Timeline.** Timeline, if it exists as a product surface, is a derived, optional, presentational view built on top of History (`01_PRODUCT_VISION.md` Section 19) — it may lag or be rebuilt; History itself may not.

### 7.2 What Creates a History Record
A History record is created for: Object creation, archival, restoration, deletion; meaningful attribute/notes changes (as distinct from incidental ones — e.g., a final saved edit, not every keystroke); Responsibility creation, pause, resume, cancellation; Execution creation (Completed or Skipped); Execution Correction (Section 23); Occurrence Override (Section 26); Access Grant creation and revocation; Attachment addition and removal; Workspace membership changes affecting the Object's visibility. Workspace-level membership changes (a member joining or leaving) are also themselves meaningful History facts about the Workspace as its own entity, structurally identical to Object-level History but scoped one level up — not a new mechanism, an application of the same one.

### 7.3 What Does Not Create a History Record
Draft/incidental UI state (e.g., unsaved form input); Item-level check/uncheck activity within a List-shaped Object (6.5) — the List Object's own meaningful changes may be recorded, but individual Item toggles are not independently historized, consistent with the Item boundary in 6.1; read/view activity (viewing an Object is never a History event); Timeline projection rebuilds (a Timeline rebuild reads History, it never writes to it).

### 7.4 Record Contents
**Domain Rule:** every History record has, at minimum: the affected Object's identity, the actor who caused it (or "system" where no human actor applies, e.g., a purge), a timestamp, the action taken, and action-relevant metadata (e.g., which Occurrence an Execution record refers to). Metadata must never include content that would violate the source Object's own Access/sensitivity rules (Section 12.4) — a History record is exactly as protected as the Object it describes, never less.

### 7.5 Ordering and Immutability
**Domain Rule:** History records are ordered by the **authoritative (server-accepted) timestamp** of the event they describe — never by a client device's locally-perceived event time, which offline devices and clock skew can make unreliable. For events whose authoritative timestamps are equal, or whose causal order cannot otherwise be established (e.g., two offline devices reconnecting near-simultaneously), a deterministic tiebreaker applies. *(The exact tiebreaker mechanism — sequence number, acceptance order, or similar — is deferred to `03`/`04`; this document fixes only the principle: authoritative timestamp governs, client-reported time never does.)* This is the same principle already established for the Correction Window (Section 23) applied consistently to History in general. History records are immutable once created — they are never edited or deleted through ordinary product flows.

### 7.6 Correction Behavior
**Domain Rule:** History is corrected by **adding a new record describing the correction**, never by editing or deleting the original record. This preserves the permanent-record guarantee even when a mistake needs to be reflected (e.g., "Execution correction" as a new record type, contingent on the open item noted in Section 5.5 being resolved by `01` first).

### 7.7 Deletion and Retention Behavior
**Domain Rule:** History belonging to an Object follows that Object's own lifecycle (Section 4.3) — it survives Archive and the Deleted recovery window intact, and is only affected by the terminal Erased state.

> **OPEN DECISION:** exact retention duration/policy is not specified here — consistent with the instruction not to invent legal retention policy. This document fixes the *behavioral* guarantee (History is not separately deletable from its Object; it does not expire independently of the Object's own lifecycle) without fixing a specific time period.

### 7.8 History vs. Timeline — Restated as a Strict Domain Boundary
**Domain Rule:** it must be structurally impossible for an Object to show a completed Responsibility (Section 5) while its History does not yet reflect that completion. If a Timeline-style feed exists and is temporarily stale or unavailable, the user can still open the Object directly and see accurate, complete History (Section 17 of `01`). A Timeline outage is never evidence of a History problem, and a History write is never permitted to be routed through the same failure-tolerant path used for Timeline projection.

### 7.9 Testable Rules — History
- **Given** a Responsibility Occurrence is completed, **when** the completion transaction succeeds, **then** a corresponding History record exists as part of that same guarantee — never as a separate, best-effort step that could fail independently. *(Invalid: the completion is recorded but History does not yet reflect it, even briefly.)*
- **Given** an Object is archived and later restored, **when** its History is viewed, **then** both the archive and restore events appear, in order, alongside everything that happened before and after. *(Invalid: archiving hides or truncates prior History.)*
- **Given** an Item is checked and unchecked several times, **when** the parent Object's History is viewed, **then** no per-toggle entries appear (6.1, 7.3).

---

## 8. Access, Sharing, Ownership

### 8.1 Ownership
**Domain Rule:** every Object has exactly one Owner (Section 4.4). Ownership determines who may Grant/Revoke Access and who may permanently delete the Object. Ownership is distinct from, and does not automatically imply, being assigned a Responsibility on the Object.

### 8.2 Grant
**Domain Rule:** a Grant extends visibility and/or action authority on a specific Object to a specific person or to an entire Workspace (`01` Section 20), **without changing who owns the Object.** A Grant means: the grantee can see the Object (and, depending on scope, act on its Responsibilities) for as long as the Grant is in effect. **A Grant does NOT mean:** the grantee becomes the Owner; the grantee can re-grant access to others unless separately given that authority; the grantee gains visibility into any other Object the Owner has not separately granted.

### 8.3 Revoke
**Domain Rule:** revoking a Grant is immediate and forward-looking only. It removes the grantee's current visibility/action authority. It has **no retroactive effect** on History — records created while the Grant was in effect remain part of the Object's permanent History (Section 7.7). **What changes is not the historical record's existence, but the revoked person's current ability to view it** — visibility into History is governed entirely by *current* Access, never by whether access existed at the time a given History record was created.

### 8.4 Transfer (Future)
**Domain Rule:** Transfer is a distinct, permanent operation — a genuine change of Owner — named here for completeness but not specified further. It must never be implemented as a side effect of Grant, and Grant must never silently behave like Transfer (`01` Section 20's explicit correction).

### 8.5 Four Independent Axes
**Domain Rule:** these are never collapsed into one "access level":
1. **Ownership** — who may permanently delete the Object and control sharing of it.
2. **Visibility** — who can currently see the Object, governed by Grant/Revoke.
3. **Responsibility Assignment** — who is expected/allowed to act on a specific Responsibility (Section 5.2's assignee set). Only the Object's Owner may create or change a Responsibility's assignee set for V1. This establishes the authority boundary explicitly rather than leaving assignment authority implicit. A person can be assigned without broad visibility being separately granted. This implied visibility is part of the existing Grant/access model defined in this section — it is not a third, independent authorization mechanism. It is narrowly scoped: sufficient to view and act on that specific Responsibility, not the rest of the Object. The exact persistence and lifecycle mechanics of this scoped visibility are a data-model/implementation decision, to be made when Responsibility and Grant are actually designed and built — not fixed here.
4. **Workspace Membership** — a precondition for being eligible for any of the above (Section 9.5), never sufficient by itself.

**Domain Rule — who may complete an Occurrence (refines axis 3):** if a Responsibility has one or more current assignees, only those assignees or the Object's Owner may complete or skip its Occurrences. If the assignee set is empty (unassigned, per 8.7), only the Object's **Owner** may act on it until it is reassigned — restricted to Owner for V1 rather than any broader "edit authority" concept, since no role model beyond Owner is defined yet (see the note in Section 4.10). This is a deliberate tightening: assignment gates who may act, it is not merely informational — a responsibility assigned to one person should not be silently completable by someone who merely has visibility into the object.

**Explicit, intentional rule (not an inference):** the Owner's ability to complete any Responsibility on their own Object, regardless of assignment, is a deliberate design choice, not an oversight of the assignee-gating rule above. Ownership and Responsibility assignment are distinct concepts (8.5) — the Owner remains the ultimately accountable party for the Object itself, independent of whoever holds day-to-day operational responsibility for a specific Responsibility on it. A future engineer must not "fix" this by removing the Owner's override, nor extend it further (e.g., to any Family member with visibility) without a new, equally explicit decision.

**Domain Rule — multiple assignees:** for V1, multiple assignees means "any one of them completing it resolves the Occurrence for everyone" — never "everyone must individually complete it." A responsibility genuinely needing separate, individual tracking per person (e.g., each family member's own daily habit) is modeled as separate Responsibilities, one per person, each with its own single assignee — not as one Responsibility requiring multiple completions. This is not a gap in the model; the existing model already covers this case without new mechanism.

### 8.6 Who May Grant or Revoke
**Domain Rule:** for V1, only an Object's **Owner** may create or revoke a Grant for it. Broader delegated sharing authority (e.g., an adult Family member sharing an object they don't own) is explicitly deferred until Family's actual authority model is defined — not invented here to fill the gap (consistent with Section 4.10's note).

### 8.7 Workspace Member Removal
**Domain Rule:** a Grant is only effective for as long as the grantee remains an active member of the Object's Workspace. Removing a member immediately voids the practical effect of any Grant naming them, without requiring the Grant record itself to be separately, manually revoked — though the Grant's History remains an accurate account of what access existed and when (7.7, 8.3).

**Domain Rule — Responsibility assignment on member removal:** removing a Workspace member automatically removes them from any Responsibility's assignee set they belonged to. If this leaves the assignee set empty, the Responsibility is not deleted or cancelled — it remains valid and continues generating Occurrences, but is now **unassigned**: any Occurrence produced while unassigned may be acted on by the Object's **Owner** only, until it is explicitly reassigned (restricted to Owner for V1, per the note in Section 4.10). This is the precise mechanism behind `01_PRODUCT_VISION.md` Section 23's "assigned responsibilities become unassigned and reassignable — never deleted."

**Domain Rule — assignment changes mid-cycle:** a change to a Responsibility's assignee set (by removal, above, or by deliberate reassignment) affects the current and all future unresolved Occurrences immediately. It has no effect on Occurrences already resolved (Completed or Skipped) — their Execution records remain attributed to whoever actually acted, regardless of later assignment changes, consistent with "past is immutable, future is editable" (5.8).

### 8.8 Access Grant State Machine
| From | To | Trigger | Notes |
|---|---|---|---|
| (none) | Active | Grant created | Owner only for V1 (8.6) |
| Active | Revoked | Explicit revoke, or member removal (8.7) | Forward-looking only (8.3) |
| Revoked | Active | A **new** Grant is created | This is a new Grant record, not a reactivation of the old one — preserves an accurate account of distinct access periods in History. |

### 8.9 Testable Rules — Access
- **Given** an Object shared via Grant to a Family workspace, **when** a member is removed from that workspace, **then** they immediately lose visibility, with no separate manual revocation step required. *(Invalid: a removed member retains visibility because nobody remembered to revoke a Grant.)*
- **Given** a Grant is revoked, **when** the same person is granted access again later, **then** this is recorded as a new, distinct Grant — History shows two separate access periods, not one continuous one. *(Invalid: reactivating erases the record of the earlier revocation.)*
- **Given** a person assigned to a Responsibility whose sole assignee is removed from the Workspace, **when** the next Occurrence becomes due, **then** it is unassigned and completable by anyone with sufficient authority, not silently orphaned. *(Invalid: the Responsibility stops producing Occurrences entirely, or the Occurrence becomes uncompletable by anyone.)*

---

## 9. Workspace

### 9.1 Definition
**Domain Rule:** a Workspace is the context an Object belongs to. It determines who is even eligible to be granted Access to Objects within it (Section 8.5's fourth axis).

### 9.2 Personal Workspace
**Domain Rule:** every user has exactly one Personal Workspace, created automatically at account creation, requiring no user action or acknowledgment (`01` Section 14). It is not presented to the user as a concept they must understand — it simply is where their Objects live until they choose otherwise.

### 9.3 Family Workspace (NEXT)
**Domain Rule, stated at the principle level only (not designed further here):** a Family Workspace is a second kind of Workspace a user may create or join, containing its own members and its own set of Objects/Grants, distinct from their Personal Workspace. Creating or joining one has **zero automatic effect** on any existing Personal Object's visibility (`01` Section 20) — nothing moves or becomes visible by default.

**Domain Rule — ownership of Objects created within Family:** an Object created while the acting Workspace context is Family belongs to that Family Workspace and is individually owned by its creator — never jointly owned, and never owned by the Workspace itself as an abstract entity. This preserves the "exactly one Owner" invariant (4.4) without modification.

**Domain Rule — implicit Grant at Family creation:** choosing to create an Object within the Family Workspace context is itself the explicit sharing decision — it constitutes an automatic Grant (Section 8.2) of workspace-wide **visibility only** at the moment of creation, performed by the creator (who holds Grant authority as Owner, per 8.6). This does **not** apply to Objects with an elevated Sensitivity classification (Section 12.4): those remain private to their creator by default even when created within Family, requiring an explicit, narrower Grant — consistent with `01_PRODUCT_VISION.md` Section 21's conservative default for sensitive information. This is the one deliberate exception to "private by default requires no configuration" (4.5): the exception is the *scope* of the automatic grant, calibrated by Sensitivity, never a category-specific rule (12.1).

**Domain Rule — visibility never implies action authority:** the implicit Family Grant above extends **visibility only**. It does not, by itself, grant the ability to edit the Object's fields, archive or delete it, change its Sensitivity, add or remove Attachments, or create/revoke further Grants. Those remain governed exclusively by Ownership (8.1, 8.6), Responsibility assignment (8.5.1), and any other explicitly-defined action authority. A Family member seeing an object they don't own can, at most, complete a Responsibility they are specifically assigned to (8.5.1) — seeing something is never, by itself, permission to change it. This closes a real authorization trap: "the household can see it" must never silently become "the household can mutate it."

### 9.4 Future Workspace Types
**Domain Rule:** Organization, Company, and Service-Provider contexts are future Workspace types, generalizing the same Workspace/Access/Responsibility concepts already defined here (Section 20 proves this concretely). This document does not design their specific roles, hierarchy, or approval semantics — doing so now would be exactly the premature abstraction this whole documentation set exists to avoid.

### 9.5 Workspace Membership vs. Object Access
**Domain Rule:** membership in a Workspace is necessary but never sufficient for Access to a specific Object within it — an Object remains private to its Owner within its own Workspace until a Grant is separately created (Section 8.2), even for other members of the same Workspace.

### 9.6 Testable Rules — Workspace
- **Given** a new user account, **when** it is created, **then** exactly one Personal Workspace exists, with no setup step required. *(Invalid: the user is asked to name, configure, or acknowledge it.)*
- **Given** a user creates a Family Workspace, **when** it is created, **then** no existing Personal Object becomes visible to anyone as a result. *(Invalid: Personal history or objects leak into the new Family context by default.)*
- **Given** two members of the same Family Workspace, **when** one creates a private Object within that Workspace, **then** the other member cannot see it without an explicit Grant. *(Invalid: Workspace membership alone grants visibility.)*

---

## 10. Templates

### 10.1 Definition
**Domain Rule:** a Template is authored starter content — suggested fields, suggested capabilities, a suggested starter Responsibility configuration. It is CONFIGURATION (Section 3), never user data and never domain state belonging to any specific Object.

### 10.2 Selection and Snapshot/Instantiation
**Domain Rule (critical invariant):** selecting a Template **copies** its current content into the newly created Object at that moment. From that instant forward, the Object holds only a provenance reference to the Template it came from (for display/analytics purposes) — it never re-reads the Template to determine its own behavior, fields, or capabilities again. This is what makes the non-negotiable requirement true: **an Object's correctness and continued function never depend on its originating Template continuing to exist, remain published, or remain unchanged.**

### 10.3 Template Lifecycle
| State | Meaning |
|---|---|
| Draft | Not selectable by users; freely editable with zero risk, since nothing yet references it. |
| Published | Selectable; every selection snapshots the current content (10.2). |
| Retired | No longer selectable by new users; **zero effect** on any Object already created from it, at any prior version. |

**Domain Rule — transitions:** Draft → Published (one-way; becoming selectable). Published → Retired (one-way; no longer selectable). There is no "unpublish back to Draft" — Retired already fully satisfies the need to stop new selections without introducing ambiguity about whether a Draft was ever live.

**Domain Rule — deletion:** a Template with **zero** instantiated Objects may be permanently removed by an administrator. A Template with **one or more** instantiated Objects can never be permanently removed — only Retired. This is a hard rule, not a UI-level suggestion, per prior analysis in this project: allowing hard deletion of a used Template is the exact failure mode the snapshot mechanism exists to prevent.

### 10.4 Template Edited / Retired / Unavailable
- **Edited (while Published):** affects only Objects created *after* the edit. Existing Objects, already snapshotted, are entirely unaffected (10.2).
- **Retired:** existing Objects unaffected; new users simply no longer see it as an option (10.3).
- **Unavailable (system outage):** existing Objects are entirely unaffected, since they hold their own copied data and never depend on live Template availability (10.2). Only the ability to *start something new* from that Template is temporarily degraded — Custom Object creation (Section 11) remains available as a fallback, consistent with the failure-isolation model (Section 19).

### 10.5 Objects Created from an Old/Retired Template Version
**Domain Rule:** such an Object behaves identically to one created from the current version — it holds its own snapshotted data regardless of what has happened to the Template since. There is no "outdated Object" state; the concept of a Template version becoming outdated does not apply to already-created Objects at all, only to the catalog a new user sees when selecting.

### 10.6 Template State Machine
| From | To | Trigger | Effect on existing Objects |
|---|---|---|---|
| (none) | Draft | Authored | None (nothing references it yet) |
| Draft | Published | Publish action | None |
| Published | Retired | Retire action | None — zero effect |
| Draft/Retired (0 instantiations) | (removed) | Hard delete | None — impossible for it to have affected anything, since nothing was ever created from it |

**Invalid transition:** hard delete of a Template with ≥1 instantiation — this must be a rejected operation, not merely discouraged.

### 10.7 Testable Rules — Templates
- **Given** a Published Template used by 10,000 Objects, **when** it is Retired, **then** all 10,000 Objects continue functioning identically, and only new-Object creation from that Template is disabled. *(Invalid: any existing Object's fields, Responsibilities, or History change or break.)*
- **Given** a Template is edited after being Published, **when** an already-existing Object created from an earlier version is viewed, **then** it shows its own original snapshotted content, unaffected by the edit. *(Invalid: the edit propagates to existing Objects.)*
- **Given** a Template with existing instantiated Objects, **when** an administrator attempts a hard delete, **then** the operation is rejected; Retire is the only available path. *(Invalid: the delete succeeds and orphans or breaks existing Objects.)*

### 10.8 Template Catalog, Usage Metadata, Provenance, and Instantiated Objects — Four Distinct Concepts

**Domain Rule:** these four concepts must never be conflated:

1. **Template Catalog** — the set of currently Published Templates available for selection by users (10.3). Administrative content.
2. **Template Usage Metadata** — aggregate, derived analytics describing how a Template has been used (e.g., count of Objects ever created from it, count of distinct users, count of distinct workspaces). **Read-only, derived, and never a runtime dependency** — no Object's behavior or validity depends on this metadata; it exists solely for administrative visibility into catalog health.
3. **Template Provenance** — the per-Object pointer recording which Template (and which version) a specific Object was created from (10.2). Used only for display/analytics on that Object; never re-read to determine behavior.
4. **Instantiated Object** — the actual independent user data (10.2), which is what the product and the user actually interact with.

**Domain Rule — administrative capability:** an administrator may view Usage Metadata for any Template, and may Publish, Edit, or Retire a Template (10.3). None of these actions ever reads from, writes to, or otherwise touches any Instantiated Object's data — Usage Metadata is computed by counting Provenance references, not by depending on them at runtime. **Usage Metadata is explicitly not a live, per-request computation** — it is a periodic or otherwise derived aggregate (exact mechanism — scheduled aggregation, projection, cached statistic, or similar — deferred to `03`/`04`), computed out-of-band from any user-facing operation. No Object creation, read, or mutation path may synchronously compute or depend on Usage Metadata.

**Non-example:** a system that recalculates or "re-validates" existing Objects against their Template when computing Usage Metadata — this would reintroduce exactly the live-dependency risk Section 10.2's snapshot rule exists to eliminate. Usage Metadata is a passive count, never an active check.

---

## 11. Custom Objects

### 11.1 Definition
**Domain Rule:** a Custom Object is simply an Object (Section 4) with no Template reference. It uses **identical** domain mechanics to a Template-backed Object in every respect — identity, Access, History, and every optional capability attach and behave exactly the same way.

### 11.2 Boundary
**Domain Rule:** a user creating a Custom Object may choose which optional capabilities to use and what attribute content to add. A user may **not**: define arbitrary logic or automation that bypasses platform Access rules; define new correctness invariants (e.g., a custom concurrency rule); or cause the platform to treat their Custom Object differently from any other Object at the domain level. The flexibility is in *content*, never in *platform behavior*.

### 11.3 Testable Rules — Custom Objects
- **Given** a user creates an Object with no Template, **when** they attach a Responsibility to it, **then** it behaves exactly per Section 5, with no special-cased behavior. *(Invalid: Custom Objects support a reduced or different Responsibility model than Template-backed Objects.)*

---

## 12. Category Experiences — Domain Boundary

### 12.1 Principle
**Domain Rule:** domain logic — Access evaluation, Responsibility/Occurrence/Execution correctness, History recording, Template snapshot behavior — **never branches on what an Object represents.** There is no domain-level `if category == 'Medicine'` anywhere in this specification, and none is permitted in implementation.

### 12.2 Category Label
**Domain Rule:** an Object may carry a **Category Label** — a stable, presentation-oriented pointer (e.g., recording that this Object originated from, or resembles, the "Plant" starter configuration) used **exclusively** by the presentation layer to select appropriate icons, microcopy, and specialized UI (`01_PRODUCT_VISION.md` Section 12). This label is provenance/presentation metadata, not a domain branch point — no domain rule in this document (Sections 4–11) may vary based on its value. *(The exact technical representation of this label is 03's concern.)*

### 12.3 Worked Mapping — Plant / Medicine / Grocery UI to the Same Domain

| Category experience | What the UI shows | Domain concepts actually used |
|---|---|---|
| Plant | Watering-focused actions, plant iconography | Object + Responsibility (Section 5) with a multi-day Schedule |
| Medicine | Dose-and-schedule-focused UI, privacy-aware presentation | Object + Responsibility with a multiple-times-daily Schedule, elevated sensitivity (12.4) |
| Grocery | Fast checklist interaction | Object + Items (Section 6), typically no Responsibility at all |
| Vehicle | Service-focused UI, document-oriented | Object + Responsibility + Attachments (4.8) |

Every row uses exactly the same underlying mechanics defined in Sections 4–11; only presentation differs.

### 12.4 Sensitivity Classification
**Domain Rule:** an Object may carry a general **Sensitivity** classification (e.g., "elevated") independent of its Category Label — used by Access defaults (a shared elevated-sensitivity Object gets a narrower default visibility, `01` Section 21) and by Notification content generation (Section 13.9). This is a domain-level flag evaluated generically, never a check against a specific category name — the same rule that forbids category-branching in 12.1 applies here: sensitivity is a property, not a hardcoded list of "sensitive category names."

---

## 13. Notifications — Domain-Level Semantics

### 13.1 Definition
**Domain Rule:** Notification is an optional alerting layer attached to a Responsibility (Section 5.6). A Schedule existing never implies a Notification will be sent.

### 13.2 Enabled/Disabled
**Domain Rule:** Notification has an explicit on/off state per Responsibility, defaulting to whatever `01`'s onboarding rule specifies (requested contextually, `01` Section 14) — never silently defaulted to "on" without the user's action creating that state.

### 13.3 What a Reminder Occurrence Means
**Domain Rule:** a Notification is always tied to a specific Occurrence (Section 5.4) — it is never a separate, independently-scheduled thing. If the Occurrence it refers to changes state (e.g., gets completed before the Notification fires), the Notification's relevance is governed by that Occurrence's true current state, not by whatever was true when the Notification was originally scheduled.

### 13.4 Failure
**Domain Rule:** Notification delivery failure has **zero effect** on Occurrence/Execution truth. A missed notification does not erase, hide, or alter the underlying Occurrence — the user can still see it as due/overdue through ordinary product surfaces (Today, Object detail) regardless of whether an alert was ever successfully delivered.

### 13.5 Duplicate Delivery
**Domain Rule:** a Notification being delivered more than once (a provider-level retry, for example) must never result in more than one Execution. Execution creation only ever happens through an explicit user completion action (Section 5.5) — a Notification firing, once or many times, never itself creates or implies an Execution.

### 13.6 Retry
*(Deferred to `04_DATA_SECURITY_RELIABILITY.md`.)* Domain-level constraint only: retry behavior must satisfy 13.5's guarantee regardless of how many delivery attempts occur.

### 13.7 Stale Notification
**Domain Rule:** if a Notification is acted on (e.g., tapped) after its Occurrence's true state has already changed (e.g., someone else already completed it), the product must reflect the Occurrence's actual current state — never the state implied by the now-stale Notification. This is the same idempotency guarantee as Section 5.10, applied to notification interaction specifically.

### 13.8 Cancellation
**Domain Rule:** cancelling or completing a Responsibility (or the Occurrence a pending Notification refers to) must prevent further Notifications tied to that now-resolved state from being meaningfully actionable — a Notification arriving after the fact must resolve per 13.7, never re-open a settled Occurrence.

### 13.9 Privacy-Sensitive Content
**Domain Rule:** Notification content generation must consult the Object's Sensitivity classification (12.4) **before** composing the alert content, not only at final delivery. An elevated-sensitivity Object's Notification content must be generic ("You have a reminder") rather than exposing specific details, consistent with `01_PRODUCT_VISION.md` Section 16. *(Exact platform-level lock-screen mechanics are 04's concern; the domain rule fixes that the content itself must already be generic by the time it reaches any delivery mechanism.)*

---

## 14. State Machines — Consolidated Reference

*(Full narrative, rules, and examples for each live in the sections above. This table is a quick-reference index, not a restatement of authority — see the section referenced for the governing rule.)*

| Concept | States | Full definition |
|---|---|---|
| Object | Active, Archived, Deleted, Erased | Section 4.10 |
| Responsibility | Active, Paused, Cancelled | Section 5.2 |
| Occurrence | Pending, Completed, Skipped, Missed (derived), Corrected (derived) | Section 5.7, 5.9, 33 |
| Execution | (created once, immutable) | Section 5.5 |
| Access Grant | Active, Revoked | Section 8.8 |
| Template | Draft, Published, Retired | Section 10.6 |
| Item | Unchecked, Checked, Removed | Section 6.5 |

---

## 15. Invariants

Non-negotiable, regardless of implementation:

1. Every Object has a stable, permanent identity.
2. Every Object is private by default from the instant of creation.
3. History cannot be disabled by any user action.
4. History is never permitted to be inconsistent with the core state change it describes (Section 7.8).
5. Timeline, if it exists, is never authoritative — it is a derived view over History, never the reverse.
6. A Responsibility belongs to exactly one Object in V1 (Section 5.1).
7. One Occurrence represents one scheduled instance, independent of every other Occurrence of the same Responsibility.
8. One Occurrence has at most one Execution; one Execution refers to exactly one Occurrence.
9. Duplicate, concurrent, and offline-replayed completion attempts all resolve to the same single Execution (Sections 5.10–5.12).
10. Execution, once created, is immutable through ordinary product flows (Section 5.5).
11. Template retirement can never invalidate, alter, or delete any already-instantiated Object (Section 10.3–10.5).
12. A Template with any instantiated Objects can never be hard-deleted, only Retired (Section 10.3).
13. Grant does not transfer ownership (Section 8.2, 8.4).
14. Revoking access has no retroactive effect on History that already exists (Section 8.3).
15. Optional/derived subsystem failure (Search, Notification, Timeline, AI, Analytics, Gamification, Attachment processing, Integrations) can never corrupt or block core domain truth (Section 19).
16. Category Label and Sensitivity are presentation/classification metadata only — no domain rule may branch on them beyond the generic evaluation already specified (Sections 12.1, 12.4).
17. Items are lightweight child records and can never silently acquire Object-equivalent capabilities (Section 6.1, 6.4) — growth beyond the Item boundary requires explicit promotion to a full Object.
18. Pausing a Responsibility never retroactively generates "missed" Occurrences for the paused window (Section 5.2).
19. Removing a Workspace member immediately voids the practical effect of their Grants and vacates their Responsibility assignments without deleting either the Grant's History or the Responsibility itself (Section 8.7).
20. A Custom Object is domain-identical to a Template-backed Object in every respect except the absence of a Template reference (Section 11.1).
21. A correction to a mistaken Execution is always an additive event, never an edit or deletion of the original fact (Section 23).
22. Concurrent edits to the same Object's fields are detected via a revision check; a losing edit is never silently applied or silently discarded (Section 24).
23. If a Responsibility has current assignees, only those assignees or the Object Owner may complete or skip its Occurrences (Section 8.5.1).
24. An Occurrence Override changes only that specific Occurrence's due time; it never alters the underlying Schedule or any other Occurrence (Section 26).
25. An Object created within a Family Workspace is individually owned by its creator, never jointly owned and never owned by the Workspace itself (Section 9.3).
26. Template Usage Metadata is a derived, read-only count and is never a runtime dependency for any Object (Section 10.8).
27. The ordinary Object deletion recovery window is a fixed, product-defined duration (30 days), distinct from and not a substitute for any legal retention or erasure policy (Section 4.3).
28. Corrected is a distinct derived Occurrence outcome from Missed — an Occurrence that was engaged with and then corrected is never conflated with one that was never acted upon at all (Sections 5.9, 23, 33).
29. Calendar-based recurrence (monthly, every-N-months, yearly, every-N-years) is calendar-aware, never approximated by a fixed day-count interval, and follows one coherent rollover rule for nonexistent target dates (Section 32).
30. Recurring local-time schedules are anchored to wall-clock time and never silently drift across a Daylight Saving transition (Section 32).
31. A Responsibility's Schedule has exactly one canonical timezone, independent of any viewer's location; changing it follows the same future-only rule as any other Schedule edit (Section 32).
32. No domain rule in this document may reference subscription, entitlement, or billing state, directly or indirectly — feature availability is enforced at the application boundary, strictly before a domain operation is invoked, never inside one (Section 36).
33. No domain rule in this document may branch on human language, translation, or locale (Section 37).
34. A user-created or custom Object cannot be retroactively re-linked to a Template's live content in V1 — Template application is a point-in-time snapshot only (Section 10.2, 38).
35. A Correction Window bounds when a prior Execution may be corrected; it never bounds whether an Occurrence may subsequently receive a new Execution (Section 23).
36. A recurring Schedule's original anchor day is never mutated by a day-of-month rollover — every occurrence is computed against the original anchor independently, never against a prior month's rolled-over result (Section 32).
37. Archiving or Deleting an Object never retroactively alters the outcome of an Occurrence that was already due before the lifecycle change — only the generation of new Occurrences during the Archived/Deleted period is suppressed (Section 4.3).
38. Workspace is the only domain concept in this document with ownership, access, membership, lifecycle, persistence, or tenancy semantics. No presentation-level grouping concept (however named — "Space" or otherwise) may acquire any of these; if such a concept exists in non-authoritative material, it is a UI grouping only (Section 41).
39. Object never carries a "completed"/"completion" field of its own — completion is always Execution, scoped to one Occurrence (Section 5.5, 21).
40. A Collection, or any grouping/query concept, never owns an Object, never gives it a second identity, and never duplicates or diverges from its Responsibility/Execution/History (Section 21).

---

## 16. Concurrency — Domain Expectations

**Domain Rule (general principle):** wherever multiple actors, devices, or retries can act on the same unit of work, that unit of work must have a deterministic identity and an idempotent outcome — this single principle, applied consistently, is what resolves every specific case below without needing a separate rule per scenario.

| Scenario | Governing rule | Section |
|---|---|---|
| Two users complete the same Occurrence | Idempotent Execution, exactly-one-winner, consistent outcome for both | 5.10 |
| Two users edit different Items on the same List | Independently addressable, no cross-item collision | 6.3 |
| Two users edit the same Object's shared fields | Revision-checked optimistic concurrency; losing edit is rejected and surfaced, never silently applied or discarded | 24 |
| Duplicate requests (accidental resubmission) | Same idempotency guarantee as concurrent completion | 5.12 |
| Retries (network-level) | Must satisfy the same idempotency guarantee regardless of attempt count | 5.11, 13.5 |
| Offline synchronization | Deterministic identity + idempotent creation makes delayed submission safe by construction | 5.11 |

> **Resolved** — see Section 24 for the full domain rule and rationale.

---

## 17. Offline — Domain Behavior

**Domain Rule:** offline correctness rests on **two distinct guarantees**, depending on the operation, not one general rule. Conflating them was an imprecision in an earlier version of this section, corrected here.

1. **"Set-a-fact" operations** (Responsibility completion/skip, Section 5; Item toggling, Section 6.3): these have deterministic identity and idempotent creation (Section 16). A correctly-idempotent operation is automatically safe to queue, delay, and retry offline — no offline-specific logic is required beyond the idempotency guarantee already established.
2. **Field-edit operations** (Object attribute/notes changes, Section 24): these are **not** naturally idempotent — they depend on the state they were edited against. Offline does not exempt them from Section 24's revision-conflict check: a field edit made offline, once synced, is evaluated against the Object's *current* revision exactly as an online edit would be, and is rejected under the same rule if the Object changed in the meantime. Idempotency alone does not solve this — the revision check is what does, and it applies identically regardless of connectivity.

**Domain Rule — restated plainly:** offline operations must satisfy the same domain correctness guarantees as online operations. Offline never bypasses or weakens idempotency (case 1) or revision-conflict detection (case 2) — it only changes *when* the operation reaches the server, never *what correctness rule governs it once it arrives*.

*(Local storage, sync protocol design, and conflict UI remain explicitly out of scope for this document — they belong to `03`/`04`.)*

---

## 18. Deletion and Retention

| Operation | Domain behavior | History preserved? |
|---|---|---|
| Object deletion (ordinary) | Removed from product surfaces; recoverable within a window (4.3) | Yes, fully |
| Optional capability removal (e.g., delete an Attachment) | Object unaffected; capability's own past state remains in History | Yes |
| Responsibility cancellation | Terminal; no future Occurrences; past Executions preserved | Yes |
| Template retirement | Zero effect on instantiated Objects (10.3–10.5) | N/A — Templates carry no user History |
| Access revocation | Forward-looking only (8.3) | Yes, and remains historically accurate |
| Workspace member removal | Grants voided in effect, assignments vacated (8.7) | Yes |

> **OPEN DECISION:** exact retention duration for the Deleted-object recovery window, and all legal/policy-driven retention or erasure requirements, are explicitly not specified here (4.3, 7.7), consistent with the instruction not to invent legal retention policy.

---

## 19. Failure Isolation — Domain Invariants

**Domain Rule:** the following are explicitly **optional/derived** and their failure must never corrupt or block core domain truth (Object, Access, History, Responsibility/Occurrence/Execution, Grant): Search, Notifications, Timeline, AI, Analytics, Gamification, Attachment processing, External integrations, Payments/Subscriptions/Entitlements. Specifically: a Payments or Entitlement provider being unavailable must never prevent a user from viewing, creating, or acting on their own core data — feature-gating for a paid capability is a distinct, separate concern (04/05) from access to a user's own Objects, Responsibilities, and History, which must always remain available regardless of billing-system health.

**Domain Rule — stronger than failure isolation (this is a permanent architectural boundary, not just a resilience concern):** no domain rule anywhere in this document may reference subscription, plan, or entitlement state at all — not merely "must tolerate its failure," but must never depend on it even when it is fully healthy. Whether a user is entitled to perform an action is decided entirely at the application boundary, before a domain operation is ever invoked; the domain layer itself has no concept of "premium" and never will, regardless of how many paid tiers Lumora eventually has. See Section 36 for the full boundary definition.

**The specific domain invariants that make this true:**
- Object mutation (creation, update, capability changes) has no required synchronous dependency on any of the above systems (Section 4.9).
- History write is part of the same guarantee as the core state change it describes (Section 7.8) — it is never routed through the same best-effort path as Timeline, Notifications, or Search indexing.
- Execution creation depends only on Occurrence identity and idempotency (Section 5), never on Notification delivery having succeeded (Section 13.4).
- Template catalog unavailability degrades only *new-object-from-template* creation; existing Objects and Custom Object creation are unaffected (Section 10.4).

---

## 20. Future Evolution — Extension Points vs. Premature Abstraction

| Future capability | Extension point already present in this model | Must NOT be built now |
|---|---|---|
| Family | Workspace already generalizes beyond Personal (Section 9); Grant already separates ownership from visibility (Section 8) | A separate "Family engine"; Family-specific Object types |
| Organizations / Companies | Workspace as a general context type extends naturally (9.4); Responsibility assignee-set already supports multiple actors (5.2) | OrganizationEngine/CompanyEngine; hierarchy/approval-chain modeling |
| Service Providers | Grant is already scoped to specific Objects/individuals, not all-or-nothing (8.2) — a time-limited, narrowly-scoped Grant is an additive extension of the same concept | A separate "external access" subsystem now |
| AI | Object/Responsibility/Execution is already the authoritative source of truth an AI system would read/act through; nothing in this model assumes AI's existence | AI as a required step in any core flow; AI-specific Object types |
| Gamification | Reacts to Execution/History facts already recorded (Section 7); core correctness never depends on it | Gamification state (streaks, points) as authoritative — it must always be derived, never a source Responsibility state depends on |
| Subscriptions/Entitlements | Objects/Responsibilities carry no plan/entitlement reference at all — intentional; this stays an orthogonal, cross-cutting concern at the application boundary | Plan-conditional logic inside any domain rule in this document |
| Relationships | Not present in V1 (Section 3); nothing in the current model precludes adding a cross-object link concept later | Pre-building a generic relationship/graph engine now |
| Richer category experiences | Category Label + presentation layer already fully decouples this from domain (Section 12) | Any category-specific domain table, service, or rule |
| New languages | No domain rule in this document references human language at all | Language-conditional domain logic (explicit anti-pattern, Section 21) |

---

## 21. Anti-Patterns

Future developers must not introduce:

- **PlantService / MedicineService / GroceryService** or any category-named service as a foundational domain dependency (Section 12.1).
- **Category-specific database models** without a genuine, demonstrated integrity reason — a typed sidecar (per `03`) requires justification beyond "this category has many fields."
- **Giant object-type switch statements** anywhere in domain logic.
- **A generic runtime capability plug-in engine** — optional capabilities are ordinary, bounded additions (Notes, Attachments, Responsibility, Items), not a registered/executed plugin system.
- **Package-manager-style Template systems** — install/upgrade/rollback/dependency-resolution machinery for what must remain static, snapshot-on-select starter content (Section 10).
- **A deep, generic cross-object JSON/attribute query engine** — attribute-specific querying is a presentation/category concern, never a platform-wide feature.
- **Business rules inside UI components** — every rule in this document belongs in domain/application code, never in presentation logic.
- **UI directly depending on persistence models** — the UI consumes stable contracts, never raw storage representations.
- **Notifications treated as core truth** — delivery success/failure must never be load-bearing for Occurrence/Execution correctness (Section 13.4).
- **Timeline treated as core truth** — restated from Section 7.8 because it was the single most severe defect found in the prior baseline review; it bears repeating as an anti-pattern, not only as a rule.
- **Items acquiring Object-equivalent capabilities** (their own History, Access, or Responsibility) instead of being promoted to a full Object (Section 6.4).
- **Hidden ownership transfer disguised as a Grant** (Section 8.2, 8.4) — the two operations must remain visibly, structurally distinct.
- **Category-specific authorization** — Access evaluation never varies by Category Label, only by the generic Sensitivity classification (Section 12.4).
- **Duplicated recurrence logic** — one Schedule/Occurrence mechanism (Section 5), never a second bespoke implementation for a specific category's "special" recurrence needs.
- **Duplicated permission logic** — one Access/Grant evaluation path (Section 8), never a parallel one for a specific feature.
- **Duplicated date/time logic** — one timezone-aware Schedule evaluation mechanism (Section 5.3), never re-implemented per feature.
- **Treating a removed member's Grants as requiring manual cleanup** — effect must be automatic and immediate, per membership status (Section 8.7), never a background job that might lag.
- **Storing "Missed" as an independently-maintained field** rather than deriving it from the absence of an Execution past due time (Section 5.9) — a stored field can drift from truth; a derived comparison cannot.
- **Editing an Execution record in place to "fix" it** — corrections are additive events (Section 23), never in-place edits, regardless of how minor the mistake seems.
- **Last-write-wins for concurrent Object field edits** — silently discarding a person's edit without their knowledge is a trust violation; conflicts must be surfaced, never hidden (Section 24).
- **`if subscription` / `if plan === 'premium'` style checks inside domain logic** — entitlement evaluation belongs strictly at the application boundary, before a domain operation is invoked, never inside one (Section 19, 36).
- **Adding a new optional capability without evaluating it against the governance checklist (Section 35)** — capability sprawl is what produced the original, since-removed generic plugin engine; a capability being "useful" is not sufficient justification on its own.
- **Computing Template Usage Metadata as a live, per-request query against Instantiated Objects** — this reintroduces the runtime-dependency risk Section 10.8 exists to eliminate; Usage Metadata must be a periodic or otherwise derived aggregate, never computed synchronously in the request path of any user-facing operation.
- **Approximating calendar-month or yearly recurrence as a fixed day-count interval** (e.g., "every 6 months" as "every 180 days") — this drifts against real calendar dates and violates Section 32's calendar-aware requirement.
- **Collapsing Corrected into Missed** (or into Pending) for the sake of a simpler status enum — this is precisely the conflation Section 33 exists to prevent.
- **A "completed" or "completion" field directly on Object** — completion is never a property of the thing itself; it belongs exclusively to Execution, scoped to one specific Occurrence (Section 5.5). A Task-style Object with its own boolean completion flag would silently bypass the entire Responsibility/Occurrence/Execution chain — no History-backed record of who completed it or when, no idempotency, no Correction path. If a UI surface's shorthand ever implies "the Object has a completion state," the correct domain translation is always "the Object has a Responsibility, and that Responsibility's current Occurrence has an effective outcome" (Section 39) — never a field on the Object.
- **A Collection, or any similarly-named grouping/query concept, duplicating Object identity or acquiring its own lifecycle** — if such a concept exists in any product surface, it must be a non-owning reference/grouping mechanism only: an Object that appears in a Collection, a Space-style grouping, Today, and Search remains exactly one canonical Object, never a copy. A Collection must never own an Object, must never give an Object a second identity, and must never become a place where Responsibility, Execution, or History could be duplicated or diverge from the Object's own authoritative record. This is the same boundary already enforced for Items (Section 6.1) and Space (Section 41), applied generally to any future grouping concept, named or not.

---

## 23. Execution Correction

**Problem:** Execution is immutable (Section 5.5), which is correct for permanent trustworthiness, but a real user will occasionally complete the wrong Occurrence by mistake and needs a way to fix it without corrupting History.

**Options considered:**
- A. Completely immutable, no correction — rejected; user-hostile for an extremely common mistake (mis-tap), and erodes trust as much as any data-integrity issue would.
- C. Permanent in-place edit of the Execution record — rejected; directly violates History's immutability guarantee (7.5) and the "never silently rewrite history" principle.
- **B + D combined — Recommended.**

**Recommendation:** a short, bounded **Correction Window**, implemented as a **compensating correction event** (D), not a raw edit (C), and not unlimited (the opposite extreme of A).

**Domain Rule — mechanics:**
- The original Execution record is never edited or deleted. It remains permanently in History exactly as created — "at T1, actor X marked this Completed" is and remains a true historical fact, mistake or not.
- Within the Correction Window (`01_PRODUCT_VISION.md` Section 32 — 10 minutes from the original Execution's timestamp), **the original completing actor only** may trigger a Correction.
- A Correction creates a new, additive History record: "Execution at T1 was corrected by actor X at T2." The original Execution record is never mutated — it remains, unchanged, as an immutable historical fact. What changes is the Occurrence's *effective current execution*, which becomes **none**.
- **Effective outcome after Correction (revised — the previous version of this rule collapsed a corrected completion into Missed, indistinguishable from "never touched at all"; this is now fixed properly rather than patched at the presentation layer):** an Occurrence with no effective current execution is evaluated by the full Missed/Corrected distinction now defined in Section 5.9, not by treating the Execution as if it had never existed. If the due instant has **not yet passed** at the moment of correction, the Occurrence is simply **Pending** — accurate on its own, nothing further needed. If the due instant **has already passed**, the Occurrence is **Corrected**, not Missed — a distinct, honest reflection of the fact that it was engaged with and then undone, never conflated with an Occurrence nobody ever acted on.
- After the window closes, the Execution is permanently immutable with no correction path in V1. A distinct, separately-designed "administrative correction" capability for post-window fixes is explicitly **FUTURE**, not built now.

**Why:** this satisfies the real, common need (fix an obvious immediate mistake) without ever making History's core promise — nothing is silently rewritten — untrue, and without collapsing a materially different fact (engaged-then-corrected) into the same label as a fact nobody engaged with at all (Missed). The window boundary keeps this a narrow, well-scoped correction mechanism rather than a general edit capability. Deriving both Missed and Corrected from the same underlying immutable Execution/Correction history (Section 5.9), rather than inventing a stored mutable status, keeps this consistent with the document's standing preference for computed rather than stored truth — and Corrected turns out to be more useful data, not just a workaround: "engaged with, then undone" is a genuinely different, more informative signal than "never touched," which is a good sign this is the right model rather than an invented patch.

**Trade-offs:** a person other than the original actor who notices a mistake (e.g., a family member) cannot themselves trigger a Correction in V1 — they must ask the original actor, or the mistake stands until a future administrative-correction capability exists. This is an accepted, deliberate narrowing: allowing any authorized person to undo someone else's completion introduces a real family-conflict risk (disputed corrections) that is out of scope to solve now.

**User impact:** users get a brief, genuine "undo" for the single most common accidental action in the product (mis-tapped completion), directly protecting trust in the exact place `01_PRODUCT_VISION.md` Section 1 identifies it matters most. A correction made after the due time has passed now correctly shows as Corrected — reflecting what actually happened (attempted, then undone) — rather than either falsely appearing untouched-and-Pending, or falsely appearing identical to an Occurrence the user never engaged with at all.

**Domain impact:** Execution's cardinality rule (5.5) is refined from "at most one Execution" to "at most one *active* Execution" — a corrected Execution persists in History but is no longer the Occurrence's current fact. **Terminology, made explicit:** the Execution *record* is immutable, full stop — it is never edited or deleted. Separately, the Occurrence has a notion of its *current effective execution*, which is a pointer that can become "none" after a Correction, and a separately-computed *effective outcome* (Pending/Completed/Skipped/Missed/Corrected, Section 5.9) derived from that pointer plus the full history. Correction never mutates an Execution; it only changes what the Occurrence currently points to and, consequently, what its derived outcome evaluates to. If a future engineer asks "if Execution is immutable, how can it be voided?" — the answer is that nothing about the Execution record is voided; only the Occurrence's reference to it is cleared, and Corrected is exactly the derived outcome for that specific case.

**Future impact:** the additive-correction-event pattern established here is the template for any future administrative correction capability — it does not need to be invented from scratch later, only extended to a broader set of authorized actors and a longer time horizon. The Corrected outcome is also a natural input to any future analytics/adherence feature, since it distinguishes "attempted and undone" from "never attempted" without any additional data collection.

**Implementation boundary:** *(deferred to 03/04)* exact timestamp comparison mechanics; whether the window is evaluated against server-received time or client-submitted time for offline cases is fixed below at the rule level, not the mechanism level.

**Domain Rule — offline:** the Correction Window is evaluated against the *original Execution's* server-recorded timestamp, not against how much time the correcting device perceives having passed — a Correction submitted after a long offline period, once synced, is evaluated against real elapsed time and rejected if the window has genuinely closed, consistent with 5.11's general offline-idempotency principle.

**Domain Rule — concurrency (corrected; previously relied on client-reported "initiated first" timing, which is not authoritative and not implementable):** a Correction succeeds only if, at the moment the server processes it: (a) the Execution it references is still the Occurrence's active Execution — i.e., no prior Correction has already voided it; and (b) the Correction Window has not yet closed, evaluated against that Execution's authoritative timestamp. If either condition fails, the Correction is rejected and the Occurrence's current authoritative state is returned to the requester — never resolved by comparing which device acted "first." A completion attempt racing against a Correction resolves the same way: whichever operation the server accepts first becomes the authoritative state; the other is evaluated against that new state and either succeeds cleanly (if it's now a valid action, e.g., completing a freshly-corrected, once-again-actionable Occurrence) or is rejected with the current state returned (5.10's idempotency guarantee, applied here as well).

**Domain Rule — the Correction Window limits undo, not future action (explicit, previously only implied by a testable rule rather than stated as a rule):** the 10-minute window bounds *when the prior Execution may be corrected*. It does not bound *whether the Occurrence may subsequently receive a new Execution*. After a valid Correction — whether the window has since closed or not — the Occurrence is evaluated exactly like any other unexecuted Occurrence: Pending if not yet due, eligible for late completion if due and unresolved, Corrected if due with a corrected-but-not-replaced Execution in its history (5.9), or Completed/Skipped the moment a genuinely new Execution is created. A Correction never permanently closes an Occurrence — treating it as if it did would turn a mistake-correction mechanism into an accidental, hidden way of blocking legitimate future completion, which is not its purpose.

**Testable Rules:**
- **Given** a user completes an Occurrence by mistake, before its due time, and corrects it 30 seconds later, **when** the correction is applied, **then** the original Execution remains in History, a new correction record exists, and the Occurrence is Pending (due time not yet passed). *(Invalid: the original Execution disappears from History.)*
- **Given** a user completes an Occurrence at 10:02 against a 10:00 due time, and corrects it at 10:05, **when** the correction is applied, **then** the Occurrence is **Corrected** — distinct from both Completed and Missed, and its History shows a completion followed by a correction. *(Invalid: the Occurrence shows as Missed, indistinguishable from an Occurrence nobody ever acted on; equally invalid: the Occurrence shows as Pending, implying nothing happened yet.)*
- **Given** an Occurrence in the Corrected state, **when** the user genuinely completes it afterward, **then** a new Execution is created and the Occurrence becomes Completed — Corrected is not a terminal or blocking state. *(Invalid: a Corrected Occurrence cannot be acted on again.)*
- **Given** a Correction is attempted 15 minutes after the original completion, **when** the window (10 minutes) has closed, **then** the Correction is rejected. *(Invalid: the correction silently succeeds regardless of elapsed time.)*
- **Given** a person other than the original completing actor attempts a Correction, **when** the request is evaluated, **then** it is rejected regardless of their authority over the Object otherwise. *(Invalid: any Owner or assignee can correct anyone's completion.)*

---

## 24. Same-Object Concurrent Field Editing

**Problem:** two people (most commonly in a Family workspace) may edit the same field on the same Object at nearly the same time — e.g., both renaming "Plant" moments apart — and the domain must define what happens without building disproportionate infrastructure.

**Options considered:**
- A. Last-write-wins — rejected; silently discards one person's edit with no visibility into what happened, a direct trust violation consistent with the product's "trust before delight" principle (`01_PRODUCT_VISION.md` Section 5).
- C. Automatic field-level merge — rejected for free-text fields; merging "Money Plant" and "Golden Money Plant" has no single correct automatic outcome, and building per-field-type merge logic is disproportionate engineering for a low-frequency event.
- D. Full conflict-resolution UI — rejected for V1 as disproportionate product investment for a rare event; remains a legitimate future refinement layered on top of the same underlying mechanism (see Future impact).
- **B. Optimistic concurrency via revision check — Recommended**, with a lightweight resolution behavior rather than a dedicated merge screen.

**Recommendation:** every Object carries a revision marker. An edit must state which revision it is editing against. If the Object's current revision no longer matches, the edit is rejected and the editor is shown the Object's current state to review and reapply their change if still wanted. This applies at the whole-Object level (a single revision marker per Object), not per-field — simpler to reason about and implement, at the cost of occasionally flagging a conflict between edits to genuinely different fields (a false-positive, never a silent data-loss case).

**Why:** this is the standard, well-understood, low-complexity mechanism (the same shape as an HTTP ETag/revision-conflict pattern) that guarantees no edit is ever silently lost, without requiring CRDT infrastructure or bespoke per-field merge logic.

**Trade-offs:** object-level (rather than field-level) granularity means editing different fields on the same Object at the same time can occasionally surface an avoidable conflict prompt. Accepted for V1: this is a minor, infrequent UX cost, not a correctness risk, and finer granularity remains available as a future refinement without changing the underlying mechanism.

**User impact:** a person's edit is never silently overwritten or silently dropped; at worst, they're asked to reapply a change against the latest version — a small, honest interruption rather than an invisible loss.

**Domain impact:** establishes a second, distinct idempotency-adjacent mechanism (revision-checked rejection) alongside the Execution/Item idempotency mechanisms already defined — both share the same underlying philosophy (deterministic identity, no silent loss) but are mechanically different, since ordinary field edits are not naturally idempotent the way a completion action is.

**Future impact:** a friendlier resolution UI (showing both versions side-by-side, offering a merge) can be layered on top of this same revision-check foundation later without changing the underlying domain rule.

**Implementation boundary:** *(deferred to 03/04)* exact revision-marker representation and storage; this document fixes only the outcome guarantee.

**Explicit invariant:** a losing concurrent edit to an Object's fields is never silently applied and never silently discarded — the editor is always informed and shown the current state.

**Domain vs. implementation boundary (sharpened):** the true domain-level guarantee is narrower than the V1 mechanism that satisfies it — **conflicting concurrent writes to the same logical field must never silently overwrite each other.** Object-level revision checking is this document's recommended V1 mechanism for satisfying that guarantee, chosen for simplicity, and it is deliberately over-inclusive: it will occasionally flag two edits to genuinely different fields (e.g., Name vs. Description) as a conflict even though they don't actually collide. This is an accepted, explicit V1 trade-off, not a domain requirement — architecture may later refine this to field-level conflict detection to eliminate the false-positive case, and doing so satisfies the same underlying domain guarantee more precisely rather than changing it. Engineers should not read "object-level revision" as itself the domain rule; it is one valid implementation of a more precise rule.

**Scope boundary:** this rule governs direct edits to an Object's own fields only. It does not apply to Responsibility completion (Section 5.10's dedicated idempotent mechanism governs that) or to Item edits within a List (Section 6.3's independent-per-item mechanism governs that) — those two cases are already fully specified and are unaffected by this section.

**Testable Rules:**
- **Given** two people load the same Plant Object and one renames it before the other submits their own rename, **when** the second submission arrives, **then** it is rejected with the current (first) name shown, not silently overwritten or silently discarded. *(Invalid: the second edit silently wins or silently vanishes.)*
- **Given** two people edit genuinely different fields on the same Object at the same time, **when** both submit, **then** at most one may be asked to retry even though their edits don't actually conflict in content — an accepted, documented trade-off, not a bug.

---

## 25. Account Deletion

**Problem:** Section 4.3 defines the Object-level Archive/Delete/Restore lifecycle. Account deletion (a user closing their entire Lumora account) is a related but distinct operation touching potentially many Objects across contexts, and was not previously specified.

**Recommendation:** Account deletion is **additive, not a new mechanism** — it applies the existing Object-level Delete/recovery-window/purge pattern (4.3) to every Object the user owns, simultaneously, rather than requiring a wholly separate concept.

**Domain Rule:**
- Every Object owned by the deleting user enters the ordinary Deleted state (4.3) and follows the same 30-day recovery window and purge behavior, individually.
- For Objects the user does not own but merely has Grant-based visibility into (e.g., shared Family Objects), account deletion only removes their membership/Grant-eligibility (per 8.7's membership-removal mechanics) — it has no effect on Objects they don't own, which remain fully intact for their actual Owner and other members.
- History involving the deleted user as an actor (e.g., "completed by [user]") is preserved per 7.7 — it does not become anonymous or disappear, consistent with History surviving Object-level lifecycle changes.

**Why:** reusing the existing Object lifecycle and membership-removal primitives avoids inventing a second, parallel deletion concept.

**User impact:** a user closing their account gets the same 30-day reconsideration window already established for ordinary deletion, applied consistently across everything they own, with no separate mental model to learn.

**Domain impact:** no new primitive introduced; Sections 4.3 and 8.7 are composed, not extended with new mechanics.

**Future impact:** as Organizations/Companies are added later, this same composition pattern (apply existing Object-lifecycle + membership-removal primitives) is expected to extend naturally to those contexts too.

**OPEN DECISION (unchanged from 4.3):** any legal/policy-driven data export requirement before permanent purge, and the governance of the terminal Erased state, remain explicitly out of scope for this document.

---

## 26. Occurrence Override

**Problem:** a user may want to adjust a single Occurrence's due time (e.g., move today's 8 AM watering to 6 PM) without altering the Responsibility's underlying Schedule for all future Occurrences. Section 5.3 named this an open point; this section resolves the domain semantics.

**Options considered:**
- A. No overrides at all — rejected as the final answer; the need is real and concrete, and defining the correct semantics now (even if building is deferred) avoids inventing behavior later without a contract.
- C. A full override model (reschedule + reassign + other per-occurrence modifications) — rejected as premature; builds a general-purpose exception framework for a specific, narrow need.
- **B. A simple, single-purpose Occurrence Override — Recommended.**

**Recommendation:** an Occurrence Override adjusts exactly one Occurrence's due time. It does not modify the Responsibility's Schedule, and it has no effect on any other Occurrence, past or future.

**Domain Rule:**
- An Override is scoped to exactly one Occurrence, identified the same way any Occurrence is (5.4's deterministic identity).
- After an Override is applied, all domain rules that reference "due instant" (Missed derivation, 5.9; Notification timing, 13.3) use the **overridden** due time for that specific Occurrence, not the original Schedule-computed time.
- The Responsibility's Schedule is completely unaffected — the next Occurrence after the overridden one is computed from the original Schedule exactly as if the override had never happened (matching 5.14's Plant example: recurrence always advances from the Schedule, not from any particular Occurrence's actual timing).
- An Override is a meaningful History event (7.2): "Occurrence originally due at [T] moved to [T'] by [actor]."

**Why:** this is the smallest possible mechanism that satisfies the real need without building general per-occurrence override machinery (assignee overrides, duration overrides, etc.) that nothing has yet demonstrated a need for.

**Trade-offs:** does not yet support per-occurrence reassignment (a different person handling just one instance) — named explicitly as a natural, structurally similar future extension of the same mechanism, not built now.

**User impact:** users can handle the extremely common "not at the usual time today" case without being forced to either skip the reminder entirely or permanently change their whole schedule.

**Domain impact:** Missed and Notification timing rules (5.9, 13.3) gain one clarifying dependency (overridden due time takes precedence) without any structural change to either.

**Future impact:** per-occurrence reassignment, if it proves necessary, extends this same Override concept rather than requiring a new mechanism.

**Implementation boundary:** *(deferred to 03/04)* exact storage of an override relative to a computed-on-demand vs. materialized Occurrence (per 5.4's existing note).

**Roadmap note:** this section defines the domain rule so it exists as a real contract; *whether and when* this ships (V1 vs. NEXT) is a `05_ROADMAP_IMPLEMENTATION_CONTRACT.md` sequencing decision, not resolved here.

**Testable Rules:**
- **Given** a weekly Responsibility with today's Occurrence overridden from 8 AM to 6 PM, **when** the Missed check runs at 10 AM, **then** the Occurrence is not yet Missed (evaluated against 6 PM, not 8 AM). *(Invalid: Missed is computed against the original schedule time, ignoring the override.)*
- **Given** the same Override, **when** next week's Occurrence is generated, **then** it is due at the original weekly time, with no trace of last week's one-time adjustment. *(Invalid: the override persists into future Occurrences.)*

---

## 27. Responsibility Assignee Semantics — Decision Record

**Problem:** the assignee set (5.2) needed clarified semantics: does having assignees gate who can complete an Occurrence, does "multiple assignees" mean "any one" or "everyone individually," and what happens to in-flight Occurrences when assignment changes.

**Options considered:** open/anyone-can-complete regardless of assignment (rejected); assignee-gated completion (recommended); "everyone must complete individually" as a first-class multi-assignee mode (rejected).

**Recommendation:** assignee-gated completion when assignees exist, falling back to open when unassigned (8.5.1 rules, added to Section 8); "any one assignee resolves it for all" as the only multi-assignee semantic in V1; per-person individual tracking is achieved via separate Responsibilities, not a new mode of this one.

**Why:** gating completion to actual assignees matches real household/family expectations (a responsibility assigned to one parent shouldn't be silently completable by a child who merely has visibility into the object), and "any one resolves it for all" matches how shared chores actually work in practice, while "everyone individually" turns out to already be expressible with the existing model (one Responsibility per person) rather than needing new semantics — a good sign the model was already sufficient.

**Trade-offs:** if a family genuinely wants "everyone must individually confirm," they need N separate Responsibilities rather than one shared one — a minor UX/setup cost in that specific, likely rare case, in exchange for not building a second completion mode.

**User impact:** clearer, more predictable behavior — a responsibility assigned to "Mom" cannot be quietly completed by someone it wasn't assigned to, while still allowing "any parent" style flexibility when the assignee set has more than one person.

**Domain impact:** Section 8.5's axis #3 and Section 8.7 gained the precise gating and mid-cycle-change rules documented there.

**Future impact:** this assignee model generalizes directly to team/organization "any team member" style assignment later without modification.

**Explicit invariant:** see Invariant 23 (Section 15).

---

## 28. Objects Created Within Family — Decision Record

**Problem:** the "exactly one Owner, exactly one Workspace" invariant (4.4) needed to be confirmed coherent once Family exists — specifically, who owns an Object created while inside a Family Workspace.

**Options considered:** joint ownership (rejected — breaks the "exactly one Owner" invariant and introduces unresolved questions about disagreement between joint owners); Workspace-as-owner (rejected — a Workspace is not an actor capable of granting/revoking/deleting, so this would require inventing a "who acts on the workspace's behalf" concept, adding complexity without benefit); **individual creator ownership — Recommended.**

**Recommendation:** the creator becomes the individual Owner (4.4 unmodified); creating within the Family context is itself treated as the explicit sharing decision, automatically granting workspace-wide visibility at creation (9.3) — except for elevated-Sensitivity Objects, which remain private to the creator by default even within Family, consistent with `01_PRODUCT_VISION.md` Section 21.

**Why:** preserves every existing invariant without modification, avoids inventing joint-ownership semantics nobody has demonstrated a need for, and avoids the redundant-friction alternative (requiring a second explicit Grant step immediately after a user already chose "Family" as the creation context).

**Trade-offs:** a user who creates something in Family but doesn't actually want it broadly visible yet must actively narrow it (or should have created it in Personal and Granted deliberately afterward) — an accepted, minor UX responsibility in exchange for avoiding friction on the overwhelmingly common case.

**User impact:** creating something "for the family" from within the Family context just works, with no extra sharing step, matching real expectation — while sensitive things stay conservatively private until the user decides otherwise.

**Domain impact:** Section 9.3 gained the ownership and implicit-grant rules; no invariant required modification, only extension.

**Future impact:** the same pattern (context-of-creation as the implicit sharing signal, gated by Sensitivity) is expected to extend to Organization/Company workspace contexts later without new mechanism.

**Explicit invariant:** see Invariant 25 (Section 15).

---

## 29. Verification Pass — Decisions 10–14

The following were audits of already-specified content, not new decisions. Findings:

**Decision 10 (History semantics):** Section 7.2's "what creates a History record" list is extended to explicitly include Occurrence Override (Section 26) and Execution Correction (Section 23) events, and to note that Workspace-level membership changes (e.g., a member joining or leaving) are themselves meaningful History facts about the Workspace, structurally identical to Object-level History but scoped to the Workspace as its own entity — not a new mechanism, an application of the same one. List Item check/uncheck is confirmed correctly resolved as "historized at the parent level only, as a summary event" (7.3, reinforced by Section 6's grocery-reset resolution) — matching option C from the decision prompt, not "never" (A) in isolation, since the parent-level completion event carries real value.

**Decision 11 (Missed occurrence):** the derived rule (due instant passed + no Execution) is verified against every case raised: timezone (5.3 — due instant is unambiguous by construction), pause (5.2 — paused-window occurrences never exist, so cannot be Missed), cancellation and deletion (do not retroactively un-Miss already-overdue occurrences — confirmed consistent), late completion (a late Execution removes an occurrence from Missed consideration entirely, since Missed requires *absence* of Execution — confirmed no conflict), offline completion (a delayed-but-present Execution correctly resolves the derived computation once synced — confirmed), Occurrence Override (Section 26 — Missed now explicitly uses the overridden due time, a clarifying addition, not a contradiction), notification failure (13.4 — zero effect, confirmed independent). **The rule is locked as correct and requires no structural change** — only the one clarifying note about Overrides, already incorporated into Section 26.

**Decision 12 (Notification semantics):** confirmed Schedule ≠ Notification holds throughout (13.1–13.2). Confirmed the Execution Correction mechanism (Section 23) requires no new Notification-specific logic: an Occurrence reverting to Pending after a correction is handled by the existing rule that Notification relevance always follows the Occurrence's true current state (13.3, 13.7) — this composes correctly without modification, a good signal of a coherent underlying model rather than something that needed a fix.

**Decision 13 (Failure isolation):** Payments/Subscriptions/Entitlements added explicitly to Section 19's list (previously implied but not named) — see Section 19 for the specific rule now added.

**Decision 14 (Future evolution):** reviewed Sections 23–28's new content (Correction, Concurrent Editing, Account Deletion, Occurrence Override, Assignee semantics, Family ownership) against Section 20's extension-point table and the Section 21 anti-pattern list — confirmed none of the newly resolved decisions introduce category-specific logic, a new engine, or a hidden dependency between optional and core systems. No changes to Section 20 were required beyond the two anti-pattern additions already made to Section 21.

---

## 30. Final Self-Check

Verifying this document against the explicit list of things it must not accidentally do:

| Must not accidentally... | Verified against |
|---|---|
| Create Plant/Medicine/Grocery backend domains | Section 12.1, 21 — explicitly forbidden; Section 12.3 proves the mapping without them |
| Make every capability mandatory | Section 3, 4.9 — all non-core capabilities explicitly optional |
| Make Notifications mandatory | Section 13.1, 13.2 — explicitly optional, no implied default from Schedule |
| Make Timeline authoritative | Section 7.8, 21 — explicitly and repeatedly forbidden |
| Make Items into Objects | Section 6.1, 6.4, 21 — explicit boundary and required promotion path |
| Make Family required during onboarding | Section 9.2, 9.3 — Personal is automatic; Family has zero automatic effect |
| Introduce future enterprise infrastructure | Section 9.4, 20 — explicitly deferred, extension points only |
| Create hidden dependencies between optional systems | Section 19 — explicit failure-isolation invariants |
| Force category-specific business logic | Section 12.1, 12.4, 21 — generic classification only |
| Duplicate definitions owned by `01` | Header block; product rationale is referenced, not restated, throughout |
| Silently resolve an OPEN DECISION without new instruction | Not applicable to this correction pass — Decisions 1–9 were explicitly reauthorized for resolution by the correction-pass instruction itself; account-deletion legal policy and Erased-state retention remain genuinely open and are still marked as such (Sections 4.3, 25) |
| Introduce category-specific logic while resolving Decisions 1–9 | Sections 23–28 reviewed against Section 12.1/21 — none introduce category branching |

---

## 31. Domain Hardening Pass — External Review Corrections

An independent review of this document, conducted after Amendment 1 (Section 29), identified four mandatory and seven strongly-recommended corrections — all domain-boundary precision issues within already-resolved product decisions, not requests to reopen those decisions. Every claim was independently re-verified against the actual document text before being accepted; none were taken on faith. All eleven were valid and are now fixed:

**Mandatory, fixed:**
1. **Correction/Missed contradiction (Section 23):** a correction applied after an Occurrence's due time had passed could previously read as forcing Pending, contradicting the Missed-derivation rule (5.9). Fixed: correction now explicitly restores the Occurrence to whatever the Missed-derivation rule would already say, rather than hardcoding an outcome.
2. **Correction concurrency ordering (Section 23):** the previous rule ("processed first if initiated first") relied on client-reported timing, which is not authoritative and not safely implementable across offline/multi-device scenarios. Fixed: replaced with a state-validity check (is the Execution still active, is the window still open) consistent with the same pattern already used for concurrent field editing (Section 24).
3. **Execution immutability terminology (Section 23):** "immutable" and "can be voided by correction" could read as contradictory. Fixed: made explicit that the Execution *record* is immutable and never mutated; only the Occurrence's *pointer* to its current effective execution changes.
4. **Offline + concurrency interaction (Section 17):** the prior rule overgeneralized "idempotency ⇒ offline safety" to all operations, when it only holds for set-a-fact operations (completion, item toggling) — field edits need revision-conflict detection (Section 24) regardless of connectivity. Fixed: Section 17 now distinguishes the two cases explicitly.

**Strongly recommended, fixed:**
5. Same-field vs. whole-object conflict scope (Section 24) — the domain guarantee (same-field conflicts) and the V1 implementation choice (object-level revision, deliberately over-inclusive) are now explicitly separated, so architecture is not locked into treating object-level revision as itself the domain rule.
6. Family Grant vs. action authority (Section 9.3) — explicit now that the implicit Family Grant conveys **visibility only**; edit, archive, delete, sensitivity changes, and further sharing remain governed exclusively by Ownership and Responsibility assignment. Closes a real authorization trap ("can see it" silently becoming "can mutate it").
7. Undefined "workspace role with edit authority" (Sections 4.10, 8.5.1, 8.6, 8.7, 8.8) — this undefined concept appeared in **five places**, not just the one originally flagged. All five now restrict the relevant action to Owner only for V1, with an explicit note that broader Family-role-based authority is deferred until a real role model exists — rather than letting `03` invent one to fill the gap.
8. Deletion restoring prior access/assignments (Section 4.3) — now explicit: deletion is a lifecycle state change only, never an implicit access-revocation; restoring an Object returns exactly its pre-deletion Grants with no re-granting required. Responsibility preservation (no backlog, assignments intact, history untouched) is now stated directly rather than left to be inferred by composing two other rules.
9. History ordering under offline events (Section 7.5) — "strictly ordered by event time" is now "ordered by authoritative server-accepted timestamp," consistent with the same principle already established for the Correction Window, with the exact tiebreaker mechanism correctly left to `03`/`04`.
10. History "permanent" wording vs. Erasure (Section 7.1) — "permanent" is replaced with "durable for the lifetime of the Object," removing an unqualified claim that was in tension with the Erased state's own existence.
11. Grocery completion-record boundary (Section 6.5) — now explicit that the record is a bare completion fact only, with item-level snapshots or counts explicitly ruled out, closing off a path by which List History could have quietly grown into a second Item-history system.

**Assessed and not changed, per the same review:** the Universal Object model, Templates, Items' capability boundary, History-vs-Timeline, Notification subordination, failure isolation, and future-extensibility boundaries were all independently re-confirmed sound and are unchanged — this was a precision-hardening pass on specific edge semantics within an already-correct foundation, not a redesign.

---

## 32. Recurrence: Calendar Months, Years, DST, Canonical Timezone, and Rollover

**Problem:** the original recurrence model (5.3) omitted every-N-months and yearly shapes entirely — meaning two of the product's own canonical examples (car maintenance every 6 months, passport renewal yearly) were not actually representable without a lossy day-count approximation. It also left DST behavior, cross-timezone viewing, and day-of-month rollover unspecified.

**Recommendation — one coherent rule, not four patches:**

- **Calendar-month and calendar-year recurrence (3.1, 3.2):** a monthly, every-N-months, yearly, or every-N-years Schedule is defined by an anchor date and an interval measured in calendar months or years — **never** approximated as a fixed number of days. Each subsequent Occurrence's due month/year advances by the stated interval from the anchor, keeping the same day-of-month (subject to the rollover rule below). "Every 6 months" starting January 15 produces occurrences on July 15, January 15, July 15 — not "every 180 days," which would drift against real calendar dates within a year or two.
- **Day-of-month rollover (3.5), one rule, no special cases:** if the target month does not contain the anchor day, the Occurrence resolves to the **last valid calendar day of that month**. January 31 → February 28 (or 29 in a leap year) → March 31 → April 30 → May 31. This same rule handles the February 29 leap-year case for yearly recurrence without a separate special case: a February 29 anchor resolves to February 28 in a non-leap year. **The original anchor day is never mutated by a rollover (made explicit, since the example above could otherwise be read as ambiguous about what March resolves to):** February's rollover to the 28th is a one-month computation, not a redefinition of the Schedule's anchor — the anchor remains the 31st permanently, and every subsequent month independently checks the *original* anchor day against its own length. March correctly resolves to the 31st, not the 28th, because March is evaluated against "day 31," never against "whatever February happened to resolve to."
- **DST (3.3):** a recurring local-time Schedule (e.g., "08:00 daily") is anchored to **wall-clock/local time**, not a fixed UTC instant. Each Occurrence's actual due moment is whatever UTC instant corresponds to "08:00 local" on that specific date — meaning the underlying UTC offset used naturally changes across a DST transition while the wall-clock time a user experiences never drifts. *(The specific timezone-conversion mechanism — library, database function, or otherwise — is explicitly deferred to `03`/`04`; this section fixes only the domain principle: local time is authoritative, not a frozen UTC offset.)*
- **Canonical timezone (3.4):** a Responsibility's Schedule has exactly **one** canonical timezone, set when the Schedule is created, which governs every Occurrence's actual due instant regardless of which Family member is viewing it from where. Presentation layers may convert the displayed time for a viewer's convenience; the underlying due instant and its governing timezone are singular and authoritative, never dependent on whoever happens to have the app open.
- **Changing the canonical timezone:** this is not treated as a new, separately-invented case — it follows exactly the same rule already established for any Schedule edit (5.3, 5.8): affects future Occurrences only. An Occurrence already due (resolved or still Pending) at the moment the timezone changes keeps its originally-computed due instant. This was evaluated for whether it constitutes a genuinely open product question and does not — it falls out cleanly from an already-established principle, so no new OPEN DECISION is introduced here. **Explicit warning against a plausible implementation mistake:** changing a Responsibility's canonical timezone is a **semantic schedule change** — it alters *when the Responsibility actually becomes due* — never merely a display/formatting preference. A future engineer must not implement timezone selection as a cosmetic UI setting; doing so would silently and incorrectly change real due instants for anyone who changes their displayed timezone without intending to reschedule anything.

**Why one coherent model:** every one of these five behaviors (month/year math, rollover, DST, canonical timezone, timezone-change handling) is a facet of the same underlying question — "what does this Schedule's due instant actually mean, precisely, at every point in time" — and specifying them together, cross-referenced from a single Section 5.3 pointer, is what prevents this from becoming the "duplicated scheduling logic" anti-pattern (Section 21) that a series of ad-hoc, separately-patched fixes would otherwise produce.

**Trade-offs:** calendar-aware month/year math is genuinely more complex to implement correctly than fixed-day-count intervals — this is accepted, since the alternative (day-count approximation) is not actually correct for the product's own canonical use cases, not just theoretically imperfect.

**User impact:** "every 6 months" and "yearly" now mean what a user actually expects, and a daily reminder never silently moves an hour twice a year.

**Domain impact:** Section 5.3's supported-shapes list is extended; no existing shape's behavior changes.

**Future impact:** this same calendar-aware, canonical-timezone, wall-clock-anchored model is expected to extend without modification to Organization/Company recurrence needs later (e.g., a monthly compliance inspection) — nothing about it is Personal/Family-specific.

**Testable Rules:**
- **Given** a Schedule anchored to the 31st with a monthly interval, **when** the occurrence for February is computed, **then** it falls on February 28 (or 29 in a leap year), and March reverts to the 31st. *(Invalid: February is skipped entirely, or the date silently shifts permanently to a different day for all future months.)*
- **Given** a daily 08:00 Schedule in a timezone observing DST, **when** a transition occurs, **then** the Occurrence remains due at 08:00 local time on both sides of the transition. *(Invalid: the due time silently becomes 07:00 or 09:00 local after the transition.)*
- **Given** a Responsibility with canonical timezone Asia/Kolkata, **when** a Family member in a different timezone views it, **then** the underlying due instant is unchanged — only its displayed representation differs. *(Invalid: the Occurrence's actual due instant changes based on who is viewing it.)*

---

## 33. Corrected — Full Decision Record

*(Formal definition already stated in Section 5.9; this section is the decision record explaining why, per the requirement that this not be resolved as a superficial presentation fix.)*

**Problem:** the original Correction mechanism (Section 23) derived an Occurrence's post-correction state as if the corrected Execution had never existed — which, once due time has passed, computes to Missed, identical to an Occurrence nobody ever acted on. This is mathematically consistent with the Missed-derivation rule but conflates two materially different facts, and the correction must not be solved by keeping this domain result and merely softening its presentation — that would mean the domain layer computes a misleading value and asks the UI to compensate for it, which is itself the wrong boundary.

**Options considered:**
- **A. Keep only Pending/Completed/Missed/Skipped, address the conflation purely in UI wording.** Rejected — this is precisely the superficial fix ruled out. The underlying value would still be factually imprecise; only its label would change.
- **C (a genuinely different model): make Correction regenerate a fresh replacement Occurrence.** Rejected — this would violate deterministic Occurrence identity (5.4), since "this Responsibility's 8:00 AM instance today" must always resolve to the same Occurrence; regenerating one would create ambiguity about which Occurrence is authoritative and complicate every downstream reference to it.
- **A stored, mutable "Corrected" field.** Considered and rejected as a variant of the options above — this document has a standing, deliberate preference for deriving status from immutable facts (Missed is the existing precedent) rather than adding another mutable field that could drift from the truth it's meant to reflect.
- **B. A fifth outcome, Corrected, derived (never stored) from the full Execution/Correction history — Recommended.**

**Recommendation:** Corrected is computed by the same kind of derivation as Missed, but consults the *complete* history of Executions and Corrections for an Occurrence rather than only the current absence of an active Execution. If due time has not yet passed at the moment of correction, the Occurrence is simply Pending — accurate and non-misleading on its own, since the ordinary window is still genuinely open. If due time has already passed, the Occurrence is Corrected, not Missed.

**Why this is stronger than a presentation fix:** Missed and Corrected are answers to two different real questions — "did anything ever happen here" versus "did something happen that was later undone" — and a domain layer that cannot distinguish them is losing real information, not just phrasing it poorly. Recovering that distinction at the domain level (rather than reconstructing it from raw History records every time a UI needs to know) is what makes it a fixed model rather than a workaround. It also turns out to be more useful than the four-status model, not merely equally correct: any future adherence or analytics feature can distinguish "genuinely missed" from "attempted, then corrected, never resumed" for free, without new data collection — a strong signal that Corrected is the right category, not an invented one.

**Trade-offs:** the Occurrence status space grows from four values to five, and every consumer of Occurrence status (Today view, History display, any future analytics) must handle a case it didn't previously need to. This is accepted as the correct cost of accuracy — collapsing it back to four values would only be cheaper by being wrong.

**User impact:** a user who catches and fixes their own mistake sees an honest reflection of what happened, not a label indistinguishable from having done nothing at all.

**Domain impact:** Sections 5.7, 5.9, and 23 are updated to define and apply Corrected consistently; no other Occurrence-status consumer's existing behavior changes for the four previously-existing values.

**Future impact:** Corrected composes cleanly with Notification (13.3, 13.7) and offline (5.11, 17) without any new rules in either area — its relevance and delivery-timing behavior already follow "the Occurrence's true current state," which now simply includes one more possible true state. This is a good sign the surrounding model was built correctly the first time.

**Invariant:** see Invariant 28 (Section 15).

---

## 34. Notes vs. Attachments — Domain Boundary

**Problem:** without a stated boundary, Notes/Attributes (Section 4.7, meant for short contextual detail) could become a de facto document-storage system, blurring the line with Attachments (Section 4.8, meant for substantial content) and creating ambiguity about which mechanism a given piece of content belongs in.

**Recommendation:** Notes/Attributes are for short, structured, user-entered context — a description, a quantity, a status note. Attachments are for large documents, media, and substantial content. This is a **product-level distinction in kind**, not a domain-enforced numeric limit — no arbitrary character count is introduced here, consistent with the instruction not to turn this into a storage-architecture decision. *(Any practical size guardrail, if one is ever needed, belongs to `03`/`04` as an implementation concern, not a domain rule.)*

**Why:** the two mechanisms have different implied guarantees elsewhere in this document — Attachments inherit Object-level Access and are individually addable/removable with their own History event (4.8); Notes are part of the Object's own field set. Conflating "paste a whole document into the notes field" with genuine attachment behavior would quietly recreate a second, informal attachment system with none of Section 4.8's guarantees.

**User impact:** none directly — this is a modeling boundary, not a user-facing restriction; a user pasting something long into Notes isn't blocked, just guided by product-level affordances (per `01`) toward Attachments when that's clearly the better fit.

**Domain impact:** clarifies, rather than changes, the existing distinction between 4.7 and 4.8.

**Invariant:** not added as a new numbered invariant — this is guidance on existing capability boundaries (4.7, 4.8), not a new correctness rule.

---

## 35. Capability Admission Governance

**Problem:** nothing in this document previously governed how a *future* optional capability gets added to the platform — every capability that exists today (Section 8.2's set) was evaluated carefully, but nothing stops that discipline from lapsing later, which is exactly how the original repository ended up with an unused, unvalidated generic capability-plugin engine.

**Recommendation:** before a new optional capability is added to the Universal Object Model, it must be evaluated against the following, cross-referenced from `01_PRODUCT_VISION.md` Section 42, which owns the full governance checklist as a product-process principle:

1. Is it reusable across multiple Object experiences, not specific to one category?
2. Is it truly a capability (composable, optional) rather than a category-specific feature in disguise?
3. Is it Core or Optional (Section 3) — and if Optional, does it genuinely need to be, or does an existing capability already express it?
4. Does it have independent lifecycle semantics distinct from what already exists?
5. Does it require independent persistence, and is that justified?
6. Does it introduce new authorization semantics, or does it compose with the existing four-axis Access model (Section 8.5)?
7. Can it compose cleanly with existing capabilities without hidden coupling (Section 8)?
8. Can it fail independently without corrupting core truth (Section 19)?
9. Does it create unnecessary coupling between previously-independent parts of the model?
10. Can an existing capability already express the requirement with no new mechanism at all?

**Why:** this is deliberately a governance checklist, not software — it does not create a capability-registry engine, a plugin runtime, or a marketplace mechanism, all of which remain explicitly forbidden (Section 21). The discipline that correctly bounded Section 8's original capability set must be repeatable, not a one-time artifact of this document's original authoring.

**Domain impact:** none directly — this section constrains future process, not current behavior.

---

## 36. Subscription / Entitlement Domain Boundary

**Problem:** future Lumora will very likely have paid tiers, but nothing previously stated an explicit, permanent boundary preventing entitlement checks from leaking into domain logic — the existing failure-isolation rule (Section 19) only covered what happens when a payment provider is *unavailable*, not the separate and more important question of whether domain logic may ever *reference* entitlement state at all, even when everything is healthy.

**Recommendation:** the domain layer defined in this entire document has no concept of a plan, tier, or entitlement, and never will. The correct boundary is:

```
Product/application boundary → entitlement/feature-availability check → authorized domain operation
```

Entitlement is evaluated once, at the application boundary, *before* a domain operation is invoked. If a user is not entitled to a capability, the application simply does not invoke the corresponding domain operation — the domain operation itself is never conditionally altered based on subscription state. No domain rule anywhere in this document may contain, directly or indirectly, logic equivalent to `if premium: allow` or `if subscription: behave differently`.

**Why:** this is the same category of discipline already applied to language-neutrality (Section 37) and category-branching (Section 12.1) — a cross-cutting concern that must never be allowed to fragment core correctness logic. Scattering entitlement checks through domain code is explicitly named in `01`'s product principles as something to avoid; this section makes that a binding domain-level invariant rather than only a product aspiration.

**Trade-offs:** none of substance — this boundary costs nothing in V1 (there is no subscription system yet) and only pays off once one exists, which is exactly when it would otherwise be tempting to violate.

**User impact:** a billing outage never prevents a user from using their already-entitled features or accessing their own data (Section 19); a future free/paid distinction never behaves inconsistently depending on which code path happened to check it.

**Domain impact:** none to existing behavior — this section adds a boundary, not a change.

**Future impact:** when subscriptions are eventually designed (explicitly out of scope here — no pricing, billing provider, or checkout flow is specified), the entitlement-evaluation layer can be built entirely at the application boundary without touching any rule in this document.

**Invariant:** see Invariant 32 (Section 15).

---

## 37. Localization Invariant

**Problem:** language-neutrality was implied throughout this document (e.g., Category Label is presentation-only, Section 12) but never stated as its own explicit, binding rule.

**Recommendation:** no domain rule in this document may branch on human language, translation, locale, or UI wording. A user's language/locale preference is a presentation/application-layer concern exclusively; the domain layer has no awareness of it.

**Why:** consistent with the same discipline applied to category-branching (12.1) and now subscription state (36) — cross-cutting presentation/billing concerns must never fragment core domain logic, on principle, regardless of whether a concrete violation has been observed yet.

**Domain impact:** none to existing behavior — no domain rule in this document currently references language; this section makes that permanent rather than incidental.

**Invariant:** see Invariant 33 (Section 15).

---

## 38. Retroactive Template Application — V1 Not Supported

**Problem:** nothing previously stated whether a user-created or custom Object could later be retroactively linked to a Template's live content — e.g., "apply the Plant template to this object I created from scratch."

**Recommendation:** explicitly **V1 NOT SUPPORTED**. An Object's relationship to a Template is fixed at creation time via snapshot (10.2) and is never established or altered afterward. If a user wants a Template's suggested fields/capabilities on an Object that doesn't have them, the only V1 paths are: manually adding the relevant capabilities to the existing Object, or creating a new Object from the Template and migrating content manually. There is no "apply template to existing object" operation, and no live Template-to-Object linking mechanism of any kind.

**Why:** any retroactive-application mechanism would necessarily create exactly the live-dependency risk Section 10.2's snapshot design exists to eliminate — the moment an existing Object can be "updated" from a Template after the fact, the Template stops being a one-time starting point and becomes a runtime dependency again, reopening the door to the package-manager-style machinery this entire model was built to avoid.

**Trade-offs:** a user who picked "Custom" and later realizes a Template would have suited them better has no shortcut — an accepted, deliberately narrow V1 limitation, not an oversight. This is explicitly marked as **deferred**, not rejected forever: real product evidence of demand could justify a proper feature later, but it is not invented preemptively here.

**Domain impact:** none — this section states a boundary that was already implicit in 10.2's snapshot design; it does not change any existing behavior.

**Invariant:** see Invariant 34 (Section 15).

---

## 39. Occurrence Effective Outcome — Formal Precedence

**Problem:** Sections 5.7, 5.9, and 33 together define Pending, Completed, Skipped, Missed, and Corrected — but as five separate prose statements rather than one unambiguous derivation order. An implementer assembling these into code has to correctly infer the precedence; that inference should not be left to them.

**Recommendation — formalized once, referenced everywhere else:**

```
Given an Occurrence's full Execution/Correction history and its due instant:

1. If an active Execution exists (i.e., not voided by a later Correction):
     → its outcome is the Occurrence's outcome: Completed or Skipped.

2. Else (no active Execution exists):
     a. If the due instant has NOT yet passed:
          → Pending.
          (This holds even if a prior Execution existed and was corrected —
           before due time, Pending is already accurate; see Section 5.9.)
     b. If the due instant HAS passed:
          i.  If at least one Execution ever existed for this Occurrence
              (and was subsequently corrected away):
                → Corrected.
          ii. Else (no Execution has ever existed for this Occurrence):
                → Missed.
```

This is the single authoritative derivation. Sections 5.7, 5.9, 23, and 33 are all consistent with it; none of them override it.

**Why:** an ordered, exhaustive precedence — rather than five independent prose rules a reader has to reconcile — is what makes this safe to implement and safe to test. Every branch is mutually exclusive and the whole tree is exhaustive: there is no history/due-instant combination that falls through without a defined outcome.

**Domain impact:** none — this section restates existing rules in one place; no outcome computed by this algorithm differs from what Sections 5.9, 23, and 33 already specified individually.

**Testable Rules:**
- **Given** an Occurrence with an active Completed Execution, **when** evaluated, **then** the outcome is Completed regardless of due-instant timing, correction history, or anything else — step 1 short-circuits everything below it.
- **Given** an Occurrence with a corrected Execution and due instant not yet passed, **when** evaluated, **then** the outcome is Pending, never Corrected — 2(a) takes precedence over 2(b)(i).
- **Given** an Occurrence with no Execution history at all and due instant passed, **when** evaluated, **then** the outcome is Missed via 2(b)(ii), the only branch that reaches it.

---

## 40. Conceptual Hierarchy: Facts, Derived State, and Projections

**Problem:** this document now contains several kinds of "not directly stored" information — Occurrence effective outcome, Timeline, Usage Metadata, and potentially future Analytics — without a single stated hierarchy distinguishing them. Left implicit, this is exactly the kind of ambiguity that could let a future contributor treat a Projection as if it had Derived-State-level authority, or vice versa.

**Recommendation — three explicit tiers:**

| Tier | Definition | Examples | Authority |
|---|---|---|---|
| **1. Facts** | Authoritative domain records of what happened. History (Section 7) is the authoritative historical record of those Facts for a given Object — not a separate thing from them, but the specific, queryable form Facts take once scoped to an Object's own record. | Object created; Execution created; Correction created; Grant created/revoked; Attachment added/removed | Authoritative, permanent (within the Object's lifecycle, 7.1), never derived from anything else |
| **2. Derived State** | Computed live from Facts, never separately stored, but fully authoritative — not optional, not best-effort, not eventually-consistent | Occurrence effective outcome (Missed/Corrected/Pending/Completed/Skipped, Section 39) | Authoritative — a correct implementation must always compute the same answer from the same Facts; this is not a cache and must never silently disagree with what the Facts imply |
| **3. Presentation Projections** | Derived from Facts and/or Derived State, optional, may lag, may be rebuilt, never authoritative | Timeline; Template Usage Metadata (10.8); Search index; future Analytics or Gamification state | Never authoritative — failure or staleness here (Section 19) can never contradict Tier 1 or Tier 2, and nothing in Tier 1 or 2 may ever depend on Tier 3 being correct or even available |

**Why:** this retroactively organizes and validates several already-established rules under one explicit model, rather than leaving each as an independent decision a reader has to separately notice follows the same shape. It also gives a fast, reusable test for any future addition to this document: before adding a new "derived" concept, ask which tier it belongs to — if the answer is unclear, that ambiguity itself is the signal to resolve before the concept is added, not after.

**Domain impact:** none to existing rules — every existing Tier-1/2/3 classification in this document (History as Fact, Occurrence outcome as Derived State, Timeline/Usage Metadata as Projections) already matches this hierarchy; this section makes the pattern explicit rather than changing any instance of it.

**Future impact:** any future Analytics, Gamification state, or AI-derived suggestion is a Tier 3 Projection by default unless a specific, explicit decision promotes something to Tier 2 — which should be rare and deliberate, exactly as rare as Section 39's five-outcome derivation was.

---

## 41. Relationships and Search — Explicit V1 Boundary Reaffirmation

**Problem:** material outside this authoritative documentation set (a UI/implementation blueprint) has been reported as discussing Relationships and Search in ways that could be read as earlier-than-V1 scope. This document has not seen that material directly and does not treat it as authoritative — but the underlying risk (a later architecture pass building infrastructure because *some* document mentioned a capability) is real regardless of that material's exact content, and is cheap to close off explicitly now.

**Recommendation — restated as an explicit, unambiguous boundary, not a new decision:**

- **Relationships:** remain exactly as scoped in Section 3 and `01_PRODUCT_VISION.md` Section 28 — deferred past V1. `03_SYSTEM_ARCHITECTURE.md` may reserve a clean extension point for a future cross-object link concept (consistent with Section 20's future-evolution table) but must not build relationship infrastructure, storage, or API surface for V1. No V1 user-facing flow may depend on Relationships existing.
- **Search:** remains exactly as scoped — a LATER, optional capability (Section 19's failure-isolation list already treats it as non-core). `03` may reserve an extension point but must not treat Search as a V1 core dependency. No V1 core flow (Quick Add, Today, Object detail, Responsibility completion) may depend on Search being available.

**Why:** this costs nothing to state now and directly forecloses a plausible, previously-identified failure mode — an architecture pass inferring earlier scope from a non-authoritative source and building accordingly. If a non-authoritative document conflicts with this boundary, this document wins per `00`'s conflict-resolution rule; the non-authoritative material should be corrected to match, not the reverse.

**Resolved (previously an open item pending source material, now settled explicitly):** Workspace (Section 9) remains the **only** authoritative domain context — the only concept in this document with ownership, access, membership, lifecycle, persistence, or tenancy semantics. If a "Space" concept exists anywhere in non-authoritative UI/design material, it may persist there **only** as a presentation-level organizational or view grouping (e.g., a personal way of visually arranging objects — "Health," "Home," "Work," "Finance") and must carry **none** of the following: independent ownership, independent membership, independent authorization, independent lifecycle, independent persistence, independent tenancy, or independent access semantics. A "Space" must never become a domain aggregate, must never be confused with or merged into the Item/Collection concept (Section 6), and Health/Home/Work/Finance-style groupings must never become Workspace types (Section 9's only types remain Personal and, next, Family). Any non-authoritative material describing "Space" as "context/domain" is describing a UI grouping convenience, not a domain concept — this document is authoritative on that point regardless of how that material is worded, per `00`'s conflict-resolution rule.
