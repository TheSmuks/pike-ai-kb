# multiset Type

Unordered collection of unique values. Essentially a `mapping(T:int(0..1))` — values are either present (1) or absent (0).

[Type Reference](../../skills/pike-language-reference/references/types.md) | [ADT Module](../modules/adt.md)

## Literal Syntax

```pike
multiset(string) s = (< "a", "b", "c" >);
multiset empty = (<>);            // empty multiset
```

## Key Operations

| Operation | Example | Notes |
|-----------|---------|-------|
| Test membership | `s["a"]` | Returns 1 if present, 0 if absent |
| Add | `s["d"] = 1` | Add value to set |
| Remove | `s["a"] = 0` | Remove value from set |
| Size | `sizeof(s)` | Number of entries |
| Iterate | `foreach (s; ; val)` | Iterate over values |
| Get entries | `indices(s)` | Array of values in the set |

## Common Patterns

```pike
// Membership check
multiset(string) allowed = (< "read", "write", "execute" >);
if (allowed[permission]) { /* access granted */ }

// Deduplication via multiset
multiset(int) seen = (<>);
foreach (data; ; int val) {
    if (!seen[val]) {
        seen[val] = 1;
        // process first occurrence
    }
}
```

## Common Pitfalls

- Multisets do not support `+`, `-`, or `&` operators like `ADT.Set` does. Use `ADT.Set` for set algebra.
- Removing an entry is `s["key"] = 0`, not `m_delete` (though `m_delete` also works).
- `indices()` returns the values in the multiset (not keys).
- Like mappings, iteration order is not guaranteed.
- Use [ADT.Set](../modules/adt.md) for union/intersection/difference operations.

## See Also

- [mapping type](./mapping-type.md) — the underlying structure
- [array type](./array-type.md) — ordered collections
- [ADT module](../modules/adt.md) — `ADT.Set` with set operations (`&`, `|`, `-`)
