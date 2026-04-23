# ADT API Reference (Pike 8.0.1116)

## ADT.Stack

LIFO stack with constant-time push/pop.

```pike
ADT.Stack(int|void initial_size)
```

```pike
ADT.Stack()->push(mixed value) -> void
```
Push value onto stack.

```pike
ADT.Stack()->pop() -> mixed
```
Pop top value. Errors if empty.

```pike
ADT.Stack()->top() -> mixed
```
Return top value without removing it.

```pike
ADT.Stack()->reset() -> void
```
Clear the stack.

```pike
ADT.Stack()->set_stack(array values) -> void
```
Replace stack contents with given array.

```pike
ADT.Stack()->sizeof() -> int
```
Number of elements.

---

## ADT.Queue

FIFO queue.

```pike
ADT.Queue(mixed ... initial_values)
```
```pike
ADT.Queue()->put(mixed value) -> void
```
Enqueue value.

```pike
ADT.Queue()->get() -> mixed
```
Dequeue front value.

```pike
ADT.Queue()->peek() -> mixed
```
View front value without removing.

```pike
ADT.Queue()->read() -> mixed
```
Alias for get (dequeue front value).

```pike
ADT.Queue()->sizeof() -> int
```
Number of elements.

```pike
ADT.Queue()->is_empty() -> int
```
Returns non-zero if queue is empty.

```pike
ADT.Queue()->flush() -> void
```
Clear the queue. Does not return elements.

---

## ADT.Heap

Min-heap. Values themselves are used as sort keys (lowest first).

```pike
ADT.Heap()
```

```pike
ADT.Heap()->push(mixed value) -> ADT.Heap.Element
```
Insert value. The value itself is the sort key. Returns element handle for later adjustment.

```pike
ADT.Heap()->pop() -> mixed
```
Remove and return minimum value.

```pike
ADT.Heap()->peek() -> mixed
```
Return minimum value without removing. `top()` is deprecated (it calls `pop()`, which is destructive).

```pike
ADT.Heap()->adjust(ADT.Heap.Element elem) -> void
```
Re-heapify after caller modifies `elem->value` directly.

```pike
ADT.Heap()->remove(ADT.Heap.Element elem) -> void
```
Remove specific element.

```pike
ADT.Heap()->sizeof() -> int
```
Number of elements.

---

## ADT.Priority_queue

Priority queue (wrapper around ADT.Heap with different interface).

```pike
ADT.Priority_queue()
```

```pike
ADT.Priority_queue()->push(int|float priority, mixed value) -> ADT.Heap.Element
ADT.Priority_queue()->pop() -> mixed
ADT.Priority_queue()->top() -> mixed
ADT.Priority_queue()->sizeof() -> int
```

---

## ADT.Table

Tabular data structure with relational operations.

```pike
ADT.Table.table(array(array) table, array(string) column_names)
```

```pike
ADT.Table.table()->select(string ... columns) -> ADT.Table.table
```
Select specific columns.

```pike
ADT.Table.table()->where(array(int|string)|int|string columns, function f, mixed ... args) -> ADT.Table.table
```
Filter rows by predicate applied to specified column(s).

```pike
ADT.Table.table()->sort(int|string ... columns) -> ADT.Table.table
```
Sort ascending by column(s). Use `rsort()` for descending.

```pike
ADT.Table.table()->distinct(string ... columns) -> ADT.Table.table
```
Remove duplicate rows (optionally by specific columns).

```pike
ADT.Table.table()->sum_col(string column) -> int|float
ADT.Table.table()->average_col(string column) -> float
ADT.Table.table()->max_col(string column) -> mixed
ADT.Table.table()->min_col(string column) -> mixed
`max_col`/`min_col` appear to return the first row's value for the column, not the actual maximum/minimum.
```

```pike
ADT.Table.table()->map(function f, string ... columns) -> ADT.Table.table
ADT.Table.table()->group(mapping(int|string:function)|function f, mixed ... args) -> ADT.Table.table
ADT.Table.table()->rename(string from, string to) -> ADT.Table.table
```

```pike
ADT.Table.table()->encode() -> string
```
Serialize table to string.

```pike
indices(ADT.Table.table) -> array(string)   // column names
values(ADT.Table.table) -> array(array)        // row data
```

---

## ADT.CritBit

Prefix-search tree family. All CritBit trees support prefix-based lookup.

### ADT.CritBit.StringTree

```pike
ADT.CritBit.StringTree()
```

```pike
// Access via operator syntax: tree["key"] = value; mixed val = tree["key"];
ADT.CritBit.StringTree()->first() -> string
ADT.CritBit.StringTree()->last() -> string
ADT.CritBit.StringTree()->next(string key) -> string
ADT.CritBit.StringTree()->previous(string key) -> string
ADT.CritBit.StringTree()->sizeof() -> int
```
Use `tree[key]` for lookup and `tree[key] = value` for insert. No named insert/remove/search/lookup/prefix methods exist.

### ADT.CritBit.IntTree

Same interface as StringTree but keys are integers.

### ADT.CritBit.FloatTree

Same interface as StringTree but keys are floats.

### ADT.CritBit.IPv4Tree

Same interface but keys are IPv4 address strings. Supports CIDR prefix lookup.

### ADT.CritBit.BigNumTree

CritBit tree with Gmp.mpz keys.

### ADT.CritBit.DateTree

CritBit tree with date-based keys.

### ADT.CritBit.MultiTree

CritBit tree where each key maps to a set of values.

### ADT.CritBit.MultiRangeSet

Set of ranges with efficient overlap queries.

### ADT.CritBit.RangeSet

Set of integer ranges with efficient membership testing.

### ADT.CritBit.Reverse

