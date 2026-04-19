# pike-ai-kb

Pike language MCP server + skills.sh-installable knowledge base. Curated, runtime-verified reference for Pike 8.0.1116 covering 130+ modules.

## Install via skills.sh

```bash
npx skills add your-org/pike-ai-kb
```

This installs the `pike-language-reference` skill to your agent's skill directory. Compatible with Claude Code, Cursor, Codex, OpenCode, and 40+ other agents.

## What's Included

**Knowledge Base** (8,100+ lines, all runtime-verified against Pike 8.0.1116):

| File | Lines | Content |
|------|-------|---------|
| `references/stdlib-patterns.md` | 6,574 | 157 sections covering 130+ modules |
| `references/syntax.md` | 896 | Control flow, operators, declarations, preprocessor |
| `references/types.md` | 326 | Type system, coercion, typeof, operators |
| `SKILL.md` | 313 | Key concepts, rules, and gotchas |

**MCP Server** (additional, optional):

| Type | Count | Details |
|------|-------|---------|
| Tools | 5 | evaluate, check-syntax, describe-symbol, list-modules, list-methods |
| Resources | 34 | Full stdlib, syntax, types, skill + 30 module-specific extracts |
| Prompts | 4 | write-pike, translate-to-pike, explain-pike, review-pike |

## Structure

```
pike-ai-kb/
  skills/
    pike-language-reference/        ← skills.sh discovers this
      SKILL.md                      ← frontmatter + key rules/gotchas
      references/
        stdlib-patterns.md          ← 6,574 lines, 157 sections, 130+ modules
        syntax.md                   ← 896 lines
        types.md                    ← 326 lines
  src/
    index.ts                        ← MCP server (TypeScript)
  package.json
  tsconfig.json
```

## Requirements

- Node.js >= 20 (for MCP server)
- Pike >= 8.0 on PATH (or set `PIKE_BIN` env var) — only needed for execution tools, not for the skill/knowledge base

## MCP Server Setup

### Install from source

```bash
git clone <repo-url> pike-ai-kb
cd pike-ai-kb
npm install
npm run build
```

### Configure in Claude Desktop / Cursor / etc.

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

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PIKE_BIN` | `pike` | Path to Pike binary (uses PATH lookup by default) |

## Knowledge Base Coverage

### Top-Level Modules (29 verified)
Stdio, Array, String, Math, Process, Thread, Crypto, Calendar, Debug, Locale, Regexp, Yabu, ADT, Concurrent, Image, MIME, Parser, Protocols, SSL, Standards, Web, System, Graphics, Tools, _Roxen, Sql, Val, Geography, Gmp, Error

### Key Protocol Modules
HTTP (client 79 exports + server), DNS (105), SMTP, LDAP (257), IMAP (27 requests), IRC, WebSocket, XMLRPC, SNMP, NNTP, TELNET (155 constants), OBEX (38), Bittorrent, Ident, LPD, LMTP, IPv6

### Standards Modules
JSON, URI, UUID (v1/v4), BSON, X509 (56 TBS methods), PEM, ASN1 (37 types), PKCS, IDNA, TLD (253 countries), ISO639_2 (504 languages), EXIF, ID3, IIM

### Notable Documented Areas
- Predef functions (50+ with verified behaviors)
- master() object (138 methods)
- Crypto (62 items: SHA1-512, AES-CBC, RSA, HMAC)
- Calendar (61 items: 8 calendar systems, timezone)
- SSL.Context (57 methods)
- Parser.XML.Tree (65 node methods)
- Error module (12 structured error types)

## License

MPL-2.0
