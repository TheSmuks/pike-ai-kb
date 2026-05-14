# Idiomatic Pike

Writing Pike the way a Pike programmer would — not as translated Python, JS, C, or Java.

See the full reference: [Idiomatic Pike (source)](../../skills/pike-language-reference/references/idiomatic-pike.md).

## Naming Conventions

| Element | Convention | Examples |
|---------|-----------|---------|
| Functions / Variables | `lower_case_underscore` | `parse_config`, `file_path` |
| Classes / Programs | `CamelCase` / `TitleCase` | `Stdio.File`, `RequestHandler` |
| Modules | `CamelCase` | `Standards.JSON`, `ADT.Stack` |
| Constants | `UPPER_CASE` or `CamelCase` | `UNDEFINED`, `Math.pi` |
| Boolean variables | `is_`/`has_`/`should_` prefix | `is_connected`, `has_permission` |

Use the `private` and `protected` keywords for visibility — Pike does not use naming conventions (e.g. `_prefix`) for access control.

**File naming:** modules are `lower-case.pmod`, programs are `UpperCamel.pike`, directory modules contain `module.pmod`.

## Autodoc Comments

Pike uses `//!` prefix for autodoc comments, processed by documentation tools:

```pike
//! Parse a configuration file and return a mapping of settings.
//! @param path -- Filesystem path to the config file.
//! @returns A mapping with configuration keys and values.
//! @throws Error.Generic -- If the file cannot be read or parsed.
mapping parse_config(string path) { }
```

Key tags: `@param`, `@returns`, `@throws`, `@note`, `@example`, `@seealso`, `@fixme`, `@bugs`.
Do not use `//` or `/** */` for autodoc — only `//!` is recognized.

## Data Structure Selection

| Type | Use When |
|------|----------|
| **array** | Ordered sequence, duplicates OK — `arr += ({x})`, `sizeof(arr)` |
| **mapping** | Key-value lookup, O(1) — `m[key]`, `has_index(m, key)` |
| **multiset** | Membership testing only — `allowed[action]` |
| **ADT.Stack** | LIFO with explicit push/pop |
| **ADT.Queue** | FIFO, thread-safe producer/consumer |
| **ADT.Heap** | Priority queue / scheduling |
| **String.Buffer** | Building strings in loops (avoids O(n^2) concatenation) |

Use `String.Buffer` instead of `result += "..."` in loops. See [Type System](../concepts/type-system.md) for type annotations and [Array](../entities/array-type.md), [Mapping](../entities/mapping-type.md) for entity details.

## Anti-Patterns to Avoid

- **No `try` keyword:** Pike uses `catch { }` without `try`. See [Error Handling](../concepts/error-handling.md).
- **Collection literals:** Use `({1,2,3})` not `[1,2,3]`, and `(["key":"val"])` not `{"key":"val"}`.
- **`foreach` not `for`:** Use `foreach(arr;; mixed item)` instead of C-style index loops.
- **Function-call `map`/`filter`:** Pike uses `map(arr, fn)` and `filter(arr, fn)` — not `arr.map(fn)`.
- **String concatenation in loops:** Use `String.Buffer`, not `result += str`.
- **Silent `catch`:** Never write bare `catch { important(); };` — always log or propagate errors.
- **`==` on reference types:** Use `equal(a, b)` for structural comparison of arrays/mappings.

## Module Organization

A directory containing `module.pmod` acts as a module:

```
MyLib/
  module.pmod      // Makes MyLib/ a module, re-export symbols here
  Utils.pmod       // MyLib.Utils
  Handler.pike     // MyLib.Handler
```

Use `inherit` for IS-A relationships (child extends parent). Use `constant this = ((program)"...")` to alias without inheriting type. Place `#pike 8.0` near the top of files for version compatibility. Use `#string "file"` to embed file contents as a string literal.

For OOP patterns and class design, see [OOP](../concepts/oop.md). For concurrency idioms (threads, mutexes, futures), see [Concurrency](../concepts/concurrency.md).
