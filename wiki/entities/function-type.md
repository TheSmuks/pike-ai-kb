# function Type

First-class callable. References methods, lambdas, and builtins. Can be stored, passed, and called dynamically.

[Type Reference](../../skills/pike-language-reference/references/types.md)

## Literal Syntax

```pike
// Lambda (anonymous function)
function(int:int) double = lambda(int x) { return x * 2; };

// Method reference
function(:void) cb = my_object->my_method;

// Builtin reference
function(string:int) len = sizeof;
```

## Type Annotations

```pike
function(int:string) f;              // one int arg, returns string
function(int, int:int) g;            // two int args, returns int
function(:void) cb;                   // no args, no return
function(mixed...:mixed) varfn;       // variadic
```

## Key Operations

| Operation | Example | Notes |
|-----------|---------|-------|
| Call | `fn(42)` | Direct invocation |
| Type check | `functionp(x)` | Returns 1 if x is callable |
| Method ref | `obj->method` | Reference to bound method |
| Lambda | `lambda(args) { body }` | Anonymous function |
| Spawn thread | `Thread.Thread(fn)` | Run function in new thread |

## Common Patterns

```pike
// Callback pattern
void do_work(function(:void) on_complete) {
    // ... work ...
    on_complete();
}

// Array operations with functions
array(int) doubled = map(({1,2,3}), lambda(int x) { return x * 2; });
array(int) evens = filter(({1,2,3,4}), lambda(int x) { return !(x & 1); });

// Sorting with comparator
Array.sort_array(arr, lambda(mixed a, mixed b) { return a > b; });

// Stored callbacks
mapping(string:function) handlers = ([
    "click": lambda() { write("clicked\n"); }
]);
```

## Common Pitfalls

- `functionp()` returns 0 for objects with ``()` operator. Check `callablep()` for broader test.
- Lambda captures variables by reference, not by value. Use a wrapper if you need value capture:
  ```pike
  // Bug: all lambdas see the same i
  for (int i = 0; i < 3; i++) callbacks += ({ lambda() { return i; } });
  // Fix: capture via argument
  for (int i = 0; i < 3; i++) callbacks += ({ lambda(int j) { return lambda() { return j; }; }(i) });
  ```
- `obj->method` creates a bound reference — `this` is fixed to `obj`.
- Function type annotations are optional but improve type safety.

## See Also

- [program type](./program-type.md) — class/blueprint values
- [Concurrent module](../modules/concurrent.md) — `Future->then()` takes function callbacks
- [Array module](../modules/array.md) — `map()`, `filter()`, `Array.sort_array()`
