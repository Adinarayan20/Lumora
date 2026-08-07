# ADR-012: Continuous Integration & Repository Automation Architecture

## Context & Problem Statement
To maintain production software quality and prevent regressions in Lumora, every code change submitted via Pull Request or merged into `main` must undergo automated validation on a clean runner.

Manual local testing is non-deterministic and susceptible to machine-specific environment drift, missing dependencies, or uncommitted files.

## Decision Drivers
- **Node Version Consistency**: Single source of truth defined in root `.nvmrc` (`22`). Injected into GitHub Actions workflow via `node-version-file: '.nvmrc'` to guarantee zero version divergence between local dev and CI.
- **Deterministic Prisma Generation**: Single workspace script `pnpm prisma:generate` (`pnpm --filter backend exec prisma generate`) invoked cleanly before quality gates.
- **Deterministic Quality Enforcement**: All Pull Requests and merges targeting `main` must run through a standardized GitHub Actions CI pipeline.
- **Fail Fast Strategy**: Pipeline steps are ordered by execution speed: Typecheck → Lint → Unit Tests → Monorepo Build. Any step failure immediately halts the job.
- **Caching Strategy**: Leverages `actions/setup-node` with native `pnpm` store caching to minimize dependency installation duration across runs.
- **Concurrency Control**: Enforces `concurrency` groups (`cancel-in-progress: true`) to automatically cancel outdated workflow runs when new commits are pushed to the same branch.
- **Future Integration Test Migration**: CI environment variables (`DATABASE_URL`, `REDIS_URL`) serve as local unit test placeholders. When integration test suites are added in future phases, the workflow will expand to use GitHub Service Containers (`services.postgres`, `services.redis`) and GitHub Secrets.

## Decision
1. Implement `.github/workflows/ci.yml` triggering on `push` to `main` and `pull_request` targeting `main`.
2. Enforce a 15-minute job timeout limit.
3. Configure `actions/upload-artifact@v4` on failure to capture diagnostic logs and test reports.

## Status
Accepted

## Consequences

### Positive
- Guaranteed build stability, Node runtime parity, and zero untested code merged into `main`.
- Reduced GitHub Actions billable minutes via concurrency cancellation and pnpm caching.

### Negative / Trade-offs
- PR merges require waiting ~1-2 minutes for CI quality gates to complete.
