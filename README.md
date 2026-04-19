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
| `references/stdlib-patterns.md` | 6,574 | 157 sections, 130+ modules |
| `references/syntax.md` | 896 | Control flow, operators, declarations |
| `references/types.md` | 326 | Type system, coercion, typeof |
| `SKILL.md` | 313 | Key concepts, rules, gotchas |

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

### Resources

- `pike://ref/stdlib` -- full standard library reference
- `pike://ref/syntax` -- syntax reference
- `pike://ref/types` -- type system reference
- `pike://ref/{Module}` -- per-module sections (30 modules)

### Requirements

- Node.js >= 20
- Pike >= 8.0 on PATH (or set `PIKE_BIN`). Only needed for execution tools, not the knowledge base.

## Coverage

**Modules**: Stdio, Array, String, Math, Process, Thread, Crypto, Calendar, Debug, Locale, Regexp, ADT, Concurrent, Image, MIME, Parser, Protocols, SSL, Standards, Web, System, Sql, Val, Geography, Gmp, Error, Function, Program, Tools

**Protocols**: HTTP, DNS, SMTP, LDAP, IMAP, IRC, WebSocket, XMLRPC, SNMP, NNTP, TELNET, OBEX, Bittorrent, Ident, LPD, LMTP, IPv6

**Standards**: JSON, URI, UUID, BSON, X509, PEM, ASN1, PKCS, IDNA, TLD, ISO639\_2, EXIF, ID3, IIM

## License

MPL-2.0
