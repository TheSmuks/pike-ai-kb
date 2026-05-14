# Memory and References

Pike uses garbage collection with a clear split between value types (copied on assignment) and reference types (shared on assignment).

## Value Types — Copied

`int`, `float`, `string` are copied on assignment. Modifying one variable never affects another.

```pike
int a = 42;
int b = a;    // b gets its own copy
b = 99;       // a is still 42

string s1 = "hello";
string s2 = upper_case(s1);  // s1 unchanged — strings are immutable
```

Strings are immutable — all operations produce new strings, so sharing is always safe.

## Reference Types — Shared

`array`, `mapping`, `multiset`, `object`, `function` are shared. Two variables pointing to the same collection see each other's mutations.

```pike
array(int) a = ({1, 2, 3});
array(int) b = a;    // shares the same array
b[0] = 99;           // a[0] is now also 99

mapping(string:int) m1 = (["x": 1]);
mapping m2 = m1;
m2["y"] = 2;         // m1["y"] is now 2
```

## Copying Reference Types

```pike
array(int) copy = original + ({});  // shallow copy
copy[0] = 99;                       // original unchanged

mixed deep = copy_value(nested_structure);  // deep copy
```

## Garbage Collection

Pike uses reference counting with a cycle detector. Objects are freed when their reference count drops to zero. Cycle detection runs periodically. No manual `free()` needed — memory reclaims automatically.

## Destructed Objects

When an object is destructed (`destruct()` or GC), accessing members raises `"Lookup in destructed object"`. Check `objectp(obj)` first — destructed objects return false.

## zero_type() — Missing Keys vs Zero

Mapping lookups return `0` for both missing keys and keys mapped to zero. `zero_type()` distinguishes them:

```pike
mapping(string:int) m = (["present": 0]);
m["present"];             // 0
m["missing"];             // 0
zero_type(m["present"]);  // 0 — key exists
zero_type(m["missing"]);  // 1 — key missing
```

## Equality: Identity vs Structural

`==` tests identity for reference types; use `equal()` for deep comparison:

```pike
array a = ({1,2,3});
array b = ({1,2,3});
a == b;      // 0 — different instances
equal(a, b); // 1 — same contents
```

## See Also

- [Type System](type-system.md) — all types and categories
- [OOP](oop.md) — object lifecycle, `create()`/`destroy()`
- [Error Handling](error-handling.md) — destructed object errors
- [Full type reference](../../skills/pike-language-reference/references/types.md)
