# Lumora — AI-Ready Personal Life Operating System

Lumora is a Personal Life Operating System built on a **Universal Object Model** (*Everything is an Object*: Task, Note, Medicine, Grocery, Plant, Pet, Vehicle, Bill, Document, Habit, Event, Subscription, Custom Object).

---

## Current Status

- **Completed Phases**: Phase A–C (DDD Infrastructure), Phase D (Runtime & Capabilities), Phase E (Persistence & CAS Concurrency).
- **Current Phase**: Foundation Reconciliation Pass (Documentation Truth & Architecture Audit).
- **Next Phase**: Product Construction (UI Experience & Feature Wiring).

---

## Documentation & Architecture

All documentation is reconciled and maintained as a single source of truth in the [`docs/`](docs/) directory. The frozen architectural contract — [`docs/00_DOCUMENTATION_INDEX.md`](docs/00_DOCUMENTATION_INDEX.md) through `docs/04_DATA_SECURITY_RELIABILITY.md` — is the primary authority; everything below is subordinate to it.

- **Master Documentation Index**: [`docs/README.md`](docs/README.md)
- **Frozen Architectural Contract**: [`docs/00_DOCUMENTATION_INDEX.md`](docs/00_DOCUMENTATION_INDEX.md)
- **Team Ownership Boundaries**: [`docs/architecture/DEVELOPMENT_BOUNDARIES.md`](docs/architecture/DEVELOPMENT_BOUNDARIES.md)
- **Product Roadmap**: [`docs/product/PRODUCT_ROADMAP.md`](docs/product/PRODUCT_ROADMAP.md)
- **Technical Debt Registry**: [`docs/architecture/TECH_DEBT.md`](docs/architecture/TECH_DEBT.md)
- **Architecture Decision Records**: [`docs/architecture/adr/`](docs/architecture/adr/)

---

## Quick Start & Operations

See [`docs/operations/RUNBOOK.md`](docs/operations/RUNBOOK.md) for local environment setup, database migrations, and operational guidelines.
See [`docs/operations/DEPLOYMENT_GUIDE.md`](docs/operations/DEPLOYMENT_GUIDE.md) for production deployment pipelines.
