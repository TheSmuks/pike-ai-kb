# Concurrent API Reference (Pike 8.0.1116)

## Overview

The Concurrent module provides a Future/Promise framework for asynchronous programming. Futures represent values that will be available later; Promises are the write-handle that resolves them.

---

## Concurrent.Future

Represents a value that will become available in the future. Futures are immutable from the consumer side.

### Construction

Futures are typically obtained from `Concurrent.Promise()->future()` or returned by async APIs. You can also create resolved futures:

```pike
Concurrent.Future()                                  // Pending future (0-arg constructor)
Concurrent.resolve(mixed value)                      // Already-resolved future
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
Concurrent.Future()->wait() -> Concurrent.Promise
```
Block until resolved. Returns the underlying Promise (not the Future itself).

---

## Concurrent.Promise

The write-handle for a Future. Each Promise has exactly one associated Future.

```pike
Concurrent.Promise()
```

### Resolution

```pike
Concurrent.Promise()->success(mixed value) -> this_program
```
Resolve the promise with a value. Returns the Promise itself. Throws if already resolved.

```pike
Concurrent.Promise()->failure(mixed value) -> this_program
```
Reject the promise with a failure value. Returns the Promise itself. Throws if already resolved.

```pike
Concurrent.Promise()->try_success(mixed value) -> this_program
```
Attempt to resolve. Returns the Promise itself. Does not throw if already resolved.

```pike
Concurrent.Promise()->try_failure(mixed value) -> this_program
```
Attempt to reject. Returns the Promise itself. Does not throw if already resolved.

### Query

```pike
Concurrent.Promise()->state -> int
```
State of the promise: `-1` (no future yet), `0` (pending), `1` (fulfilled), `2` (rejected).

### Access

```pike
Concurrent.Promise()->future() -> Concurrent.Future
```
Return the associated Future.

---

## Concurrent.AggregateState

Internal class tracking the state of aggregated futures (e.g., from `Concurrent.results`).
Not intended for direct construction — use combinators like `Concurrent.results()`, `Concurrent.fold()` instead.

Key members: `results` (array), `accumulator`, `fold_fun`, `extra`, `max_failures`, `min_failures`, `materialise`.


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
Equivalent to `Concurrent.results` — resolves when all futures succeed. Separate function objects.


### Concurrent.race

```pike
Concurrent.race(array(Concurrent.Future) futures) -> Concurrent.Future
```
Resolves or rejects when the first Future settles (whichever comes first).

### Future()->zip

```pike
Concurrent.Future()->zip(Concurrent.Future ... futures) -> Concurrent.Future
```
Combine this future with others into a tuple. Resolves to an array of values.

### Concurrent.fold

```pike
Concurrent.fold(array(Concurrent.Future) futures, mixed initial, function(mixed, mixed:mixed) reducer) -> Concurrent.Future
```
Fold over resolved future values left-to-right.
