# AGENTS.md — pike-ai-kb

Curated, runtime-verified knowledge base for the Pike programming language (8.0.1116). Covers syntax, type system, and 130+ standard library modules with code examples tested against a live Pike runtime.

Serves as both an installable agent skill and an MCP server exposing tools, resources, and prompts for Pike language assistance.

## Architecture: LLM Wiki

The knowledge base follows the [LLM Wiki pattern](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) — a three-layer structure where knowledge is compiled once and kept current, not re-derived on every query.

```
raw/         Immutable source documents — the source of truth the LLM reads from
wiki/        LLM-maintained interlinked markdown pages — the persistent, compounding artifact
AGENTS.md    Schema — conventions and workflows for wiki maintenance
```

The wiki is the primary interface. The raw sources are never modified. The LLM owns the wiki entirely — creating pages, updating them, maintaining cross-references, and keeping everything consistent.

## Layers

### raw/ — Sources

Immutable source documents. The LLM reads from these but never modifies them.

- Pike 8.0 language reference and stdlib documentation
- Runtime verification results (factcheck output)
- Community articles, RFCs, GitHub discussions
- Images stored locally in `raw/assets/`

### wiki/ — Knowledge Base

LLM-generated interlinked markdown pages. The wiki grows and stays current through three operations (see Operations below).

```
wiki/
  overview.md              Top-level entry point and synthesis
  index.md                 Content catalog — updated on every ingest/lint
  log.md                   Chronological activity log — append only
  concepts/                Language concept pages (6 pages)
  entities/                Core type pages — array, mapping, string, etc. (6 pages)
  modules/                 Standard library module pages (9 pages)
  guides/                  Task-oriented guides — debugging, idiomatic Pike (2 pages)
```

### skills/ — Agent Tools

Hermes Agent skill definitions backed by the wiki. The `skills/` directory provides installable skill packages. The `wiki/` directory is the source of truth that the skills draw from.

## Operations

### Ingest

When a new source is added to `raw/` (or the wiki is first populated):

1. Read the source document
2. Update `raw/manifest.md` with the new entry
3. Create or update wiki pages — extract key information, integrate with existing pages, update cross-references
4. Update `wiki/index.md` — add new pages to the catalog
5. Append to `wiki/log.md` — record the ingest event

A single source may touch 10–15 wiki pages. After ingesting, report what changed so the human can review.

### Query

When asked a Pike question:

1. Read `wiki/index.md` to find relevant pages
2. Read those pages
3. Synthesize an answer with citations to wiki pages
4. If the answer is a new synthesis, comparison, or insight worth keeping — offer to file it as a new wiki page

### Lint

Periodically, ask to health-check the wiki:

- Contradictions between pages
- Stale claims superseded by newer sources
- Orphan pages with no inbound links
- Important concepts mentioned but lacking their own page
- Missing cross-references
- Data gaps that could be filled with a web search

Report findings. Update pages and `wiki/log.md` with lint results.

## Project Structure

```
raw/
  README.md                This layer's purpose and conventions
  manifest.md               Catalog of all source documents
  assets/                   Downloaded images, diagrams

wiki/
  overview.md               Top-level entry point
  index.md                  Content catalog (updated on ingest/lint)
  log.md                    Activity log (append-only)
  concepts/                 Language concept pages
  entities/                 Core type pages
  modules/                  Standard library module pages
  guides/                   Task-oriented guides

skills/
  pike-language-reference/  Agent skill — syntax, types, stdlib patterns
  pike-stdlib-api/          Agent skill — exact API signatures
  pike-debugging/           Agent skill — error diagnosis, CLI introspection

src/
  index.ts                  MCP server entry — 7 tools, resources, prompts
  runner.ts                 Pike execution helpers (runPike, runPikeCode)
  extractModule.ts          Module section extractor for stdlib reference
  tools.test.ts             Test suite (77 tests, all passing)
  pike-helpers.ts           Pike code generation helpers
  validation.ts             Input validation schemas

dist/                       Compiled output (gitignored)
```

## Build & Run

```bash
npm install
npm run build          # tsc → dist/
npm run start          # node dist/index.js
npm run lint           # eslint src/
npm run typecheck      # tsc --noEmit
npm run format:check    # prettier --check
npm test               # vitest run (77 tests)
```

Requirements: Node.js >= 22, TypeScript 5.x.

## Code Style

- Follow existing patterns in `src/index.ts` and `skills/`.
- TypeScript strict mode is enabled — respect it.
- Write descriptive commit messages (Conventional Commits).
- Update CHANGELOG.md for user-visible changes.

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
- When answering Pike questions, consult the wiki first before falling back to raw sources.

## Conventions

- **Commits**: [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `chore:`, etc.)
- **Branches**: Conventional Branch naming (`feature/`, `fix/`, `chore/`, `docs:`)
- **Changelog**: [Keep a Changelog](https://keepachangelog.com/) format
- **Wiki pages**: kebab-case filenames, relative links between pages, links to raw sources for deeper reading

## Template Version

0.3.0
