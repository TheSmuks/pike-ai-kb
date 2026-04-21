# ADR 0001: Initial Architecture

## Status

Accepted

## Context

pike-ai-kb needs to serve Pike language knowledge to AI coding agents through two channels:

1. **Static knowledge** — syntax, types, stdlib patterns, idiomatic conventions
2. **Dynamic introspection** — runtime symbol lookup, code execution, syntax validation

The project must be installable as both an agent skill (via skills.sh) and an MCP server.

## Decision

Use a dual-package architecture:

- **Agent skill**: Markdown files in `skills/pike-language-reference/` following the agent skills specification. Static, version-controlled, and distributable via `npx skills add`.
- **MCP server**: TypeScript application using `@modelcontextprotocol/sdk`. Provides tools for Pike runtime interaction and resources for serving curated documentation.

Both channels share the same underlying knowledge base files, ensuring consistency.

## Consequences

- **Positive**: Single source of truth for Pike knowledge. AI agents can use static skills for quick reference and MCP tools for runtime verification.
- **Positive**: Skill files are version-controlled and can be reviewed like code.
- **Negative**: Pike must be available on the host system for MCP server execution tools to work. The knowledge base (skill files) works without Pike.
- **Negative**: Large reference files (stdlib-patterns.md is 6500+ lines) may consume significant context window. Future work may split these into per-module files.