Reversed CritBit tree (iterates in descending order).

---

## ADT.History

Bounded circular buffer retaining the last N values.

```pike
ADT.History(int max_size)
```

```pike
ADT.History()->push(mixed value) -> void
ADT.History()->flush() -> void
ADT.History()->sizeof() -> int
ADT.History()->get_maxsize() -> int
ADT.History()->get_latest_entry_num() -> int
ADT.History()->get_first_entry_num() -> int
ADT.History()->set_maxsize(int new_size) -> void
```
Use `[]` indexing to retrieve values by sequence number. `flush()` clears history and returns void.

---

## ADT.List

Doubly-linked list with insert/append at head/tail and pop from both ends.

```pike
ADT.List()
```

```pike
ADT.List()->insert(mixed value) -> int  // insert at head, returns 0
ADT.List()->append(mixed value) -> int  // append to tail, returns 0
ADT.List()->pop() -> mixed              // remove and return head value
ADT.List()->pop_back() -> mixed         // remove and return tail value
ADT.List()->head() -> mixed             // peek at head value
ADT.List()->tail() -> mixed             // peek at tail value
ADT.List()->flush() -> void             // clear list
ADT.List()->sizeof() -> int
ADT.List()->is_empty() -> int
```

---

## ADT.Set

Set data structure with standard set operations.

```pike
ADT.Set(array|void values)
```

```pike
ADT.Set()->add(mixed value) -> void
ADT.Set()->remove(mixed value) -> void
ADT.Set()->contains(mixed value) -> int
ADT.Set()->`&(ADT.Set other) -> ADT.Set   // intersection
ADT.Set()->`|(ADT.Set other) -> ADT.Set   // union
ADT.Set()->`-(ADT.Set other) -> ADT.Set   // difference
ADT.Set()->subset(ADT.Set other) -> int
ADT.Set()->sizeof() -> int
ADT.Set()->is_empty() -> int
ADT.Set()->cast(string type) -> mixed
ADT.Set()->filter(function(mixed:int) f) -> ADT.Set
ADT.Set()->map(function(mixed:mixed) f) -> array(mixed)
```
Set operations use operators (`&`, `|`, `-`), not named methods. No `^` (symmetric difference) operator. `map()` returns an array, not a Set.

---

## ADT.Trie

Character-based trie (prefix tree).

```pike
ADT.Trie()
```

```pike
ADT.Trie()->insert(string key, mixed value) -> void
ADT.Trie()->remove(string key) -> void
ADT.Trie()->lookup(string key) -> mixed
ADT.Trie()->first() -> string
ADT.Trie()->next(string key) -> string
ADT.Trie()->sizeof() -> int
```
No `prefix()` method. `sizeof()` does not reflect entry count (returns constant). Use `first()`/`next()` to iterate keys.

---

## ADT.Interval

Interval arithmetic with proper rounding.

```pike
ADT.Interval(int|float a, int|float b)
```

```pike
ADT.Interval()->`+(mixed other) -> ADT.Interval
ADT.Interval()->`-(mixed other) -> ADT.Interval
ADT.Interval()->`&(ADT.Interval other) -> ADT.Interval  // intersection
ADT.Interval()->`|(ADT.Interval other) -> ADT.Interval  // union
ADT.Interval()->contains(mixed value) -> int
ADT.Interval()->overlaps(ADT.Interval other) -> int
ADT.Interval()->touches(ADT.Interval other) -> int
```
Use `i->start` and `i->stop` for raw numeric bounds. No `*`/`/` operators. No `intersect()`/`union()` methods — use `&`/`|` operators.

---

## ADT.Sequence

Indexed sequence using `[]` indexing. Requires int or array argument to construct.

```pike
ADT.Sequence(int|array values)
```

```pike
ADT.Sequence()->`[](int index) -> mixed
ADT.Sequence()->`[]=(int index, mixed value) -> mixed
ADT.Sequence()->sizeof() -> int
```
Access and mutate via `[]` indexing. No named insert/remove/get/set/push/pop/cast methods.

---

## ADT.Struct

Base class for packed binary structures with named fields. Must be inherited, not used directly.

```pike
class MyPacket {
  inherit ADT.Struct;
  Item header = Chars(4);
  Item length = Word();
}
```

Item types: `Byte`, `Word`, `Long`, `Chars`, `Varchars`, `SByte`, `SWord`, `SLong`, `Drow`, `Gnol`, `int8`–`int64`, `uint8`–`uint64`. Use `(string)object` to encode, `object->decode(string)` to decode. Direct field access via `object->field_name`.

---

## ADT.BitBuffer

Bit-level read/write buffer for binary protocols.

```pike
ADT.BitBuffer(string|void initial_data)
```

```pike
ADT.BitBuffer()->put(int value, int bits) -> void
ADT.BitBuffer()->get(int bits) -> int
ADT.BitBuffer()->read(int bytes) -> string
ADT.BitBuffer()->drain() -> string
ADT.BitBuffer()->feed(string data) -> void
ADT.BitBuffer()->sizeof() -> int
```
`get(bits)` reads bits and returns int. `read(bytes)` reads bytes and returns string. `put(value, bits)` writes bits. No `read_bits`/`write_bits` methods.

---

## ADT.CircularList

Circular linked list with wrap-around traversal.

```pike
ADT.CircularList(int|array values)
```

```pike
ADT.CircularList()->first() -> CircularListIterator
ADT.CircularList()->sizeof() -> int
ADT.CircularList()->is_empty() -> int
```
`first()` returns an iterator object with `value()`, `index()`, `+= n` (advance), `-= n` (retreat) operations. No `push`/`pop`/`next`/`prev`/`current`/`remove`/`cast` methods.
