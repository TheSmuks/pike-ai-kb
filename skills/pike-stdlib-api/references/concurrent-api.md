# Concurrent API Reference (Pike 8.0.1116)

## Overview

The Concurrent module provides a Future/Promise framework for asynchronous programming. Futures represent values that will be available later; Promises are the write-handle that resolves them.

---

## Concurrent.Future

Represents a value that will become available in the future. Futures are immutable from the consumer side.

### Construction

Futures are typically obtained from `Concurrent.Promise()->future()` or returned by async APIs. You can also create resolved futures:

```pike
Concurrent.Future(mixed value)          // Already-resolved future
Concurrent.Future(function(mixed:function) eval)  // From evaluation function
```

### Chaining

```pike
Concurrent.Future()->then(function(mixed:mixed) on_success, function(mixed:mixed)|void on_failure) -> Concurrent.Future
```
Chain callbacks. `on_success` receives the resolved value. `on_failure` receives the failure value. Returns a new Future for the callback's return value.

```pike
Concurrent.Future()->on_success(function(mixed:void) cb) -> Concurrent.Future
```
Register success callback. Returns the same future for chaining.

```pike
Concurrent.Future()->on_failure(function(mixed:void) cb) -> Concurrent.Future
```
Register failure callback. Returns the same future for chaining.

### Transformation

```pike
Concurrent.Future()->map(function(mixed:mixed) f) -> Concurrent.Future
```
Apply function to the resolved value. Equivalent to `then(f)`.

```pike
Concurrent.Future()->flat_map(function(mixed:Concurrent.Future) f) -> Concurrent.Future
```
Apply function that returns a Future, flattening the nesting.

```pike
Concurrent.Future()->transform(function(mixed:mixed) success_fn, function(mixed:mixed)|void failure_fn) -> Concurrent.Future
```
Transform both success and failure paths.

### Recovery

```pike
Concurrent.Future()->recover(function(mixed:mixed) f) -> Concurrent.Future
```
Recover from failure. `f` receives the failure value and returns a plain value.

```pike
Concurrent.Future()->recover_with(function(mixed:Concurrent.Future) f) -> Concurrent.Future
```
Recover from failure with an async recovery. `f` returns a Future.

### Blocking Retrieval

```pike
Concurrent.Future()->get() -> mixed
```
Block until resolved, then return the value (or throw on failure).

```pike
Concurrent.Future()->wait() -> Concurrent.Future
```
Block until resolved. Returns self for chaining.

---

## Concurrent.Promise

The write-handle for a Future. Each Promise has exactly one associated Future.

```pike
Concurrent.Promise()
```

### Resolution

```pike
Concurrent.Promise()->success(mixed value) -> void
```
Resolve the promise with a value. Throws if already resolved.

```pike
Concurrent.Promise()->failure(mixed value) -> void
```
Reject the promise with a failure value. Throws if already resolved.

```pike
Concurrent.Promise()->try_success(mixed value) -> int
```
Attempt to resolve. Returns 1 on success, 0 if already resolved.

```pike
Concurrent.Promise()->try_failure(mixed value) -> int
```
Attempt to reject. Returns 1 on success, 0 if already resolved.

### Query

```pike
Concurrent.Promise()->is_done() -> int
```
Returns non-zero if the promise has been resolved or rejected.

### Access

```pike
Concurrent.Promise()->future() -> Concurrent.Future
Concurrent.Promise()->get_future() -> Concurrent.Future
```
Return the associated Future. Both methods are equivalent.

---

## Concurrent.AggregateState

Tracks the state of aggregated futures (e.g., from `Concurrent.results`).

```pike
Concurrent.AggregateState(array(Concurrent.Future) futures)
```

```pike
Concurrent.AggregateState()->get_results() -> array
Concurrent.AggregateState()->get_failures() -> array
Concurrent.AggregateState()->is_done() -> int
```

---

## Top-Level Combinators

### Concurrent.results

```pike
Concurrent.results(array(Concurrent.Future) futures) -> Concurrent.Future
```
Returns a Future that resolves to an array of all results when all futures succeed, or fails when any fails.

### Concurrent.first_completed

```pike
Concurrent.first_completed(array(Concurrent.Future) futures) -> Concurrent.Future
```
Returns a Future that resolves when the first input Future resolves (success or failure).

### Concurrent.all

```pike
Concurrent.all(array(Concurrent.Future) futures) -> Concurrent.Future
```
Alias for `Concurrent.results`. Resolves when all succeed.

### Concurrent.any

```pike
Concurrent.any(array(Concurrent.Future) futures) -> Concurrent.Future
```
Resolves when the first Future succeeds. Fails only if all Futures fail.

### Concurrent.race

```pike
Concurrent.race(array(Concurrent.Future) futures) -> Concurrent.Future
```
Resolves or rejects when the first Future settles (whichever comes first).

### Concurrent.zip

```pike
Concurrent.zip(Concurrent.Future ... futures) -> Concurrent.Future
```
Combine futures into a tuple. Resolves to an array of values.

### Concurrent.fold

```pike
Concurrent.fold(array(Concurrent.Future) futures, mixed initial, function(mixed, mixed:mixed) reducer) -> Concurrent.Future
```
Fold over resolved future values left-to-right.
