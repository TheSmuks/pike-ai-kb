# Pike Knowledge Base — Index

Content catalog of all wiki pages. Updated on every ingest or lint pass.

## Overview

| Page | Summary |
|------|---------|
| [overview.md](overview.md) | Top-level entry point and synthesis — what Pike is, where to start |

## Concepts

| Page | Summary |
|------|---------|
| [concepts/type-system.md](concepts/type-system.md) | Value vs reference types, union types, coercion, typeof, type predicates |
| [concepts/syntax.md](concepts/syntax.md) | Literals, operators, control flow, functions, preprocessor, sprintf/sscanf |
| [concepts/memory-and-references.md](concepts/memory-and-references.md) | Value copy vs reference sharing, GC, destructed objects, zero_type(), equal() |
| [concepts/oop.md](concepts/oop.md) | Classes, constructors, access modifiers, inheritance, import vs inherit, lfuns |
| [concepts/concurrency.md](concepts/concurrency.md) | Threads, mutex, conditions, thread-local, futures/promises, queue pattern |
| [concepts/error-handling.md](concepts/error-handling.md) | catch syntax, throwing, inspecting, typed errors, rethrowing, common errors |

## Entity Pages (Core Types)

| Page | Summary |
|------|---------|
| [entities/array-type.md](entities/array-type.md) | `({})` literals, indexing, slicing, operators, pitfalls |
| [entities/mapping-type.md](entities/mapping-type.md) | `([])` literals, zero_type() for key existence, merge/remove operators |
| [entities/multiset-type.md](entities/multiset-type.md) | `(<>)` literals, membership test, add/remove |
| [entities/string-type.md](entities/string-type.md) | Immutability, operators, char vs substring access, casting gotchas |
| [entities/function-type.md](entities/function-type.md) | Lambda syntax, method references, type annotations, closure capture |
| [entities/program-type.md](entities/program-type.md) | Program vs object distinction, object_program(), typed object variables |

## Standard Library Modules

| Page | Summary |
|------|---------|
| [modules/stdio.md](modules/stdio.md) | Stdio.File, Stdio.Port, Stdio.UDP, Stdio.Buffer — file I/O |
| [modules/adt.md](modules/adt.md) | ADT.Stack, Queue, Heap, Table, Set, CritBit, List, History, Struct, Trie |
| [modules/string.md](modules/string.md) | String.* functions, global string functions, SplitIterator |
| [modules/array.md](modules/array.md) | Array.* functions, global array functions, arrow operator |
| [modules/mapping.md](modules/mapping.md) | Mapping operations, zero_type() for key existence, operators |
| [modules/crypto.md](modules/crypto.md) | Hashes, AES/CBC, HMAC, RSA, ECC, password hashing, random generation |
| [modules/protocols.md](modules/protocols.md) | HTTP client/server, SSL, Parser.HTML/XML/CSV |
| [modules/concurrent.md](modules/concurrent.md) | Future/Promise, chaining, recovery, combinators |
| [modules/standards.md](modules/standards.md) | JSON, URI, UUID, Base64, PEM, IDNA, BSON |

## Guides

| Page | Summary |
|------|---------|
| [guides/idiomatic-pike.md](guides/idiomatic-pike.md) | Naming conventions, autodoc, data structure selection, anti-patterns |
| [guides/debugging.md](guides/debugging.md) | Common errors, CLI introspection, backtrace reading, debugging workflow |

## Statistics

| Metric | Value |
|--------|-------|
| Total pages | 24 |
| Concept pages | 6 |
| Entity pages | 6 |
| Module pages | 9 |
| Guide pages | 2 |
| Source documents | 16 |
| Pike version | 8.0.1116 |
| Last lint | 2026-05-14 |
