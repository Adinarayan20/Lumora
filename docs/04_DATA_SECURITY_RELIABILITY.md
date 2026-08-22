# Lumora Data, Security, and Reliability Specification

> **STATUS:** Draft — real-world engineering review complete, ready for freeze confirmation
> **OWNS:** Persistence protection, security enforcement mechanics, encryption/secrets, retention/deletion/recovery operational detail, backup/disaster recovery, audit integrity, rate limiting/abuse protection, failure isolation at the operational level, monitoring/incident response, threat model, security and reliability testing.
> **DOES NOT OWN:** Product intent (`01`), domain meaning (`02`), architecture/module boundaries (`03`) — this document consumes `03` as a fixed input and protects it; it does not reinterpret Object, Workspace, History, Execution, Correction, Occurrence, `occurrence_tracking`, `next_due_at`, the Responsibility chain, V1 capability boundaries, the Search/Relationships deferral, the modular-monolith decision, or the API/domain/persistence boundary. Any apparent need to touch these is flagged as a contradiction, not silently resolved here.
> **AUTHORITY:** Per `00_DOCUMENTATION_INDEX.md`.

**Contradiction check, performed before drafting, per instruction:** none found. Every security/reliability mechanism below fits inside the Tier 1/2/3 model and the frozen architecture without requiring any locked decision to change. One genuine cross-cutting *constraint* was surfaced rather than a contradiction — see §12 (backup retention must not be shorter than the deletion recovery window, or the two policies fight each other) — flagged explicitly, not silently decided.

---

## 1. Purpose and Scope

This document answers: how is the architecture in `03` actually protected, kept correct under failure, and kept private? It does not redesign anything `03` already decided — it specifies the operational mechanics that make those decisions hold in production.

**Four states, kept distinct throughout this document, never collapsed into each other:**
1. **DOCUMENTED** — described in `00`/`01`/`02`/`03`/`04`.
2. **ARCHITECTURALLY DEFINED** — has a specific, concrete mechanism in `03`/`04` (a table shape, a constraint, a transaction boundary), not just a principle.
3. **IMPLEMENTED** — exists as actual code in the repository.
4. **VERIFIED BY TESTS** — has a passing, automated test proving it.

**Stated plainly, once, so it doesn't need repeating per section:** everything in this document is at states 1 and 2. **Nothing in this document is currently state 3 or 4.** The repository audit (`03` §23) found the specific pieces that would need to change to reach state 3 (Reminders/completion rebuilt, Household/Templates-engine/capability-runtime/Redis removed, mobile app built from near-zero) — none of that work has happened yet. Where this document says a mechanism "prevents" or "enforces" something, that describes the *architectural intention*, verified against `02`/`03` for consistency — it is not a claim that the mechanism is running in production today.

**04 → 05 boundary, stated once:** `05` may choose concrete libraries, exact retry counts, rate-limit thresholds, deployment procedures, operational runbooks, RPO/RTO numbers, infrastructure sizing, and migration sequencing. `05` **cannot** weaken or bypass any invariant this document fixes — the Erasure Authority mechanism and its fail-closed behavior (§11a), the break-glass process (§14), the per-component worker role model (§14b), the append-only enforcement, the Correction Window's server-timestamp rule, attachment content-immutability (§7), and every entry in the threat model (§26) are constraints `05` operationalizes, not decisions `05` gets to revisit.

## 2. Authentication and Session Security

Session tokens are short-lived and refresh-rotated; a refresh token is single-use and its reuse (a sign of theft) invalidates the entire session family, not just the one token. Sessions are bound to a device/session identity separate from the user identity, so a single compromised device can be revoked without logging the person out everywhere. Password storage uses a modern, slow, salted hash (mechanism choice deferred to `05` — this document fixes the *property*, not the library). No session or credential material ever appears in logs (§9's redaction rule applies here specifically, not just to domain content).

**Account recovery, addressed explicitly — absent from the original draft:** recovery (password reset, account-access recovery) uses a time-limited, single-use token delivered only to a channel already verified as belonging to the account (email/SMS, exact mechanism deferred to `05`). Successful recovery invalidates **every** existing session for that account, not merely the one being recovered — closing the standard account-takeover window where an attacker resets credentials while the legitimate owner's session (or the attacker's own newly-created one) would otherwise remain valid alongside it.

**Recovery-channel change, closed as its own boundary:** "verified channel" is only a meaningful guarantee if changing *which* channel is verified is itself protected — otherwise an attacker holding a live session could change the account's recovery email, then trigger recovery through the new, attacker-controlled channel, defeating the mechanism above entirely. Changing the account's verified recovery channel requires re-authentication (step-up verification of the current credential, not just an active session) and does not immediately or silently discard the previous channel — a transition period or notification to the prior channel is required before the new one becomes the sole recovery path, exact mechanism deferred to `05`.

## 3. Authorization Enforcement Mechanics

Directly operationalizing `03` §5 and §14: the authorization check inside the mutation transaction is implemented as a single, shared guard function per capability key — never duplicated per controller. **Reliability property:** if the guard function itself throws or times out, the transaction rolls back; there is no code path where an exception during authorization results in the mutation proceeding. **Security property:** the guard reads current Ownership/assignee/Grant state from the same transaction's view, not from a cached or pre-fetched value — closing the exact TOCTOU gap `03` §5 was designed to prevent, verified here as a testable property (§28).

## 4. Workspace Isolation

