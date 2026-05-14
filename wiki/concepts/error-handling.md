# Error Handling

Pike uses exceptions for error signaling. The `catch` keyword replaces `try`/`catch` — there is **no `try` keyword**.

## Throwing Errors

```pike
void validate(string name) {
  if (!strlen(name)) error("Name cannot be empty\n");
}
throw(Error.Generic("Something went wrong", backtrace()));
```

## Catching Errors

`catch` is an expression returning the error (or `0` if none):

```pike
mixed err = catch { risky_operation(); };
if (err) werror("Failed: %s\n", describe_backtrace(err));
```

Pike syntax is `catch { ... };`, not `try { ... } catch(e) { ... }`.

## Inspecting Errors

Errors are `Error.Generic` objects (runtime) or legacy arrays (from `error()`):

```pike
mixed err = catch { some_operation(); };
if (!err) return;
if (objectp(err)) {
  write("Class: %O\n", object_program(err));
  write("Message: %s\n", err->message());
} else if (arrayp(err)) {
  write("Message: %s\n", err[0]);
}
```

`Error.Generic` objects are also `arrayp` — check `objectp` first.

## Typed and Rethrowing

```pike
mixed err = catch { operation(); };
if (objectp(err)) {
  program p = object_program(err);
  if (p == Error.Math) write("Math error\n");
  else if (p == Error.Index) write("Index error\n");
  else if (p == Error.Permission) return; // handle specific
  else throw(err);                         // rethrow unknown
}
```

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `Division by zero` | Divide by zero variable | Check divisor |
| `Index out of range` | Array access beyond bounds | Check `sizeof(arr)` |
| `Lookup in destructed object` | Use after `destruct()` | Check `objectp(obj)` |
| File ops return `0` | `Stdio.read_file` fails | Check return value |

## Gotchas

- Constant `1/0` is a **compile-time** error — `catch` cannot intercept.
- `Stdio.read_file()` returns `0` on failure — it does **not** throw.
- Never silently swallow: bare `catch { };` hides bugs — always log or rethrow.

## See Also

- [Syntax](syntax.md) — `catch` expression syntax
- [Type System](type-system.md) — `zero_type()`, type predicates
- [Memory and References](memory-and-references.md) — destructed objects
- [Error Patterns](../../skills/pike-debugging/references/error-patterns.md)
- [CLI and Introspection](../../skills/pike-debugging/references/cli-and-introspection.md)
