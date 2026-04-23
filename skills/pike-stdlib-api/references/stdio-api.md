# Stdio API Reference (Pike 8.0.1116)

## Top-Level Functions

### File I/O

```pike
Stdio.read_file(string filename, int|void start, int|void len) -> string
```
Read a file into a string. `start` is 0-based line number to start from. `len` is number of lines (if start given) or bytes.

```pike
Stdio.read_bytes(string filename, int|void start, int|void len) -> string
```
Read raw bytes from file. `start` and `len` are byte offsets.

```pike
Stdio.write_file(string filename, string data, int|void mode) -> int
```
Write data to file, replacing existing content. Returns number of bytes written. `mode` defaults to 0666.

```pike
Stdio.append_file(string filename, string data) -> int
```
Append data to end of file. Returns number of bytes written.

```pike
Stdio.append_path(string base, string ... parts) -> string
```
Append path components to a base path, normalizing separators.

### File Operations

```pike
Stdio.cp(string from, string to) -> int
```
Copy file `from` to `to`. Returns 1 on success, 0 on failure.

```pike
Stdio.exist(string path) -> int
```
Check if path exists. Returns 0 if not, else truthy value.

```pike
Stdio.is_dir(string path) -> int
```
Returns non-zero if path is a directory.

```pike
Stdio.is_file(string path) -> int
```
Returns non-zero if path is a regular file.

```pike
Stdio.is_link(string path) -> int
```
Returns non-zero if path is a symbolic link.

```pike
Stdio.file_size(string path) -> int
```
Returns file size in bytes, -2 if directory, -1 if not found.

```pike
Stdio.mkdirhier(string path, int|void mode) -> int
```
Create directory and all parent directories. Returns 1 on success.

```pike
Stdio.recursive_rm(string path) -> void
```
Remove a file or directory tree recursively.

```pike
Stdio.recursive_mv(string from, string to) -> void
```
Move a file or directory tree recursively.

```pike
Stdio.simplify_path(string path) -> string
```
Simplify a file path by resolving `.` and `..` components.

### Networking

```pike
Stdio.sendfile(array(string) headers, Stdio.File from, int offset, int len, array(string) trailers, Stdio.File to, function|void callback, mixed ... args) -> object
```
Zero-copy file transfer. Sends headers, then `len` bytes from `from` at `offset`, then trailers, to `to`. If callback is provided, operation is non-blocking; callback receives `(mixed ... args)` on completion. Returns a call-out object for non-blocking mode.

### Directory

```pike
Stdio.get_all_active_fd() -> array(int)
```
Returns array of all active file descriptors.

### Other

```pike
Stdio.gethostip(string|void host) -> mapping
```
Get IP addresses for a host. Returns a mapping of network interface names to IP data.

```pike
Stdio.perror(string message) -> void
```
Print error message to stderr.

---

## Stdio.File

The primary file I/O class. Inherits `Stdio.Fd`.

### Opening / Closing

```pike
Stdio.File()->open(string filename, string mode, int|void permissions) -> int
```
Open file. `mode` is "r", "w", "wat", "rct" etc. Returns 1 on success. Append requires "wat" (write+append+truncate) not "a" alone.

```pike
Stdio.File()->close(string|void how) -> int
```
Close file. `how` can be "r", "w", or 0 for both.

```pike
Stdio.File()->connect(string host, int port) -> int
```
Open TCP connection.

```pike
Stdio.File()->connect_unix(string path) -> int
```
Open Unix domain socket connection.

```pike
Stdio.File()->open_socket(int|void port, string|void host, int|void family) -> int
```
Create a socket bound to optional port/host.

```pike
Stdio.File()->openat(Stdio.File dirfd, string path, string mode, int|void flags) -> Stdio.File
```
Open file relative to directory file descriptor (O_PATH).

```pike
Stdio.File()->openpt(string|void mode) -> string
```
Open a pseudo-terminal. Returns the slave device name.

```pike
Stdio.File()->pipe(void|int flags) -> Stdio.File
```
Create a pipe pair. `flags` can include PROP_IPC, PROP_NONBLOCK, etc.

```pike
Stdio.File()->assign(Stdio.File|zero o) -> Stdio.File
```
Assign another file object's fd to this one.

### Reading

```pike
Stdio.File()->read(int|void nbytes, bool|void now) -> string
```
Read up to `nbytes` from file. Returns data string; empty string `""` at EOF.

```pike
Stdio.File()->read_oob(int|void nbytes, bool|void now) -> string
```
Read out-of-band data.

```pike
Stdio.File()->read_function(int nbytes) -> function(:string)
```
Returns a function that reads `nbytes` each call.

```pike
Stdio.File()->line_iterator(int|void trim) -> Stdio.LineIterator
```
Returns a line iterator for this file.

```pike
Stdio.File()->peek(int|void timeout, int|void not_read_fd) -> int
```
Check if data is available. Returns 1 if readable, 0 if timeout, -1 on error.

### Writing

```pike
Stdio.File()->write(string data, mixed ... args) -> int
```
Write data (with optional sprintf-style format). Returns bytes written.

