# Type System

Pike has a rich, statically-checked type system with value and reference types, union types, generic collections, and transparent bignum promotion.

## Value Types (Copied on Assignment)

- **int** — Signed integer, transparently promotes to arbitrary-precision bignum on overflow.
- **float** — IEEE 754 double-precision.
- **string** — Immutable byte/character sequence.

```pike
int x = 42;
int big = Int.NATIVE_MAX + 1;  // auto-promoted to bignum, type stays int
float pi = 3.14;
string s = "hello";            // all ops return new strings
```

## Reference Types (Shared on Assignment)

- **array(T)** — Ordered, dynamically-sized, typed collection.
- **mapping(K:V)** — Key-value dictionary; keys can be any type.
- **multiset(T)** — Unique membership set; essentially `mapping(T:int(0..1))`.
- **object(Program)** — Class instance; use `->` for member access.
- **program** — A class blueprint (not an instance).
- **function(T:R)** — First-class callable.

```pike
array(int) a = ({1, 2, 3});
mapping(string:int) m = (["a": 1]);
multiset(string) s = (< "x", "y" >);
```

## Special Types

| Type     | Meaning |
|----------|---------|
| `mixed`  | Any value at all |
| `void`   | No return (return-type annotation only) |
| `zero`   | Only the value `0` / `UNDEFINED` (Pike 8.1+) |
| `auto`   | Type inferred from initializer (Pike 8.1+) |

## Union Types

```pike
int|string x;                    // either int or string
array(int|string) items;         // elements are int or string
mapping(string:int|string) m;    // values are int or string
```

## Type Coercion

```pike
(int)"42"       // 42  — decimal only, NO hex
(int)"0xFF"     // 0   — hex NOT parsed by (int)
(float)"3.14"   // 3.14
(string)42      // "42"
(array)"hi"     // ({104, 105}) — chars to int codes
```

Use `sprintf("%t", x)` to get the type name as a string, or `typeof(x)` for compile-time type inspection.

## Type Predicates

```pike
intp(x)      floatp(x)     stringp(x)    arrayp(x)
mappingp(x)  multisetp(x)  objectp(x)    programp(x)
functionp(x) zero_type(x)  undefinedp(x)
```

## Key Gotchas

- `(int)` on float **truncates** toward zero — use `(int)round(f)` for rounding.
- `(int)"0xFF"` returns `0` — use `sscanf("0xFF", "%x", int v)` for hex.
- `typeof(0)` returns `zero`, not `int`.
- `m[key]` returns `0` for both missing keys and keys mapped to zero — use `zero_type()` to distinguish.
- `Val.true`, `Val.false`, `Val.null` are singleton objects for boolean/null semantics.

## See Also

- [Syntax](syntax.md) — operators, literals, control flow
- [Memory and References](memory-and-references.md) — value vs reference semantics in depth
- [OOP](oop.md) — `object`, `program`, `function` types in class context
- [Full type reference](../../skills/pike-language-reference/references/types.md)
