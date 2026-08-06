# Lumora Technical Debt & Deferred Architectural Backlog

This document records architectural recommendations, infrastructure components, and enterprise capabilities deferred from current units (Unit 1 & Unit 2) to maintain strict scope control and prevent premature optimization.

---

## Technical Debt & Deferral Registry

| ID | Capability / Recommendation | Priority | Target Phase | Status | Reason for Deferral | Estimated Effort |
|---|---|:---:|:---:|:---:|---|:---:|
| **TD-001** | **Kafka Event Bus Integration** | High | Phase 3 (Scale) | `Deferred` | In-process transactional outbox worker satisfies current single-node processing throughput requirements without introducing cluster operational overhead. | 2 Sprints |
| **TD-002** | **RabbitMQ Task Queue Cluster** | Medium | Phase 3 (Scale) | `Deferred` | Current outbox polling pattern handles asynchronous event processing reliably. RabbitMQ will be integrated when background task workload demands dedicated message queuing. | 1 Sprint |
| **TD-003** | **Elasticsearch / Meilisearch Engine** | High | Phase 3 (Search) | `Deferred` | PostgreSQL full-text indexing and basic keyword search satisfy initial object search requirements for Unit 2. Dedicated search indexing engine scheduled for Phase 3. | 2 Sprints |
| **TD-004** | **OpenTelemetry APM & Distributed Tracing** | Medium | Phase 3 (Observability) | `Deferred` | NestJS JSON Logger and Correlation ID middleware provide adequate request context tracing. OpenTelemetry collector integration deferred to enterprise deployment phase. | 1 Sprint |
| **TD-005** | **PostgreSQL Read Replicas & CQRS Projections** | High | Phase 3 (Scale) | `Deferred` | Single PostgreSQL instance with optimized indexes handles current read workload. Read replicas and separate CQRS read models will be provisioned under scale benchmark milestones. | 3 Sprints |
| **TD-006** | **Redis Distributed Cache Layer** | Medium | Phase 3 (Scale) | `Deferred` | In-memory caching and direct database reads satisfy early phase performance targets. Distributed cache layer deferred to prevent cache invalidation complexity during domain construction. | 1 Sprint |
| **TD-007** | **Cloudflare / CloudFront Global CDN** | Low | Phase 4 (Production) | `Deferred` | Asset storage and media delivery are backed by local file asset storage in dev/test environment. CDN integration belongs to production infrastructure setup. | 1 Sprint |
| **TD-008** | **Multi-Region Active-Active Database Deployment** | Low | Phase 4 (Enterprise) | `Deferred` | Single region deployment meets initial production availability goals. Multi-region active-active replication deferred to global enterprise phase. | 4 Sprints |
| **TD-009** | **SOC2 Type II Compliance & Audit Controls** | Medium | Phase 4 (Compliance) | `Deferred` | Detailed audit logging is captured in `AuditLogRepository`. Formal SOC2 policies, controls, and external auditing deferred to enterprise compliance milestone. | 3 Sprints |
| **TD-010** | **ISO27001 Security Management Certification** | Low | Phase 4 (Compliance) | `Deferred` | Security rules (RBAC, JWT, Bcrypt) are implemented at code boundaries. ISO27001 ISMS certification deferred to enterprise launch phase. | 3 Sprints |
| **TD-011** | **Automated Multi-Region Disaster Recovery (DR)** | Medium | Phase 4 (Infrastructure) | `Deferred` | Database point-in-time recovery and snapshot backups provide initial recovery capability. Automated multi-region DR failover deferred to Phase 4. | 2 Sprints |
| **TD-012** | **Kubernetes Auto-Scaling (HPA / KEDA)** | Medium | Phase 3 (DevOps) | `Deferred` | Containerized monorepo deploys cleanly on single node / Docker Compose for development and staging. K8s HPA deferred to Phase 3 infrastructure setup. | 2 Sprints |
| **TD-013** | **Dynamic Micro-Kernel Plugin Architecture** | Low | Phase 4 (Extensibility) | `Deferred` | Universal Object Catalog supports custom types via JSON attributes. Dynamic third-party plugin loading deferred to prevent premature architectural complexity. | 4 Sprints |
| **TD-014** | **Timeline Schema Migration v2 Audit Columns** | Medium | Phase 2 (Unit 3) | `Tracked` | Current Prisma Timeline schema model persists id, objectId, startedAt, endedAt, timezone. Dedicated columns for workspaceId, userId, action, metadata will be added in database migration v2. | 1 Sprint |

---

## Architectural Deferral Policy

1. **Premature Optimization Protection**: Enterprise infrastructure (Kafka, K8s, Redis clusters, Read Replicas) MUST NOT be introduced during domain engineering phases unless benchmark evidence demonstrates performance degradation.
2. **Tracked Milestones**: Every deferred item must remain recorded in this registry until formally scheduled in `Roadmap.md` and assigned an implementation issue.
3. **Zero Technical Debt Inflation**: Code implemented during Unit 2 must adhere strictly to `IMPLEMENTATION_GUIDELINES.md` so that future integration of deferred capabilities requires zero refactoring of domain core logic.