Every table holding Workspace-scoped data has a non-nullable `workspace_id` column (per `00`'s locked decision on this from the original repository audit). Every query path is required to filter by the resolved server-side Workspace context — enforced at the repository layer as a mandatory parameter, not an optional filter a call site could forget to apply. Background workers (scheduler, outbox consumers) must independently re-validate Workspace/Object ownership before mutating anything — a job queued for one Workspace's data must not be executable against another's even if the job payload were somehow tampered with in transit.

## 5. Object-Level Access Protection

Object IDs are non-sequential (UUID-class) — enumeration resistance, defense in depth alongside, never instead of, the Workspace-scoping check. Every Object-returning endpoint performs the check `object.workspace_id == resolved_context` on every read, not only at creation — this generalizes the one pattern the original repository got right in exactly one place (`getReminderById`) into a mandatory shape for every resource, closing the gap where the sibling Templates controller skipped authorization entirely. **Test requirement (§28):** attempting to read/mutate an Object using a valid ID from a Workspace the requester does not belong to must return not-found, never a permission-denied that would confirm the Object's existence.

## 6. Sensitivity and Privacy Handling

Elevated-Sensitivity Objects (02 §12.4) receive protection at three points, not one: (a) sharing default — narrower automatic visibility when created in Family (02 §9.3); (b) notification content — generic text composed before the payload reaches any delivery provider (02 §13.9, `03` §9); (c) **logging — new here:** any field belonging to an elevated-Sensitivity Object is redacted from structured logs, error traces, and any future support/debugging tooling by default, not by convention that could be forgotten per log call. Redaction is implemented as a serialization-layer property of the Object type, not a per-call-site discipline.

## 7. Attachment Security

Direct implementation of `03` §22: uploads go through an authorized-intent step (the API issues a scoped, short-lived upload target; the client never gets a raw, long-lived write credential to storage). Downloads use short-lived, scoped signed URLs — never a permanent public link, regardless of how convenient that would be for CDN caching. Attachment metadata carries the parent Object's Access scope at read time (re-checked, not cached at upload time) — an Attachment on an Object whose access changed after upload must reflect the new access state immediately, not the state at the moment it was uploaded.

**Content trust, addressed explicitly — absent from the original draft:** an uploaded Attachment is not immediately available for download upon receipt. It passes through a validation/scan step first — content-type verified against the file's actual bytes, not merely its claimed MIME type, plus malware/virus scanning (exact scanning mechanism deferred to `05`). A failed scan results in rejection, with the Attachment never transitioning to an available/downloadable state — never silently served on the assumption that upload-time checks were sufficient.

**Content immutability after validation — the same TOCTOU pattern already solved for authorization (`03` §5), recurring here and now closed the same way:** scan-then-serve alone has a race — bytes could be validated, marked safe, then swapped before being downloaded, so the scan's "these bytes were safe" verdict would no longer describe what's actually served. Fixed by making the validated bytes immutable once available: once an Attachment transitions to available, the specific bytes addressed by that Attachment identity cannot be replaced in place — not by re-upload, not by any code path. If a user uploads a revised file, that creates a **new** Attachment/content version with its own identity and its own scan, never an in-place mutation of already-validated content. This is architecturally required now; the exact mechanism (content-addressed storage, a hash pinned at validation time and checked on every download, or another approach) is `05`'s implementation choice.

## 8. Encryption

Data at rest: full-disk/volume encryption at the database and storage layer (managed by the hosting platform's standard mechanism — a `05` implementation choice, not specified here). Data in transit: TLS everywhere, no exceptions, including internal service-to-database and service-to-queue connections, not only the public API edge. Elevated-Sensitivity content gets no *additional* cryptographic mechanism beyond this baseline in V1 — field-level application encryption is a real future option if evidence justifies the added key-management complexity, explicitly not built now, consistent with the standing cost-discipline principle.

## 9. Secrets Management

Database credentials, provider API keys, and signing keys live in a dedicated secrets store (platform-managed, not `.env` files committed anywhere, not hardcoded) with least-privilege access per service component — the API service and the background workers do not need identical credential scope, and should not share it merely for convenience. Secret rotation is a defined operational capability (rotate without a full redeploy), not necessarily automated on a fixed schedule in V1.

## 10. Data Retention

**What is defined:** the 30-day ordinary-deletion recovery window (`01` §31, `02` §4.3) is a **UX recovery policy**, explicitly and repeatedly distinguished throughout this project from a legal retention policy — restated here as binding: after 30 days, an ordinarily-Deleted Object's data is permanently purged, including its History, Execution, and Correction facts, and this purge is irreversible.

**What is explicitly not defined, and not invented here:** any legal minimum or maximum retention requirement, any right-to-erasure/right-to-be-forgotten process distinct from ordinary deletion, and any jurisdiction-specific data residency requirement. These remain **OPEN DECISION**, carried forward unchanged from `01`/`02` — this document does not manufacture a retention policy to fill the gap.

## 11. Deletion and Recovery

Direct implementation of `03`'s frozen Tier model: deleting an Object marks it Deleted (a state, per `02` §4.3) — this is not a physical row deletion at the moment of the user's action. Physical deletion happens exactly once, at purge time (30 days later or on legal-erasure request, once that process exists), and cascades correctly through every Tier-1 table referencing the Object (`execution`, `correction`, `history`, `attachment`) plus every Tier-2 derived row (`occurrence_tracking`, `next_due_at`) — Tier-2 rows require no special handling since they're disposable by definition; Tier-1 purge is the only step that matters for correctness. Restoration within the window reverses the state flag only — no data was physically touched, so restoration is instantaneous and exact, including the pre-deletion Access configuration (02 §4.3's explicit rule, unchanged).

## 11a. Deletion, Erasure, and Backup — Explicitly Layered, Not Collapsed

Four distinct states, kept separate rather than treated as one "deletion" concept:

```
Active
  ↓
Deleted / Recoverable  (state flag only — no physical row touched, per §11)
  ↓  (30-day window)
Terminal Erased in the authoritative primary store  (physical purge — irreversible, in the live database)
```

...and, layered independently on top of that:

```
Backup snapshot, taken before terminal erasure, may still physically contain the erased data
  ↓
An ordinary application restore from that snapshot MUST NOT resurrect terminally-erased records —
even if the snapshot predates the erasure itself (see the corrected mechanism below)
  ↓
The backup itself expires later, per backup-retention policy (§12)
```

**The original mechanism here was insufficient, and it's worth being precise about exactly why, not just stating the fix.** A tombstone row stored in the primary database is only as durable as the primary database's own restore point. Consider: a snapshot taken Day 1, an Object deleted Day 20, terminally erased (tombstone created) Day 50, disaster Day 51, restore of the *Day-1* snapshot. That snapshot contains neither the deletion nor the tombstone — both postdate it. Restoring it resurrects the live Object with no tombstone anywhere in the restored database to catch it, because the tombstone was never independent of the very store being rolled back. "Check the tombstone table after restore" silently assumed the tombstone would survive being restored-over, which it doesn't.

**Corrected architectural requirement:** terminal erasure must be recorded to an **Erasure Authority independently durable from the primary store's own backup/restore lifecycle** — a destination that is never included in, and never rolled back by, a primary-database restore operation. This is a property requirement, not a vendor choice (deliberately not naming a specific product or technology here, per instruction): whatever `05` implements it as, it must satisfy (a) append-only, (b) physically or logically separate from the primary database's own snapshots, such that restoring the primary database has no effect on it whatsoever, (c) **retained for at least the maximum possible rollback horizon the organization could ever restore to — not stated as "effectively permanent," since that phrasing risks silently making a data-minimization/legal-retention decision this document is explicitly not authorized to make (§30).** Any retention beyond the rollback horizon is a policy question, not a technical requirement of this mechanism, and is deferred exactly as the rest of retention policy is.

**Corrected restore sequence, against that authority:**
1. Restore the primary database from whichever snapshot is being used.
2. Query the Erasure Authority for **every** erasure record it has ever stored — not filtered by the snapshot's date, not assumed to already be reflected in the restored data. Because the Erasure Authority's own retention is independent of the primary store, it correctly still contains the Day-50 erasure even after a Day-1 snapshot is restored.
3. For every `object_id` present in that full result set, re-purge it from the restored primary store **unconditionally** — regardless of what state that object_id shows in the just-restored snapshot (Active, Deleted, or anything else), and regardless of whether the snapshot predates or postdates the original erasure.
4. Only after this reconciliation completes is the restored system opened to users.

**The invariant, stated precisely, now actually holds under the worst case:** an ordinary database restore can never resurrect an Object that was already terminally erased before the restore cutover, even when the snapshot being restored predates the erasure — because the check no longer depends on the erasure record having been *inside* the restored snapshot at all.

**The Erasure Authority is now itself a security-critical trust boundary, and needs its own recovery invariant — not just "independently durable" stated once and left at that:**

> The Erasure Authority must have its own independent durability and recovery boundary such that: loss or rollback of the *primary store* cannot remove an erasure record (already established above), **and** loss, rollback, or integrity failure of the *Erasure Authority itself* cannot silently cause an already-recorded terminal erasure to be forgotten.

**Fail-closed behavior, stated explicitly, not left implicit:**
- If the Erasure Authority is unavailable or its integrity cannot be verified, **terminal erasure does not complete.** An Object stuck at the end of its 30-day recoverable-deletion window, unable to reach the Erasure Authority, remains in the Deleted-but-not-yet-purged state rather than being purged with no durable record that it happened — the system waits, it does not proceed unsafely.
- If the Erasure Authority is unavailable, or its own integrity cannot be verified, during a restore, **the restore does not cut over to users.** Reconciliation (step 2 above) is a required gate, not a best-effort step — a restore that cannot complete it does not go live.

**Named test, exactly the scenario given:** Day 1 — snapshot taken. Day 20 — Object X deleted. Day 50 — Object X terminally erased, Erasure Authority record written. Day 51 — restore the Day-1 snapshot. **Expected:** immediately after restore-reconciliation completes and before any user-facing access, Object X is absent — its data, History, Execution, and Correction records are purged from the restored primary store, despite the Day-1 snapshot having contained them in full, live, un-deleted state.

**Do not invent legal policy here:** this mechanism enforces Lumora's own ordinary 30-day-recovery-then-purge promise surviving a restore correctly, nothing more. It says nothing about, and does not attempt to satisfy, any external right-to-erasure legal requirement — that remains OPEN DECISION (§30). If one is later adopted, it very likely triggers writes to this same Erasure Authority rather than needing a second, parallel mechanism — but the trigger condition for *when* legal erasure must happen is not decided here.

**Write ordering, and who may write — a detail worth catching now rather than in another round:** the Erasure Authority and the primary store are two independent, separately-durable systems — a single atomic transaction cannot span both the way an ordinary in-database write can. Ordering therefore matters: the Erasure Authority record is written **first**, and the primary-store purge only proceeds after that write is confirmed durable. If the process crashes between the two steps, the failure mode is "erasure recorded, purge not yet completed" — safe, since a reconciliation process can complete the purge later and the data remains protected against restore-resurrection in the meantime. The reverse ordering would allow exactly the dangerous case this mechanism exists to prevent: data purged with no record of it ever having happened. Writing to the Erasure Authority is restricted to the same narrow, reviewed code path that performs terminal erasure — not a general worker or application capability, and not writable by `app_command_role` or any of §14b's other roles, since none of them have a legitimate reason to erase anything.

## 12. Backup and Restore

**Constraint, not a contradiction, surfaced explicitly:** backup retention must be **at least** as long as the 30-day deletion recovery window, or the two policies actively conflict — a backup that expired before the recovery window closes could make "restore my accidentally deleted object" impossible even though the product promises it's still recoverable. This is a concrete requirement on backup configuration (§10/§11's guarantee only holds if this is true), not a new domain decision.

