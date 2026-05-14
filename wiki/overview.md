# Pike 8.0.1116 — Knowledge Base Overview

Welcome to the Pike knowledge base wiki. This is the central entry point for
everything about Pike 8.0.1116 — a dynamic, bytecode-compiled, object-oriented
language with C-like syntax, strong typing, and a rich standard library.

---

## What Is Pike?

Pike is a high-level language that compiles to bytecode and runs on its own
virtual machine. It is designed for rapid development of internet-facing and
systems software — web servers, protocol implementations, text processing, and
more. Key characteristics:

- **C-like syntax** with curly braces, but far higher-level than C
- **Strong, dynamic typing** with type inference (`auto`) and explicit casts
- **First-class functions and closures** — pass, return, and store callables freely
- **Object-oriented** with single inheritance (`inherit`), access modifiers, and
  constructor methods named `create()`
- **130+ standard library modules** covering I/O, crypto, networking, data
  structures, and protocols
- **Garbage-collected memory** with predictable value/reference semantics

```pike
// A taste of Pike
int main() {
  array(int) nums = ({1, 2, 3, 4, 5});
  array(int) evens = filter(nums, lambda(int x) { return !(x & 1); });
  write("evens: %O\n", evens); // evens: ({ /* 2 elements */\n    2,\n    4\n  })
  return 0;
}
```

---

## Language Concepts

These pages cover the core semantics of Pike:

| Topic | Description |
|-------|-------------|
| [Type System](concepts/type-system.md) | Value vs reference types, type inference, coercion, `typeof`, `mixed` |
| [Syntax](concepts/syntax.md) | Literals, operators, control flow, declarations, collection syntax `({})`, `([])`, `(<>)` |
| [Memory & References](concepts/memory-and-references.md) | Copy-on-assignment, copy-on-write strings, identity vs structural equality |
| [Object-Oriented Programming](concepts/oop.md) | Classes, `inherit`, `create()` constructors, access modifiers, `this_program` |
| [Concurrency](concepts/concurrency.md) | Threads, `Thread.Mutex`, `Condition`, async patterns |
| [Error Handling](concepts/error-handling.md) | Exceptions, `catch`/`throw`, `Error` objects, backtraces |

### Quick Reference: Value vs Reference

- **Value types** — `int`, `float`, `string`: copied on assignment.
- **Reference types** — `array`, `mapping`, `multiset`, `object`, `program`,
  `function`: share underlying data on assignment. Use `copy_value()` for deep
  copies and `equal()` for structural comparison.

### Common Gotchas

- Integer division uses **floor division** (rounds toward negative infinity),
  not truncation toward zero.
- `switch` cases **fall through** — always use `break`.
- `foreach` iterates **by value** with optional index; strings iterate as
  character codes (`int`).
- `==` on arrays/mappings checks **identity**, not contents — use `equal()`.

---

## Standard Library

Pike ships with 130+ modules. Deep-dive pages are available for the most
important ones:

- [Modules Index](modules/) — catalog of module deep-dives
- Key modules: `Stdio`, `ADT`, `Crypto`, `Protocols`, `Standards`,
  `String`, `Array`, `Mapping`, `Multiset`, `Math`, `Filesystem`, `Thread`,
  `Process`, `System`, `Sql`, `Web`, `Yp`, `Gz`, `Tar`, `Image`

For the full catalog of all types, modules, and entities, see
[Entity Pages](entities/) and the master [Index](index.md).

---

## Guides

| Guide | What You'll Learn |
|-------|-------------------|
| [Idiomatic Pike](guides/idiomatic-pike.md) | Autodoc, naming conventions, Pike-flavored patterns, anti-patterns to avoid |
| [Debugging](guides/debugging.md) | CLI introspection, error diagnosis, backtrace reading, common pitfalls |

---

## Where to Start

- **New to Pike?** Start with [Syntax](concepts/syntax.md), then
  [Type System](concepts/type-system.md), then
  [Idiomatic Pike](guides/idiomatic-pike.md).
- **Coming from C/Java?** Pay close attention to
  [Memory & References](concepts/memory-and-references.md) — Pike's
  value/reference model differs from what you expect.
- **Looking for a module?** Check the [Index](index.md) or browse
  [Module Deep-Dives](modules/).
- **Debugging a problem?** Jump straight to [Debugging](guides/debugging.md).

---

## About This Wiki

This wiki is part of the **pike-ai-kb** project — a curated, runtime-verified
knowledge base for Pike 8.0.1116. All code examples have been tested against a
live Pike runtime. For project activity, see the [Activity Log](log.md).
