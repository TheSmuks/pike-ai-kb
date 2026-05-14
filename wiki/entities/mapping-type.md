# mapping Type

Key-value dictionary (hash table). Reference type — shared on assignment. Keys can be any type.

[Type Reference](../../skills/pike-language-reference/references/types.md) | [Mapping Module](../modules/mapping.md)

## Literal Syntax

```pike
mapping(string:int) m = (["a": 1, "b": 2]);
mapping empty = ([]);                         // empty mapping
mapping(string:mixed) data = (["key": val]);  // mixed values
```

## Key Operations

| Operation | Example | Notes |
|-----------|---------|-------|
| Get | `m["key"]` | Returns 0 for missing keys |
| Set | `m["key"] = val` | Add or update |
| Delete | `m_delete(m, "key")` | Returns removed value |
| Keys | `indices(m)` | Array of keys |
| Values | `values(m)` | Array of values (matching order) |
| Size | `sizeof(m)` | Number of entries |
| Merge | `m1 + m2` | New mapping; m2 overwrites on collision |
| Remove keys | `m - (["key"])` | New mapping without those keys |
| Iterate | `foreach (m; key; val)` | Preferred iteration |
| Existence | `zero_type(m[key])` | 0=exists, 1=missing |

## Common Patterns

```pike
// Count occurrences
mapping(string:int) counts = ([]);
foreach (items; ; string item) counts[item]++;

// Default values
int val = m[key] || default_value;

// Check key existence properly
if (!zero_type(m[key])) {
    // key exists (even if value is 0)
}

// Merge with overrides
mapping config = defaults + user_overrides;
```

## Common Pitfalls

- `m[key]` returns `0` for both missing keys and keys with value `0`. Use `zero_type()` to distinguish.
- Key order is not guaranteed (hash-based). Do not rely on insertion order.
- `+` creates a new mapping. Right side wins on key collision.
- Empty mapping literal is `([])`, not `{}` (that would be a block/empty class).
- `indices()` and `values()` always return arrays in matching order, but that order is arbitrary.

## See Also

- [mapping module](../modules/mapping.md) — mapping operations
- [array type](./array-type.md) — ordered collections
- [multiset type](./multiset-type.md) — unique-value sets
- [ADT module](../modules/adt.md) — `ADT.Table` for relational data
