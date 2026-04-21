# CI Guide

CI uses separate workflow files, one concern per file. All workflows use `permissions: contents: read` and `concurrency` groups to cancel in-flight runs on new pushes.

## Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `ci.yml` | Push to main, PRs to main | Build (`npm run build`) and lint (`npm run lint`) |
| `commit-lint.yml` | Push to main, PRs to main | Enforces [Conventional Commits](https://www.conventionalcommits.org/) |
| `changelog-check.yml` | PRs to main | Requires CHANGELOG.md updates on PRs |
| `blob-size-policy.yml` | PRs to main | Rejects files larger than 1MB (configurable via `BLOB_SIZE_LIMIT` variable) |

## Adding New Checks

- **Project-specific** jobs (test coverage, deployment) go in `ci.yml`
- **Cross-cutting policies** (commit style, size limits) get their own workflow file

## Local Validation

Before pushing, run:

```bash
npm run lint       # tsc --noEmit
npm run build      # tsc
```
