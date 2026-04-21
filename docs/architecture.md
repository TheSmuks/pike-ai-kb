# Architecture

See [ARCHITECTURE.md](../ARCHITECTURE.md) for the full architecture document.

## Summary

pike-ai-kb is a dual-purpose package:

1. **Agent Skill**: Static markdown files in `skills/` consumed by AI coding agents for Pike language knowledge.
2. **MCP Server**: Node.js server providing runtime tools for Pike code execution, syntax checking, and symbol introspection.

### Key Components

| Component | Path | Purpose |
|-----------|------|---------|
| Skill files | `skills/pike-language-reference/` | Static Pike language reference for AI agents |
| MCP server | `src/index.ts` | Runtime tools (evaluate, check-syntax, describe-symbol, list-modules, list-methods) |
| Reference docs | `skills/pike-language-reference/references/` | Detailed stdlib patterns, syntax, and type system docs |
| CI workflows | `.github/workflows/` | Build, lint, commit-lint, changelog-check, blob-size-policy |

### Dependencies

- **Runtime**: Node.js >= 20, Pike >= 8.0 (for execution tools only)
- **Build**: TypeScript 5.x, `@modelcontextprotocol/sdk`, `zod`
