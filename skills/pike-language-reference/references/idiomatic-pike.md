# Idiomatic Pike

A guide for writing code the way a Pike programmer would, not as translated Python, JS, C, or Java.

## 1. Autodoc Done Right

Pike uses `//!` prefix for autodoc comments. These are processed by the documentation tools to generate API docs.

### Tags

| Tag | Purpose | Syntax |
|-----|---------|--------|
| `@decl` | Declare function/method signature | `@decl return_type name(params)` |
| `@param` | Parameter description | `@param name -- description` |
| `@returns` | Return value description | `@returns description` |
| `@throws` | Exception description | `@throws ErrorType -- description` |
| `@note` | Important notes | `@note description` |
| `@example` | Usage examples | `@example code` |
| `@fixme` | Known issues | `@fixme description` |
| `@bugs` | Known bugs | `@bugs description` |
| `@seealso` | Cross-references | `@seealso symbol` |

### WRONG vs CORRECT

WRONG — using wrong comment style:
```pike
// This is a regular comment, not autodoc
/** This is not autodoc either (no ! prefix) */
/* Regular block comment */
```

CORRECT — autodoc uses `//!`:
```pike
//! This is an autodoc comment. It will be parsed by the
//! documentation system.
```

WRONG — placing autodoc away from the symbol:
```pike
//! Documentation for parse_config
// ... other code ...
string parse_config(string path) { }
```

CORRECT — autodoc directly before the declaration:
```pike
//! Parse a configuration file and return a mapping of settings.
//! @param path
//!   Filesystem path to the config file.
//! @returns
//!   A mapping with configuration keys and values.
//! @throws Error.Generic
//!   If the file cannot be read or parsed.
mapping parse_config(string path) { }
```

WRONG — mixing autodoc with regular comments for documentation:
```pike
// @param name The name to greet
string greet(string name) { return "Hello, " + name; }
```

CORRECT — proper autodoc with `//!` prefix on each line:
```pike
//! Generate a greeting string.
//! @param name -- The name to greet.
//! @returns A greeting string.
string greet(string name) { return "Hello, " + name; }
```

## 2. Module Structure Conventions

### File Types

| Extension | Purpose | Example |
|-----------|---------|---------|
| `.pmod` | Pike module file | `Net.pmod`, `Utils.pmod` |
| `.pike` | Pike program/class file | `Server.pike`, `Handler.pike` |

### Directory as Module

A directory containing `module.pmod` acts as a module. The directory name becomes the module name.

```
MyLib/
  module.pmod      // Makes MyLib/ a module
  Utils.pmod       // Accessible as MyLib.Utils
  Handler.pike     // Accessible as MyLib.Handler
```

Inside `module.pmod`, re-export symbols or define the module's public interface:

```pike
// MyLib/module.pmod
constant Utils = ((program)"Utils.pmod");
constant version = "1.0.0";
```

### `constant this = ...` vs `inherit`

Use `inherit` to extend a class with its behavior and interface. Use `constant this = ...` to alias or wrap another program without inheriting its type.

```pike
// inherit: Child IS-A Parent, gets all methods
class MyFile {
  inherit Stdio.File;
}

// constant: MySocket wraps a Stdio.File but is not itself one
class MySocket {
  constant this = ((program)"Stdio.File");
  // or: Stdio.File fd = Stdio.File();
}
```

### Preprocessor Directives

```pike
// Set version compatibility — locks behavior to a specific Pike version
#pike 8.0

// Include a file's contents as a string literal
string template = #string "template.html";
// Equivalent to: string template = "<contents of template.html>";
```

The `#pike` directive should appear near the top of the file, before any code that depends on version-specific behavior.

## 3. Common Anti-Patterns from Other Languages

### Python

| Wrong (Python idiom) | Correct Pike |
|----------------------|-------------|
| `for item in list:` | `foreach(list;; mixed item)` |
| `len(arr)` | `sizeof(arr)` |
| `dict.get(key, default)` | `m[key]\|\|default` or `has_index(m, key) && m[key]` — note: `\|\|` returns default for falsy values (`0`, `""`); for exact `dict.get` semantics use `has_index(m, key) ? m[key] : default` |
| `try: ... except: ...` | `catch { ... };` or `catch(mixed e) { ... }` |
| `f"{name} is {age}"` | `sprintf("%s is %d", name, age)` |
| `list.append(x)` | `arr += ({x})` |
| `list.sort(key=fn)` | `sort(arr)` (in-place, ascending) or `Array.sort_array(arr, fn)` |

