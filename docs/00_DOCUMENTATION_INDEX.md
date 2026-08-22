# Lumora Documentation Index

> **STATUS:** AUTHORITATIVE — NAVIGATION AND AUTHORITY MAP ONLY.
> This document defines no product, domain, or technical content itself. It defines which document owns which kind of decision, what happens when two documents appear to disagree, and how this documentation set relates to prior material.

---

## 1. Purpose

Lumora's prior documentation (two Codex-generated baseline specifications) and its prior implementation both drifted from the agreed product vision in specific, identified ways — most seriously, a contradiction over whether History is core or optional, and an onboarding flow that forced a Personal/Family choice before the user received any value. This documentation set exists to close that gap permanently by giving every decision exactly one authoritative home, so drift of that kind cannot recur silently.

This index is the map. It is not a substitute for reading the document that actually owns a decision.

---

## 2. The Document Set

| # | File | Status | Owns | Does Not Own |
|---|---|---|---|---|
| 00 | `00_DOCUMENTATION_INDEX.md` | **Published** | Navigation, authority, conflict resolution | Any product, domain, or technical content |
| 01 | `01_PRODUCT_VISION.md` | **Published** | Product intent, user value, user-facing behavior, scope sequencing (product framing) | Data models, class/schema design, API mechanics, exact concurrency/locking mechanisms |
| 02 | `02_DOMAIN_BUSINESS_LOGIC.md` | **Published** | Meaning of every core term (Object, Responsibility, Occurrence, Execution, Access, History, Item), invariants, state machines, business rules | Product rationale/marketing framing, deployment topology, infrastructure choices |
| 03 | `03_SYSTEM_ARCHITECTURE.md` | **Frozen** | Module boundaries, dependency direction, API/event/runtime shape, technology choices and why | Redefinition of domain terms (references 02), product scope decisions |
| 04 | `04_DATA_SECURITY_RELIABILITY.md` | **Draft — first complete pass, not yet reviewed/frozen** | Persistence strategy, indexing/performance rules, authorization enforcement mechanics, privacy/security rules, failure and recovery behavior | Product rationale, module boundary design (references 03) |
| 05 | `05_ROADMAP_IMPLEMENTATION_CONTRACT.md` | Pending | V1/NEXT/LATER/FUTURE sequencing at implementation granularity, acceptance criteria, code-quality and engineering-process rules, repository migration plan (KEEP/REMOVE/REBUILD) | Redefinition of product or domain decisions (references 01/02) |

**Forward note on Document 05:** by explicit decision, engineering/code-quality rules live inside 05 rather than in a separate Engineering Constitution, because the current scope doesn't justify a seventh document. The trigger for reconsidering that: if 05 grows large enough that sequencing decisions and engineering-process rules start being hard to find independently of each other, split them then — not preemptively.

**Stated plainly:** `01` is product authority — why Lumora exists and what a person experiences. `02` is domain authority — exactly what every term means, and the rules that make it correct. Neither substitutes for the other, and as of this publication both are equally binding on `03`.

---

## 3. Authority and Conflict Resolution

Each document is authoritative **only** within the column it owns in the table above. No document may redefine a term or re-decide a question that belongs to another document — it must reference that document instead.

**When two documents appear to disagree:**

1. Identify which document *owns* the specific decision in question, using the table above.
2. The owning document is correct. The other document is treated as out of date on that point and must be corrected to match — never the reverse.
3. If ownership itself is ambiguous, that ambiguity is a defect in this index and must be resolved by amending Section 2, not by guessing per-instance.

This mirrors, and exists specifically to prevent a repeat of, the failure already found in the prior Codex baseline: the same term (History/Timeline) was described two incompatible ways because no single document had unambiguous ownership of its meaning.

---

## 4. Foundational Locked Decisions

These are cross-cutting corrections established through adversarial review of the prior baseline. They are stated briefly here because they affect every document; each is **owned and fully specified** in the document listed, and must not be redefined elsewhere.

