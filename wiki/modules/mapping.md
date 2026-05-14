# Mapping Module / Mapping Operations

Key-value dictionary operations. Pike mappings are hash tables with any-type keys.

[Full Utilities API](../../skills/pike-stdlib-api/references/utilities-api.md) | [Type Reference](../../skills/pike-language-reference/references/types.md)

## Mapping Literals and Basic Operations

```pike
mapping(string:int) m = (["a": 1, "b": 2]);
m["c"] = 3;             // add/set
int v = m["a"];         // get (returns 0 for missing keys)
m_delete(m, "a");       // remove, returns removed value
sizeof(m);               // number of entries
indices(m);              // array of keys
values(m);               // array of values
```

## Mapping Operators

```pike
(["a":1]) + (["b":2]);     // (["a":1, "b":2]) — merge
(["a":1, "b":2]) - (["a"]); // (["b":2]) — key removal
```

## Distinguishing Missing Keys from Zero Values

`m[key]` returns `0` for both missing keys and keys mapped to `0`. Use `zero_type()`:

```pike
mapping(string:int) m = (["present": 0]);
m["present"];             // 0 — key exists, value is 0
m["missing"];             // 0 — key does not exist
zero_type(m["present"]);  // 0 — key exists
zero_type(m["missing"]);  // 1 — key is missing
```

## Iteration

```pike
foreach (m; string key; int val) {
    write("%s => %d\n", key, val);
}
```

## Common Patterns

```pike
// Count occurrences
mapping(string:int) counts = ([]);
foreach (words; ; string w) counts[w]++;

// Merge with defaults
mapping opts = default_opts + user_opts;
```

## Gotchas

- Mapping key order is not guaranteed (hash-based). Use `ADT.Table` for ordered data.
- `m[key]` returns `0` for missing keys — use `zero_type()` to distinguish from actual `0`.
- `+` on mappings creates a new mapping. Right side overwrites left on key collision.
- Keys can be any type, but `string` and `int` are most common.
- `indices()` and `values()` return arrays in matching order.

## See Also

- [mapping type](../entities/mapping-type.md)
- [multiset type](../entities/multiset-type.md)
- [ADT module](./adt.md) — `ADT.Table` for relational operations
- [Array module](./array.md) — array utilities
