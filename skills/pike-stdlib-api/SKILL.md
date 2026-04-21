---
name: pike-stdlib-api
description: Exact API surface of the Pike 8.0.1116 standard library — function signatures, class hierarchies, and method listings for correct code generation
metadata:
  version: "1.0.0"
  organization: pike-lang
---

# Pike Standard Library API Reference

## Overview

Exact API surface of the Pike 8.0.1116 standard library. This skill provides function signatures, class hierarchies, and method listings derived from runtime introspection against Pike 8.0.1116.

**Purpose**: LLMs need exact API shapes to stop guessing at function names, parameter types, and return types.

**When to use**: Use this skill when you need to know the exact signature of a function, the methods available on a class, or the classes available in a module.

## Coverage

| Reference | Modules Covered |
|-----------|----------------|
| [stdio-api.md](references/stdio-api.md) | Stdio.File, Stdio.Port, Stdio.UDP, Stdio.Buffer, top-level I/O functions |
| [adt-api.md](references/adt-api.md) | ADT.Stack, ADT.Queue, ADT.Heap, ADT.Table, ADT.CritBit, ADT.History, ADT.List, ADT.Set, ADT.Trie, ADT.Interval, ADT.Sequence, ADT.Struct, ADT.BitBuffer |
| [concurrent-api.md](references/concurrent-api.md) | Concurrent.Future, Concurrent.Promise, Concurrent.AggregateState |
| [crypto-api.md](references/crypto-api.md) | Crypto.Hash (SHA256, SHA1, MD5, etc.), Crypto.AES, Crypto.HMAC, Crypto.RSA, Crypto.Password, Crypto.Random, cipher modes |
| [protocols-api.md](references/protocols-api.md) | Protocols.HTTP (get/post/put/delete, Query, Server), SSL (File, Context, Port), Parser (HTML, CSV, XML) |
| [standards-api.md](references/standards-api.md) | Standards.JSON, Standards.URI, Standards.UUID, Standards.BASE64, Standards.PEM |
| [utilities-api.md](references/utilities-api.md) | String, Array, Math, Process, Getopt, Thread, Error, Val, System, Regexp, MIME, Sql.Sql, Calendar, Image, Debug, Locale, Gmp, Geography, Function, Program, Tools, Web |

## Rules

1. **Do not fabricate functions.** If a function is not listed in these references, it does not exist in Pike 8.0.1116.
2. **Check before using.** Before calling any function, verify it exists in the appropriate reference file.
3. **Signatures are exact.** Parameter types and return types are as listed — do not substitute types from other languages.
4. **Method access uses `->`.** Object methods are called with `obj->method(args)`, not `obj.method(args)`.