| Decision | Owning document |
|---|---|
| Personal is the launch product; Family is next; Organizations/Companies/Service Providers are future and must not shape V1 UX or onboarding. | 01 |
| History is core, authoritative, and consistent with the state change it records. Timeline (if it exists) is a derived, optional, presentational view over History and may lag or be rebuilt. "History" and "Timeline" are never referred to as one subsystem. | 01 (product meaning) / 02 (formal definition) / 04 (persistence guarantee) |
| Onboarding never forces a Personal-vs-Family choice, or any other configuration step, before the user reaches value. | 01 |
| A Responsibility belongs to exactly one Object for V1. Multi-object responsibilities are a possible future extension, not a current ambiguity. | 02 |
| Items (list entries) are lightweight child records with no independent Responsibility, Access, or History of their own. | 01 (product boundary) / 02 (formal definition) |
| Selecting a template copies its content into the created object at that moment; the object does not depend on the template continuing to exist. Template retirement can never destroy or break existing objects. | 01 (product behavior) / 02 (formal semantics) |
| Grant Access and Transfer Ownership are two distinct operations. V1 ships only Grant (explicit, revocable). Transfer is future scope. | 01 (product behavior) / 02 (formal semantics) |
| Category-specific product experiences (Plant, Medicine, Grocery, Vehicle, etc.) are a presentation-layer concern. They must never require a category-specific backend, service, or database model. | 01 |
| Search must enforce authorization at query time, independent of index freshness. Cached or locally stored data must not remain usable once authorization is revoked. | 04 |
| Notification content generation must consult privacy sensitivity before composing the message body, not only at the delivery boundary. | 01 (product rule) / 04 (enforcement) |
| Cost discipline (infrastructure, operational, and maintenance cost for a small team) is an explicit, first-class architectural concern, not an afterthought. | 03 / 04 |
| A typed sidecar (a more structured, relationally-integral extension beyond flexible attributes) requires a genuine integrity or domain reason. It must never become a category-specific table by another name. | 02 / 03 |
| No generic deep cross-object attribute query/filter engine. No generic runtime capability plug-in engine. No large branch on object type in core logic. | 03 |
| Execution is immutable through ordinary flows, but a 10-minute, original-actor-only Correction Window allows undoing a mistaken completion via an additive correction event — never an edit or deletion of the original fact. | 01 §32 / 02 §23 |
| Concurrent edits to the same Object's fields are resolved via revision-checked optimistic concurrency; a losing edit is rejected and surfaced, never silently applied or discarded. Last-write-wins is explicitly rejected. | 01 §33 / 02 §24 |
| Object deletion uses a 30-day recovery window before permanent purge (a UX decision, distinct from any legal retention policy, which remains open). Account deletion applies this same pattern to everything a user owns. | 01 §31 / 02 §4.3, §25 |
| Sensitivity is an object-level-only classification for V1 (no field/attachment-level granularity yet), template-suggested by default and always user-overridable. | 01 §21 / 02 §12.4 |
| An Object created within the Family workspace is individually owned by its creator; creating it there is itself the sharing action (automatic workspace-wide Grant), except for elevated-Sensitivity objects, which stay private by default. | 01 §37 / 02 §9.3 |
| If a Responsibility has assignees, only those assignees or the Object owner may complete its occurrences; multiple assignees means "any one resolves it for all," never "everyone must individually complete it." | 01 §36 / 02 §8.5.1 |
| Template Catalog, Template Usage Metadata, Template Provenance, and Instantiated Object are four distinct concepts; Usage Metadata is read-only derived analytics and is never a runtime dependency. | 01 §38 / 02 §10.8 |
| Recurrence is calendar-aware (every-N-months, yearly) with one coherent day-of-month rollover rule; recurring local-time schedules are wall-clock anchored and never drift across DST; a Responsibility has exactly one canonical timezone independent of any viewer. | 01 §39 / 02 §32 |
| Corrected is a fifth, derived Occurrence outcome, distinct from Missed — an Occurrence engaged with and then corrected is never conflated with one never acted upon at all. | 01 §40 / 02 §5.9, §33 |
| No domain rule may ever reference subscription/entitlement state, even when healthy — not only "must tolerate its failure." Entitlement is evaluated once, at the application boundary, before a domain operation is invoked. | 01 §43 / 02 §36 |
| No domain rule may branch on human language, translation, or locale. | 02 §37 |
| Retroactive Template application to an existing or custom Object is explicitly V1 Not Supported — Template linkage is fixed at creation via snapshot only. | 01 §44 / 02 §38 |
| Future optional capabilities must pass a ten-question governance checklist before being added to the platform — capability sprawl is a standing risk, not a one-time decision. | 01 §42 / 02 §35 |

