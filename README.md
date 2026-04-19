# pike-ai-kb

Standalone MCP server providing a curated, runtime-verified Pike language knowledge base for AI code generation. Zero dependency on the Pike source tree — uses only a local Pike installation for runtime tools.

## What's Included

**Knowledge Base** (8,100+ lines, all runtime-verified against Pike 8.0.1116):

| File | Lines | Content |
|------|-------|---------|
| `data/stdlib-patterns.md` | 6,574 | 157 sections covering 130+ modules |
| `data/syntax.md` | 896 | Control flow, operators, declarations, preprocessor |
| `data/types.md` | 326 | Type system, coercion, typeof, operators |
| `data/SKILL.md` | 313 | Key concepts, rules, and gotchas |

**MCP Tools** (5):
- `pike-evaluate` — Execute Pike code
- `pike-check-syntax` — Compile without executing
- `pike-describe-symbol` — Runtime introspection of any symbol
- `pike-list-modules` — List installed Pike modules
- `pike-list-methods` — List methods on a class/module

**MCP Resources** (34):
- `pike://ref/stdlib` — Full standard library reference
- `pike://ref/syntax` — Syntax reference
- `pike://ref/types` — Type system reference
- `pike://ref/skill` — Skill definition with rules/gotchas
- `pike://ref/{Module}` — Module-specific sections (30 modules)

**MCP Prompts** (4):
- `write-pike` — Write Pike code with KB guidance
- `translate-to-pike` — Translate from another language
- `explain-pike` — Explain Pike code
- `review-pike` — Review code for correctness

## Requirements

- Node.js >= 20
- Pike >= 8.0 installed and on PATH (or set `PIKE_BIN`)

Pike is only needed for the execution/introspection tools. The knowledge base resources work without Pike.

## Install

```bash
# Clone
git clone <repo-url> pike-ai-kb
cd pike-ai-kb

# Install dependencies
npm install

# Build
npm run build
```

## Usage

### Direct

```bash
# Start the MCP server
node dist/index.js

# Or via npm
npm start
```

### With Claude Desktop / Cursor / etc.

Add to your MCP configuration:

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

## Using as a Skill

The `data/SKILL.md` file is a standalone skill definition that can be loaded by any agent framework. It contains:

- Pike language overview and key concepts
- 12 rules with WRONG/CORRECT examples covering the most common LLM mistakes
- Operator overloading lfuns reference

For agent frameworks that support skill directories:

```
your-project/.agents/skills/pike-language-reference/
  SKILL.md                    ← copy from data/SKILL.md
  references/
    stdlib-patterns.md        ← copy from data/stdlib-patterns.md
    syntax.md                 ← copy from data/syntax.md
    types.md                  ← copy from data/types.md
```

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
