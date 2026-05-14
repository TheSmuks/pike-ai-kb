# Syntax

Pike uses C-family syntax with its own collection literal notation, no `try` keyword, and powerful iteration constructs.

## Identifiers and Keywords

Letter/`_` followed by letters/digits/`_`, case-sensitive. Keywords include `break`, `catch`, `class`, `constant`, `continue`, `do`, `else`, `final`, `for`, `foreach`, `if`, `inherit`, `lambda`, `return`, `switch`, `while`, and more.

## Literals

```pike
42              // int decimal      0x2A        // int hex
3.14            // float            "hello"      // string
'c'             // char → int       ({1,2,3})   // array (NOT [1,2,3])
(["k":"v"])     // mapping (NOT {}) (<"a","b">) // multiset
```

## Operators

Arithmetic: `+ - * / %` (int division rounds toward -inf).
String/Array: `+` (concat), `*` (repeat/join), `/` (split), `-` `&` `|` (set ops).
Range: `arr[2..4]` (inclusive), `arr[..3]`, `arr[<0]` (last).
Assignment: `= += -= *= /= %= &= |= ^= <<= >>=`.

## Control Flow

```pike
if (c) { } else if (c2) { } else { }
while (c) { }      do { } while (c);
for (int i=0; i<10; i++) { }
foreach (arr; int i; mixed v) { }
foreach (m; mixed k; mixed v) { }
switch (v) { case 1: f(); break; case 2..5: g(); break; default: h(); }
```

Cases fall through without `break` (C-style). `break` exits loops/switch; `continue` skips iteration.

## Functions

```pike
string greet(string name, string|void greeting) {
  if (zero_type(greeting)) greeting = "Hello";
  return sprintf("%s, %s!", greeting, name);
}
function(int:int) double = lambda(int x) { return x * 2; };
void log(string fmt, mixed ... args) { write(fmt+"\n", @args); }
```

## Preprocessor

```pike
#define NAME val    #if / #elif / #else / #endif
#include "file.h"   #pike 8.0     #string "file.txt"
```

## sprintf / sscanf

```pike
sprintf("%s has %d items", name, count);
sprintf("%O", any_value);                        // debug dump
sprintf("%t", 42);                                // "int"
int n = sscanf("42 items", "%d %s", int i, string s);
```

## See Also

- [Type System](type-system.md) — types, annotations, coercion
- [Error Handling](error-handling.md) — `catch` syntax (no `try`!)
- [OOP](oop.md) — classes, `inherit`, lfuns
- [Full syntax reference](../../skills/pike-language-reference/references/syntax.md)
- [Idiomatic Pike](../../skills/pike-language-reference/references/idiomatic-pike.md)
