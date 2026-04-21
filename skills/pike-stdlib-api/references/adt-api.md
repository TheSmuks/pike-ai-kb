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

```pike
ADT.Stack()->`[](int index) -> mixed
```
Index into stack (0 = bottom).

---

## ADT.Queue

FIFO queue.

```pike
ADT.Queue()
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
ADT.Queue()->read(mixed value) -> void
```
Alias for put.

```pike
ADT.Queue()->sizeof() -> int
```
Number of elements.

```pike
ADT.Queue()->is_empty() -> int
```
Returns non-zero if queue is empty.

```pike
ADT.Queue()->flush() -> array
```
Return all elements and clear queue.

---

## ADT.Heap

Min-heap priority queue with adjustable priorities.

```pike
ADT.Heap()
```

```pike
ADT.Heap()->push(mixed value, int|float priority) -> ADT.Heap.Element
```
Insert value with priority. Returns element handle for later adjustment.

```pike
ADT.Heap()->pop() -> mixed
```
Remove and return lowest-priority value.

```pike
ADT.Heap()->top() -> mixed
```
Return lowest-priority value without removing.

```pike
ADT.Heap()->low() -> mixed
```
Alias for top.

```pike
ADT.Heap()->adjust(ADT.Heap.Element elem, int|float new_priority) -> void
```
Change priority of an element.

```pike
ADT.Heap()->remove(ADT.Heap.Element elem) -> void
```
Remove specific element.

```pike
ADT.Heap()->sizeof() -> int
```
Number of elements.

```pike
ADT.Heap()->is_empty() -> int
```

```pike
ADT.Heap()->peek() -> mixed
```

---

## ADT.Priority_queue

Priority queue (wrapper around ADT.Heap with different interface).

```pike
ADT.Priority_queue()
```

```pike
ADT.Priority_queue()->push(mixed value, int|float priority) -> void
ADT.Priority_queue()->pop() -> mixed
ADT.Priority_queue()->top() -> mixed
ADT.Priority_queue()->sizeof() -> int
```

---

## ADT.Table

Tabular data structure with relational operations.

```pike
ADT.Table.table(array(array) table, array(string)|void column_names)
```

```pike
ADT.Table.table()->select(string ... columns) -> ADT.Table.table
```
Select specific columns.

```pike
ADT.Table.table()->where(function(array:int) filter) -> ADT.Table.table
```
Filter rows by predicate.

```pike
ADT.Table.table()->sort(string column, int|void reverse) -> ADT.Table.table
```
Sort by column.

```pike
ADT.Table.table()->distinct(string ... columns) -> ADT.Table.table
```
Remove duplicate rows (optionally by specific columns).

```pike
ADT.Table.table()->sum(string column) -> int|float
ADT.Table.table()->average(string column) -> float
ADT.Table.table()->max(string column) -> mixed
ADT.Table.table()->min(string column) -> mixed
ADT.Table.table()->count(string|void column) -> int
```

```pike
ADT.Table.table()->map(function(array:array) f) -> ADT.Table.table
ADT.Table.table()->group(string column) -> ADT.Table.table
ADT.Table.table()->rename(string from, string to) -> ADT.Table.table
ADT.Table.table()->cast(function(mixed:mixed) f, string ... columns) -> ADT.Table.table
```

```pike
ADT.Table.table()->encode() -> string
```
Serialize table to string.

```pike
ADT.Table.table()->colnames() -> array(string)
ADT.Table.table()->rows() -> array(array)
```

---

## ADT.CritBit

Prefix-search tree family. All CritBit trees support prefix-based lookup.

### ADT.CritBit.StringTree

```pike
ADT.CritBit.StringTree()
```

```pike
ADT.CritBit.StringTree()->insert(string key, mixed value) -> mixed
ADT.CritBit.StringTree()->remove(string key) -> mixed
ADT.CritBit.StringTree()->search(string key) -> mixed
ADT.CritBit.StringTree()->lookup(string key) -> mixed
ADT.CritBit.StringTree()->prefix(string prefix) -> array
ADT.CritBit.StringTree()->first() -> string
ADT.CritBit.StringTree()->last() -> string
ADT.CritBit.StringTree()->next(string key) -> string
ADT.CritBit.StringTree()->previous(string key) -> string
ADT.CritBit.StringTree()->sizeof() -> int
```

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
ADT.History()->get() -> array
ADT.History()->query(int|void n) -> array
ADT.History()->flush() -> array
ADT.History()->sizeof() -> int
ADT.History()->max() -> int
```

---

## ADT.List

Doubly-linked list with efficient insert/remove at any position.

```pike
ADT.List(array|void initial_values)
```

