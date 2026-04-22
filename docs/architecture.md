# Architecture

See [ARCHITECTURE.md](../ARCHITECTURE.md) for the full architecture document.

## Summary

pike-ai-kb is a dual-purpose package:

1. **Agent Skill**: Static markdown files in `skills/` consumed by AI coding agents for Pike language knowledge.
2. **MCP Server**: Node.js server providing runtime tools for Pike code execution, syntax checking, and symbol introspection.

### Key Components

| Component | Path | Purpose |
|-----------|------|----------|
| Skill files | `skills/pike-language-reference/` | Static Pike language reference for AI agents |
| Skill files | `skills/pike-stdlib-api/` | Exact function signatures for 30+ modules |
| Skill files | `skills/pike-debugging/` | Error diagnosis, CLI introspection, runtime debugging |
| MCP server | `src/index.ts` | Runtime tools (7 tools: evaluate, check-syntax, describe-symbol, list-modules, list-methods, validate-example, signature) |
| Runner | `src/runner.ts` | Pike execution helpers (runPike, runPikeCode) |
| Module extractor | `src/extractModule.ts` | Section extractor for stdlib reference resources |
| Reference docs | `skills/*/references/` | Detailed stdlib patterns, syntax, types, API, debugging docs |
| CI workflows | `.github/workflows/` | Build, lint, commit-lint, changelog-check, blob-size-policy |

### Dependencies

- **Runtime**: Node.js >= 20, Pike >= 8.0 (for execution tools only)
- **Build**: TypeScript 5.x, `@modelcontextprotocol/sdk`, `zod`

- **Skills**: pike-language-reference, pike-stdlib-api, pike-debugging