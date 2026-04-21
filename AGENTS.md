# AGENTS.md — pike-ai-kb

Curated, runtime-verified knowledge base for the Pike programming language (8.0.1116). Covers syntax, type system, and 130+ standard library modules with code examples tested against a live Pike runtime.

Serves as both an installable agent skill and an MCP server exposing tools, resources, and prompts for Pike language assistance.

## Build & Run

```bash
npm install
npm run build          # tsc → dist/
npm run start          # node dist/index.js
npm run lint           # tsc --noEmit
```

Requirements: Node.js >= 20, TypeScript 5.x.

## Code Style

- Follow existing patterns in `src/index.ts` and `skills/`.
- TypeScript strict mode is enabled — respect it.
- Write descriptive commit messages (Conventional Commits).
- Update CHANGELOG.md for user-visible changes.

## Project Structure

```
src/
  index.ts                       # MCP server entry — 5 tools, resources, prompts

skills/
  pike-language-reference/       # Agent skill
    SKILL.md                     # Core rules, gotchas, quick-reference
    references/                  # Detailed reference files
      stdlib-patterns.md         # 6500+ lines, 130+ modules
      syntax.md                  # Control flow, operators, declarations
      types.md                   # Type system, coercion, typeof

dist/                            # Compiled output (gitignored)
```

## Testing

- All new features must include tests.
- Bug fixes must include regression tests.
- Examples in skill files must be verified against Pike 8.0.1116.

## Error Handling

- Do not suppress errors.
- Errors must be distinguishable from success at the caller boundary.
- Fail explicitly — no plausible-looking output on failure.

## CI/CD

Four GitHub Actions workflows:

| Workflow | Purpose |
|---|---|
| `ci.yml` | Build, lint, type-check |
| `commit-lint.yml` | Enforce Conventional Commits format |
| `changelog-check.yml` | Require CHANGELOG.md entry on user-facing changes |
| `blob-size-policy.yml` | Reject oversized binary blobs |

## Agent Behavior

- Read existing code before modifying — match surrounding patterns.
- Search for existing solutions before introducing new abstractions.
- Prefer editing existing files over creating new ones.
- Do not leave placeholder comments, TODO stubs, or forwarding addresses.
- Remove dead code completely — no commented-out blocks, no tombstones.
- Validate all claims against source code or documentation before stating them.
- When blocked, gather more information rather than guessing.

## Conventions

- **Commits**: [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `chore:`, etc.)
- **Branches**: Conventional Branch naming (`feature/`, `fix/`, `chore/`, `docs/`)
- **Changelog**: [Keep a Changelog](https://keepachangelog.com/) format

## Template Version

0.2.0