```pike
ADT.List()->insert(mixed value) -> ADT.List.Node
ADT.List()->append(mixed value) -> ADT.List.Node
ADT.List()->pop() -> mixed
ADT.List()->shift() -> mixed
ADT.List()->first() -> mixed
ADT.List()->last() -> mixed
ADT.List()->erase(ADT.List.Node node) -> void
ADT.List()->sizeof() -> int
ADT.List()->is_empty() -> int
ADT.List()->cast(string type) -> mixed
```
Casts to "array" produce a plain array of values.

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
ADT.Set()->intersection(ADT.Set other) -> ADT.Set
ADT.Set()->`&(ADT.Set other) -> ADT.Set
ADT.Set()->union(ADT.Set other) -> ADT.Set
ADT.Set()->`|(ADT.Set other) -> ADT.Set
ADT.Set()->difference(ADT.Set other) -> ADT.Set
ADT.Set()->`-(ADT.Set other) -> ADT.Set
ADT.Set()->symmetric_difference(ADT.Set other) -> ADT.Set
ADT.Set()->`^(ADT.Set other) -> ADT.Set
ADT.Set()->subset(ADT.Set other) -> int
ADT.Set()->sizeof() -> int
ADT.Set()->is_empty() -> int
ADT.Set()->cast(string type) -> mixed
ADT.Set()->filter(function(mixed:int) f) -> ADT.Set
ADT.Set()->map(function(mixed:mixed) f) -> ADT.Set
```

---

## ADT.Trie

Character-based trie (prefix tree).

```pike
ADT.Trie(mapping|void initial_data)
```

```pike
ADT.Trie()->insert(string key, mixed value) -> void
ADT.Trie()->remove(string key) -> void
ADT.Trie()->lookup(string key) -> mixed
ADT.Trie()->prefix(string prefix) -> array
ADT.Trie()->sizeof() -> int
```

---

## ADT.Interval

Interval arithmetic with proper rounding.

```pike
ADT.Interval(int|float|ADT.Interval value)
ADT.Interval(int|float min, int|float max)
```

```pike
ADT.Interval()->`+(mixed other) -> ADT.Interval
ADT.Interval()->`-(mixed other) -> ADT.Interval
ADT.Interval()->`*(mixed other) -> ADT.Interval
ADT.Interval()->`/(mixed other) -> ADT.Interval
ADT.Interval()->contains(mixed value) -> int
ADT.Interval())->intersect(ADT.Interval other) -> ADT.Interval
ADT.Interval()->union(ADT.Interval other) -> ADT.Interval
ADT.Interval()->min() -> float
ADT.Interval()->max() -> float
```

---

## ADT.Sequence

Indexed sequence with efficient insert/delete.

```pike
ADT.Sequence(array|void values)
```

```pike
ADT.Sequence()->insert(int index, mixed value) -> void
ADT.Sequence()->remove(int index) -> mixed
ADT.Sequence()->get(int index) -> mixed
ADT.Sequence()->set(int index, mixed value) -> void
ADT.Sequence()->push(mixed value) -> void
ADT.Sequence()->pop() -> mixed
ADT.Sequence()->sizeof() -> int
ADT.Sequence()->cast(string type) -> mixed
```

---

## ADT.Struct

Packed binary structure parser/builder with named fields.

```pike
ADT.Struct(string format)
```
`format` is a struct-style layout string (e.g., "int32:x string:y:16").

```pike
ADT.Struct()->decode(string data) -> mapping
ADT.Struct()->encode(mapping fields) -> string
```

Also supports direct field access when created from a definition.

---

## ADT.BitBuffer

Bit-level read/write buffer for binary protocols.

```pike
ADT.BitBuffer(string|void initial_data)
```

```pike
ADT.BitBuffer()->read(int bits) -> int
ADT.BitBuffer()->write(int bits, int value) -> void
ADT.BitBuffer()->read_bits(int count) -> array(int)
ADT.BitBuffer()->write_bits(array(int) bits) -> void
ADT.BitBuffer()->drain() -> string
ADT.BitBuffer()->feed(string data) -> void
ADT.BitBuffer()->sizeof() -> int
```
Returns number of available bits.

---

## ADT.CircularList

Circular linked list with wrap-around traversal.

```pike
ADT.CircularList(array|void values)
```

```pike
ADT.CircularList()->push(mixed value) -> void
ADT.CircularList()->pop() -> mixed
ADT.CircularList()->first() -> mixed
ADT.CircularList()->next() -> mixed
ADT.CircularList()->prev() -> mixed
ADT.CircularList()->current() -> mixed
ADT.CircularList()->remove() -> mixed
ADT.CircularList()->sizeof() -> int
ADT.CircularList())->is_empty() -> int
ADT.CircularList()->cast(string type) -> mixed
```
