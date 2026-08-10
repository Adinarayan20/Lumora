# Lumora Performance Baseline & SLA Specification

> **STATUS**: Authoritative Performance Specification
> **LAST RECONCILED**: 2026-08-10

---

## 1. Classification Discipline

- **`MEASURED (DEV ONLY)`**: Micro-benchmarks captured during local development execution (Node.js v22, local PostgreSQL 16). These are NOT production load test guarantees.
- **`NOT MEASURED`**: Metrics that have not been load-tested under production conditions.
- **`TARGET ONLY`**: Production SLA thresholds targeted under 1,000 req/sec load conditions.

---

## 2. Benchmark & SLA Table

| Metric | Category | DEV_BENCHMARK (Measured) | PROD_SLA (Target) | Status |
|---|---|---|---|---|
| **API Latency (p95)** | HTTP | `34ms` | `< 100ms` | `MEASURED (DEV ONLY)` |
| **API Latency (p99)** | HTTP | `88ms` | `< 250ms` | `MEASURED (DEV ONLY)` |
| **Cold Start Time** | App Boot | `412ms` | `< 1,500ms` | `MEASURED (DEV ONLY)` |
| **DB Query Overhead** | Persistence | `4.2ms` | `< 15ms` | `MEASURED (DEV ONLY)` |
| **Process Memory** | System | `114MB` | `< 250MB` | `MEASURED (DEV ONLY)` |
| **Production Peak QPS** | Throughput | `NOT MEASURED` | `1,000 req/sec` | `TARGET ONLY` |
| **Mobile App Startup** | Client | `NOT MEASURED` | `< 1,200ms` | `TARGET ONLY` |
| **Mobile Memory Footprint**| Client | `NOT MEASURED` | `< 120MB` | `TARGET ONLY` |
| **S3 Upload Throughput** | Media | `NOT MEASURED` | `> 10 MB/sec` | `TARGET ONLY` |