---

## 5. Relationship to Prior Material

Two prior documents — `LUMORA_PRODUCT_SPECIFICATION.md` and `LUMORA_ARCHITECTURE_SPECIFICATION.md` (Codex-generated baseline) — were reviewed in detail before this set was started. Their valid content has been carried forward; their identified contradictions have been corrected (Section 4 above). As of this publication:

- `01_PRODUCT_VISION.md` is authoritative over `LUMORA_PRODUCT_SPECIFICATION.md`. Where they conflict, this document wins.
- Because `02`–`05` are not yet published, `LUMORA_ARCHITECTURE_SPECIFICATION.md` may still be consulted as reference material for architecture and domain detail not yet restated here — but any content in it that conflicts with a Section 4 locked decision is already superseded, regardless of publication order.
- Once `02`–`05` are published, both Codex documents should be archived rather than kept as live references, to avoid exactly the dual-source-of-truth drift this documentation set was created to eliminate.

A separate, source-verified audit of the actual current repository (not reflected in either Codex document) exists and will be the primary input to `05_ROADMAP_IMPLEMENTATION_CONTRACT.md`'s migration plan. That audit is implementation-truth, not target-truth, and does not override any decision in this document set.

---

## 6. Terminology Map

Full, authoritative definitions of every core term live in `02_DOMAIN_BUSINESS_LOGIC.md`. Other documents use these terms consistently but do not redefine them. The core terms are: **Object, Access, History, Notes/Attributes, Attachment, Responsibility, Schedule, Occurrence, Execution, Notification, Item, Relationship, Template, Custom Object, Workspace, Grant, Transfer.**

If a document appears to define one of these terms differently from how it is used elsewhere, that is a defect to be corrected against `02`, not a legitimate local variation.

---

## 7. Change Control

- Adding a new document, renaming a document, or changing which document owns a decision requires updating this index.
- Correcting content *within* a document's own owned scope does not require updating this index.
- A decision should never be duplicated into a second document "for convenience." Reference the owning document instead. Duplication is how the original History/Timeline contradiction happened.

---

## 8. Amendment Log

**Amendment 1 — Cross-Document Consistency & Decision Resolution Pass.** Fourteen previously-open or previously-unaudited decisions were reviewed; nine were resolved with full recommendations (Execution correction, same-field concurrent editing, object deletion/recovery lifecycle, template administration and usage metadata, grocery list behavior, occurrence overrides, responsibility assignee semantics, the Personal/Family workspace model, and object-level sensitivity scope); five were verification passes over already-specified content (History semantics, missed-occurrence derivation, notification semantics, failure isolation, future-evolution boundaries), each confirmed correct with minor, explicitly-noted additions. One cross-document gap was found and corrected: `02` had defined Object lifecycle states (Archive/Delete/Restore) without `01` ever establishing the product-level need — `01` Section 31 now owns that product framing, with `02` Section 4.3 deferring to it. Full detail lives in `01` Sections 31–38 and `02` Sections 23–29. Two items remain genuinely open: Family workspace ownership succession, and legal/policy-driven data retention — both explicitly marked rather than silently resolved, per standing instruction not to invent legal policy or manufacture certainty where none exists.

