# Source Manifest

Catalog of all raw source documents. Updated when new sources are added.

## Active Sources

| ID | File | Type | Added | Description |
|----|------|------|-------|-------------|
| S001 | `skills/pike-language-reference/references/stdlib-patterns.md` | Verified reference | 2026-04-22 | 6,605 lines, 157 sections, 130+ modules — runtime-verified examples |
| S002 | `skills/pike-language-reference/references/syntax.md` | Verified reference | 2026-04-22 | 882 lines — control flow, operators, declarations, preprocessor |
| S003 | `skills/pike-language-reference/references/types.md` | Verified reference | 2026-04-22 | 328 lines — type system, coercion, typeof, annotations |
| S004 | `skills/pike-language-reference/references/idiomatic-pike.md` | Verified reference | 2026-04-22 | 606 lines — autodoc, anti-patterns, data structures, naming |
| S005 | `skills/pike-stdlib-api/references/stdio-api.md` | API reference | 2026-04-22 | 532 lines — Stdio.File, Stdio.Port, Stdio.FILE API surface |
| S006 | `skills/pike-stdlib-api/references/adt-api.md` | API reference | 2026-04-22 | 432 lines — ADT.Struct, ADT.History, ADT.Priority_queue, etc. |
| S007 | `skills/pike-stdlib-api/references/utilities-api.md` | API reference | 2026-04-22 | 528 lines — Array, Mapping, String, Search, Protocols, etc. |
| S008 | `skills/pike-stdlib-api/references/crypto-api.md` | API reference | 2026-04-22 | 324 lines — Crypto, Nettle,DSA, RSA, HMAC, etc. |
| S009 | `skills/pike-stdlib-api/references/protocols-api.md` | API reference | 2026-04-22 | 330 lines — Protocols.HTTP, SMTP, DNS, LDAP |
| S010 | `skills/pike-stdlib-api/references/concurrent-api.md` | API reference | 2026-04-22 | 181 lines — Thread, Thread.Mutex, Thread.Condition |
| S011 | `skills/pike-stdlib-api/references/standards-api.md` | API reference | 2026-04-22 | 150 lines — Standards.JSON, Standards.URI, Standards.UUID |
| S012 | `skills/pike-debugging/references/error-patterns.md` | Verified reference | 2026-04-22 | 298 lines — common error patterns, diagnosis, fixes |
| S013 | `skills/pike-debugging/references/cli-and-introspection.md` | Verified reference | 2026-04-22 | 225 lines — pike CLI, introspection functions, debugging techniques |
| S014 | `skills/pike-language-reference/SKILL.md` | Compiled rules | 2026-04-22 | 320 lines — key concepts, rules, gotchas for code generation |
| S015 | `skills/pike-stdlib-api/SKILL.md` | Compiled index | 2026-04-22 | API reference index linking to module reference files |
| S016 | `skills/pike-debugging/SKILL.md` | Compiled guide | 2026-04-22 | Debugging skill — error diagnosis, CLI introspection |

## Notes

- Sources S001–S013 are the primary content; S014–S016 are compiled skill definitions derived from them.
- All content has been fact-checked (V3) against Pike 8.0.1116 runtime.
- New sources should be added to this manifest before wiki ingestion.
