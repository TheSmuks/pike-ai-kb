# CLI Flags and Runtime Introspection

## Pike CLI Flags

| Flag | Purpose | Example |
|------|---------|---------|
| `pike script.pike` | Run a Pike script | `pike hello.pike` |
| `pike -e 'expr'` | Evaluate single expression | `pike -e 'write("%O\n", indices(Stdio));'` |
| temp file | Multi-line scripts — write to a .pike file and run it | `pike /tmp/test.pike` |
| `pike -v` | Show version | `pike --version` |
| `pike --show-paths` | Show module/include paths | Shows master.pike, lib/modules, include paths |
| `pike --info` | Build info + features | Shows version, paths, all compiled-in features |
| `pike --features` | List all features | Lists modules and capabilities |
| `pike -d` / `-d#` | Increase debug level | Debug output during compilation |
| `pike -t` / `-t#` | Increase trace level | Traces function calls during execution |
| `pike -x tool` | Run built-in tool | `pike -x hilfe` (REPL), `pike -x test_pike` |

### Built-in Tools (`pike -x`)

| Tool | Purpose |
|------|---------|
| `hilfe` | Interactive Pike REPL |
| `test_pike` | Run Pike test suite |
| `benchmark` | Built-in benchmarks |
| `cgrep` | Context-aware grep |
| `extract_autodoc` | Extract autodoc from source |
| `httpserver` | Minimal HTTP server |
| `module` | Module installer |
| `dump` | Dump Pike files to object files |

## Runtime Introspection Patterns

### Check if a Module Exists

```pike
mixed mod;
catch { mod = master()->resolv("ModuleName"); };
if (!mod) write("Module not found\n");
```

### List All Methods on an Object

```pike
object f = Stdio.File();
array(string) methods = sort(indices(f));
foreach(methods; int i; string m) {
  write("%s\n", m);
}
```

### Get Function Type Signature

```pike
typeof(Stdio.read_file)
// function(string, void | int, void | int : string(8bit))

// Note: typeof(Class->method) returns mixed, not a detailed signature.
// For instance methods, check on an actual instance:
typeof(Stdio.File())
// program(Stdio.File)

// To see instance method signatures, iterate:
object f = Stdio.File();
foreach(indices(f);; string m) {
  mixed v = f[m];
  if (functionp(v)) write("%s: %O\n", m, typeof(v));
}
```

### Identify an Object's Class

```pike
object_program(my_object)
// Returns the program, e.g. Stdio.File

// Check if object is a specific class
object_program(my_object) == Stdio.File  // true or false
```

### Inspect Any Value

```pike
// %O — dump any value in readable form
write("%O\n", some_value);

// %t — just the type name
write("%t\n", some_value);  // "int", "string", "array", etc.

// typeof — detailed compile-time type
write("%O\n", typeof(some_value));  // int(42..42), array(int), etc.
```

### Inspect the Module Path

```pike
// Where Pike looks for modules
master()->pike_module_path
// ({ "/usr/local/pike/8.0.1116/lib/modules" })

// Resolve a symbol path
master()->resolv("Stdio.File")
// Returns the program Stdio.File
```

### Check Available Features

```pike
// Has threads?
master()->resolv("Thread")  // non-zero if available

// Has SSL?
master()->resolv("SSL")  // non-zero if available

// Has crypto?
master()->resolv("Crypto.SHA256")  // non-zero if available
```

### Navigating the Stdlib Source

```bash
# Find module source files
pike --show-paths
# Shows: Module path...: /usr/local/pike/8.0.1116/lib/modules

# List all modules
ls /path/to/lib/modules/

# Read a Pike module (.pmod is readable)
cat /path/to/lib/modules/Array.pmod

# C modules (.so) — source is in Pike source tree:
#   src/modules/_Stdio/   — Stdio C implementation
#   src/modules/_Crypto/  — Crypto C implementation
#   src/post_modules/     — Optional C modules (GTK2, etc.)
```

### Module File Conventions

| Extension | Meaning | Source Available |
|-----------|---------|-----------------|
| `Foo.pmod` | Pike module (readable source) | Yes |
| `_Foo.so` | C module (binary) | In Pike source tree under `src/modules/` |
| `Foo/module.pmod` | Directory-as-module | Yes |
| `Foo.pike` | Standalone program | Yes |

### Interactive Debugging with hilfe

```bash
pike -x hilfe
# Starts a REPL where you can type Pike expressions:
# > typeof(Stdio.read_file)
# (1) Result: function(string, void | int, void | int : string(8bit))
# > indices(Stdio.File())
# (2) Result: ({ /* 90 elements */
#     "_disable_callbacks",
#     ...
# })
```

### Trace Execution

```bash
# Trace function calls
pike -t script.pike

# Increase trace verbosity
pike -t -t script.pike  # level 2
pike -t -t -t script.pike  # level 3
```

### Dump Preprocessor Output

```pike
// cpp() runs the preprocessor and returns the result
string output = cpp("#define FOO 42\nint x = FOO;");
write("%s\n", output);
```

## Common Diagnostic Workflows

### "Does this function exist?"

```pike
mixed fn;
catch { fn = master()->resolv("Stdio.nonexistent"); };
if (!fn) write("Does not exist\n");
```

### "What methods does this class have?"

```pike
object inst;
catch { inst = Stdio.File(); };
if (inst) write("%O\n", sort(indices(inst)));
```

### "What's the exact type signature?"

```pike
write("%O\n", typeof(Stdio.read_file));
```

### "Why is my code failing at runtime?"

```pike
mixed err = catch {
  // your code here
};
if (err) {
  write("Error: %s\n", describe_backtrace(err));
  if (objectp(err)) {
    write("Error class: %O\n", object_program(err));
    write("Message: %s\n", err->message());
  } else if (arrayp(err)) {
    write("Message: %s\n", err[0]);
  }
}
```

### "What modules are available?"

```bash
pike -e 'write("%O\n", master()->pike_module_path);'
ls "$(pike -e 'write("%s\n", master()->pike_module_path[0]);')"
```