**Restore verification, not assumed correct:** after any restore (full or point-in-time), before the restored system is opened to users, four checks run in order: (1) the Erasure Authority reconciliation pass from §11a — corrected to query the full, independent authority, not a same-store tombstone; (2) the Tier-2 consistency check from §17a, run once across all restored `occurrence_tracking`/`next_due_at` rows, since a restore is exactly the kind of event that could leave Tier 2 stale relative to Tier 1; (3) a basic row-count/checksum sanity comparison against the pre-restore backup manifest, to catch a grossly incomplete restore before it's mistaken for a successful one; (4) the Day-1/Day-50/Day-51-style scenario is included in the standing recovery-drill suite below, not only as a one-time test. Exact tooling for each deferred to `05`; the requirement that all four happen, in this order, before cutover is fixed here.

**Recovery drills:** the restore procedure (including all verification passes above) is exercised periodically against a non-production environment, not left untested until an actual disaster — frequency deferred to `05` as an operational scheduling decision, but "never tested until needed" is explicitly rejected as acceptable. The old-snapshot-predates-erasure scenario is a required, standing case in that drill suite, not a one-off.

## 13. Disaster Recovery

Recovery point objective and recovery time objective are explicitly **not fixed in this document** — they depend on infrastructure choices made in `05`, and inventing numbers here would misrepresent them as already-decided. What's fixed: the outbox pattern (`03` §3, §9) means Tier-3 projections (Search, Timeline, Usage Metadata) can always be fully rebuilt from Tier-1 Facts after a restore — disaster recovery only needs to restore Tier 1 and Tier 2 correctly; Tier 3 self-heals by replaying the same consumers used in ordinary operation, not a special DR-only procedure.

## 14. Audit and History Integrity, and Privileged Access

`03` §7 already enforces History immutability at the database-role level (UPDATE/DELETE grants revoked). That protects against one thing only: the **application trust boundary** — every normal application code path, every service, every worker, runs under a role that structurally cannot mutate `history`, `execution`, or `correction`, no matter what application-level bug or compromise occurs. This is a real, strong guarantee, and it is also, by construction, not the same guarantee as protection against a database administrator — a different, separate boundary this document must not pretend the first one covers.

