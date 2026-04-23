# Architecture

## Overview

pike-ai-kb is a dual-purpose npm package: (a) an installable agent skill providing Pike language reference to AI coding agents, and (b) an MCP (Model Context Protocol) server providing runtime tools for Pike code execution and introspection. Both roles share a single knowledge base of curated, runtime-verified Pike documentation.

## Components

### Skill Layer: pike-language-reference (`skills/pike-language-reference/`)

Static markdown files consumed by AI agents at prompt-construction time. No runtime dependency on the MCP server.

| File | Purpose |
|---|---|
| `SKILL.md` | Core language rules and gotchas — literal syntax, reference semantics, immutability, integer division, constructors, inheritance, switch fall-through, foreach, sscanf, zero_type, operator overloading |
| `references/stdlib-patterns.md` | Detailed standard library patterns organized by module (6500+ lines, 157+ sections). All examples verified against Pike 8.0.1116 |
| `references/syntax.md` | Pike syntax reference: control flow, operators, declarations, preprocessor directives |
| `references/types.md` | Pike type system: value vs reference types, coercion, typeof, type annotations, operators |
| `references/idiomatic-pike.md` | Idiomatic Pike patterns guide |

### Skill Layer: pike-stdlib-api (`skills/pike-stdlib-api/`)

| File | Purpose |
|---|---|
| `SKILL.md` | API reference index for 7 module groups |
| `references/stdio-api.md` | Stdio module API (544 lines) |
| `references/adt-api.md` | ADT module API (472 lines) |
| `references/utilities-api.md` | Utilities API (547 lines) |
| `references/crypto-api.md` | Crypto module API (357 lines) |
| `references/protocols-api.md` | Protocols API (345 lines) |
| `references/concurrent-api.md` | Concurrent API (194 lines) |
| `references/standards-api.md` | Standards API (146 lines) |

### Skill Layer: pike-debugging (`skills/pike-debugging/`)

| File | Purpose |
|---|---|
| `SKILL.md` | Debugging skill definition — error diagnosis workflow |
| `references/cli-and-introspection.md` | CLI flags and runtime introspection (225 lines) |
| `references/error-patterns.md` | Error patterns taxonomy with fixes (298 lines) |

### MCP Server (`src/index.ts`)

Node.js MCP server built on `@modelcontextprotocol/sdk`. Communicates over stdio. Starts by probing the Pike binary, verifying the knowledge base, and running content integrity validation.

**Tools (7):**

| Tool | Purpose |
|---|---|
| `pike-evaluate` | Execute Pike code via temp file. Returns stdout/stderr. Configurable timeout (default 30s). Optional stdin piped to the process |
| `pike-check-syntax` | Compile without executing using `compile_string()`. Returns "Syntax OK" or compilation errors |
| `pike-describe-symbol` | Runtime symbol introspection via `master()->resolv()`. Returns structured JSON with type, kind, and members |
| `pike-list-modules` | Scans `master()->pike_module_path` for `.pmod`/`.pike` files. Returns structured JSON with sorted module list |
| `pike-list-methods` | Lists all methods/indices on a resolved class or module. Returns structured JSON |
| `pike-validate-example` | Validate a Pike code example by compiling and optionally running it. Returns PASS/FAIL |
| `pike-signature` | Get the exact type signature of a Pike symbol. Returns structured JSON with per-member type info. More precise than pike-describe-symbol |
**Resources (44):**

- `pike://ref/{Module}` — Per-module curated sections from `stdlib-patterns.md` for 30 documented modules
- `pike://ref/stdlib` — Full standard library reference
- `pike://ref/syntax` — Syntax reference
- `pike://ref/types` — Type system reference
- `pike://ref/skill` — Complete SKILL.md content
- `pike://ref/idiomatic-pike` — Idiomatic Pike patterns guide
- `pike://ref/api/{module}` — API references for 7 module groups (stdio, adt, concurrent, crypto, protocols, standards, utilities)
- `pike://ref/debugging/cli` — CLI flags and runtime introspection
- `pike://ref/debugging/errors` — Error patterns taxonomy with fixes

Resource content is lazily loaded and cached in-process on first access.

**Prompts (4):**

| Prompt | Purpose |
|---|---|
| `write-pike` | Write Pike code for a given task, with inline convention reminders |
| `translate-to-pike` | Translate code from another language to idiomatic Pike |
| `explain-pike` | Explain Pike code with focus on idioms and gotchas |
| `review-pike` | Review Pike code for correctness against a checklist of common mistakes |

### Pike Runtime

External dependency. Requires Pike >= 8.0 on `PATH`, or the `PIKE_BIN` environment variable pointing to the binary. Used for:

