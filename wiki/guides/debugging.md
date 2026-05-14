# Debugging Pike

A practical guide to diagnosing and fixing errors in Pike programs.

Source references: [Error Patterns](../../skills/pike-debugging/references/error-patterns.md), [CLI and Introspection](../../skills/pike-debugging/references/cli-and-introspection.md).

## Common Error Types and Fixes

### Compile-Time Errors (exit code 1 or 20)

- **Syntax errors** (`unexpected TOK_*`): Usually a missing semicolon, wrong collection literal syntax (`[]` instead of `({})`), or using `extends` instead of `inherit`. Check the line *before* the reported position.
- **Type mismatch** (`Bad argument N`, `Bad type in assignment`): Wrong type passed or assigned. Use `typeof()` to check what an expression actually produces. See [Type System](../concepts/type-system.md).
- **Undefined identifier**: Typo, out-of-scope variable, or missing `inherit`/`import`. Pike is case-sensitive.
- **Not present in module**: Function is in a submodule, misspelled, or you are using `_Stdio` through `Stdio` or vice versa.
- **Constant division by zero**: `1/0` is caught at compile time — `catch` cannot intercept it.

### Runtime Errors (exit code 10 or 21)

- **Division by zero**: Only runtime division by a zero variable is catchable. Use `catch` and check `object_program(err) == Error.Math`.
- **Array index out of range**: Check `sizeof(arr)` before indexing. Use range indexing for safety.
- **Missing mapping key**: Not an error — returns `0`. Use `zero_type(m[key])` to distinguish missing from mapped-to-zero.
- **File not found**: `Stdio.read_file()` returns `0`, does not throw. Always check the return value.
- **Destructed object** (`Lookup in destructed object`): Check `objectp(obj)` before calling methods.

## CLI Introspection Techniques

| Command | Purpose |
|---------|---------|
| `pike -e 'expr'` | Evaluate a single expression |
| `pike -x hilfe` | Interactive REPL for live exploration |
| `pike --show-paths` | Show module/include paths |
| `pike --features` | List compiled-in modules and capabilities |
| `pike -t` / `-t -t` | Trace function calls at increasing verbosity |

Key introspection calls: `write("%O\n", val)` for readable dump, `write("%t\n", val)` for type name, `typeof(expr)` for detailed signature, `indices(obj)` for method list, `master()->resolv("Module.Symbol")` to check existence, `master()->pike_module_path` for module paths.

## Reading Backtraces

Runtime errors print a backtrace from `main()` down to the error site:

```
Error message.
/path/to/file.pike:LINE: /program_name()->method_name()
/path/to/file.pike:LINE: /program_name()->caller_method()
```

Use `describe_backtrace(err)` to get a readable trace from a caught error. Error objects also expose `err->message()` for the error text and `object_program(err)` for the error class.

## Debugging Workflow

1. **Compile error?** Read the file and line number. Check the token before the error position.
2. **Type error?** Add explicit type annotations to catch issues earlier. Use `typeof()` to verify expressions.
3. **Runtime crash?** Wrap suspect code in `catch`, inspect with `describe_backtrace(err)`.
4. **Wrong result?** Use `pike -x hilfe` to test expressions interactively. Compare with `write("%O\n", value)`.
5. **Missing symbol?** Verify with `master()->resolv("Module.Symbol")`. Check `pike --features` for availability.

## Error Handling Patterns

Always catch and log — never silently swallow errors:

```pike
mixed err = catch {
  risky_operation();
};
if (objectp(err)) {
  write("Class: %O\n", object_program(err));
  write("Message: %s\n", err->message());
  write("Trace:\n%s\n", describe_backtrace(err));
} else if (arrayp(err)) {
  // Legacy format from error()
  write("Message: %s\n", err[0]);
}
```

For error handling idioms and exception patterns, see [Error Handling](../concepts/error-handling.md). For type-related debugging, see [Type System](../concepts/type-system.md).