**Two boundaries, named explicitly, never conflated:**
- **Application trust boundary:** every runtime component of Lumora (API, workers, scheduler). Structurally cannot bypass Tier-1 immutability. No exceptions, no admin mode inside the application.
- **Infrastructure administrator trust boundary:** whoever holds database-superuser or equivalent infrastructure-level credentials, capable of bypassing any application-level restriction by definition — no database constraint can protect against its own administrator.

**Break-glass process for the second boundary, required, not optional:** any use of infrastructure-administrator privilege against Tier-1 tables requires — (1) distinct, non-routine authentication, never the same credential used for ordinary infrastructure operations; (2) explicit authorization from a second party, not a single individual's unilateral access; (3) the action and its justification logged to a destination outside the database being administered, so a misused credential cannot also erase the record of its own misuse; (4) rarity as a design goal — if break-glass access is used routinely, that itself is a signal the application-layer design has a gap it's compensating for, not a normal operating mode; (5) every use reviewed after the fact, not only logged. This is the honest, complete answer to "what protects History from the one actor who technically could violate it" — a controlled, audited, rare process, not a claim that the database constraint alone is sufficient.

## 14a. Migrations — a Gap in the Original Draft

Not raised by the review directly, but a real one I found doing this properly: nowhere did the original draft address how schema migrations interact with the append-only enforcement in §14. This matters specifically because migrations require exactly the kind of elevated privilege §14 just spent a full section restricting.

**Rule:** migrations run under a distinct role from every runtime role defined in §14b below, and from ad-hoc infrastructure-administrator access — a role scoped to schema changes only, applied through a reviewed, version-controlled migration pipeline, never an interactive session. Any migration touching `history`, `execution`, `correction`, `correction`'s uniqueness constraint, **or any `GRANT`/`REVOKE` statement affecting the role privileges defined in §14b**, requires explicit additional review before merge, flagged automatically by touching those specific files — a migration is the one legitimate, routine way either the append-only guarantee or the new worker-privilege boundary could be accidentally weakened (e.g., a careless migration re-granting `INSERT` on `execution` to a role that shouldn't have it, while adding an unrelated column). Migrations follow an expand-then-contract pattern for any schema change that could be read by two different application versions simultaneously during a rolling deploy — the modular monolith's single deployable unit doesn't eliminate this concern, since a rolling restart across multiple instances still creates a brief window of mixed versions.

## 14b. Worker Trust Boundary — Per-Component Privilege, Not One Application Role

**The original draft's gap, stated precisely:** §14's append-only enforcement correctly stripped UPDATE/DELETE from Tier-1 tables for "the application" — but treated the application as one undifferentiated identity, meaning any component holding valid application-level credentials, including a notification scheduler or an outbox consumer that has no legitimate reason to ever touch `execution`/`correction`/`history`, could still INSERT into them. A compromised worker credential shouldn't just be *bounded* by scope, as the original draft said — it shouldn't have the capability at all unless its job actually requires it.

**Corrected privilege model — separate database roles per component, not one application role:**

| Role | Used by | Privilege on Tier-1 Facts (`execution`, `correction`, `history`) | Privilege elsewhere |
|---|---|---|---|
| `app_command_role` | Only the specific, narrow use-case handlers implementing Responsibility completion, correction, and other operations that create Tier-1 Facts by domain requirement (`02`/`03`) | `INSERT`-only, no `UPDATE`, no `DELETE` — the same restriction §14 already established, now scoped to the one component that actually needs it | Ordinary CRUD on Object/Access/Responsibility tables per domain rules |
| `app_query_role` | The rest of the API surface — anything that reads but doesn't create Tier-1 Facts | `SELECT`-only | Read/write on non-Tier-1 tables as ordinary operations require |
| `scheduler_role` | The notification scheduler (`03` §9) | **None — no grant at all**, not even `SELECT`; it has no legitimate reason to read `execution`/`correction`/`history` to do its job | `SELECT` on `responsibility`/`next_due_at`; `INSERT`-only on `notification_intent` |
| `outbox_consumer_role` | Timeline projection, Search indexer, Usage Metadata aggregator, Notification delivery-status logger | `SELECT`-only, and only where a consumer genuinely needs to read Tier-1 Facts to build its own projection (e.g., a Timeline consumer reading `history`) — never `INSERT`/`UPDATE`/`DELETE` | `INSERT`/`UPDATE` only on that consumer's own designated projection table — never another consumer's |
| `tier2_maintenance_role` | The §17a consistency-check/repair job | `SELECT`-only on `execution`/`correction` (to recompute correct values); no access to `history` at all, since it has no need to read or write it | `INSERT`/`UPDATE` only on `occurrence_tracking`/`next_due_at` — Tier-2 tables, which is exactly what this job exists to maintain |
| Migration role (§14a) | Migration pipeline only | Schema DDL only — no runtime data access of any kind | Schema DDL only |
| Infrastructure administrator (§14) | Break-glass only | Full — the one role for which no database grant can be a complete defense, hence the process controls in §14 | Full |

**Why this is the correct fix, not just a stricter one:** `app_command_role` is granted only to the specific application code implementing the domain operations that `02`/`03` say create Tier-1 Facts — never to the general API runtime identity. A vulnerability in an unrelated endpoint (Object rename, Grant management) does not, by itself, grant access to `app_command_role`'s privileges, because that endpoint's code never runs under that role. This is real defense in depth: compromising "the application" broadly is no longer equivalent to compromising the one narrow path capable of writing Tier-1 Facts.

**What the role model solves, and what it deliberately does not — stated explicitly so it isn't misread later:** database privileges answer *who may write* to Tier-1 tables. They do not, and cannot by themselves, answer *what constitutes a valid fact* — a compromise of the narrow command path itself could still, in principle, `INSERT` a malformed or semantically invalid Execution, since `INSERT`-permitted is not the same guarantee as `INSERT-only-valid-domain-transitions`. That correctness responsibility belongs to the domain/application layer (`02`'s invariants, `03`'s transactional command path), not to the database grant. The division is: **database privileges enforce which component may write; domain/application invariants enforce what a valid write looks like.** Neither substitutes for the other, and a future reader must not conclude "Tier-1 is secure because the role handles it" — the role handles authority separation; validity is a separate, equally necessary guarantee already established elsewhere in this document set.

