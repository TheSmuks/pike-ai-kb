# Concurrency

Pike provides preemptive threads with POSIX semantics, mutex/condition synchronization, thread-local storage, and a futures/promises API via the `Concurrent` module.

## Thread Creation

```pike
Thread.Thread t = Thread.Thread(function_name, @args);
Thread.Thread t = Thread.Thread(lambda() {
  return result;
});
mixed result = t->wait();
```

## Mutex — Mutual Exclusion

`Thread.Mutex` with `Thread.MutexKey`. Assign `0` to the key to unlock.

```pike
Thread.Mutex mtx = Thread.Mutex();
void safe_increment() {
  Thread.MutexKey key = mtx->lock();
  counter++;
  key = 0;
}
```

Locks are **not** reentrant — `lock()` twice from the same thread deadlocks. Use `trylock()` for non-blocking.

## Condition Variables

```pike
Thread.Mutex mtx = Thread.Mutex();
Thread.Condition cond = Thread.Condition();
int ready = 0;
void consumer() {
  Thread.MutexKey key = mtx->lock();
  while (!ready) cond->wait(key);
  key = 0;
}
void producer() {
  Thread.MutexKey key = mtx->lock();
  ready = 1; cond->broadcast(); key = 0;
}
```

Use `broadcast()` to wake all waiters; `signal()` wakes one.

## Thread-Local Storage

```pike
Thread.Local local_data = Thread.Local();
void worker() {
  local_data->set(getpid());
  int id = local_data->get();
}
```

## Futures and Promises (Concurrent)

```pike
Concurrent.Future f = Concurrent.resolve(computation());
Concurrent.Promise p = Concurrent.Promise();
// later: p->success(result);
f->then(lambda(mixed val) { return val * 2; });
Concurrent.Future all = Concurrent.results(({f1, f2, f3}));
array results = all->wait()->get();
Concurrent.Future winner = Concurrent.first_completed(({f1, f2}));
```

## Thread-Safe Queue Pattern

```pike
ADT.Queue q = ADT.Queue();
Thread.Mutex mtx = Thread.Mutex();
Thread.Condition cond = Thread.Condition();
void producer() {
  while (1) {
    Thread.MutexKey key = mtx->lock();
    q->put(produce()); cond->signal(); key = 0;
  }
}
void consumer() {
  while (1) {
    Thread.MutexKey key = mtx->lock();
    while (q->is_empty()) cond->wait(key);
    mixed item = q->get(); key = 0; process(item);
  }
}
```

## Gotchas

- Threads are preemptive (POSIX) — no yield needed.
- `ADT.Queue` is thread-safe but condition patterns need explicit mutex.
- Check availability: `master()->resolv("Thread")`.

## See Also

- [Type System](type-system.md)
- [Error Handling](error-handling.md)
- [Idiomatic Pike](../../skills/pike-language-reference/references/idiomatic-pike.md)
