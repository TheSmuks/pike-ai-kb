# Pike Error Patterns — Complete Taxonomy

## Compile-Time Errors (exit code 1 or 20)

Pike compilation fails fast with precise diagnostics. Every compile error includes the file and line number.

### Syntax Errors

```
-:3:syntax error, unexpected TOK_IDENTIFIER, expecting TOK_LEX_EOF or ';'
```

**Common causes:**
- Missing semicolon (`;`)
- Using `[]` instead of `({})` for array literals
- Using `{}` instead of `([])` for mapping literals
- Using `extends` instead of `inherit`
- Forgetting `(` around collection literals: `{1,2,3}` instead of `({1,2,3})`

**Fix:** Go to the line number. Check the token before the error — the mistake is usually on the previous line or the same line before the indicated position. Note: token names like `TOK_IDENTIFIER` are context-dependent; the same token name may appear for different syntactic constructs.

### Type Mismatch Errors

```
-:4:Bad argument 2 to write.
-:4:Expected: object | string(..).
-:4:Got     : type(mixed).
```

```
-:5:Bad type in assignment.
-:5:Expected: int.
-:5:Got     : string(72..72).
```

**Common causes:**
- Passing wrong type to a function
- Assigning a string to an int variable
- Indexing a mapping with wrong key type
- Returning wrong type from typed function

**Fix:** Use `typeof()` to check what the expression actually produces. Cast explicitly if needed.

### Undefined Identifier

```
-:3:Undefined identifier my_function.
```

**Common causes:**
- Typo in function/variable name
- Using a variable before it's declared
- Forgetting to inherit or import a module
- Case sensitivity (Pike is case-sensitive)

**Fix:** Check spelling. Ensure the symbol is in scope. Use `import ModuleName;` or `inherit ClassName;` for external symbols.

### Not Present in Module

```
-:2:Index 'nonexistent' not present in module Stdio.
```

**Common causes:**
- Function doesn't exist in that module
- Function is in a submodule (e.g., `Stdio.File->open` not `Stdio.open`)
- Function name is misspelled
- Using `_Stdio` function through `Stdio` or vice versa

**Fix:** Verify with `pike -e 'write("%O\n", indices(master()->resolv("Module")));'`. Check the API reference.

### Constant Division by Zero

```
-:2:Divide by constant 0
Compilation failed.
```

Pike evaluates constant expressions at compile time. `1/0` is caught before execution.

**Fix:** Ensure divisors in constant expressions are non-zero.

## Runtime Errors (exit code 10 or 21)

### Error Format

Uncaught runtime errors print to stderr:
```
Error message.
/path/to/file.pike:LINE: /program_name()->method_name()
/path/to/file.pike:LINE: /program_name()->caller_method()
```

The backtrace shows the call chain from `main()` down to the error location.

### Division by Zero

```
Division by zero.
Unknown program: `/(10,0)
/tmp/script.pike:5: /main()->main()
```

**Error class:** `Error.Math` (displays as `_static_modules.Builtin()->MathError`, subclass of `Error.Generic`)

**Important:** Constant division by zero (`1/0`) is caught at compile time (exit code 20) — `catch` does not intercept it. Only runtime division by a zero variable is catchable.

**Catch pattern:**
```pike
mixed err = catch { int z = x / y; };
if (objectp(err) && object_program(err) == Error.Math) {
  // Division by zero
}
```

### Array Index Out of Range

```
Index 10 is out of array range -3..2.
/tmp/script.pike:2: /main()->run(1,({"pike"}))
```

**Fix:** Check `sizeof(arr)` before indexing. Use range indexing: `arr[..min(n, sizeof(arr)-1)]`.

### Invalid Arguments

Bad argument errors are caught at **compile time** when the type is statically known:
```
-:2:Bad argument 1 to sqrt.
-:2:Expected: int | float.
-:2:Got     : string.
Compilation failed.
```

At runtime with `mixed` variables, the function may silently return 0 instead of throwing.

**Fix:** Check the function signature. Pass the correct type. Use explicit type annotations to catch errors at compile time.

### Missing Key in Mapping

Not an error — `m[key]` returns `0` for missing keys. Use `zero_type()` to distinguish missing from mapped-to-zero.

### File Not Found

`Stdio.read_file()` and `Stdio.File()->open()` do NOT throw on missing files. They return `0` (read_file) or `0` (open). Check the return value.

```pike
string data = Stdio.read_file("maybe_missing.txt");
if (!data) {
  // File doesn't exist or couldn't be read
}
```

### Object Already Closed / Destructed

```
Lookup in destructed object.
```

**Fix:** Check `objectp(obj)` before calling methods. Destructed objects return false for most type checks.

## Error Handling Patterns

### Basic Error Capture

```pike
mixed err = catch {
  // code that might fail
};
if (err) {
  write("Failed: %s\n", describe_backtrace(err));
}
```

### Inspecting Error Details

```pike
mixed err = catch {
  // code that might fail
};
if (!err) return;  // no error