```pike
Stdio.File()->write_oob(string data, mixed ... args) -> int
```
Write out-of-band data.

```pike
Stdio.File()->send_fd(Stdio.File file) -> int
```
Send a file descriptor over a Unix domain socket (ancillary data).

### Positioning

```pike
Stdio.File()->seek(int pos, int|void how) -> int
```
Set file position. `how` is `Stdio.SEEK_SET`, `Stdio.SEEK_CUR`, or `Stdio.SEEK_END`. `seek(pos)` without `how` defaults to `Stdio.SEEK_SET`.

```pike
Stdio.File()->tell() -> int
```
Return current file position.

```pike
Stdio.File()->truncate(int length) -> int
```
Truncate file to given length.

```pike
Stdio.File()->stat() -> Stdio.Stat
```
Get file status as a Stat object.

```pike
Stdio.File()->statat(string path, bool|void symlink) -> Stdio.Stat
```
Stat a file relative to this directory fd.

```pike
Stdio.File()->sync() -> int
```
Sync file to disk.

### Status

```pike
Stdio.File()->is_open() -> int
```
Returns non-zero if file is open.

```pike
Stdio.is_file(string path) -> int
```
Returns non-zero if path is a regular file. Standalone function, not a method on Stdio.File.

```pike
Stdio.File()->errno() -> int
```
Return errno for last operation.

```pike
Stdio.File()->mode() -> int
```
Return file open mode.

```pike
Stdio.File()->query_fd() -> int
```
Return the file descriptor number.

```pike
Stdio.File()->query_address(string|void arg) -> string
```
Return local or remote address.

### Blocking Mode

```pike
Stdio.File()->set_blocking() -> void
```
Set file to blocking mode, clearing all callbacks.

```pike
Stdio.File()->set_nonblocking(function|void rcb, function|void wcb, function|void ccb) -> void
```
Set nonblocking mode with read/write/close callbacks.

```pike
Stdio.File()->set_blocking_keep_callbacks() -> void
```
Set blocking mode without clearing callbacks.

```pike
Stdio.File()->set_nonblocking_keep_callbacks() -> void
```
Set nonblocking mode without changing callbacks.

### Callbacks

```pike
Stdio.File()->set_read_callback(function(mixed, string:void)|zero cb) -> void
Stdio.File()->set_write_callback(function(mixed:void)|zero cb) -> void
Stdio.File()->set_close_callback(function(mixed:void)|zero cb) -> void
Stdio.File()->set_read_oob_callback(function(mixed, string:void)|zero cb) -> void
Stdio.File()->set_write_oob_callback(function(mixed:void)|zero cb) -> void
Stdio.File()->query_read_callback() -> function|zero
Stdio.File()->query_write_callback() -> function|zero
Stdio.File()->query_close_callback() -> function|zero
Stdio.File()->set_callbacks(function|void rcb, function|void wcb, function|void ccb) -> void
Stdio.File()->query_callbacks() -> array(function|zero)
Stdio.File()->set_id(mixed id) -> void
Stdio.File()->query_id() -> mixed
```

### Buffering

```pike
Stdio.File()->set_buffer(int buf_size, string|void mode) -> void
Stdio.File()->query_buffer_mode() -> array(int)
Stdio.File()->set_buffer_mode(int|void read_buf_size, int|void write_buf_size) -> void
```

### Locking

```pike
Stdio.File()->lock(Stdio.File|void other, int|void operation, int|void start, int|void size) -> mapping
```
Apply advisory lock. Returns mapping with lock details.

```pike
Stdio.File()->trylock(Stdio.File|void other, int|void operation, int|void start, int|void size) -> mapping|zero
```
Non-blocking lock attempt. Returns 0 if lock unavailable.

### Duplication

```pike
Stdio.File()->dup() -> Stdio.File
Stdio.File()->dup2(Stdio.File|int to) -> Stdio.File
Stdio.File()->take_fd(int new_fd) -> int
Stdio.File()->release_fd() -> int
```

### Backend

```pike
Stdio.File()->set_backend(Pike.Backend b) -> void
Stdio.File()->query_backend() -> Pike.Backend
```

### Terminal (TTY)

```pike
Stdio.File()->tcgetattr() -> mapping
Stdio.File()->tcsetattr(string when, mapping attr) -> int
```
`when` is "TCSANOW", "TCSADRAIN", or "TCSAFLUSH".

```pike
Stdio.File()->tcdrain() -> void
Stdio.File()->tcflush(string direction) -> void
Stdio.File()->tcsendbreak(int|void duration) -> void
Stdio.File()->tcsetsize(int rows, int cols) -> void
```

### Extended Attributes

```pike
Stdio.File()->getxattr(string attr) -> string
Stdio.File()->setxattr(string attr, string value, int flags) -> int
Stdio.File()->listxattr() -> array(string)
Stdio.File()->removexattr(string attr) -> int
```

### Other

