# ADT Module (Abstract Data Types)

Collection of classic data structures: stacks, queues, heaps, trees, sets, and more.

[Full ADT API](../../skills/pike-stdlib-api/references/adt-api.md)

## Key Classes

| Class | Purpose |
|-------|---------|
| `ADT.Stack` | LIFO stack. `push()`, `pop()`, `top()`. |
| `ADT.Queue` | FIFO queue. `put()`, `get()`, `peek()`. |
| `ADT.Heap` | Min-heap. Value itself is sort key. `push()`, `pop()`, `peek()`. |
| `ADT.Priority_queue` | Priority queue wrapping Heap. `push(priority, value)`. |
| `ADT.Table` | Relational table with `select()`, `where()`, `sort()`, `group()`. |
| `ADT.Set` | Set with `&` (intersection), `\|` (union), `-` (difference). |
| `ADT.CritBit.StringTree` | Prefix-search tree with `[]` operator access. |
| `ADT.List` | Doubly-linked list. `insert()`/`append()`, `pop()`/`pop_back()`. |
| `ADT.History` | Bounded circular buffer retaining last N values. |
| `ADT.Struct` | Base class for packed binary structures with named fields. |
| `ADT.BitBuffer` | Bit-level read/write for binary protocols. |
| `ADT.Trie` | Character-based trie (prefix tree). |

## Common Patterns

```pike
// Stack
ADT.Stack s = ADT.Stack();
s->push(1); s->push(2);
int top = s->pop();  // 2

// Queue
ADT.Queue q = ADT.Queue(1, 2, 3);
q->put(4);
int val = q->get();  // 1

// Priority queue
ADT.Priority_queue pq = ADT.Priority_queue();
pq->push(3, "low"); pq->push(1, "high");
pq->pop();  // "high"

// Set operations
ADT.Set a = ADT.Set(({1, 2, 3}));
ADT.Set b = ADT.Set(({2, 3, 4}));
ADT.Set inter = a & b;   // {2, 3}
ADT.Set uni = a | b;      // {1, 2, 3, 4}
```

## ADT.Table (Relational Operations)

```pike
ADT.Table.table t = ADT.Table.table(
    ({ ({"alice", 30}), ({"bob", 25}) }),
    ({"name", "age"})
);
t = t->select("name")->where("age", `<, 28);
```

## Gotchas

- `ADT.Heap` is a min-heap. Use negative values or `ADT.Priority_queue` for max-heap behavior.
- `ADT.Heap->top()` is deprecated — it calls `pop()` (destructive). Use `peek()` instead.
- `ADT.Set` has no `^` (symmetric difference) operator. `Set->map()` returns an array, not a Set.
- `ADT.CritBit.StringTree` uses `[]` operators only — no named insert/remove/search methods.
- `ADT.Trie->sizeof()` does not reflect entry count. Iterate with `first()`/`next()`.
- `ADT.Table` `max_col`/`min_col` may return the first row's value, not the actual max/min.
- `ADT.Struct` must be inherited, not used directly.

## See Also

- [array type](../entities/array-type.md) — arrays as simple collections
- [mapping type](../entities/mapping-type.md) — key-value dictionaries
