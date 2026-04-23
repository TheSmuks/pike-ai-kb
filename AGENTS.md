# AGENTS.md — pike-ai-kb

Curated, runtime-verified knowledge base for the Pike programming language (8.0.1116). Covers syntax, type system, and 130+ standard library modules with code examples tested against a live Pike runtime.

Serves as both an installable agent skill and an MCP server exposing tools, resources, and prompts for Pike language assistance.

## Build & Run

```bash
npm install
npm run build          # tsc → dist/
npm run start          # node dist/index.js
npm run lint           # eslint src/
npm run typecheck      # tsc --noEmit
npm run format:check   # prettier --check
```

Requirements: Node.js >= 22, TypeScript 5.x.

## Code Style

- Follow existing patterns in `src/index.ts` and `skills/`.
- TypeScript strict mode is enabled — respect it.
- Write descriptive commit messages (Conventional Commits).
- Update CHANGELOG.md for user-visible changes.

## Project Structure

```
src/
  index.ts                       # MCP server entry — 7 tools, resources, prompts
  runner.ts                      # Pike execution helpers (runPike, runPikeCode)
  extractModule.ts               # Module section extractor for stdlib reference
  tools.test.ts                  # Test suite (118 tests)

skills/
  pike-language-reference/       # Agent skill — syntax, types, stdlib patterns
    SKILL.md                     # Core rules, gotchas, quick-reference (322 lines)
    references/
      stdlib-patterns.md         # 6,574 lines, 157 sections, 130+ modules
      syntax.md                  # 913 lines, control flow, operators, declarations
      types.md                   # 326 lines, type system, coercion, typeof
      idiomatic-pike.md          # 603 lines, idiomatic patterns, anti-patterns

  pike-stdlib-api/               # Agent skill — exact API signatures
    SKILL.md                     # API reference index (36 lines)
    references/
      stdio-api.md               # 544 lines
      adt-api.md                 # 472 lines
      utilities-api.md           # 547 lines
      crypto-api.md              # 357 lines
      protocols-api.md           # 345 lines
      concurrent-api.md          # 194 lines
      standards-api.md           # 146 lines

  pike-debugging/                # Agent skill — error diagnosis, CLI introspection
    SKILL.md                     # Debugging skill definition (191 lines)
    references/
      cli-and-introspection.md   # 225 lines
      error-patterns.md          # 298 lines

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