**Role-isolation invariant, frozen now, mechanism deferred to `05`:** possession of `app_command_role`'s capability must not imply arbitrary database access under that capability. Concretely, this rules out an implementation where a shared connection pool runtime-switches into `app_command_role` and then executes broadly-scoped or dynamically-constructed SQL — an unrelated vulnerability in the completion-handling code path must not be escalatable into arbitrary access under that role. The exact containment mechanism (parameterized, narrowly-scoped operations only; connection-per-role isolation; or another approach) is `05`'s implementation choice, not prescribed here — but the property itself is fixed: the command capability is exercised only through the specific, predefined domain operations already designed, never as general elevated database access.

**Compromised-worker test, named exactly as required:** given a compromised `scheduler_role` or `outbox_consumer_role` credential, when the worker attempts to `INSERT` or `UPDATE` a row in `execution`, `correction`, or `history` directly, the database rejects the operation with a permission-denied error — independent of any application-layer code path, independent of whether the attacker also compromised the surrounding service logic, because the role simply holds no grant permitting it.

**Composes correctly with authorization (§3), not a bypass of it:** `app_command_role`'s elevated write privilege is only *reached* after the transactional authorization check in §3 passes — the role grants the *capability* to write Tier-1 Facts, it does not grant permission to skip checking whether the specific request is authorized to do so. A malicious client attempting to complete an Occurrence in a Workspace it has no access to is stopped by §3/§4 before `app_command_role`'s insert privilege is ever exercised on its behalf.

**Privileged access to the role model itself:** granting or modifying `app_command_role` (deciding which code runs under it) is itself an infrastructure-administrator-boundary operation, change-controlled and logged (§14) — this is effectively "who decides which code gets Tier-1 write access," and getting it wrong would silently undo everything above it.

## 15. Rate Limiting

Per-user and per-IP limits at the API boundary, tuned tighter for expensive or abuse-prone operations (account creation, Grant creation, completion-command submission at implausible frequency) than for ordinary reads. Exact numeric thresholds are deferred to `05` as an operational tuning decision, not fixed here — what's fixed is that every mutating endpoint has *some* limit, none are unbounded by default.

## 16. Abuse Protection

Beyond rate limiting: anomaly signals worth defining now even without fixed thresholds — a single account attempting authorization checks against many different Workspaces in a short window (enumeration behavior), a single Object receiving an implausible volume of Grant creation/revocation cycles (potential access-thrashing abuse), repeated failed authorization attempts against the same Object ID (targeted probing). These are flagged as signals for `05`'s monitoring implementation to act on, not built as blocking logic here — false positives on legitimate Family-sharing behavior are a real risk this document doesn't want to hand-wave past.

## 17. Concurrency and Reliability Guarantees — Restated from the Reliability Lens

Everything `03` §6 established for correctness doubles as a reliability guarantee: the atomic check-and-set on `occurrence_tracking` means a partial failure mid-completion (process crash between steps) leaves the system in a state recoverable by reconstruction (`03` §6), never a state requiring manual data repair. This is worth stating explicitly here because "correct under concurrency" and "recoverable after a crash" are the same property, verified by the same test suite (§29), not two separate reliability concerns needing separate mechanisms.

## 17a. Corrupted Derived State — Distinct from Lost Derived State

`03` §6's reconstruction covers a *missing* `occurrence_tracking`/`next_due_at` row — the system correctly notices the absence and rebuilds. It does not, on its own, cover a row that's *present but wrong* — e.g., a bug leaves `next_due_at` pointing at a stale value while a row still exists there, so nothing ever triggers the missing-row reconstruction path. This is the more dangerous case, because it fails silently rather than triggering recovery.

**Mechanism:** a periodic consistency-check job independently recomputes Tier-2 state from Tier-1 Facts for a sample (or, at V1 scale, the full set) of `occurrence_tracking`/`next_due_at` rows and compares against the stored value. Any mismatch is both auto-repaired (the recomputed value is correct by definition, since Tier 2 has no independent authority — §17 of `03`) and raised as an alertable signal (§23), because a mismatch means something in the write path produced wrong Tier-2 state, which is a bug worth finding even though the repair itself is harmless. This closes the gap between "recoverable in theory" and "actively self-correcting against silent drift in practice."

## 18. Offline and Replay Safety — Security Lens

Beyond `03` §17's correctness treatment: an offline-queued command replayed maliciously (a captured, replayed network request, not just an accidental double-submit) is defended by the same idempotency/revision-check mechanisms — a replay attack against a SET-A-FACT command is indistinguishable from, and defended identically to, an accidental duplicate. A replayed FIELD EDIT command carrying a stale revision is rejected by the same optimistic-concurrency check regardless of whether the staleness was accidental or adversarial. No new mechanism is needed; the correctness properties already established are also the security properties, which is worth stating as confirmation, not assumed silently.

**Device clock, stated as a blanket invariant, not case-by-case:** no domain decision anywhere in this architecture ever trusts a client-reported timestamp — the Correction Window (§ above, `03` §17) is the clearest example, but the rule is general. A device with a deliberately manipulated clock gains nothing; every time-sensitive decision resolves against the server-recorded timestamp.

**Long-offline clients (days to weeks), not just brief disconnection:** a client reconnecting after an extended offline period does not merely replay its queued commands against a possibly very stale local cache — it triggers a full state refresh of any view it's about to display (Today, Object detail) before showing anything, rather than presenting weeks-old cached assumptions as if current. Queued SET-A-FACT and FIELD-EDIT commands still replay correctly regardless of elapsed time (deterministic identity / revision-check are time-independent beyond the Correction Window specifically), but the client's *presentation* layer must not treat "I have a local cache" as equivalent to "I have current data" after a long gap.

**Reconnect storms:** many devices reconnecting simultaneously after a shared outage (a provider incident, a server restart) use jittered exponential backoff for their reconnect and queue-replay attempts, not immediate simultaneous retry — a required client behavior, not merely a server-side capacity assumption.

**Device logout / session revocation vs. queued offline commands:** if a session is remotely revoked (device reported lost, user-initiated remote logout) while that device still holds queued offline commands, those commands cannot be submitted after revocation — the authentication check at the API boundary rejects them using the same session-validity check as any other request, closing the gap where a lost device's queue might otherwise be treated as a special, trusted case.

## 19. Transactional Integrity

