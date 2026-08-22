# Lumora Product Vision

> **STATUS:** AUTHORITATIVE PRODUCT TARGET
> **OWNS:** Product intent, user value, user-facing behavior, scope sequencing (product framing).
> **DOES NOT OWN:** Data models, class or schema design, API mechanics, exact concurrency or locking implementation. See `02_DOMAIN_BUSINESS_LOGIC.md`, `03_SYSTEM_ARCHITECTURE.md`, `04_DATA_SECURITY_RELIABILITY.md`.
> **AUTHORITY:** See `00_DOCUMENTATION_INDEX.md`. This document is authoritative over `LUMORA_PRODUCT_SPECIFICATION.md` wherever they conflict.
>
> **On decision depth:** the decisions in this document that were previously wrong, contradictory, or actively contested — capability optionality, onboarding, category experiences vs. universal backend, templates, History vs. Timeline, Grant vs. Transfer, Lists/Items — receive the full decision-record treatment (Problem, Context, Goals, Non-Goals, Requirements, Constraints, Considered Approaches, Recommendation, Why, Trade-offs, Security/Performance/Cost implications, Failure modes, Recovery, Future evolution, Migration, Examples, Non-examples, Acceptance criteria). Smaller decisions use a tighter form (Problem → Rule → Why → Boundary) so the load-bearing decisions aren't buried in repetition.

---

## 1. Product Thesis

**One sentence:** Lumora is a personal system of record — a place where the things that matter in someone's life can carry a reminder and a persistent history of what happened, across any category, without a separate app per category.

**The actual bet, stated precisely:** the differentiator is not storage and not reminders — both exist elsewhere. It is that an object *persists and accumulates a record* rather than disappearing once "done." A completed task in a to-do app vanishes into a checked-off list. A car in Lumora remains a living thing with a service history that keeps growing. That distinction is the entire value proposition, and it only pays off if it is *felt*, not merely true underneath the surface — see Section 12 (Category-Specific Experiences) for how this document resolves that tension.

## 2. Product Definition

Lumora helps a person organize and operate the things that matter in their life: what exists, what needs to happen around it, who is allowed to see or act on it, and what has already happened. The platform underneath is universal. The product experienced by a first-time user is deliberately narrow and simple — see Section 5.

## 3. The Problem Lumora Solves

- Things that matter get scattered across notes apps, reminder apps, calendars, spreadsheets, and memory — each with its own mental model the user has to re-learn.
- Recurring responsibilities (medication, maintenance, renewals) lose their history the moment they're marked done — there is no accumulated record of what actually happened over time.
- Existing reminder tools treat "done" as an ending. Lumora treats it as one more fact layered onto something that keeps existing.
- Family/shared coordination tools force an all-or-nothing choice between full visibility and no visibility, with no natural way to keep some information private while sharing the rest.

## 4. Target Users

### 4.1 Primary — the Individual
One person, using Lumora with nobody else depending on them. No family workspace exists yet. This is the entire launch product.

### 4.2 Secondary — Family / Household
The same individual, once they choose to bring in other people — a spouse, children, roommates, a caregiver. Not a different buyer or a different persona; an expansion of the first one's usage. Family is **discovered**, never required.

### 4.3 Future — Organizations, Companies, Service Providers, Other Collaborative Contexts
Teams, clubs, schools, businesses, equipment/work-order workflows, and time-limited external access for contractors or service providers. The underlying model (Section 9) is deliberately shaped so these can be added later without a rewrite — see Section 7.2 for exactly what "future" protects and what it explicitly does not build now.

## 5. Product Principles

1. **Trust before delight.** Correctness and privacy outrank animation, AI, or gamification, always.
2. **Objects are durable context, not disposable tasks.** A responsibility should never lose the object, history, or people that explain it.
3. **Responsibility is not the same thing as the object it concerns.** They are separate ideas the user experiences as connected, not as one.
4. **Private by default.** Sharing is explicit and reversible; nothing becomes visible to anyone by accident.
5. **Value in seconds, not after configuration.** A real, useful object should exist within the first minute of use.
6. **One platform, many experiences.** The storage and access foundation is universal; the surface the user sees can be — and should be — specialized per category.
7. **Optional systems degrade safely.** Search, notifications, AI, gamification, and analytics never decide core truth and never block core actions when they fail.
8. **No category worship.** Plant, Medicine, Grocery, and Vehicle are never separate foundational systems, regardless of how specialized their UI becomes.

## 6. Scope Sequencing

**NOW:** Personal. **NEXT:** Family. **LATER/FUTURE:** Organizations, Companies, Service Providers, other collaborative contexts.

**Why future contexts must not shape the initial product**, stated as its own decision, because this has previously been violated in practice (the prior repository contained a full package-manager-style template installation engine and a generic capability-plugin runtime — infrastructure built for hypothetical future flexibility with no current user to validate it against):

