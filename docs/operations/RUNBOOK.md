# Lumora Operational Runbook & Incident Response

## Severity Level Definitions

| Level | Impact | Initial Response SLA | Escalation |
|---|---|---|---|
| **SEV-1** | Core API or database outage; complete platform downtime. | 15 mins | Lead Architect / Infrastructure On-Call |
| **SEV-2** | Degraded functionality; specific module failure (e.g. notifications/reminders failing). | 1 hour | Backend Engineering Lead |
| **SEV-3** | Minor operational flaw; non-critical performance degradation. | 4 hours | On-Call Engineer |

---

## Alerting & Common Incident Mitigation

### Incident 1: Database Connection Pool Exhaustion
- **Symptom**: `PrismaClientKnownRequestError` with error code `P2024` (Timed out fetching a connection from the pool).
- **Diagnosis**: Run `SELECT count(*) FROM pg_stat_activity WHERE state = 'active';` to inspect active connections.
- **Mitigation**:
  1. Increase `connection_limit` parameter in `DATABASE_URL`.
  2. Inspect long-running transactions exceeding `DEFAULT_WORKSPACE_TRANSACTION_TIMEOUT_MS` (20,000ms).
  3. Restart NestJS backend instances gracefully to release leaked connections.

### Incident 2: High Memory / Battery Drain on Mobile Client
- **Symptom**: Mobile app slowdown during large list virtualized rendering.
- **Mitigation**: Verify FlashList / FlatList windowing configuration in React Native client and enforce backend keyset cursor pagination (`take: 50`).

---

## Log Inspection Procedures
Logs are output in structured JSON format via NestJS Logger. Filter production logs by correlation ID:
```bash
docker logs lumora-backend | grep '"requestId":"<REQUEST_ID>"'
```
