# array Type

Ordered, dynamically-sized, 0-indexed collection. Reference type — shared on assignment.

[Type Reference](../../skills/pike-language-reference/references/types.md) | [Array Module](../modules/array.md)

## Literal Syntax

```pike
array(int) a = ({1, 2, 3});
array empty = ({});                  // empty array
array(mixed) any = ({1, "two", 3.0}); // heterogeneous
```

## Key Operations

| Operation | Example | Notes |
|-----------|---------|-------|
| Index | `a[0]` | 0-indexed; `a[-1]` is last element |
| Slice | `a[1..3]` | Returns new array `({a[1], a[2], a[3]})` |
| Concatenation | `a + ({4})` | Returns new array |
| Append | `a += ({4})` | Efficient when sole reference |
| Remove | `a - ({2})` | Remove all occurrences |
| Length | `sizeof(a)` | Number of elements |
| Search | `search(a, val)` | Returns index or -1 |
| Sort | `sort(a)` | In-place, returns same array |
| Reverse | `reverse(a)` | Returns new array |
| Iterate | `foreach (a; ; elem)` | Preferred iteration |
| Arrow | `a->field` | Extract field from array of mappings/objects |

## Common Patterns

```pike
// Filter via array comprehension
array(int) evens = filter(({1,2,3,4,5}), lambda(int x) { return !(x & 1); });

// Map via array comprehension
array(string) names = map(objects, `->, "name");

// Reduce
int total = Array.reduce(`+, numbers, 0);

// Check membership
if (search(arr, value) != -1) { /* found */ }
```

## Common Pitfalls

- `+` creates a new array. Use `+=` for efficient append (in-place when sole reference).
- `sort()` modifies the array in place and returns it.
- `a[-1]` returns the last element, but `a[-2]` also works (negative indexing).
- Slice `a[1..2]` is inclusive on both ends (2 elements).
- Empty array literal is `({})`, not `[]` (that would be an empty mapping).

## See Also

- [Array module](../modules/array.md) — utility functions
- [ADT module](../modules/adt.md) — stacks, queues, heaps
- [mapping type](./mapping-type.md) — key-value collections