- **Problem:** "the architecture must support X eventually" is repeatedly, and wrongly, read as "the product should expose or prepare for X now."
- **Rule:** the architecture preserves the *extension points* future contexts will need (Section 9, Section 15's Access model). The product surface — onboarding, terminology, default screens, pricing — is designed exclusively around the individual and, next, the household. Nothing about Organizations, Companies, or Service Providers appears in V1 copy, V1 screens, or V1 setup flow.
- **Why:** designing onboarding or positioning around personas that don't exist yet dilutes the one persona that does, and every prior round of this project's own analysis found that the times this rule was broken in practice, it produced unused, unvalidated infrastructure rather than future-readiness.

## 7. The User's Mental Model

The user should never need to think in terms of Object, Responsibility, Occurrence, Execution, Workspace, Template, Access, or Event. Those are the system's internal vocabulary, defined authoritatively in `02_DOMAIN_BUSINESS_LOGIC.md`. What the user actually thinks is one of:

- "I need to keep track of this."
- "I need to remember something."
- "I need to do this — or someone else needs to."
- "I need to know what happened."
- "I want to share this, but not everything."

Every product surface in this document exists to translate one of these five plain intentions into the underlying model without ever asking the user to understand the model itself.

## 8. Universal Object Philosophy

**Problem:** the product must support representing anything a user cares about — including things Lumora's designers never anticipated — without requiring a new backend model, service, or database structure per category, while also not forcing every object into identical, maximal structure.

**Context:** this is the foundational decision the rest of the product is built on. Getting the boundary wrong in either direction is costly: too rigid, and the platform becomes a curated app with a fixed category list (defeating the entire thesis); too generic, and every object forces the user through configuration they don't want (defeating "value in seconds").

**Goals:** one consistent way to represent anything; no forced structure; ability to start minimal and grow.
**Non-goals:** a no-code database builder exposed to end users; a system where every object must have every possible feature to be "complete."

**Requirements:**
- Every object has a stable identity, is private by default, and accumulates history automatically. These three are never optional — see 8.1.
- Beyond that, every other capability is opt-in and additive — see 8.2.

**Constraints:** the user must never be asked to decide, at creation time, which capabilities an object will "support" — capabilities are added when invoked, not configured in advance.

**Considered approaches:**
- *Category-specific schemas per object type* — rejected; recreates PlantEngine/MedicineEngine, defeats the entire universal-model thesis.
- *One rigid schema all objects must fully populate* — rejected; forces configuration on users who just want "Plant + a photo," violating Principle 5.
- *Fully freeform, schema-less objects with no guaranteed structure at all* — rejected; without guaranteed Access and History, the product can't make its core trust promises.
- **Recommended: a small set of always-present guarantees plus a larger set of genuinely optional, composable capabilities.**

### 8.1 Core Guarantees — never optional, never configured

| Guarantee | What it means to the user |
|---|---|
| **Object identity** | The thing exists, persists, and can always be found again — it doesn't disappear because a related reminder was dismissed or completed. |
| **Access** | Private by default the moment it's created. Nobody sees it unless the user (or, in Family, the sharing rules — Section 20) explicitly makes it visible. |
| **History** | What happened to this object is remembered automatically, without the user turning anything on. See Section 19 for why this is a guarantee, not a feature. |

### 8.2 Optional, Composable Capabilities

| Capability | What invoking it looks like to the user | Absent by default? |
|---|---|---|
| Notes / details | Free text, a photo, a description | Yes |
| Attachments | A file or document attached to the object | Yes |
| Responsibility (which carries Schedule → Occurrence → Execution, and an optional Notification) | "Remind me to do this" | Yes |
| Items | A checklist inside the object (see Section 18) | Yes |
| Relationship | Linking one object to another | Yes — deferred past V1 entirely, see Section 28 |

**Why:** this split is what makes "start simple, enrich later" true structurally rather than aspirationally. A plant with just a photo and a plant with a full watering schedule, fertilizing schedule, and history are the same underlying thing at different points of enrichment — never two different kinds of object.

**Trade-offs:** a fully generic, maximally flexible model is architecturally tempting but user-hostile if exposed directly (see Section 13's Quick Add resolution for how the product hides this flexibility behind fast defaults). The chosen split accepts a small amount of product-design discipline (deciding what's core vs. optional, once) in exchange for never forcing that decision onto the user per-object.

**Security implications:** because Access is a guarantee rather than a toggle, there's no configuration path where a user accidentally creates something world-visible by not thinking about it — the safe state is the only state.

**Performance implications:** optional capabilities that are never invoked create no data and cost nothing — a plain note-only object is cheap regardless of how rich the platform's full capability set is.

**Failure modes / Recovery:** if a capability's supporting system fails (e.g., attachment upload fails), the object itself remains valid and usable; the failure is visible and specific to that capability, never to the object's existence.

**Future evolution:** new capabilities can be added to the optional set later (Relationships is the clearest current candidate — Section 28) without touching the core guarantees or any existing object.

**Examples:** "My Plant" with only a photo and a note. "My Plant" with a photo, a watering Responsibility, and three months of watering History. Both fully valid, both the same kind of thing underneath.
**Non-examples:** an object that cannot exist without a Responsibility attached (violates optionality). An object whose History can be turned off (violates the guarantee — see Section 19).

**Acceptance criteria:** a user can create an object using only the always-present guarantees and never be prompted to configure anything else; a user can later attach any optional capability to that same object without re-creating it; removing an unused optional capability (e.g., disabling notifications) never affects Access or History.

## 9. Object Categories Are Not Separate Systems

Plant, Medicine, Grocery, Vehicle, Pet, Document, Passport, Habit, Appointment — none of these are domain models, engines, or backend services. Each is a **starting configuration** (Section 10) applied to the universal Object described in Section 8. A user can also create something with no starting configuration at all — see Section 11. This is the mechanical guarantee that makes "the user can create something Lumora never anticipated" literally true rather than aspirational: every optional capability attaches to the object itself, never to a category name.

## 10. Templates

**Problem:** users benefit from curated starting points ("Plant" pre-suggests a watering responsibility) but must never have their data depend on that starting point continuing to exist, and Lumora's team must be able to maintain the catalog without risking existing users' data.

**Context:** this was previously over-solved — an earlier implementation built full package-manager-style install/upgrade/rollback machinery for what should be static starter content. That is explicitly rejected here.

**Goals:** fast, useful starting points; a catalog that can evolve; zero risk to existing objects when it does.
**Non-goals:** template versioning as a live dependency; templates depending on each other; a user-facing schema designer.

**Requirements:**
- Selecting a template **copies** its suggested fields, capabilities, and starter Responsibility configuration into the newly created object at that moment.
- After that moment, the object is independent. It does not re-read the template, does not break if the template changes, and does not break if the template is retired.
- An administrator can manage the starter catalog (add, edit, retire) without any risk to existing objects, because existing objects no longer reference the template's live content.

**Constraints:** a template that has ever been used to create at least one object can be retired (removed from what new users can select) but must never be deletable in a way that would affect those objects.

**Considered approaches:**
- *Live reference* (object always reads current template state) — rejected; this is precisely what makes template retirement dangerous, and is the root cause the earlier over-built lifecycle machinery was trying to compensate for.
- *Full versioned dependency system* (objects track template version, can "upgrade") — rejected for V1; solves a problem that doesn't exist once snapshotting is real, and is exactly the shape of the previously over-built system.
- **Recommended: snapshot-on-select, template retirement is a simple visibility change, not a data operation.**

**Why:** this is the smallest mechanism that fully satisfies the non-negotiable requirement ("template retirement must never destroy existing user data") without building machinery to manage a dependency that, once snapshotted, no longer exists.

**Trade-offs:** if the team wants to push an improved version of a template to existing objects, that must be an explicit, visible, user-approved action later (a dismissible "an updated version of this template is available" nudge is a reasonable future addition) — never automatic. This is an accepted trade-off, not a gap: automatic propagation would silently reintroduce the live-dependency risk this design exists to avoid.

**Failure modes / Recovery:** if the template catalog is temporarily unavailable, existing objects are entirely unaffected (they hold their own copied data); only the ability to *start something new from a template* is degraded, and custom-object creation (Section 11) remains available as a fallback.

**Future evolution:** a user saving their own customized object as a personal, reusable starting point is a distinct, plausible future feature — explicitly named as an open item in Section 29, not assumed.

**Examples:** the "Plant" template is edited to suggest fertilizing in addition to watering — existing plant objects are unaffected; only plants created after the edit see the new suggestion. **Non-examples:** an object that stops working, loses fields, or shows an error because its template was retired.

**Acceptance criteria:** retiring a template removes it from what new users can select and has zero observable effect on any existing object; editing a published template never changes any already-created object.

## 11. Custom Objects

A user can create something with no template at all — "My Aquarium," "My Camera Collection," anything. This uses the exact same object mechanics as a template-backed object (Section 8): the only difference is that no starter configuration was copied in. This is the direct test of Section 1's thesis, and the product must never make this path feel like a downgrade from the templated path — it should feel equally first-class, just starting blanker.

**Boundary:** custom objects support the same optional capabilities as any object. They do not support arbitrary user-defined logic, automation, or access-policy overrides — a user can decide *what* their object tracks, never *how the platform enforces access or correctness*.

## 12. Category-Specific Experiences

**Problem:** a backend that is genuinely universal risks producing a UI that feels generic — form fields and a reminder toggle, indistinguishable from a spreadsheet-with-templates — which directly undermines Section 1's thesis, since the product's real advantage (persistent, history-bearing objects) is a slow-reveal value that pays off over weeks, not something a first session can feel on its own.

**Context:** earlier analysis in this project flagged this as an unresolved tension between "no category-specific backend" and "must feel like a finished consumer product." This section resolves it as an explicit product decision, not a deferred hope.

**Goals:** the user should feel that Lumora understood the thing they created, from the first session. **Non-goals:** a different backend, service, or data model per category.

**Requirements:**
- Every category (Plant, Medicine, Grocery, Vehicle, Pet, etc.) gets curated presentation: category-appropriate icon and visual language, category-appropriate microcopy ("Water plant" / "Take medicine" / "Check off item" instead of generic "Complete"), and category-appropriate quick-add fields (a grocery item asks for quantity; a medicine asks for dose and times; a plant asks for watering frequency).
- Over time, specific categories may earn a genuinely richer, more detailed experience (a dedicated plant page with richer visual treatment, a medicine-focused adherence view, a fast dedicated grocery-checking interface). These are explicitly desired, not merely tolerated.
- Every one of these experiences consumes the same universal object data and the same optional capabilities described in Section 8 — nothing about them requires a category-aware backend.

**Constraints:** a rich category experience must degrade gracefully to the generic object experience (Section 17) if the category isn't one that has received special UI treatment yet — a custom object with no curated experience must still be fully usable, not second-class.

**Considered approaches:**
- *Fully generic UI for everything, no category specialization ever* — rejected; this is what produces the "feels like a spreadsheet" risk this section exists to prevent.
- *A separate application or module per category* — rejected outright; recreates PlantBackend/MedicineBackend by another name, the single most explicitly forbidden pattern in this project.
- **Recommended: one universal backend and object model, with a presentation layer that is free to be as specialized as the product needs, per category, growing over time.**

**Why:** this is the only approach that satisfies both halves of the requirement simultaneously — it makes "the backend is universal" and "the user should feel understood" compatible instead of contradictory.

**Trade-offs:** category-specific presentation is real, ongoing product/design work, not a one-time architectural decision — the team should expect to keep investing in curated experiences for the categories that matter most to users, and should treat this as core product work, not polish.

**Security implications:** none — presentation logic never determines access or authorization; those remain governed entirely by Section 20 regardless of which category a category experience is dressed as.

**Performance implications:** category-specific UI must not require category-specific queries; it renders from the same object payload every category uses.

**Future evolution:** new categories automatically get the generic experience immediately, and can graduate to a curated experience later purely as a presentation investment — never a backend one.

**Examples:** a "Medicine" object rendered with dose-and-schedule-focused UI, privacy-aware presentation, and adherence-oriented language — while, underneath, being exactly the same Object + Responsibility structure as "Vehicle" with service-focused UI. **Non-examples:** a "Medicine" object that is stored, queried, or validated differently from a "Vehicle" object at the platform level.

**Acceptance criteria:** adding a new curated category experience never requires a new table, service, controller, or backend model — only new presentation content and, if genuinely warranted, a template addition.

## 13. Quick Add

The fastest path from intention to a real object. The user types or says what they want to track; the system matches it against known categories where possible and falls back to a plain custom object where it can't. The initial guess is always visible and editable in the same screen — never a silent, unrecoverable assumption, and never a multi-step wizard. Suggested Responsibilities (e.g., "want a watering reminder?") are offered as a single, dismissible, one-tap nudge — never a required field.

**This matching quality is real product work**, not a solved problem the backend hands the UI for free. Getting "remind me to water my plants every 3 days" to correctly produce a Plant object with a 3-day watering Responsibility is the single hardest product-surface problem in this document, and should be resourced accordingly rather than assumed to fall out of the domain model automatically.

## 14. Onboarding & First Value Journey

**Problem:** the previous baseline specification's onboarding flow included a forced first step — "select personal/family goal" — before the user reached any value. This directly contradicts the explicit, repeated product rule against forced configuration before value, and is corrected here, permanently.

**Context:** this is not a wording fix; it is a behavioral contradiction that would have shipped a real onboarding-drop-off risk if built as previously specified.

**Goals:** the fastest possible path to a real, useful object. **Non-goals:** data collection, life-inventory questionnaires, forced categorization.

**Requirements:**
- A Personal workspace is created automatically and invisibly the moment the account exists. The user is never asked to acknowledge, name, or configure it.
- The very first screen after authentication is Quick Add itself — not a screen that precedes it.
- Family is never mentioned, offered, or hinted at during onboarding. It is discovered later exclusively through explicit user action (Section 20).
- Notification permission is requested contextually, at the moment the user's first Responsibility is created — never upfront, before it means anything.

**Considered approaches:**
- *"Select Personal or Family" as step one* — **rejected outright**; this is the specific defect being corrected.
- *A short preference questionnaire before first use* — rejected; violates "value before configuration."
- **Recommended: Install → authenticate → Quick Add → first object → contextual next steps.**

**Why:** every prior round of product analysis in this project converged on the same rule independently; the one place it was violated was a document, not a product decision, and this correction restores consistency between stated principle and specified behavior.

**Failure modes:** if a user abandons before completing Quick Add, nothing was lost — no partial account setup, no half-filled questionnaire to resume.

**Acceptance criteria:** zero required screens exist between authentication and the first Quick Add interaction; no product copy references Family, Organizations, or any workspace concept until the user takes an explicit action to create or join one.

### 14.1 First 60 Seconds
User signs in, is presented with Quick Add directly, creates one real object. Lumora shows it, in category-appropriate presentation (Section 12), immediately. Nothing else is visible yet.

### 14.2 First Day
User adds a few more objects, possibly across different categories. If they created something recurring, a reminder fires and gets completed — the first real proof of the trust promise (Section 25). Object detail (Section 17) shows history has already begun accumulating, with zero setup.

### 14.3 First Week
Reminders continue firing reliably — this is the moment retention is actually won or lost (Section 26's success criteria are built around this). The user has not yet been asked about Family, sharing, or any advanced capability unless they sought it out themselves.

## 15. Today / Home Experience

Answers exactly one question: "what needs my attention right now?" Shows responsibilities due or overdue, and recently added objects. It must never be a dashboard of empty placeholder widgets — if the user has added three things, Today shows exactly those three things' relevant state, not six empty category cards inviting configuration. Once Family exists (NEXT), whether Today merges Personal and Family items by default or requires an explicit toggle is an open product decision — see Section 29.

## 16. Notifications

Notifications are strictly optional and nested under Responsibility (Section 8.2) — a schedule never implies a notification automatically. Requested contextually per Section 14. Content generation must consult the object's privacy sensitivity (Section 21) before composing the message shown on a lock screen: an elevated-sensitivity object produces generic notification text ("You have a reminder") rather than exposing specifics before the device is unlocked. This is a product rule regardless of platform; exact enforcement mechanics belong to `04_DATA_SECURITY_RELIABILITY.md`.

## 17. Object Experience

A single, coherent place for everything about one thing: its details/notes, its attachments, its responsibilities (if any), and its history — automatically present, never separately enabled. Category-specific presentation (Section 12) changes how this is arranged and worded; it never changes what data exists underneath. This screen is where Section 1's thesis becomes visible to the user, and its design quality should be treated as the single most important screen in the product.

## 18. Lists & Items

**Problem:** a grocery list is a genuinely different shape from a recurring responsibility (checking off an item is not "completing an occurrence"), but without a clear boundary, "Items" risks growing into a second, parallel object platform with its own capabilities, access rules, and history.

**Context:** this is an explicitly flagged risk from prior analysis — the danger isn't that Lists don't deserve a lightweight mechanism, it's that the mechanism could quietly acquire the full weight of Section 8 if not bounded.

**Goals:** fast, lightweight checklist behavior; safe simultaneous editing by multiple people (relevant the moment Family exists). **Non-goals:** items with their own attributes, their own Responsibility, or their own History entries.

**Requirements:**
- An Item supports: text, checked state, quantity, unit, and ordering. Nothing else.
- Two people must be able to check off *different* items on a shared list at the same time without either change overwriting the other. This is a product-level correctness requirement, not a nice-to-have — the exact mechanism belongs to `02`/`04`, but the guarantee itself is specified here because it's user-visible behavior.
- An Item never independently accumulates its own history log; the list's own history (as an object) covers meaningful changes.

**Considered approaches:**
- *Force grocery items into the full Responsibility model* — rejected; wildly disproportionate overhead for "checked or not," explicitly the wrong pattern per prior analysis.
- *Items as one blob of data on the list object, no independent identity* — rejected; this is exactly what breaks the concurrent-editing requirement above, since two simultaneous changes to one blob can silently overwrite each other, the same category of correctness bug as double-completing a responsibility.
- **Recommended: Items as lightweight, independent child records of a List-shaped object, each editable independently.**

**Trade-offs:** this is one more concept than "just store an array," but it's the only option that satisfies the concurrent-editing requirement, which is not optional once Family exists.

**Future evolution:** if a genuine need for per-item reminders emerges later, that item should become a full Object instead of Items acquiring Responsibility capability — the boundary stays fixed; the item graduates, the mechanism doesn't expand.

**Examples:** "Grocery List" object with Items: Milk, Rice, Bread — each independently checkable. **Non-examples:** an Item with its own due date and notification (that's a Responsibility on its own Object, not an Item).

**Acceptance criteria:** two users checking different items on the same shared list simultaneously never lose either change; an Item never appears in any history view independently of its parent list's own history.

**Resolved (was previously an open item):** a completed shopping list resets in place by default — items uncheck automatically and the same list is reused for the next trip, with zero extra decision required from the user. A lightweight summary record of "list completed on [date]" is preserved (Section 7 of `02`) so shopping history isn't lost even though individual items reset. A user who wants a specific trip's contents preserved as its own permanent record can Archive that list and start a fresh one — an ordinary, general-purpose action, not a new list-specific feature. See Section 34 for the full reasoning.

## 19. History vs. Timeline

**Problem:** the previous baseline specification described History as both a core, non-negotiable foundation (in one section) and a degradable, delay-tolerant projection (in another). This is not a nuance — it determines whether "who completed this and when" can ever be lost or delayed, which is directly load-bearing for the product's core trust promise (Principle 1).

**Context:** this contradiction was identified through direct adversarial review and is corrected here as a permanent, non-negotiable product rule.

**Requirements:**
- **History** is core. It records meaningful facts (an object was created, a responsibility was completed, access was changed) and is guaranteed consistent with the change it describes — the fact and its history record are never out of sync, delayed, or independently lost.
- **Timeline**, if the product ever presents one (a "recent activity" style view), is a *separate, optional, presentational* layer built on top of History. It may lag, may need to be rebuilt, and its temporary unavailability never means History itself is wrong or missing.
- These two are never referred to, designed, or documented as one subsystem again.

**Why:** a user who completed a responsibility must be able to trust that fact is permanently and immediately recorded — that trust is the product's entire differentiation from a disposable to-do list (Section 1). Making that guarantee depend on an optional, best-effort projection would quietly break the core thesis while looking, on paper, like a reasonable performance optimization.

**Failure modes / Recovery:** if a Timeline-style feed is temporarily unavailable or stale, the user can still open any object and see its accurate, complete history directly — nothing is ever lost, only a convenience view is temporarily degraded.

**Non-examples:** "the completion succeeded but the history entry is still processing" is not an acceptable state for History; it is an acceptable, expected state for a Timeline feed.

**Acceptance criteria:** it must be structurally impossible for an object to show a completed responsibility while its history does not yet reflect that completion.

## 20. Access & Sharing

**Problem:** Personal and Family need to share one foundation without either forcing everything into one visibility model or requiring two different products. Two genuinely different operations — sharing something while still owning it, and permanently giving it away — were previously conflated under one "sharing" concept.

**Goals:** private by default; sharing explicit and reversible; ownership and visibility clearly separable.
**Non-goals:** ownership transfer as part of V1; field-level permission granularity (Section 21 handles the one real gap this creates, narrowly).

**Requirements:**
- **Grant Access**: the default, reversible, V1-only mechanism. The object's owner does not change; visibility extends to selected people or the whole Family workspace. Revoking a grant is immediate.
- **Transfer Ownership**: a distinct, permanent operation ("this is genuinely the family's car now, not just mine") — explicitly future scope, not built in V1.
- Ownership, visibility (who can see), and responsibility-assignment (who is expected to act) are three independent things. A person can be assigned a responsibility on an object without owning it or without having been separately granted broad visibility into it.

**Considered approaches:**
- *One combined "share" action that sometimes moves, sometimes grants* — **rejected**; this was the earlier flaw. Collapsing a reversible action and a permanent one into the same gesture is a real design mistake users would eventually be burned by.
- *Require ownership transfer for anything to be usable by family members* — rejected; destroys the "I still own my stuff" property the model explicitly protects.
- **Recommended: Grant only in V1; Transfer named and deferred explicitly, never silently.**

**Why:** this keeps sharing safe-by-default and reversible, which matters most in the exact moment it's most tempting to skip carefully — inviting a new family member and deciding what they can see.

**Trade-offs:** "everything I can see" becomes a slightly more complex question once grants exist (owned-by-me, plus granted-to-me) — an accepted cost for keeping ownership and visibility honest and separate.

**Examples:** a user creates a Family workspace; their existing Personal objects are **not** automatically shared — nothing moves by default. Sharing "the family car" grants Family visibility while the user remains its owner. **Non-examples:** creating a Family workspace silently exposing personal history to new members (this must never happen); a "share" action that quietly changes who owns the object.

**Acceptance criteria:** creating or joining a Family workspace has zero effect on any existing Personal object's visibility; every grant is independently revocable without affecting ownership.

**Resolved (was previously an open coherence question):** when a user creates something directly within the Family workspace — as opposed to sharing an existing Personal object into it — choosing "Family" as the creation context *is itself* the explicit sharing decision. There is no redundant second "now share it" step for the common case of creating something for the household. The single exception: an elevated-sensitivity object (Section 21) created within Family stays private to its creator by default, exactly as it would in Personal, until they take an explicit, separate action to share it more narrowly. The creator remains the object's sole owner either way — see Section 37 for the full reasoning.

## 21. Privacy Sensitivity

Some objects deserve more conservative default sharing than others, independent of category — most notably Personal Care and health-related information. This is a **general, product-level property** ("this kind of thing gets a more conservative default"), never a special code path tied to being literally named "Medicine." The formal mechanism belongs to `02`; the product rule is: when an elevated-sensitivity object is shared into Family, its default visibility is narrower than an ordinary object's, and notification content about it stays generic (Section 16) regardless of platform.

**Resolved scope (was previously open):** Sensitivity is decided at the **object level only** for V1 — a single Standard/Elevated classification per object. Field-level and attachment-level sensitivity (e.g., one especially sensitive document attached to an otherwise ordinary shared object) are explicitly **not** built now; this remains a plausible, narrowly-scoped future refinement, not silently dropped, just deliberately deferred. Elevated status is **template-suggested by default** (e.g., Medicine, Passport, and Doctor Appointment templates default to Elevated as authored content — a configuration choice, never a code-level category check) and is always user-overridable on any object, template-backed or custom. Custom objects default to Standard unless the user explicitly marks them Elevated.

## 22. Canonical Use Cases

| Object | Typical capabilities invoked | If left minimal | Sharing behavior |
|---|---|---|---|
| Plant | Responsibility (recurring) | Just a note and photo — fully valid | Ordinary default |
| Medicine | Responsibility (recurring, multiple times/day) | Just a record of what's taken | Elevated sensitivity default |
| Grocery List | Items | N/A — a list needs no schedule to function | Ordinary default, concurrent editing safe |
| Doctor appointment | Responsibility (single occurrence) | Doesn't apply — the date is the point | Elevated sensitivity default |
| Vehicle | Responsibility (recurring — e.g., every 6 months for service), Attachments | Just ownership record + documents | Ordinary default |
| Pet | Responsibility (recurring) | Just a profile | Ordinary default |
| Passport | Responsibility (yearly recurrence supported for renewal reminders; single-occurrence also valid) | Just stored info | Elevated sensitivity default |
| Document | Attachments, occasionally Responsibility | Just storage | Depends on document type |
| Habit | Responsibility (recurring, self-only) | Doesn't apply — inherently scheduled | Rarely shared |
| Custom (unanticipated) | Whatever the user invokes, if anything | Just a record — the actual test of the whole model | User's choice |

## 23. Edge Cases

- **Concurrent completion:** if two people complete the same responsibility occurrence at nearly the same moment, the one who loses the race sees "already completed by [name] at [time]" — never a raw error.
- **Offline completion:** a completion made while offline and synced later behaves exactly as if it had happened live — never creates a duplicate record.
- **Missed occurrence:** must remain visible to the user as missed, never silently dropped.
- **Skip vs. Pause vs. Cancel** are three different user intentions and must be offered as three different actions: "not today" (skip, no effect on future), "stop reminding me for a while" (pause, resumes automatically), "I'm done with this entirely" (cancel, permanent, history preserved).
- **Family member removed:** their assigned responsibilities become unassigned and reassignable — never deleted, and history involving them is preserved.
- **Template retired mid-use:** zero effect on any existing object (Section 10).
- **Sensitive object shared into Family:** defaults narrow (Section 21); expanding visibility further requires an explicit action, never happens by default.

## 24. Product Boundaries — What Lumora Is Not

Not a clinical/medical decision system. Not a generic chat product. Not a social feed. Not a payment processor. Not a generic no-code database builder exposed raw to end users. Not a company ERP/CRM at launch. Not a game — gamification, if it exists, is a presentation layer that never alters correctness. Not an AI-first product — AI, if it exists later, is optional and Lumora must fully function without it.

## 25. Product Differentiation

Not "everything in one place" alone — Notion and Airtable already offer that, with more flexibility. The real differentiators: against reminder apps, objects persist and accumulate history instead of disappearing on completion. Against Notion/Airtable, the platform does the schema work so the user doesn't have to. Against family-organizer apps, Personal-first sequencing means the product delivers value to one person before ever asking about a household. [Speculative, not yet user-validated] This thesis only holds if category experiences (Section 12) make the difference *felt* in the first session, not just true in the data model.

## 26. Product Risks

- A generic-feeling V1 that doesn't make its real differentiation felt early enough — directly mitigated by Section 12's category-experience requirement, but that mitigation is only as good as the actual design investment behind it.
- Unreliable reminders breaking trust in week one — the single highest-stakes technical dependency of the entire product thesis.
- Requesting notification permission at the wrong moment (too early) suppressing opt-in for the mechanism retention depends on — addressed by Section 14's contextual-timing rule.
- Scope dilution toward future contexts before Personal/Family are validated (Section 6).
- The internal framing "Personal Life Operating System" leaking into user-facing copy — it is an internal thesis statement, not consumer language, and must never appear in onboarding, app-store copy, or first-run screens.

## 27. Success Criteria

How V1 will be judged as working, not just shipped:
- D30 retention, specifically segmented by whether the user created two or more *different* object categories — tests whether universality itself drives engagement, not just reminders in general.
- Reminder delivery success rate — the single most trust-critical metric in the product.
- Time from install to first object created, and separately, time to first *completed* responsibility — the two halves of the first-value moment.
- Completion rate on fired reminders — ignored reminders predict churn before churn is otherwise visible.
- Custom-object creation rate — direct signal on whether the product is perceived as a platform or a fixed-category app.

## 28. Roadmap Summary (Product Framing — engineering-level sequencing lives in `05`)

- **NOW (V1):** Personal only. Core guarantees + optional capabilities (Section 8), 5–8 curated templates plus real custom objects, Quick Add, Today, Object experience, reliable reminders, Items/Lists.
- **NEXT:** Family — Grant-based sharing, invitations, role defaults (adult/limited), family-aware Today.
- **LATER:** Transfer Ownership, user-saved personal templates, Relationships, richer category-specific experiences beyond the initial set, search.
- **FUTURE:** Organizations, Companies, Service-provider scoped/temporary access, AI, chat, deep integrations, multiple languages.

## 29. Open Product Decisions

Updated following a full cross-document consistency and decision-resolution pass. Marked explicitly rather than silently assumed.

**Resolved by this pass** (kept here as a pointer, not restated — see the section named):
- Grocery list reset vs. archive → resolved, Section 34.
- Per-occurrence overrides → domain semantics resolved, Section 35 (build timing remains a `05` roadmap sequencing question, not a product ambiguity).
- Execution correction/undo → resolved, Section 32.
- Same-field concurrent editing → resolved, Section 33.
- Object deletion/recovery lifecycle → resolved, Section 31.
- Objects created within Family (ownership/visibility) → resolved, Section 37.
- Template administration and usage visibility → resolved, Section 38.

**Still genuinely open:**
- **OPEN DECISION:** once Family exists, does Today merge Personal and Family items by default, or require an explicit toggle? Not addressed by this pass.
- **OPEN DECISION:** should users be able to save their own customized object as a personal, reusable starting template (distinct from customizing a single instance)? Named as plausible future work, not committed.
- **OPEN DECISION:** what happens to a Family workspace if its sole owner leaves or deletes their account — is there a succession model, or is this out of scope until Organizations exist? Account deletion itself is now resolved (Section 31.4), but Family *ownership succession* specifically (who becomes responsible for a shared workspace) remains open.
- **OPEN DECISION (newly surfaced):** legal/policy-driven data retention and right-to-erasure requirements — deliberately not invented in this pass; requires legal/policy input before `04_DATA_SECURITY_RELIABILITY.md` can treat it as settled.

## 30. Terminology Quick Reference

Plain-language gloss only — authoritative definitions live in `02_DOMAIN_BUSINESS_LOGIC.md`.

- **Object** — a thing that exists and matters.
- **Access** — who can see or act on it; private by default.
- **History** — what happened to it, remembered automatically and authoritatively.
- **Responsibility** — what needs to happen around it.
- **Occurrence** — one specific due instance of a responsibility.
- **Execution** — the record of what actually happened for one occurrence.
- **Item** — a lightweight entry inside a list-shaped object.
- **Template** — a starting configuration; independent of the object once selected.
- **Workspace** — the context (Personal or Family) an object lives in.
- **Grant** — reversible, explicit sharing that does not change ownership.
- **Transfer** — permanent change of ownership; future scope.
- **Correction Window** — a short period after completing something in which the user who did it can undo that specific mistake.
- **Corrected** — the honest status shown when something was completed and then undone after its due time had passed — different from never having done it at all.
- **Sensitivity** — a general flag marking an object for more conservative default sharing and notification behavior, independent of category.

---

# Amendments — Cross-Document Consistency & Decision Resolution Pass

The sections below were added in a dedicated correction pass after `01` and `02` were first approved, specifically to resolve items that were correctly left open at the time and to fix places where `02` had begun defining product-facing behavior (Object lifecycle states) that `01` had not yet framed. Each section below is authoritative product framing; full domain mechanics for the same decisions live in the correspondingly-named sections of `02_DOMAIN_BUSINESS_LOGIC.md`.

## 31. Object Lifecycle: Archive, Delete, Restore, Account Deletion

**Problem:** `02_DOMAIN_BUSINESS_LOGIC.md` had already defined Object states (Active/Archived/Deleted/Erased) because the domain needed them to be coherent, but `01` had never established the product-level need or user-facing behavior for this — a genuine gap between the two documents that this section closes.

**Should Archive and Delete be separate actions?** Yes. They answer different user intentions: Archive means "I don't need to see this in my regular views right now, but it's not over" (a sold car's records, a finished project). Delete means "I want this gone." Collapsing them would force users into the wrong one for common, everyday cases.

**Recommendation:**
- **Archive** — reversible, hides the object from default views (Today, default lists) with zero data loss. Restorable anytime.
- **Delete** — removes the object from every product surface immediately, for everyone who had visibility into it, but is recoverable for **30 days** before permanent purge. This window is a deliberate UX safety net for the common accidental-deletion case — not a legal retention policy, which remains a distinct, separately-governed question (Section 29).
- **Account deletion** — applies this same Delete/recovery-window pattern to everything the user owns at once, rather than being a separate concept. Objects they merely have visibility into (shared Family objects they don't own) are unaffected beyond losing their own access to them.

**Why:** reusing one lifecycle pattern for both ordinary object deletion and account deletion means the user only ever needs to learn one mental model, and it matches the general "additive, not a new engine" principle that runs through this whole specification.

**User impact:** an accidental "delete" tap, or even a full account closure, is never instantly and irreversibly catastrophic — there's always a real window to reconsider.

**Trade-offs:** History and other data for a deleted object linger for 30 days even though the object is invisible everywhere — an intentional, small storage cost in exchange for genuine recoverability.

**Future impact:** legal/policy-driven retention and right-to-erasure requirements are a distinct, separate concern from this UX-driven recovery window and remain explicitly open (Section 29) — they will layer on top of, not replace, this behavior.

## 32. Execution Correction

**Problem:** completing the wrong thing by mistake — tapping "water plant" when you didn't — is common, and a product that can't correct an obvious immediate mistake erodes exactly the trust it's trying to build.

**Recommendation:** a **10-minute Correction Window** after completing something. Within that window, the person who completed it (and only that person, in V1) can undo it — the item returns to its normal due/pending state, as if not yet acted on. After 10 minutes, the completion is permanent.

**Why not longer, or unlimited?** An unbounded "edit my history" capability would undermine the very trust guarantee (Section 19) that makes Lumora different from a disposable checklist — the whole point of History is that it can be relied on. Ten minutes is long enough to catch an obvious immediate mistake, short enough that it can never become a general-purpose way to rewrite what happened.

**Why only the original person, not anyone with access?** In a shared Family context, letting anyone "undo" someone else's completion invites real conflict (disputed corrections). Keeping this narrow to the original actor avoids that entirely for V1.

**What the record shows:** nothing is ever erased. The original completion stays in history exactly as it happened; the correction is recorded as its own event ("this was corrected"). A curious family member can always see both facts — that it was marked done, and that it was then undone — never a silently rewritten past.

**User impact:** the single most common accidental action in the product now has a real, honest fix, without weakening the trust guarantee everything else depends on.

**Trade-offs:** a mistake noticed after 10 minutes, or noticed by someone other than the person who made it, has no fix in V1 — accepted as a deliberate scope boundary, not an oversight; a broader, separately-designed correction capability remains a reasonable future addition.

## 33. Concurrent Editing (Same Field, Same Object)

**Problem:** two family members editing the same object's name at nearly the same moment — one changes "Plant" to "Money Plant," the other to "Golden Money Plant" — needed a defined, honest behavior.

**Recommendation:** if this happens, the second person's edit is not silently applied and not silently thrown away. They're shown that someone else already changed it, and can decide whether to keep their own edit.

**Why not just let the last person's edit win?** Silently discarding someone's edit without telling them is exactly the kind of small trust violation this specification has repeatedly rejected elsewhere (Section 5's principles) — a family member who renamed something and later finds their change reverted, with no explanation, will reasonably distrust the app.

**Why not a full conflict-resolution screen?** This situation is rare — most edits to shared objects don't collide. Building a dedicated merge UI for a rare event is disproportionate for V1; a simple "someone else changed this, here's the current version" is honest and sufficient, and can evolve into something richer later without changing the underlying guarantee.

**User impact:** nobody's edit ever silently vanishes; at worst, someone occasionally has to glance at the current version and reapply their change.

## 34. Grocery List Behavior

Covered in full in Section 18's resolution above: lists reset in place by default for fast reuse, with a lightweight completion record preserving shopping history without needing to keep old checked-off states around. Users who want a specific trip preserved in full can archive that list and start fresh — an ordinary action available on any object, not new list-specific functionality.

## 35. Occurrence Overrides

**Problem:** "water plant every Monday" — but just this once, move it from 8 AM to 6 PM, without changing the standing schedule.

**Recommendation:** support a simple, single-purpose override — move just one occurrence's due time. Nothing about assignment, duration, or anything else changes; the underlying weekly schedule is completely unaffected, and next Monday reverts to normal automatically.

**Why not a fuller override system** (also changing who's assigned, for instance, just for one instance)? Nothing has yet demonstrated a need for that. Building it now would be exactly the kind of premature, unvalidated flexibility this specification has consistently rejected elsewhere. The simple version handles the concrete, common case; a richer version can extend it later if real usage shows it's needed.

**Roadmap note:** this defines *what it should do* if and when it ships — it does not commit to shipping it in V1. That sequencing call belongs to `05_ROADMAP_IMPLEMENTATION_CONTRACT.md`.

## 36. Responsibility Assignee Semantics

**Problem:** when a responsibility is assigned to specific people, who's actually allowed to complete it, and what does it mean if more than one person is assigned?

**Recommendation:** if a responsibility has assignees, only those people (or the object's owner) can complete it — visibility into an object doesn't automatically mean permission to act on everything in it. If more than one person is assigned, any one of them completing it settles it for everyone — there's no "everyone must each confirm" mode. If a family genuinely wants each person tracked separately (e.g., everyone's own daily habit), that's naturally handled by each person having their own separate responsibility, not a special multi-completion mode of a shared one.

**Why:** this matches how real households actually work — "whoever waters the plant, it's watered" — while still protecting against a child, say, being able to complete a responsibility that was specifically assigned to a parent.

**User impact:** assignment now means something real and predictable, not just a label.

## 37. Objects Created Within Family

**Problem:** once Family exists, who owns something created directly inside it, and does the household see it automatically or does the creator need a separate sharing step?

**Recommendation:** the person who creates it remains its individual owner (never jointly owned, never "owned by the family" as an abstract thing) — this keeps the ownership model completely unchanged from Personal. Creating something *while in* the Family context is treated as the sharing decision itself — the household sees it automatically, with no redundant second "now share it" step. The one exception: anything with elevated privacy sensitivity (Section 21) stays private to its creator by default even inside Family, until they deliberately share it more narrowly.

**Why not joint ownership?** It raises real, unresolved questions — what if two owners disagree about deleting something? — that nothing in this product currently needs solved. Individual ownership with automatic sharing gets the same practical outcome (the household can see and use it) without any new complexity.

**User impact:** creating "the family car" or "family groceries" from within Family just works, immediately visible to the household, with no extra step — while sensitive things stay appropriately private by default.

## 38. Template Administration

**Problem:** templates are starter content, not a source of truth for existing objects — but the team maintaining Lumora still needs to manage the catalog and understand how it's being used, without that management capability becoming a runtime dependency for any user's data.

**Recommendation:** an internal administrative capability (not an end-user-facing feature) lets the team publish, edit, and retire templates, and view usage information — how many objects, users, and workspaces have ever used a given template. This usage information is read-only, aggregate analytics; no object's behavior or correctness ever depends on it, and computing it never touches or re-validates existing objects' data. This is a distinct concept from template *provenance* (the record on an individual object of which template it came from, used only for display) — the two must never be confused with each other or with the actual independent object data itself.

**Why:** the team needs real operational visibility into the catalog without reintroducing the live-dependency risk that Section 10's snapshot design exists specifically to eliminate.

**Non-goal, restated:** this is explicitly not a request for template versioning, upgrade paths, or migration tooling — those remain rejected as premature per Section 10's existing reasoning.

---

# Amendments — Business Logic Stress Test & Hardening Pass

The sections below resolve findings from a deeper real-world business-logic stress test conducted after Amendments 1 and 2. Full domain mechanics for each live in the correspondingly-numbered sections of `02_DOMAIN_BUSINESS_LOGIC.md`.

## 39. Recurrence: Every N Months, Yearly, DST, and Timezone

**Problem:** the original recurrence model didn't explicitly support "every 6 months" or "yearly" — despite these being real, common needs (car maintenance, dental checkups, passport and insurance renewal, annual checkups) already used as examples elsewhere in this document.

**Recommendation:** recurrence now explicitly supports every-N-months and yearly/every-N-years, computed against real calendar dates — never approximated as a fixed number of days, which would drift over time. A monthly or yearly reminder anchored to a date that doesn't exist in some target month (like the 31st) resolves to the last real day of that month. A recurring daily reminder stays at the same wall-clock time (e.g., "8 AM") through a Daylight Saving transition — it never silently drifts by an hour. A shared responsibility has one governing time zone, set when it's created, regardless of which family member is looking at it from where; each person just sees the time converted for their own display.

**Why:** these aren't edge cases — they're the actual shape of some of the product's own headline examples. A "every 6 months" reminder that quietly turns into "every 180 days" would visibly drift within a year or two, and a medicine reminder that moves by an hour twice a year is exactly the kind of reliability failure that breaks trust in the one thing this product promises to get right.

**User impact:** "every 6 months" and "yearly" now mean exactly what a user expects, with no drift, ever.

## 40. Corrected: An Honest Outcome for a Corrected Completion

**Problem:** the Correction Window (Section 32) lets someone undo a mistaken completion — but the original fix made a corrected completion, once its due time had passed, look identical to something the user never did anything about at all. Both showed as "Missed." That's not accurate, and papering over it with softer wording in the interface would leave the underlying number wrong, not just poorly phrased.

**Recommendation:** a corrected completion that happened after its due time now shows as its own honest state — **Corrected** — distinct from both "completed" and "missed." It means exactly what it says: this was done, then undone. If the due time hadn't yet arrived when the correction happened, it simply goes back to normal "not due yet" — no special label needed, since nothing misleading was ever at risk in that case.

**Why:** these are two different real situations and deserve two different honest answers. Someone who caught their own mistake and fixed it did something meaningfully different from someone who never engaged with the reminder at all — the product should say so, not average the two into the same negative-sounding label.

**User impact:** correcting a mistake never makes you look like you ignored something entirely — and if you genuinely never get back to it, "Corrected" stays an honest, accurate record rather than quietly becoming indistinguishable from "missed" over time.

## 41. Notes vs. Attachments

Short, contextual information (a description, a quick note, a status) belongs in an object's Notes. Larger content — documents, photos, substantial files — belongs in Attachments, which carry their own sharing and history behavior. This is a guideline for what each is for, not a hard limit on either — nobody is blocked from typing a long note, but the product should nudge toward Attachments when that's clearly the better fit.

## 42. Capability Admission Governance

**Problem:** nothing previously protected the platform's small, deliberate set of optional capabilities (Notes, Attachments, Responsibility, Items) from future sprawl — every one of today's capabilities was carefully evaluated, but nothing stops that discipline from lapsing on the next one.

**Recommendation:** before any new optional capability is added to the platform, it must be checked against ten questions: is it genuinely reusable across different kinds of objects, not really specific to one category? Is it a true capability rather than a category feature in disguise? Does it need its own lifecycle, its own storage, its own permission rules? Can it fail on its own without breaking anything else? Does it create hidden dependencies? And — most often the deciding question — can something that already exists already express this need, with no new mechanism at all?

**Why:** this exact discipline lapsing once already produced real, unused overhead in this product's history (a generic capability-execution system with no real use) — this section makes the discipline explicit and repeatable rather than something that only happened once, carefully, at the start.

## 43. Monetization & Entitlement Boundary

**Problem:** this document has never stated even a lightweight monetization principle, despite extensive earlier analysis of it — and without one written down, there's no anchor to push back against entitlement logic creeping into the wrong layer once a real subscription feature is under deadline pressure.

**Recommendation:** Lumora will very likely have paid tiers eventually — some combination of free personal use, a paid personal tier, and a family tier are the most plausible shapes, based on everything analyzed earlier in this project. None of that is designed here; no pricing, no billing provider, no checkout flow. What's fixed now is the boundary: whether someone is entitled to a feature is decided once, at the edge of the application, before anything about their actual data is touched. A person's own objects, responsibilities, and history are never held hostage by a billing problem — if payment processing is down, everything a person already has access to keeps working exactly as before. What a subscription controls is *availability of additional capability*, never *access to what's already yours*.

**Why:** billing systems fail, get delayed, get disputed, and change providers — none of that should ever be able to touch whether someone can see their own life's information.

**User impact:** a payment hiccup is never able to lock someone out of their own data.

## 44. Retroactive Template Application — V1 Not Supported

If a user creates something custom and later wishes they'd started from an official template instead, there's no "apply this template retroactively" feature in V1 — they add capabilities manually, or start a new object and move content over themselves. This is explicitly a deferred limitation, not an oversight: building a way to retroactively re-link an existing object to a template's live content would reintroduce exactly the fragile dependency the template snapshot design (Section 10) exists to prevent. If real usage later shows this is genuinely needed, it can be designed properly then.

## 45. History Presentation Guidance

Not every history entry needs equal visual weight when a user browses an object's past. Some entries are naturally more interesting to a person (a completion, a correction, a share) than others (routine administrative changes). This is purely about how history is *displayed* — every entry remains equally true and equally permanent; nothing here changes what History means or how completely it's recorded (Section 19).