### JavaScript

| Wrong (JS idiom) | Correct Pike |
|-------------------|-------------|
| `arr.map(fn)` | `map(arr, fn)` |
| `arr.filter(fn)` | `filter(arr, fn)` |
| `arr.reduce(fn, init)` | `Array.reduce(fn, arr, init)` |
| `Object.keys(obj)` | `indices(m)` |
| `try { } catch(e) { }` | `catch(e) { }` — no `try` keyword in Pike |
| `arr.forEach(fn)` | `foreach(arr;; mixed item) fn(item)` |
| `arr.push(x)` | `arr += ({x})` |
| `str.trim()` | `String.trim_whites(str)` |
| `JSON.parse(s)` | `Standards.JSON.decode(s)` |
| `JSON.stringify(o)` | `Standards.JSON.encode(o)` |

### C

| Wrong (C idiom) | Correct Pike |
|-----------------|-------------|
| `for (int i=0; i<n; i++)` | `foreach(arr; int i; mixed val)` |
| `printf("%d\n", x)` | `write("%d\n", x)` |
| `malloc(n * sizeof(int))` | `allocate(n)` — creates array of zeros |
| `free(ptr)` | Automatic GC — no manual free |

### Java

| Wrong (Java idiom) | Correct Pike |
|-------------------|-------------|
| `try { } catch (Exception e) { }` | `catch { }` or `catch(Error.Generic e) { }` |
| `obj instanceof MyClass` | `object_program(obj) == (program)MyClass` or `objectp(obj) && has_index(obj, "method")` |
| `String.valueOf(x)` | `(string)x` or `sprintf("%O", x)` |

### Ruby

| Wrong (Ruby idiom) | Correct Pike |
|-------------------|-------------|
| `arr.each {\|x\| ... }` | `foreach(arr;; mixed x) { ... }` |
| `hash.merge(other)` | `m + other_m` |

### Go

| Wrong (Go idiom) | Correct Pike |
|-----------------|-------------|
| `if err != nil { }` | `catch(mixed e) { }` or check return value |

### Key Syntax Differences

WRONG — JS/Java try/catch:
```pike
try {
  do_something();
} catch (mixed e) {
  write("error: %O\n", e);
}
```

CORRECT — Pike uses `catch` without `try`:
```pike
mixed e = catch {
  do_something();
};
if (e) {
  write("error: %O\n", e);
}
```

Or inline:
```pike
catch {
  do_something_dangerous();
};
```

WRONG — Python-style map/filter on arrays:
```pike
array results = arr.map(fn);
array filtered = arr.filter(fn);
```

CORRECT — Pike uses function-call syntax with the collection as the first argument:
```pike
array results = map(arr, fn);
array filtered = filter(arr, fn);
```

## 4. Data Structure Selection Guide

| Type | Use When | Key Operations |
|------|----------|---------------|
| **array** | Ordered sequence, duplicates OK | `+= ({x})` append, `[-1]` last, `sizeof()` length |
| **mapping** | Key-value lookup, O(1) access | `m[key]`, `m[key] = val`, `indices(m)`, `values(m)` |
| **multiset** | Membership testing only (no values) | `[key]` tests membership, `+= (< key >)` add |
| **ADT.Stack** | LIFO with explicit push/pop | `push(val)`, `pop()`, `top()` |
| **ADT.Queue** | FIFO, thread-safe | `put(val)`, `get()`, `peek()` |
| **ADT.Heap** | Priority queue, scheduling | `push(val)`, `pop()`, `peek()` (deprecated: `top()` calls `pop()`) |
| **ADT.Table** | Tabular data with column ops | `ADT.Table.table(data, columns)` |
| **ADT.CritBit.Tree** | Space-efficient prefix tree for various key types | Prefix search, nearest-neighbor lookup |
| **ADT.History** | Bounded history buffer | `push(val)`, `h[-1]` latest, `flush()` clear |

### When to Use What

**Array** — default choice for lists:
```pike
array items = ({});
items += ({"first", "second"});
foreach (items;; string item) { }
```