Every multi-table write identified in `03` (Execution+History, Correction+History+tracking-clear, Object-create+outbox-stage) is one database transaction, no exceptions — partial application of any of these is a reliability defect, not an acceptable degraded state, and must fail the entire transaction rather than leave Tier-1 tables inconsistent with each other.

## 20. Outbox Reliability

At-least-once delivery, restated precisely per `03` §3/§9: each consumer (Notification, Timeline, Search-when-built, Usage Metadata) maintains its own idempotent-processing marker keyed by outbox event id, so redelivery is safe per-consumer independently — one consumer's retry does not require or trigger another's. Failed events dead-letter after a bounded retry count (exact count deferred to `05`) rather than retrying forever, with dead-lettered events remaining inspectable and manually replayable — never silently dropped.

## 21. Scheduler Reliability

Direct extension of `03` §9's idempotent-claim mechanism: if a worker crashes after claiming due work but before completing dispatch, the claim itself (`notification_intent` row) is the recovery anchor — a stuck, undelivered intent is detectable by age and re-attempted by any worker, since delivery itself is separately idempotent at the provider-integration layer. No distributed lock/lease with expiry is required beyond the unique-insert claim already established; adding one would be exactly the kind of infrastructure this project's cost-discipline principle exists to prevent without demonstrated need.

## 22. Projection Failure Isolation

Restated as an operational requirement, not just an architectural one: a Tier-3 consumer being down, slow, or fully failed must be observable (§23) but must never appear as an error to the user performing a Tier-1/2 operation — completing a Responsibility succeeds and is confirmed to the user regardless of whether Timeline/Search/Notification are currently healthy. This is `03` §4/§10's rule, operationalized as a monitoring and alerting requirement rather than restated as architecture.

## 23. Monitoring and Alerting

Building on `03` §19's named metrics: alert thresholds, specifically — reminder delivery success rate dropping below a defined threshold is a **paging-severity** alert, not a dashboard-only metric, given `01`'s explicit identification of reminder reliability as the product's highest-stakes dependency. Outbox dead-letter count growing (rather than being drained) per consumer is an alert, distinguishing "one bad event" from "a consumer is systematically broken." Authorization-failure rate spiking is both a security signal (§16) and a reliability signal (a broken deploy could look identical to an attack) — alerted on, investigated with both lenses.

## 24. Incident Handling

