# Lumora API & REST Transport Architecture

> **STATUS**: Authoritative API Specification  
> **LAST RECONCILED**: 2026-08-10  

---

## 1. RESTful URL Conventions

All workspace-bound resources follow the standard tenant prefix:
`/workspaces/:workspaceId/<resource>`

### Core Endpoints Matrix:
- `POST /workspaces/:workspaceId/objects` — Universal Create
- `GET /workspaces/:workspaceId/objects` — Workspace Object List (Paginated)
- `GET /workspaces/:workspaceId/objects/:idOrKey` — Object Detail
- `PATCH /workspaces/:workspaceId/objects/:id` — CAS Update
- `DELETE /workspaces/:workspaceId/objects/:id` — Soft Delete
- `GET /workspaces/:workspaceId/timeline` — Activity Stream
- `GET /workspaces/:workspaceId/search?query=` — Full-Text Search
- `GET /workspaces/:workspaceId/relationships` — Graph Links
- `GET /workspaces/:workspaceId/collections` — Collections List

---

## 2. Standardized Response & Error Contracts

APIs return pure JSON payloads wrapped by application Use Cases using `Result<T, ApplicationException>`.

### Error Mapping Rules (ADR-001):
- `EntityNotFoundException` → `404 Not Found`
- `RevisionConflictException` / `ObjectConcurrencyException` → `409 Conflict`
- `DomainValidationException` → `422 Unprocessable Entity`
- `ForbiddenException` → `403 Forbidden`
- `UnauthorizedException` → `401 Unauthorized`

---

## 3. Pagination Controls

- Workspace object listing supports cursor-based pagination using base64url-encoded `updatedAt_ISO|id` strings (`first`, `after`).
- Default page size: 50 items. Maximum page size: 100 items (`MAX_PAGE_SIZE = 100`).