- Code execution (temp file pattern — Pike 8.0.1116 does not support `pike -`)
- Syntax checking (`compile_string()` via `pike -e`)
- Symbol introspection (`master()->resolv()` via temp file — requires function definitions for `Standards.JSON.encode()`)
- Module discovery (scanning `pike_module_path` via `pike -e`)

All Pike invocations use `child_process.execFile` with configurable timeouts and a 10MB output buffer.

### Shared Helpers (`src/pike-helpers.ts`)

Eliminates duplication across the three introspection tools (`pike-describe-symbol`, `pike-list-methods`, `pike-signature`):

- `pikeResolvePreamble(symExpr)` — Shared Pike code for symbol resolution with `_Stdio` fallback
- `pikeToolResponse(result, errorPrefix)` — Generic MCP response handler for Pike execution results
- `buildDescribeSymbolCode()`, `buildListMethodsCode()`, `buildSignatureCode()`, `buildListModulesCode()` — Pike code generators that produce structured JSON via `Standards.JSON.encode()`
- `_safe_typeof()` (Pike function) — Maps Pike types to JSON-safe strings, correctly distinguishing `program` from `function` (Pike programs are callable, so `sprintf("%t")` misreports them as `function`)

### Content Validation (`src/validation.ts`)

Runs at startup to catch content integrity issues early:

- **Module heading validation**: Verifies each entry in `documentedModules` has a matching heading in `stdlib-patterns.md`
- **Code fence validation**: Counts `` ``` `` markers in all skill markdown files and warns on mismatches

## Data Flow

```
                    ┌─────────────────────────────────────┐
                    │           AI Agent / MCP Client      │
                    └───────┬─────────────┬───────────────┘
                            │             │
                 Skill files│             │MCP (stdio)
                 (startup)  │             │
                            ▼             ▼
┌───────────────────────────────────────────────────────────┐
│                      pike-ai-kb                           │
│                                                           │
│  ┌──────────────────┐    ┌────────────────────────────┐  │
│  │   Skill Layer    │    │       MCP Server            │  │
│  │  (markdown files)│    │  tools / resources / prompts│  │
│  └──────┬───────────┘    └──────────┬─────────────────┘  │
│         │                           │                     │
│         │  Shared knowledge base    │                     │
│         │  (cached file reads)      │execFile             │
│         ▼                           ▼                     │
│  ┌──────────────────────────────────────┐                │
│  │  skills/pike-language-reference/     │                │
│  │    SKILL.md                          │                │
│  │    references/stdlib-patterns.md     │                │
│  │    references/syntax.md              │                │
│  │    references/types.md               │                │
│  │    references/idiomatic-pike.md      │                │
│  │  skills/pike-stdlib-api/             │                │
│  │    SKILL.md                          │                │
│  │    references/stdio-api.md           │                │
│  │    references/adt-api.md             │                │
│  │    references/utilities-api.md       │                │
│  │    references/crypto-api.md          │                │
│  │    references/protocols-api.md       │                │
│  │    references/concurrent-api.md      │                │
│  │    references/standards-api.md       │                │
│  │  skills/pike-debugging/              │                │
│  │    SKILL.md                          │                │
│  │    references/cli-and-introspection.md│                │
│  │    references/error-patterns.md      │                │
│  └──────────────────────────────────────┘                │
│                                      │                    │
└──────────────────────────────────────┼────────────────────┘
                                       ▼
                              ┌─────────────────┐
                              │  Pike Runtime    │
                              │  (pike binary)   │
                              └─────────────────┘
```

1. **Static knowledge path**: Agent reads skill files at session startup. Provides foundational Pike rules, syntax, and stdlib patterns without any runtime dependency.
2. **Dynamic introspection path**: MCP tools invoke the Pike binary for code execution, syntax validation, symbol lookup, and module listing. This supplements static knowledge with live runtime data.
3. **Curated documentation path**: MCP resources serve module-specific sections extracted from the stdlib patterns file. Allows agents to pull targeted reference material on demand.

## Tech Stack

| Component | Technology |
|---|---|
| Language | TypeScript 5.x (ESM, strict mode) |
| Runtime | Node.js >= 22 |
| MCP SDK | `@modelcontextprotocol/sdk` ^1.12.0 |
| Schema validation | `zod` ^3.25.0 |
| Build | `tsc` (strict mode, `noUncheckedIndexedAccess`) |
| Linting | ESLint 9.x (`typescript-eslint`) |
| Formatting | Prettier 3.x |
| Testing | Vitest 4.x |
| Transport | stdio (MCP StdioServerTransport) |
| External runtime | Pike 8.0.1116 |
| License | MIT |