A security or data-integrity incident (suspected unauthorized access, a Tier-1 consistency violation detected by the invariant checks in §29) triggers: contain (revoke affected sessions/credentials), assess scope (which Workspaces/Objects, using the same Workspace-scoped query patterns already built for ordinary operation — incident response doesn't need bespoke tooling, it reuses the access patterns that already exist), notify affected users where the incident involves their data (exact notification obligations and timelines are a policy question deferred to `05`/legal input, not invented here), and record a postmortem. This is a process outline, not a runbook — exact escalation paths and staffing are operational detail for `05`.

## 25. Operational Recovery

For each Tier: Tier 1 (Facts) — restore from backup per §12/§13, or repair via the append-only nature of the tables (a bad write can be corrected by a compensating Fact, per `02` §7.6's correction-not-edit principle, never by editing history). Tier 2 (Derived State) — always safe to delete and let reconstruction run (`03` §6). Tier 3 (Projections) — always safe to delete and let the outbox consumer rebuild from Tier 1. This three-tier recovery story is the direct payoff of the Tier model being real rather than aspirational: operational recovery complexity is concentrated entirely in Tier 1, and Tiers 2–3 are, by design, never a source of operational risk.

## 26. Threat Model

| Threat | Attack surface | Mitigation | Enforcement boundary | Residual risk |
|---|---|---|---|---|
| Cross-Workspace data access | Spoofed/guessed `workspaceId` in request body | Server-side resolution only (§4), never trusted from body — direct fix for the exact vulnerability found in the original repository's Templates controller | Application layer, every request | None identified beyond correct implementation |
| Object enumeration | Sequential/guessable IDs | Non-sequential IDs + mandatory workspace-scoped check (§5) | Application layer | Low — enumeration alone is insufficient without also breaching Workspace scoping |
| TOCTOU on authorization | Authorization checked separately from, and before, the mutation it gates, allowing state to change in between | Authorization decision evaluated *inside* the same transaction as the mutation, against current state (`03` §5, §3 of this document) | Database transaction boundary | None identified if the transactional coupling is correctly implemented; this is the one place a shortcut during implementation would silently reopen the gap |
| Privilege escalation via Grant | Actor grants themselves broader access than their Ownership allows | Grant creation restricted to Owner only for V1 (`03` §14), no role system to escalate through | Application layer | Low for V1; re-evaluate when Family roles are designed |
| Replay attack | Captured and resubmitted request | Idempotency (SET-A-FACT) / revision-check (FIELD EDIT) — identical defense whether accidental or adversarial (§18) | Database constraint (uniqueness) + application (revision check) | None identified |
| Device clock manipulation | Client reports a false timestamp to influence a time-sensitive decision | No domain decision ever trusts client-reported time; server-recorded timestamps only (§18) | Application/database — timestamps are server-assigned, never accepted from the client | None identified |
| Notification content leakage | Elevated-Sensitivity object detail on a locked screen | Redaction at Intent-creation time, before any provider (§6, `03` §9) | Application layer, before dispatch | Low — depends on Sensitivity classification being set correctly at the domain level, which is `02`'s concern, not re-litigated here |
| Attachment link leakage | Permanent public URL shared/leaked | Short-lived, scoped signed URLs only (§7) | Storage/CDN layer | Low — a leaked signed URL remains valid until expiry, an accepted, bounded window |
| Webhook/inbound provider compromise | Forged delivery-receipt or future payment webhook | Signature verification against the provider's published mechanism before trusting any inbound webhook payload; webhook handlers idempotent, reusing the same discipline as every other command (§20) | Application layer, at webhook ingestion | Depends on the provider's own signing-key hygiene — outside Lumora's control |
| Worker credential compromise | A scheduler or outbox-consumer worker's credentials are stolen | Per-component role model (§14b): `scheduler_role`/`outbox_consumer_role` hold **no grant at all** on `execution`/`correction`/`history` — not even `SELECT` for the scheduler. A compromised worker cannot create a fake Execution; the database rejects the attempt regardless of application-layer behavior | Database role, independent of application-layer trust | None identified for Tier-1 Facts specifically — a compromised worker remains able to write within its own narrow, legitimate scope (e.g., spurious `notification_intent` rows), which is a bounded nuisance, not a system-of-record integrity risk |
| Account recovery / session takeover | Password-reset or recovery flow hijacked to gain a persistent foothold | Time-limited, single-use recovery tokens delivered only to a verified out-of-band channel; successful recovery invalidates **all** existing sessions for the account, not just issuing a new one alongside old ones | Application layer, recovery-flow endpoint | Depends on the security of the out-of-band channel itself (email/SMS account compromise) — outside Lumora's control, a standard, accepted residual risk for this class of mechanism |
| Malicious attachment content | Uploaded file is malware, or claims a false content-type | Attachments pass through a scan/validation step (content-type verified against actual bytes, not just claimed MIME type) before being marked available for download; failed scans are rejected, never silently served | Application/storage layer, between upload and availability | Scan efficacy depends on the scanning mechanism's own coverage — a general limitation of any scanning approach, not specific to this design |
| Insider/privileged misuse of History | Infrastructure administrator bypassing application-layer immutability | Break-glass process — non-routine auth, second-party authorization, externally logged, reviewed (§14) | Infrastructure administrator trust boundary, explicitly separate from the application boundary | Irreducible to zero by design — an administrator boundary can be controlled and audited, never eliminated |
| Denial of service via mutation spam | Unbounded completion/Grant-cycle requests | Rate limiting (§15) + abuse signals (§16) | Application/API layer | Exact thresholds deferred to `05` — until tuned, this mitigation is architecturally defined but not yet calibrated |
| Backup/restore data resurrection | Restoring a snapshot that predates a legitimate erasure | Erasure Authority reconciliation, mandatory gate before restore cutover (§11a) | Restore procedure, before cutover to users | None identified given the fail-closed rule (§11a) — a restore literally cannot cut over if reconciliation can't complete, removing the "skipped under pressure" risk as a silent failure mode; it becomes a stalled restore instead, which is visible |
| Erasure Authority unavailable, corrupted, rolled back, or maliciously altered | Loss of the one mechanism that makes terminal erasure survive a primary-store restore | Independent durability, append-only design, and fail-closed behavior (§11a): unavailability blocks terminal erasure completion and blocks restore cutover rather than proceeding unsafely | Erasure Authority's own trust boundary, explicitly distinct from the primary store's | Requires independent recovery/testing of the Authority itself, not covered by ordinary primary-database drills — named explicitly in §29 |

## 27. Failure Modes Catalog


| Component fails | User-visible effect | Core truth affected? |
|---|---|---|
| Notification provider down | Reminders don't arrive; Today view still shows what's due | No — Tier 1/2 unaffected |
| Search index (once built) unavailable | Search returns no/stale results | No |
| Timeline consumer stuck | Recent-activity feed stale | No — History itself remains complete and queryable directly |
| Outbox worker crashed | Tier-3 consumers lag until restarted | No — outbox rows persist, replay on restart |
| Database primary unavailable | Full outage — nothing works | Yes, by definition — Tier 1 requires the database; this is the one component with no failure isolation, correctly, since it's the actual source of truth |
| Scheduler worker crashed | Notifications delayed until another worker picks up due work | No |
| Attachment storage provider down | Uploads/downloads fail; Object and its other data remain usable | No |
| Erasure Authority unavailable | Terminal erasure held (Object stays Deleted-but-not-purged, not unsafely purged); any pending restore held before cutover | Yes, specifically for deletion-survives-restore correctness — the one place this document requires fail-closed rather than fail-open, by design |

## 28. Security Testing

Required, not optional, before any release: cross-workspace access attempts return not-found (§5); authorization guard failure rolls back the transaction, never partially applies a mutation (§3); replayed/duplicate requests across all three offline command classes resolve safely (§18); the Correction Window's offline server-timestamp test (`03` §17) passes; attachment URLs expire and are unusable after expiry; no elevated-Sensitivity field appears in logs under any code path (automated log-scanning test, not manual review alone).

**Erasure Authority tests, named explicitly:** (a) the full Day-1/Day-20/Day-50/Day-51 scenario from §11a — object absent after restore; (b) Erasure Authority write succeeds, primary-store purge fails (simulated crash) — retry completes the purge safely, the object is never user-visible in the interim; (c) Erasure Authority unavailable — terminal erasure does not complete, object remains in Deleted state; (d) Erasure Authority unavailable during a restore attempt — restore does not cut over; (e) Erasure Authority contains an erasure record absent from the just-restored primary snapshot — reconciliation purges the object, confirming the mechanism works in the direction it exists for, not just the direction that happens to be convenient to test.

**Worker/role tests, extended:** `scheduler_role` attempts `INSERT` on `execution` → denied; `outbox_consumer_role` attempts `INSERT` on `execution` → denied; `outbox_consumer_role` writes to its own designated projection table → allowed; `tier2_maintenance_role` writes to `occurrence_tracking` → allowed, writes to `history` → denied; **`app_query_role` attempts any write to `execution`/`correction`/`history` → denied**; `app_command_role` executing a valid, predefined domain operation → allowed; `app_command_role` attempting a direct, arbitrary mutation of Tier-1 data outside the predefined operations it's scoped to → must be architecturally impossible, not merely discouraged (§14b's role-isolation invariant).

**Attachment tests, extended:** malicious byte content → rejected; MIME-type claim mismatching actual content → rejected; validated-safe bytes → available for download; **attempted replacement of already-validated bytes under the same Attachment identity → architecturally impossible** (§7); expired signed URL → rejected; a valid signed URL used from outside its granted Workspace scope → rejected.

**Recovery tests, extended:** a recovery token reused after first use → rejected; an expired recovery token → rejected; successful recovery invalidates every other existing session, verified directly, not assumed; a session active before recovery, tested after recovery completes → rejected; a recovery-channel change without step-up re-authentication → rejected.

## 29. Reliability Testing

Required: the five `occurrence_tracking`/Correction tests from `03` §6/§20 (no-Execution→Missed, Execution+Correction+due-passed→Corrected, Correction+new-Execution→new-current, concurrent-completion→one-Execution, completion-races-correction→deterministic sequential outcome); scheduler duplicate-intent prevention under concurrent workers (`03` §9); outbox consumer crash-and-resume producing no duplicate and no lost processing; a full Tier-2 deletion (drop all `occurrence_tracking`/`next_due_at`) followed by reconstruction producing byte-identical state to before deletion, run as an actual automated test, not asserted from the proof alone. **The Erasure Authority's own recovery is tested independently of ordinary primary-database drills** (§11a, §12) — its durability/availability is a distinct dependency the rest of this document's reliability story does not otherwise exercise.

## 30. Compliance and Retention — Explicit Open Decisions

Restated plainly, not buried: legal minimum/maximum retention requirements, right-to-erasure process and timelines, data residency/jurisdiction requirements, and any regulatory framework applicability (health-data-adjacent handling given the Personal Care use case, minors' data given possible Family child accounts) are **all OPEN DECISION**. This document does not invent answers to any of them. They require legal/policy input before `05` can treat any of them as settled — flagged here exactly as strongly as they were flagged in the original repository audit at the start of this project, because nothing since has resolved them.

## 31. Tier Hierarchy Protection — the Organizing Principle of This Document

Every mechanism above exists to protect, not replace, the Tier model `03` froze: Tier 1 gets the strongest guarantees (transactional integrity, immutability enforcement, backup/DR coverage, audit logging of privileged access) because it's the only tier where a mistake is unrecoverable. Tier 2 gets recovery-by-reconstruction instead of backup-and-restore, because that's cheaper and equally correct. Tier 3 gets independent failure isolation and rebuild-from-source, because it was never supposed to need anything stronger. No mechanism in this document creates a fourth kind of truth, a bypass around the Tier model, or a "just this once" exception — that would be the one genuine way this document could contradict `03`, and it doesn't.

## 32. Gap Analysis Matrix

| Area | Current decision | Enforcement mechanism | Failure mode | Test | Open decision |
|---|---|---|---|---|---|
| Authentication | Short-lived rotating tokens, device-bound sessions | §2 | Stolen token used before expiry/rotation | §28 | Exact token lifetime — deferred to `05` |
| Authorization | Owner-only + narrow assignee exception, transactional | §3, `03` §5/§14 | TOCTOU if implementation decouples check from mutation | §26 row, §28 | None |
| Workspace isolation | Server-resolved context, mandatory scoping | §4 | A repository method omits the scope filter | §28 | None |
| Object isolation | Non-sequential IDs + per-read scoping check | §5 | Same as above, per-resource | §28 | None |
| Sensitive data | Object-level Sensitivity, redaction at 3 points | §6, `02` §12.4 | A new code path (e.g., new log statement) forgets redaction | §28 (automated log-scan) | Field-level sensitivity remains deferred (`01` §21) |
| Attachments | Signed, short-lived URLs; scoped upload intents | §7 | A leaked signed URL remains valid until expiry | §28 | None |
| History | Tier-1 authoritative, append-only at DB-role level | `03` §7, §14 | Bypassed only via infrastructure-administrator boundary | §14's break-glass audit review | None |
| Execution | Immutable Fact, `UNIQUE`-backed currency | `03` §6 | Same as History | §29 (five named tests) | None |
| Correction | Immutable Fact, `UNIQUE(execution_id)` | `03` §6 | Same as History | §29 | None |
| Deletion/recovery | Archive/Delete/Restore state machine, 30-day window | `02` §4.3, this doc §11 | Restore after window expiry is impossible by design (correct) | §29 | Legal retention/erasure — OPEN, §30 |
| Erasure Authority | Independently durable, append-only, fail-closed on unavailability | §11a | Compromise/loss of the Authority itself blocks erasure and restore rather than proceeding unsafely | §28, §29 (independent of primary-DB drills) | Exact implementation technology — deferred to `05`; retention scoped to rollback horizon, not "permanent," per the correction above |
| Backups | Retention ≥ 30 days, Erasure Authority reconciliation on restore | §11a, §12 | Backup misconfigured shorter than 30 days | §12's drills | Exact retention period — deferred to `05` |
| Restore | Four-check verification before cutover (Erasure Authority reconciliation, Tier-2 consistency, backup sanity, standing drill) | §12 | Verification step skipped under incident pressure | §12's drills | None architecturally; a process-discipline risk |
| Offline replay | Idempotency (facts) / revision-check (fields), identical online/offline | §18, `03` §17 | None identified beyond implementation correctness | §28, §29 | None |
| Outbox | At-least-once, per-consumer idempotent markers, dead-letter | §20, `03` §9 | Consumer stuck, not draining | §23 (alertable), §29 | Retry/dead-letter thresholds — deferred to `05` |
| Scheduler | Time-driven, idempotent claim via unique insert | §21, `03` §9 | Worker crash mid-dispatch | §29 | None |
| Notifications | Cannot create Execution; content redacted pre-dispatch | §6, `03` §9 | Provider outage — reminders don't arrive | §23 (paging-severity alert) | None architecturally; provider SLA is external |
| Projections | Tier-3, independently rebuildable, never authoritative | `03` §10/§11 | Stale/unavailable — no effect on Tier 1/2 | §29 | None |
| Observability | Named metrics incl. reminder delivery rate; per-consumer lag | §23 | A signal exists but alert threshold untuned | N/A pre-`05` | Alert thresholds — deferred to `05` |
| Secrets | Dedicated store, least-privilege per component, rotatable | §9 | Compromised credential — bounded by scope (§26 row) | §28 | Rotation schedule — deferred to `05` |
| Rate limiting | Present on every mutating endpoint, tighter on sensitive ops | §15 | Architecturally defined, not yet calibrated | Pending `05` thresholds | Exact numeric limits — deferred to `05` |
| Migrations | Distinct elevated role, expand-then-contract, flagged review for Tier-1 tables and role grants | §14a | A careless migration weakens append-only enforcement or worker-role boundaries | Not yet defined — should be a required CI check in `05` | Exact CI enforcement mechanism — deferred to `05` |
| Worker permissions | Per-component database roles; no Tier-1 write grant outside `app_command_role` | §14b | A worker role is mistakenly over-granted during a future migration | §14b's compromised-worker test | None architecturally; enforcement depends on the migration-review flag in §14a actually being honored |
| Account recovery | Single-use time-limited token; full session invalidation on success | §2 | Out-of-band channel (email/SMS) itself compromised | Not yet defined — needed in `05`'s test suite | Exact token TTL and channel mechanism — deferred to `05` |
| Attachment content trust | Scan/validate before availability; content-type verified against actual bytes | §7 | Scanning mechanism has a coverage gap | Not yet defined — needed in `05`'s test suite | Exact scanning tool/service — deferred to `05` |
| Disaster recovery | Tier 1/2 restored; Tier 3 self-heals via replay | §13 | Full regional outage | §12's drills | RPO/RTO numbers — deferred to `05` |

