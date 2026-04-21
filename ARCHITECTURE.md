# Architecture

## Overview

pike-ai-kb is a dual-purpose npm package: (a) an installable agent skill providing Pike language reference to AI coding agents, and (b) an MCP (Model Context Protocol) server providing runtime tools for Pike code execution and introspection. Both roles share a single knowledge base of curated, runtime-verified Pike documentation.

## Components

### Skill Layer (`skills/pike-language-reference/`)

Static markdown files consumed by AI agents at prompt-construction time. No runtime dependency on the MCP server.

| File | Purpose |
|---|---|
| `SKILL.md` | Core language rules and gotchas — literal syntax, reference semantics, immutability, integer division, constructors, inheritance, switch fall-through, foreach, sscanf, zero_type, operator overloading |
| `references/stdlib-patterns.md` | Detailed standard library patterns organized by module (6500+ lines, 157+ sections). All examples verified against Pike 8.0.1116 |
| `references/syntax.md` | Pike syntax reference: control flow, operators, declarations, preprocessor directives |
| `references/types.md` | Pike type system: value vs reference types, coercion, typeof, type annotations, operators |

### MCP Server (`src/index.ts`)

Node.js MCP server built on `@modelcontextprotocol/sdk`. Communicates over stdio. Starts by probing the Pike binary and verifying the knowledge base.

**Tools (5):**

| Tool | Purpose |
|---|---|
| `pike-evaluate` | Execute Pike code via stdin piped to `pike -`. Returns stdout/stderr. Configurable timeout (default 30s) |
| `pike-check-syntax` | Compile without executing using `compile_string()`. Returns "Syntax OK" or compilation errors |
| `pike-describe-symbol` | Runtime symbol introspection via `master()->resolv()`. Returns type signature, kind (program/class/object/function/value), and members |
| `pike-list-modules` | Scans `master()->pike_module_path` for `.pmod`/`.pike` files. Returns sorted list of available modules |
| `pike-list-methods` | Lists all methods/indices on a resolved class or module |

**Resources (33+):**

- `pike://ref/{Module}` — Per-module curated sections extracted from `stdlib-patterns.md` for 30 documented modules (Stdio, Array, String, Math, Process, Thread, Crypto, Calendar, Image, Sql, etc.)
- `pike://ref/stdlib` — Full standard library reference
- `pike://ref/syntax` — Syntax reference
- `pike://ref/types` — Type system reference
- `pike://ref/skill` — Complete SKILL.md content

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

- Code execution (`pike -` for stdin evaluation)
- Syntax checking (`compile_string()` via `pike -e`)
- Symbol introspection (`master()->resolv()` via `pike -e`)
- Module discovery (scanning `pike_module_path` via `pike -e`)

All Pike invocations use `child_process.execFile` with configurable timeouts and a 10MB output buffer.

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
| Language | TypeScript 5.x (ESM) |
| Runtime | Node.js >= 20 |
| MCP SDK | `@modelcontextprotocol/sdk` ^1.12.0 |
| Schema validation | `zod` ^3.25.0 |
| Build | `tsc` (strict mode) |
| Transport | stdio (MCP StdioServerTransport) |
| External runtime | Pike 8.0.1116 |
| License | MPL-2.0 |
