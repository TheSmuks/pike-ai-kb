---
name: pike-debugging
description: How to diagnose Pike errors, introspect the runtime, navigate the stdlib source, and debug Pike code on the CLI
metadata:
  version: "1.0.0"
  organization: pike-lang
---

# Pike Debugging & Runtime Introspection Guide

## Overview

Guide for diagnosing Pike compilation errors, runtime errors, and backtraces; navigating the standard library source; and using Pike's CLI and introspection tools to understand what's available. Target: Pike 8.0.1116.

## Rules

### Rule: Read the Error Message — Pike Tells You Exactly What's Wrong

Pike errors have precise location and type information. Do not guess — read the error output.

**Compile-time errors** (exit code 1 or 20):
```
-:4:Bad type in assignment.
-:4:Expected: int.
-:4:Got     : string(72..72).
Compilation failed.
```

Format: `<file>:<line>:<message>`. For `-e` scripts, file is `-`.

**Runtime errors** (exit code 10 or 21):
```
Division by zero.
/tmp/script.pike:5: /main()->main()
```

Format: `<message>\n<location>: <program/object>-><method>()`.

### Rule: Use `compile_string` for Syntax-Checking

`pike -c` does NOT exist. Use `compile_string` to verify code compiles:

```pike
mixed err = catch {
  program p = compile_string(code, "check");
};
if (err) {
  // Syntax error — describe_backtrace(err) gives details
}
```

Note: `compile_string` runs the preprocessor and full compilation. It will execute `constant` expressions but won't run `create()`.

### Rule: Error Values Have Three Shapes

```pike
mixed err = catch { /* code */ };
```

1. **`err == 0`** (zero_type == 1): No error occurred. Always check `if (err)` before inspecting.

2. **`arrayp(err) == 1`**: Legacy format from `error()` and `throw(({msg, backtrace()}))`.
   - `err[0]` — error message string
   - `err[1]` — backtrace array
   - Use `describe_backtrace(err)` for human-readable output

3. **`objectp(err) == 1`**: `Error.Generic` or subclass (also `arrayp`!).
   - `err->message()` — error message string
   - `err->backtrace()` — backtrace array
   - Subclasses: `Error.Math`, `Error.BadArgument`, `Error.Index`, `Error.Permission`, `Error.Resource`, `Error.Decode`, `Error.Compilation`, `Error.ModuleLoad`
   - `object_program(err)` gives the specific error class
   - Check inheritance: `Program.inherits(object_program(err), Error.Generic)`

Always check `objectp(err)` first — Error.Generic objects are also `arrayp`.
`error("msg")` produces legacy array format, not an Error.Generic object. Runtime errors (division by zero, index out of bounds) produce Error.Generic subclasses.

### Rule: Format Strings Use Pike Specifiers, Not Python/JS

```
WRONG:   write(value)                       // not a generic print
WRONG:   write("hello " + name)             // works but no type safety
CORRECT: write("%O\n", some_value)          // inspect any value
CORRECT: write("Hello %s, age %d\n", name, age)  // typed formatting
```

Key format specifiers:
- `%O` — readable dump of any value (most useful for debugging)
- `%t` — type name only (`"int"`, `"string"`, `"array"`, etc.)
- `%d` — integer
- `%s` — string
- `%f` — float
- `%%` — literal `%`

### Rule: Do Not Guess at APIs — Use Runtime Introspection

Before using any function or class, verify it exists:

```pike
// Check if a module exists
mixed mod;
catch { mod = master()->resolv("ModuleName"); };
if (!mod) { /* module not available */ }

// List methods on an object
object f = Stdio.File();
array(string) methods = sort(indices(f));
// Note: sorted methods include underscore-prefixed internal methods first

// Get function type signature
typeof(Stdio.read_file)
// Returns: function(string, void | int, void | int : string(8bit))

// Get the class/program of an object
object_program(f)
// Returns: Stdio.File

// Check type at runtime
intp(x), floatp(x), stringp(x), arrayp(x), mappingp(x),
multisetp(x), objectp(x), programp(x), functionp(x)
```

### Rule: `pike -e` Accepts Full Programs

`pike -e` compiles and runs Pike code — either a single expression or a full program with `int main()`. For multi-line scripts, a temp file is cleaner:

```bash
# Single expression
pike -e 'write("%O\n", indices(Stdio.File()));'

# Full program via -e
pike -e 'int main() { write("%O\n", indices(Stdio.File())); return 0; }'

# Multi-line — use a temp file
cat > /tmp/test.pike <<'EOF'
int main() {
  // your code here
  return 0;
}
EOF
pike /tmp/test.pike
```

### Rule: Navigate the Module Source to Understand Behavior

Pike modules live in `/usr/local/pike/8.0.1116/lib/modules/`:

```bash
# Find the paths Pike uses
pike --show-paths

# List all available modules
ls /usr/local/pike/8.0.1116/lib/modules/*.pmod

# Read a module's source
cat /usr/local/pike/8.0.1116/lib/modules/Array.pmod | head -50

# C modules are .so files — their source is in the Pike source tree
# Pike source: src/modules/ or src/post_modules/
```

Module file conventions:
- `ModuleName.pmod` — Pike module (source readable)
- `_ModuleName.so` — C module (binary, source in Pike tree)
- `DirectoryName/` with `module.pmod` — directory-as-module

### Rule: Common Error Patterns and Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `syntax error, unexpected TOK_*, expecting TOK_*` | Syntax mistake. Common: missing `;`, wrong literal syntax, used `[]` instead of `({})` for arrays | Read the line number. Check for `(` before `{` in literals. |
| `Bad type in assignment. Expected: X. Got: Y.` | Type mismatch in assignment | Check what the RHS actually returns. Use `%O` to inspect. |
| `Index 'X' is not present in module Y` | Function/class doesn't exist in that module | Use `master()->resolv()` to check. Check spelling. Some functions are in `_Module` not `Module`. |
| `Index Z is out of array range` | Array access out of bounds | Check `sizeof()` before indexing. Use negative indices: `arr[-1]` for last. |
| `Division by zero` | Integer or float division by zero | Check divisor before dividing. |
| `Cannot cast X to Y` | Invalid type cast | Not all casts are valid. Use conversion functions instead. |
| `Too few arguments to X` | Missing required arguments | Check function signature. Use `typeof()` to see expected args. |
| `Too many arguments to X` | Extra arguments passed | Check function signature. Some functions are variadic. |
| `Undefined identifier: X` | Variable or function not declared | Declare before use. Check scope. `global` prefix for module-level. |
| `Attempting to index a non-indexed value` | Using `[]` or `->` on a non-collection | Check the value is actually an object/mapping/array before indexing. |
| `Illegal character in program` | Non-ASCII or control character in source | Check encoding. Pike source should be UTF-8 or ASCII. |

## Additional References

- [cli-and-introspection.md](references/cli-and-introspection.md) — CLI flags, runtime introspection commands, and diagnostic techniques
- [error-patterns.md](references/error-patterns.md) — Complete error taxonomy with examples and fixes