**Mapping** — when you need key-value association:
```pike
mapping(string:int) counts = ([]);
counts["apple"]++;
if (has_index(counts, "orange")) { }
```

**Multiset** — when you only need to check existence:
```pike
multiset allowed = (< "read", "write", "execute" >);
if (allowed[action]) { }
```

**ADT.Stack** — explicit stack semantics:
```pike
ADT.Stack stk = ADT.Stack();
stk->push("a");
stk->push("b");
string top = stk->pop(); // "b"
```

**ADT.Queue** — producer/consumer or BFS:
```pike
ADT.Queue q = ADT.Queue();
q->put("task1");
q->put("task2");
string task = q->get(); // "task1"
```

**String.Buffer** — building strings in loops:
```pike
String.Buffer buf = String.Buffer();
foreach (lines;; string line)
  buf->add(line + "\n");
string result = buf->get();
```

## 5. Error Handling Idioms

### Patterns

```pike
// Catch any error, discard (use sparingly — masks bugs)
catch {
  maybe_fails();
};

// Catch and inspect error
mixed e = catch {
  risky_operation();
};
if (e) {
  werror("Failed: %O\n", e);
}

// Catch with typed error inspection
catch(Error.Generic e) {
  // This form does NOT exist — catch always binds mixed.
  // Use mixed e and then check type.
}
mixed err = catch {
  risky_operation();
};
if (objectp(err) && err->is_generic_error) {
  werror("Generic error: %s\n", err->message());
}
```

### Throwing Errors

```pike
// Throw from within a function — preferred
void validate(string name) {
  if (!strlen(name))
    error("Name cannot be empty\n");
  // error() is equivalent to throw(({message, backtrace()}))
}

// Construct typed error
throw(Error.Generic("Something went wrong", backtrace()));

// Legacy throw (array form)
throw(({ "message", backtrace() }));
```

### WRONG vs CORRECT

WRONG — silently swallowing errors:
```pike
catch { do_something_important(); };
// Error is gone forever. If this fails, you'll never know why.
```

CORRECT — log or propagate:
```pike
mixed e = catch { do_something_important(); };
if (e) {
  werror("Failed: %O\n", e);
  // either rethrow, return error code, or handle
}
```

WRONG — using return codes instead of exceptions:
```pike
int|mapping result = parse_json(data);
if (intp(result)) {
  // error code path — mixing success and error in return type
  return 0;
}
```

CORRECT — use exceptions for failure, return for success:
```pike
mapping result = parse_json(data);
// If parse_json fails, it throws. No need to check return type.
```

WRONG — JS/Java try/catch syntax:
```pike
try {
  do_work();
} catch (mixed e) {
  handle_error(e);
}
```

CORRECT — Pike catch expression:
```pike
mixed e = catch {
  do_work();
};
if (e) handle_error(e);
```

## 6. Naming Conventions

| Element | Convention | Examples |
|---------|-----------|---------|
| Functions | `lower_case_underscore` | `parse_config`, `send_request`, `get_value` |
| Variables | `lower_case_underscore` | `file_path`, `total_count`, `buffer_size` |
| Classes/Programs | `CamelCase` or `TitleCase` | `Stdio.File`, `Protocols.HTTP`, `Array` |
| Modules | `CamelCase` | `Standards.JSON`, `Protocols.HTTP`, `ADT.Stack` |
| Constants | `UPPER_CASE` or `CamelCase` | `UNDEFINED`, `__VERSION__`, `Math.pi` |
| Private members | Same as public, use `private` keyword | `private int internal_count;` |
| Boolean variables | `is_`, `has_`, `should_` prefix | `is_connected`, `has_permission`, `should_retry` |

### File Naming

| Type | Convention | Example |
|------|-----------|---------|
| Module files | `lower-case.pmod` | `http.pmod`, `json.pmod` |
| Program files | `UpperCamel.pike` | `Server.pike`, `RequestHandler.pike` |
| Directory modules | `module.pmod` inside | `MyLib/module.pmod` |

### Visibility

Pike uses keywords for visibility, not naming conventions:

```pike
class Connection {
  private string host;       // accessible only within this class
  protected int port;        // accessible within this class and descendants
  public string name;        // accessible everywhere (default)

  private void log(string msg) { }
  string get_host() { return host; }
}
```