```pike
Stdio.File()->async_connect(string host, int port, function|void cb) -> int
Stdio.File()->grantpt() -> string
Stdio.File()->proxy(Stdio.File from) -> void
Stdio.File()->linger(int|void on_off, int|void seconds) -> int
Stdio.File()->set_close_on_exec(bool yes) -> void
Stdio.File()->set_keepalive(int|void time) -> void
Stdio.File()->set_peek_file_before_read_callback(int|void val) -> void
Stdio.File()->_disable_callbacks() -> void
Stdio.File()->_enable_callbacks() -> void
```

---

## Stdio.Port

TCP/IP server port listener.

```pike
Stdio.Port()
Stdio.Port(int port, function(mixed, mixed:void)|void accept_callback, string|void ip)
```

```pike
Stdio.Port()->bind(int port, function|void accept_callback, string|void ip) -> int
Stdio.Port()->bind_unix(string path, function|void accept_callback) -> int
Stdio.Port()->accept() -> Stdio.File
Stdio.Port()->close() -> void
Stdio.Port()->query_address() -> string
Stdio.Port()->set_id(mixed id) -> void
Stdio.Port()->query_id() -> mixed
Stdio.Port()->set_backend(Pike.Backend b) -> void
```

---

## Stdio.UDP

UDP datagram socket.

```pike
Stdio.UDP()
```

```pike
Stdio.UDP()->bind(int port, string|void ip) -> Stdio.UDP
Stdio.UDP()->send(string host, int port, string data) -> int
Stdio.UDP()->read(mapping|void args) -> mapping
```
Returns `(["data": string, "ip": string, "port": int])`.

```pike
Stdio.UDP()->set_nonblocking(function(mapping:void)|void read_callback) -> Stdio.UDP
Stdio.UDP()->set_blocking() -> Stdio.UDP
Stdio.UDP()->enable_broadcast() -> Stdio.UDP
Stdio.UDP()->set_multicast_ttl(int ttl) -> Stdio.UDP
Stdio.UDP()->add_membership(string group, string|void iface) -> Stdio.UDP
Stdio.UDP()->drop_membership(string group, string|void iface) -> Stdio.UDP
Stdio.UDP()->close() -> void
Stdio.UDP()->query_fd() -> int
```

---

## Stdio.Buffer

Buffered I/O with read/write semantics, supporting both streaming and packet modes.

```pike
Stdio.Buffer(string|void contents)
Stdio.Buffer(int size)
```

```pike
Stdio.Buffer()->add(string data) -> Stdio.Buffer
Stdio.Buffer()->read(int bytes) -> string
Stdio.Buffer()->read_hbuffer(int len) -> Stdio.Buffer
Stdio.Buffer()->output_to(Stdio.File f, int|void nbytes) -> int
Stdio.Buffer()->input_from(Stdio.File f, int|void nbytes) -> int
Stdio.Buffer()->read_buffer(int len) -> Stdio.Buffer
Stdio.Buffer()->unread(int nbytes) -> void
Stdio.Buffer()->consume(int nbytes) -> void
Stdio.Buffer()->trim() -> void
```

Integer read/write (big-endian):

```pike
Stdio.Buffer()->read_int(int size) -> int
Stdio.Buffer()->read_int8() -> int
Stdio.Buffer()->read_int16() -> int
Stdio.Buffer()->read_int32() -> int
Stdio.Buffer()->add_int(int value, int size) -> Stdio.Buffer
Stdio.Buffer()->add_int8(int v) -> Stdio.Buffer
Stdio.Buffer()->add_int16(int v) -> Stdio.Buffer
Stdio.Buffer()->add_int32(int v) -> Stdio.Buffer
```

String operations:

```pike
Stdio.Buffer()->read_cstring() -> string
Stdio.Buffer()->read_hstring(int width) -> string
Stdio.Buffer()->add_hstring(string s, int width) -> Stdio.Buffer
```

Configuration:

```pike
Stdio.Buffer()->set_error_mode(int|function mode) -> Stdio.Buffer
sizeof(Stdio.Buffer) -> int
```

---

## Stdio.FILE

Stdio wrapper around FILE* with line buffering. Inherits Stdio.File.

```pike
Stdio.FILE(string|void filename, string|void mode)
```

```pike
Stdio.FILE()->gets() -> string
Stdio.FILE()->ungets(string s) -> void
Stdio.FILE()->getchar() -> int
Stdio.FILE()->printf(string format, mixed ... args) -> int
```

---

## Stdio.FakeFile

In-memory file backed by a String.Buffer. Implements the Stdio.File interface for testing and string-based I/O.

```pike
Stdio.FakeFile(string|void data, string|void mode)
```

Supports the same read/write/seek/tell interface as Stdio.File.

---

## Stdio.LineIterator

Iterator over lines of a Stdio.File.

```pike
Stdio.File()->line_iterator(int|void trim) -> Stdio.LineIterator
```

Implements the Iterator interface. `trim` parameter has no observable effect on output.

---

## Stdio.Stat

Object returned by `Stdio.File()->stat()`. Provides named field access to stat results.

Key fields: `mode`, `size`, `atime`, `mtime`, `ctime`, `uid`, `gid`, `dev`, `ino`, `nlink`, `rdev`.
