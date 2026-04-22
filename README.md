# pike-ai-kb

Curated, runtime-verified knowledge base for the Pike programming language (8.0.1116). Covers syntax, type system, and 130+ standard library modules with code examples tested against a live Pike runtime.

Installable as an agent skill via [skills.sh](https://skills.sh) or as an MCP server.

## Install

```bash
npx skills add TheSmuks/pike-ai-kb
```

Works with Claude Code, Cursor, Codex, OpenCode, and 40+ other agents.

## Contents

| File | Lines | Content |
|------|------:|---------|
| `pike-language-reference/SKILL.md` | 322 | Core rules, gotchas, quick-reference |
| `pike-language-reference/references/stdlib-patterns.md` | 6,574 | 157 sections, 130+ modules |
| `pike-language-reference/references/syntax.md` | 913 | Control flow, operators, declarations |
| `pike-language-reference/references/types.md` | 326 | Type system, coercion, typeof |
| `pike-language-reference/references/idiomatic-pike.md` | 603 | Idiomatic patterns, anti-patterns |
| `pike-stdlib-api/SKILL.md` | 36 | API reference index |
| `pike-stdlib-api/references/stdio-api.md` | 544 | Stdio module API |
| `pike-stdlib-api/references/adt-api.md` | 472 | ADT module API |
| `pike-stdlib-api/references/utilities-api.md` | 547 | Utilities API |
| `pike-stdlib-api/references/crypto-api.md` | 357 | Crypto module API |
| `pike-stdlib-api/references/protocols-api.md` | 345 | Protocols API |
| `pike-stdlib-api/references/concurrent-api.md` | 194 | Concurrent API |
| `pike-stdlib-api/references/standards-api.md` | 146 | Standards API |
| `pike-debugging/SKILL.md` | 191 | Debugging skill definition |
| `pike-debugging/references/cli-and-introspection.md` | 225 | CLI flags, runtime introspection |
| `pike-debugging/references/error-patterns.md` | 298 | Error patterns taxonomy with fixes |

All examples verified against Pike 8.0.1116.

## MCP Server

Optional MCP server providing runtime tools alongside the knowledge base.

### Build

```bash
npm install && npm run build
```

### Configure

```json
{
  "mcpServers": {
    "pike-ai-kb": {
      "command": "node",
      "args": ["/path/to/pike-ai-kb/dist/index.js"],
      "env": {
        "PIKE_BIN": "/usr/local/bin/pike"
      }
    }
  }
}
```

### Tools

| Tool | Description |
|------|-------------|
| `pike-evaluate` | Execute Pike code |
| `pike-check-syntax` | Compile without executing |
| `pike-describe-symbol` | Runtime symbol introspection |
| `pike-list-modules` | List installed modules |
| `pike-list-methods` | List class/module methods |
| `pike-validate-example` | Validate a code example (compile + optional run) |
| `pike-signature` | Get exact type signature of a symbol |

### Resources

- `pike://ref/stdlib` — full standard library reference
- `pike://ref/syntax` — syntax reference
- `pike://ref/types` — type system reference
- `pike://ref/skill` — language reference SKILL.md
- `pike://ref/idiomatic-pike` — idiomatic Pike patterns guide
- `pike://ref/{Module}` — per-module curated sections (30 modules)
- `pike://ref/api/stdio` — Stdio API reference
- `pike://ref/api/adt` — ADT API reference
- `pike://ref/api/concurrent` — Concurrent API reference
- `pike://ref/api/crypto` — Crypto API reference
- `pike://ref/api/protocols` — Protocols API reference
- `pike://ref/api/standards` — Standards API reference
- `pike://ref/api/utilities` — Utilities API reference
- `pike://ref/debugging/cli` — CLI flags and runtime introspection
- `pike://ref/debugging/errors` — Error patterns taxonomy

### Requirements

- Node.js >= 20
- Pike >= 8.0 on PATH (or set `PIKE_BIN`). Only needed for execution tools, not the knowledge base.

## Coverage

**Modules**: Stdio, Array, String, Math, Process, Thread, Crypto, Calendar, Debug, Locale, Regexp, Yabu, ADT, Concurrent, Image, MIME, Parser, Protocols, SSL, Standards, Web, System, Sql, Val, Geography, Gmp, Error, Function, Program, Tools

**Protocols**: HTTP, DNS, SMTP, LDAP, IMAP, IRC, WebSocket, XMLRPC, SNMP, NNTP, TELNET, OBEX, Bittorrent, Ident, LPD, LMTP, IPv6

**Standards**: JSON, URI, UUID, BSON, X509, PEM, ASN1, PKCS, IDNA, TLD, ISO639\_2, EXIF, ID3, IIM

## License

MIT
