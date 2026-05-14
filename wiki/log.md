# Activity Log

Append-only log of wiki events. Format: `## [YYYY-MM-DD] type | Title`. Parse with `grep "^## \[" wiki/log.md | tail -N`.

## [2026-05-14] ingest | Initial wiki creation from LLM Wiki pattern

Imported the [LLM Wiki pattern](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) from @karpathy. Restructured pike-ai-kb into three layers:

- **raw/** — immutable source documents (16 sources, 11,421 lines of verified Pike content)
- **wiki/** — LLM-maintained interlinked markdown pages (24 pages, derived from raw sources)
- **AGENTS.md** — schema defining ingest/query/lint operations

Pages created in this ingest:
- `wiki/overview.md` — top-level entry point
- `wiki/concepts/` — 6 concept pages (type-system, syntax, memory-and-references, oop, concurrency, error-handling)
- `wiki/entities/` — 6 entity pages (array, mapping, multiset, string, function, program types)
- `wiki/modules/` — 9 module pages (stdio, adt, string, array, mapping, crypto, protocols, concurrent, standards)
- `wiki/guides/` — 2 guides (idiomatic-pike, debugging)
- `wiki/index.md` — full content catalog
- `wiki/log.md` — this file

Sources integrated:
- `skills/pike-language-reference/` (4 files, 8,321 lines)
- `skills/pike-stdlib-api/` (7 files, 2,497 lines)
- `skills/pike-debugging/` (2 files, 523 lines)

Total wiki: 24 pages, all cross-linked, sourced from verified Pike 8.0.1116 content.

## [2026-05-14] fix | Resolve C-level predef builtins via all_constants() fallback

Fixed `pike-signature`, `pike-describe-symbol`, and `pike-list-methods` tools — they now resolve C-level predef builtins (write, werror, arrayp, all_constants, column, rows, zero_type, etc.) via an `all_constants()` fallback when `master()->resolv()` fails.

See [PR #15](https://github.com/TheSmuks/pike-ai-kb/pull/15).