## 7. String Handling

### Core Operations

```pike
// Split string by separator
array parts = "a,b,c" / ",";  // ({"a", "b", "c"})

// Join array with separator
string joined = ({"a", "b", "c"}) * ",";  // "a,b,c"

// Search for substring
int pos = search("hello world", "world");  // 6

// Replace
string s = replace("hello", "l", "r");  // "herro"
string s2 = replace("hello", ({"h","l"}), ({"H","L"}));  // "HeLLo"

// Trim whitespace
string trimmed = String.trim_whites("  hello  ");  // "hello"

// Split on whitespace (no built-in String.split — normalize then divide)
array words = replace("hello   world\tfoo", "\t", " ") / " " - ({""});  // ({"hello", "world", "foo"})

// Format with sprintf
string msg = sprintf("%s has %d items", name, count);

// Parse with sscanf
int n; string rest;
int matched = sscanf("42 items", "%d %s", n, rest);
// matched == 2, n == 42, rest == "items"
```

### Building Strings Efficiently

WRONG — concatenation in a loop:
```pike
string result = "";
for (int i = 0; i < 1000; i++)
  result += "line " + i + "\n";  // O(n^2): new string each iteration
```

CORRECT — use String.Buffer:
```pike
String.Buffer buf = String.Buffer();
for (int i = 0; i < 1000; i++)
  buf->add(sprintf("line %d\n", i));
string result = buf->get();
```

### Inspecting Values

```pike
// %O gives readable dump of any type
write("%O\n", some_value);

// String cast for simple conversion
string s = (string)42;  // "42"
string f = (string)3.14; // "3.14"
```

## 8. Concurrency Patterns

### Threads

```pike
// Create a thread
Thread.Thread t = Thread.Thread(function_name, @args);

// Create with inline lambda
Thread.Thread t = Thread.Thread(lambda() {
  // work here
});

// Wait for a thread to finish
mixed result = t->wait();
```

### Mutex — Mutual Exclusion

```pike
Thread.Mutex mtx = Thread.Mutex();
Thread.MutexKey key;

void safe_increment() {
  key = mtx->lock();
  counter++;
  key = 0; // unlock by assigning 0
}
```

### Condition — Signaling Between Threads

```pike
Thread.Mutex mtx = Thread.Mutex();
Thread.Condition cond = Thread.Condition();
int ready = 0;

// Consumer thread
void consumer() {
  Thread.MutexKey key = mtx->lock();
  while (!ready)
    cond->wait(key);
  key = 0;
  // process
}

// Producer thread
void producer() {
  Thread.MutexKey key = mtx->lock();
  ready = 1;
  cond->broadcast();
  key = 0;
}
```

### Thread-Local Storage

```pike
Thread.Local local_data = Thread.Local();

void worker() {
  local_data->set(getpid());
  int id = local_data->get();
}
```

### Futures and Promises (Concurrent module)

```pike
// Create a future from a value or computation
Concurrent.Future f = Concurrent.resolve(expensive_computation());

// Or use a Promise for deferred resolution
Concurrent.Promise p = Concurrent.Promise();
// ... later: p->success(result);
// f = p->future();

// Chain operations
Concurrent.Future result = f->then(lambda(mixed val) {
  return val * 2;
});

// Wait for multiple futures
array(Concurrent.Future) futures = ({
  Concurrent.resolve(task_a()),
  Concurrent.resolve(task_b()),
  Concurrent.resolve(task_c()),
});

// Wait for all to complete
Concurrent.Future all = Concurrent.results(futures);
array results = all->wait()->get();

// Race: first to complete
Concurrent.Future winner = Concurrent.first_completed(futures);
mixed fastest = winner->wait()->get();
```

### Thread-Safe Queue Pattern

```pike
ADT.Queue q = ADT.Queue();
Thread.Mutex mtx = Thread.Mutex();
Thread.Condition cond = Thread.Condition();

void producer() {
  while (1) {
    mixed item = produce_item();
    Thread.MutexKey key = mtx->lock();
    q->put(item);
    cond->signal();
    key = 0;
  }
}

void consumer() {
  while (1) {
    Thread.MutexKey key = mtx->lock();
    while (q->is_empty())
      cond->wait(key);
    mixed item = q->get();
    key = 0;
    process_item(item);
  }
}
```