if (objectp(err)) {
  // Error.Generic or subclass
  write("Class: %O\n", object_program(err));
  write("Message: %s\n", err->message());
  write("Backtrace:\n%s\n", describe_backtrace(err));
} else if (arrayp(err)) {
  // Legacy format: ({ message_string, backtrace_array })
  write("Message: %s\n", err[0]);
  write("Backtrace:\n%s\n", describe_backtrace(err));
```

**Note:** `error("msg")` produces the legacy array format, not an `Error.Generic` object. Runtime errors (division by zero, index out of bounds) produce `Error.Generic` subclasses. Always check `objectp(err)` before `arrayp(err)` since `Error.Generic` objects are also `arrayp`.

### Typed Error Handling

```pike
mixed err = catch {
  some_operation();
};
if (objectp(err)) {
  program p = object_program(err);
  if (p == Error.Math) write("Math error\n");
  else if (p == Error.BadArgument) write("Bad argument\n");
  else if (p == Error.Index) write("Index error\n");
  else if (p == Error.Permission) write("Permission denied\n");
  else if (p == Error.Resource) write("Resource error\n");
  else if (p == Error.Decode) write("Decode error\n");
  else if (p == Error.Compilation) write("Compilation error\n");
  else if (p == Error.ModuleLoad) write("Module load error\n");
  else write("Generic error: %s\n", err->message());
}
```

### Rethrowing

```pike
mixed err = catch {
  risky_operation();
};
if (err) {
  if (objectp(err) && object_program(err) == Error.Permission) {
    // Handle permission errors specifically
    return;
  }
  throw(err);  // rethrow everything else
}
```

## Common Failure Patterns

### Wrong Collection Literal Syntax

```pike
// WRONG — these are syntax errors:
array a = [1, 2, 3];
mapping m = {"key": "val"};
// CORRECT:
array a = ({1, 2, 3});
mapping m = (["key": "val"]);
```

### Using `==` on Reference Types

```pike
// WRONG — == is identity comparison for arrays/mappings/objects, not structural:
array a = ({1, 2, 3});
array b = ({1, 2, 3});
if (a == b) { }  // false — different instances

// CORRECT — structural comparison:
if (equal(a, b)) { }  // true
```

### Missing `break` in switch

```pike
// WRONG — falls through silently:
switch (x) {
  case 1: do_one();
  case 2: do_two();  // BUG: always runs when x==1
}

// CORRECT:
switch (x) {
  case 1: do_one(); break;
  case 2: do_two(); break;
}
```

### Not Checking Return Values

```pike
// WRONG — silently fails:
Stdio.File()->open("file.txt", "r");
// Returns 0 on failure, no error thrown

// CORRECT:
Stdio.File f = Stdio.File();
if (!f->open("file.txt", "r")) {
  write("Failed to open: %s\n", strerror(f->errno()));
}
```

### Silent `catch` Swallowing

```pike
// WRONG — swallows ALL errors including real bugs:
catch { important_operation(); };

// CORRECT — catch and log:
mixed err = catch { important_operation(); };
if (err) {
  write("Failed: %s\n", describe_backtrace(err));
  // or rethrow: throw(err);
}
```