**Amendment 2 — Domain Hardening Pass.** An independent review of Amendment 1's output found that several "resolved" decisions had loose domain-boundary edges that could not yet safely freeze into architecture — most notably a genuine contradiction between the Execution Correction mechanism and the Missed-occurrence derivation rule, a non-deterministic ("client-initiated-first") concurrency rule for corrections, and an undefined "workspace role with edit authority" concept referenced in five separate places despite no role model existing yet. Eleven precision fixes were made, all within `02` (Sections 4.3, 4.10, 6.5, 7.1, 7.5, 8.5.1, 8.6, 8.7, 8.8, 9.3, 17, 23, 24), documented in full in `02` Section 31. This was a domain-boundary hardening pass, not a reopening of product decisions — every fix tightens the precision of an already-correct choice rather than changing the choice itself. The Universal Object model, Templates, Items, History-vs-Timeline, Notification subordination, and failure isolation were independently re-confirmed sound and left unchanged.

**Amendment 3 — Business Logic Stress Test & Hardening Pass.** A deeper real-world stress test surfaced two product-facing gaps serious enough to matter at launch: the recurrence model couldn't actually represent two of the product's own canonical examples (car maintenance every 6 months, yearly passport renewal) without a lossy day-count approximation, and — the most significant single finding of this pass — the Amendment 2 fix to Execution Correction was domain-consistent but still produced a misleading product outcome, collapsing "completed, then corrected" into the same "Missed" label as "never touched at all." This was deliberately *not* patched at the presentation layer; a new, properly-derived fifth Occurrence outcome, **Corrected**, was added to the domain model itself (`02` Sections 5.9, 14, 23, 33), computed from immutable Execution/Correction history exactly as Missed already is. Recurrence was extended to calendar-aware every-N-months and yearly shapes with one coherent day-of-month rollover rule, explicit DST wall-clock anchoring, and a canonical-timezone rule for shared Responsibilities (`02` Section 32). Five smaller boundaries were formalized: Notes vs. Attachments guidance, a ten-question capability-admission governance checklist (protecting against the exact capability-sprawl failure mode already seen once in this product's history), a subscription/entitlement domain-agnosticism invariant stronger than mere failure-isolation, a language-neutrality invariant, and explicit "V1 Not Supported" status for retroactive Template application. Full detail lives in `01` Sections 39–45 and `02` Sections 32–38. No previously-validated decision was reopened; every change either closed a genuine product gap (recurrence, Corrected) or made an already-correct principle explicit and binding (governance, entitlement, localization boundaries).

**Amendment 4 — Final Pre-Architecture Domain Audit.** Two classes of issue were found and closed. First, a genuine documentation-governance defect: this index's own status table still listed `02` as Pending while three full amendment rounds had treated it as authoritative — fixed, and a one-line explicit authority summary (`01` = product authority, `02` = domain authority) added to prevent recurrence. Second, seven genuine domain-boundary ambiguities, all precision-tightening rather than decision-reopening: the Correction Window was clarified to bound only *when* a prior Execution may be corrected, never *whether* the Occurrence may later receive a new one (`02` §23); the five-outcome derivation (Pending/Completed/Skipped/Missed/Corrected) was formalized as one explicit, exhaustive precedence algorithm rather than five separate prose rules (`02` §39); recurrence's day-of-month rollover was made explicit that the original anchor is never mutated by a rollover, so March correctly resolves against "day 31," not against February's rolled-over "28" (`02` §32); changing a Responsibility's canonical timezone was flagged explicitly as a semantic schedule change, never a display preference (`02` §32); the Object Owner's override authority over Responsibility assignment was made an explicit, intentional rule rather than an inferable one (`02` §8.5.1); Archive/Delete's pause-style suppression was clarified to apply only to Occurrences that would have been newly generated during the deleted window, never retroactively to one already due beforehand (`02` §4.3); and a three-tier Facts/Derived-State/Presentation-Projections hierarchy was added to organize History, Occurrence outcome, Timeline, and Usage Metadata under one explicit model (`02` §40). Relationships and Search's V1-deferred scope was explicitly reaffirmed as a boundary `03` must not cross regardless of any non-authoritative external material (`02` §41). One genuine open item was surfaced and deliberately not resolved: a possible terminology collision between "Workspace" (already defined, with real access/ownership semantics) and a reported "Space" concept in separate, non-authoritative UI material this document set has not reviewed directly — flagged for explicit resolution before `03` begins, not invented here.

**Amendment 5 — Final Terminology Reconciliation.** The Workspace/Space question flagged as open in Amendment 4 is now resolved: Workspace remains the sole domain concept carrying ownership/access/membership/lifecycle/persistence/tenancy semantics; a "Space" or any similarly-named presentation-layer grouping concept may exist only as a UI convenience with none of those semantics, may never become a domain aggregate or a Workspace type, and must not be confused with Item/Collection (`02` §41, new Invariant 38). A terminology audit across `00`/`01`/`02` for Workspace, Space, Collection, Category, Object, Responsibility, Occurrence, Execution, History, Timeline, Template, Item, Relationship, and Search found every term already carrying exactly one consistent meaning within the authoritative document set — no internal collision existed; the only ambiguity was between the authoritative documents and external, non-authoritative material this document set has not directly reviewed. The Facts/Derived-State/Projections hierarchy (`02` §40) was refined to stop equating Facts with History outright — History is now stated precisely as the authoritative historical record *of* Facts for a given Object, not a bare synonym for Facts in general. Search, Relationships, Category-vs-domain separation, and the Items boundary were each re-confirmed already correctly scoped in `01`/`02` and required no further change. Note: a UI/Product Experience Completion Blueprint is referenced throughout this reconciliation as material to be brought into alignment, but no such document has been shared within this documentation project — `00`/`01`/`02` were hardened to be authoritative and self-protecting against the specific collision regardless, but the external material itself has not been directly edited.

**Amendment 6 — Defensive Hardening Without Source Verification.** A subsequent message described a "Lumora_UI_Product_Experience_Completion_Blueprint.md" in detail and requested line-by-line reconciliation against it. That file was not actually present in the project at the time (verified directly against the filesystem, not assumed) — nor were three other files the same message described as freshly uploaded. No claim about that external material's specific wording could be verified and none is treated as confirmed. Two defensive additions were made to `02` regardless, because they guard against plausible implementation mistakes independent of whether that specific material exists: Object must never carry its own "completed" field (completion belongs exclusively to Execution, scoped to one Occurrence — Section 21, Invariant 39), and any future Collection/grouping concept must never own an Object, duplicate its identity, or diverge from its Responsibility/Execution/History (Section 21, Invariant 40) — the same non-duplication boundary already enforced for Items and Space, generalized. No other change was made on the basis of unverified claims about the Blueprint's content.

**Amendment 7 — 03 Materialized; 04 First Draft.** `03_SYSTEM_ARCHITECTURE.md` was drafted and hardened across five correction-gate rounds conducted entirely in conversation, then materialized as an actual persisted file for the first time. The correction gates found and fixed: an Execution-immutability violation (an `active` field flipping on the Execution row itself, corrected to a separate Tier-2 tracking pointer); a missing `UNIQUE(correction.execution_id)` constraint the reconstruction proof depended on; a naive-NULL recovery path for `occurrence_tracking` that could have permitted duplicate Facts; imprecise "first operation wins" concurrency language corrected to sequential-evaluation-against-committed-state; an underspecified `next_due_at` given a full definition and recompute-trigger table; missing scheduler-concurrency and Skip-representation detail; and, in the final round, History being mislabeled as a "projection" of Execution/Correction when it is independently Tier-1 authoritative for the historical record. `03` is now frozen. `04_DATA_SECURITY_RELIABILITY.md` was then drafted as a first complete pass, consuming `03` without reopening it — one cross-cutting constraint was surfaced rather than invented (backup retention must be at least the 30-day deletion recovery window, or the two policies conflict), and legal retention/erasure/data-residency/compliance questions were restated as explicit OPEN DECISIONS rather than answered. `04` is a draft, not yet reviewed or frozen.
