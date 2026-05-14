# Concurrent Module

Future/Promise framework for asynchronous programming. Futures represent deferred values; Promises resolve them.

[Full Concurrent API](../../skills/pike-stdlib-api/references/concurrent-api.md)

## Core Concepts

| Class | Purpose |
|-------|---------|
| `Concurrent.Future` | Read-only handle for a value available later |
| `Concurrent.Promise` | Write-handle that resolves a Future |

## Creating Futures

```pike
// From a Promise
Concurrent.Promise p = Concurrent.Promise();
Concurrent.Future f = p->future();
// ... later, in another thread or callback:
p->success(42);

// Already resolved
Concurrent.Future done = Concurrent.resolve(42);
```

## Chaining

```pike
f->then(lambda(mixed val) { return val * 2; })
 ->then(lambda(mixed val) { write("Result: %O\n", val); });

// Error handling
f->then(success_cb, failure_cb);
f->on_success(lambda(mixed v) { ... });
f->on_failure(lambda(mixed e) { ... });
```

## Transformation & Recovery

```pike
future->map(lambda(mixed v) { return v + 1; })       // transform value
       ->flat_map(lambda(mixed v) {                  // chain async
           return async_operation(v);
       })
       ->recover(lambda(mixed err) {                 // recover from failure
           return default_value;
       });
```

## Blocking Retrieval

```pike
mixed result = future->get();   // block until resolved, throw on failure
```

## Combinators

```pike
// All must succeed
Concurrent.Future all = Concurrent.results(({f1, f2, f3}));

// First to complete wins
Concurrent.Future first = Concurrent.first_completed(({f1, f2}));

// Fold over results
Concurrent.Future sum = Concurrent.fold(
    ({f1, f2, f3}), 0, lambda(mixed acc, mixed v) { return acc + v; });

// Zip into tuple
Concurrent.Future tuple = f1->zip(f2, f3);  // resolves to ({v1, v2, v3})
```

## Gotchas

- `Future->wait()` returns the underlying Promise, not the Future itself.
- `Promise->success()` throws if already resolved. Use `try_success()` for safe resolution.
- `Concurrent.results` fails fast — rejects when any input Future fails.
- `Concurrent.first_completed` resolves on first settlement (success OR failure).
- `Concurrent.race` is similar to `first_completed` but explicitly named for "first wins" semantics.

## See Also

- [Stdio module](./stdio.md) — nonblocking file I/O with callbacks
- [Thread](../../skills/pike-stdlib-api/references/utilities-api.md) — `Thread.Thread`, `Thread.Mutex`, `Thread.Queue`
