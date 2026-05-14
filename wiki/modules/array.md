# Array Module

Array manipulation functions. Many array operations are global functions or operators.

[Full Utilities API](../../skills/pike-stdlib-api/references/utilities-api.md) | [Type Reference](../../skills/pike-language-reference/references/types.md)

## Key Functions

```pike
Array.reduce(`+, ({1, 2, 3}), 0);    // 6 — left fold
Array.flatten(({{1,2}, {3}}));        // ({1, 2, 3})
Array.uniq(({1, 2, 2, 3}));          // ({1, 2, 3})
Array.sort(({3, 1, 2}));             // ({1, 2, 3}) — in-place
Array.shuffle(({1, 2, 3}));          // random order
Array.all(({1,2,3}), `>);            // test all elements
Array.any(({1,2,3}), `==, 2);        // test any element
Array.sum(({1, 2, 3}));              // 6
```

## Global Array Functions

```pike
search(({1, 2, 3}), 2);     // 1 — index of value, -1 if not found
sort(a);                      // in-place sort, returns a
reverse(({1, 2, 3}));        // ({3, 2, 1}) — new array
column(matrix, 0);            // extract nth element from array of arrays
min(1, 2, 3);                 // 1
max(1, 2, 3);                 // 3
```

## Array Operators

```pike
({1, 2}) + ({3, 4});          // ({1, 2, 3, 4}) — concatenation
({1, 2}) - ({2});             // ({1}) — removal
({1, 2, 3})[1..2];           // ({2, 3}) — slice
({1, 2, 3})[-1];             // 3 — negative index
sizeof(({1, 2, 3}));          // 3
```

## Arrow Operator

```pike
// Extract field from array of mappings
array(mapping) data = ({(["x":1]), (["x":2])});
data->x;  // ({1, 2})

// Call method on array of objects
objs->method();  // array of return values
```

## Gotchas

- `Array.sort` sorts in-place and returns the same array reference.
- Use `Array.sort_array(arr, comparator)` for custom sort order.
- `+` on arrays creates a new array (does not modify in place).
- `+=` on array variables is efficient (appends in place when sole reference).
- `search()` is a global function, not `Array.search`.
- `Array.diff` returns `({a_segments, b_segments})` — parallel arrays of segments.

## See Also

- [array type](../entities/array-type.md)
- [ADT module](./adt.md) — richer data structures
- [String module](./string.md) — string utilities
