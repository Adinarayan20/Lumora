# Lumora Platform Performance Baseline & SLA Thresholds

## Key Performance Indicators (KPIs)

| Metric | Target SLA | Measurement Method | Benchmark Status |
|---|---|---|---|
| **API Latency (p95)** | < 100ms | HTTP Response Header Timing | `PASSED` |
| **API Latency (p99)** | < 250ms | APM Middleware Metrics | `PASSED` |
| **Cold Start Time** | < 1,500ms | Container Boot Time | `PASSED` |
| **Database Query Overhead** | < 15ms | Prisma Middleware Query Logger | `PASSED` |
| **Memory Footprint** | < 200MB / instance | Node.js process.memoryUsage() | `PASSED` |

---

## Architectural Performance Controls

1. **Pagination Limits**: All workspace collection queries mandate maximum page size of 50 items (`take: 50`) using cursor-based pagination (`CursorEncoder`).
2. **N+1 Prevention**: Explicit relation selection (`include: OBJECT_RELATIONS_INCLUDE`) prevents N+1 query multiplication.
3. **Database Index Coverage**: Composite access paths (`workspaceId`, `userId`, `action`) indexed in PostgreSQL database.
