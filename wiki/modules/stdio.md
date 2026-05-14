# Stdio Module

File I/O, networking, and buffered streams. The most-used Pike module.

[Full Stdio API](../../skills/pike-stdlib-api/references/stdio-api.md) | [I/O Patterns](../../skills/pike-language-reference/references/stdlib-patterns.md)

## Key Classes

| Class | Purpose |
|-------|---------|
| `Stdio.File` | Primary file handle (inherits `Stdio.Fd`). Read, write, seek, TCP, callbacks. |
| `Stdio.FILE` | Line-buffered wrapper around `FILE*`. Inherits `Stdio.File`. |
| `Stdio.Port` | TCP server port listener. Accept connections via callback. |
| `Stdio.UDP` | UDP datagram socket. |
| `Stdio.Buffer` | Buffered binary I/O with int/string read/write helpers. |

## Top-Level Convenience Functions

```pike
string data = Stdio.read_file("file.txt");          // whole file to string
Stdio.write_file("out.txt", data);                   // overwrite file
Stdio.append_file("log.txt", entry + "\n");          // append
Stdio.cp("src.txt", "dst.txt");                      // copy
Stdio.mkdirhier("/a/b/c/");                          // mkdir -p
Stdio.recursive_rm("dir/");                          // rm -rf
```

## Stdio.File Quick Reference

```pike
Stdio.File f = Stdio.File("data.bin", "r");
string chunk = f->read(100);     // read up to 100 bytes
f->seek(0, Stdio.SEEK_SET);      // rewind
int pos = f->tell();
f->close();
```

- Open modes: `"r"`, `"w"`, `"wat"` (write+append+truncate), `"rct"` (read+create+truncate).
- `write()` supports sprintf-style formatting: `f->write("%d items\n", 42)`.
- `read()` returns `""` (empty string) at EOF, not `0`.
- Set nonblocking with `set_nonblocking(rcb, wcb, ccb)` for async I/O.

## Stdio.Port (TCP Server)

```pike
Stdio.Port port = Stdio.Port(8080, lambda(mixed id) {
    Stdio.File conn = id->accept();
    // handle connection...
});
```

## Stdio.Buffer

Binary protocol helper with integer and string operations:

```pike
Stdio.Buffer buf = Stdio.Buffer();
buf->add_int32(0xDEADBEEF);
buf->add("payload");
int magic = buf->read_int32();
string payload = buf->read(7);
```

## Gotchas

- `Stdio.read_file` line-based `start`/`len` params are 0-indexed line numbers, not byte offsets.
- `Stdio.File->open` mode `"a"` alone does not work as expected; use `"wat"`.
- `Stdio.File->read()` returns `""` at EOF. Check with `sizeof(data) == 0`, not `!data`.
- `Stdio.sendfile` performs zero-copy transfer — callback makes it non-blocking.
- `file_size()` returns `-2` for directories, `-1` for missing files.

## See Also

- [Stdio.File](./stdio.md) (this page)
- [String module](./string.md) for string utilities
- [Concurrent module](./concurrent.md) for async patterns with Futures
