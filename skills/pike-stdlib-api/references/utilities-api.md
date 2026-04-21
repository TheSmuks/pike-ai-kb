# Utilities API Reference (Pike 8.0.1116)

## String

```pike
String.trim_whites(string s) -> string
String.trim(string s) -> string
```
Remove leading and trailing whitespace.

```pike
String.lower_case(string s) -> string
String.upper_case(string s) -> string
```
Case conversion (locale-independent ASCII).

```pike
String.common_prefix(array(string) strs) -> string
```
Longest common prefix of all strings.

```pike
String.count(string haystack, string needle) -> int
```
Count non-overlapping occurrences of needle.

```pike
String.width(string s) -> int
```
Maximum character width (8, 16, or 32 bits).

```pike
String.split(string s, string|void sep) -> array(string)
```
Split string by separator. Default splits on whitespace.

---

## Array

```pike
Array.reduce(function(mixed, mixed:mixed) f, array arr, mixed|void initial) -> mixed
```
Left fold over array.

```pike
Array.flatten(array arr) -> array
```
Recursively flatten nested arrays.

```pike
Array.uniq(array a) -> array
```
Remove duplicates, preserving order.

```pike
Array.diff(array a, array b) -> array(array)
```
Compute longest common subsequence diff. Returns `(["data": array, "offset": int])`.

```pike
Array.intersect(array a, array b) -> array
```
Elements common to both arrays.

```pike
Array.permute(array a) -> array(array)
```
All permutations.

```pike
Array.every(array a, function(mixed:int) test) -> int
```
True if test passes for all elements.

```pike
Array.any(array a, function(mixed:int) test) -> int
```
True if test passes for any element.

```pike
Array.search(array a, mixed value) -> int
```
Find index of value, -1 if not found.

```pike
Array.sort(array a, function|void cmp) -> array
```
Sort (returns new array).

```pike
Array.shuffle(array a) -> array
```
Randomly reorder array.

```pike
Array.sum(array(int|float) a) -> int|float
Array.min(array a) -> mixed
Array.max(array a) -> mixed
```

---

## Math

### Basic Functions

```pike
Math.sqrt(float|int x) -> float
Math.sin(float x) -> float
Math.cos(float x) -> float
Math.tan(float x) -> float
Math.pow(float|int base, float|int exp) -> float
Math.log(float x) -> float
Math.exp(float x) -> float
Math.floor(float x) -> float
Math.ceil(float x) -> float
Math.round(float x) -> float
```

### Constants

```pike
Math.inf  -> float   // Positive infinity
Math.nan  -> float   // Not a number
Math.pi   -> float   // pi
Math.e    -> float   // Euler's number
```

### Matrix

```pike
Math.Matrix(int rows, int cols, array|void values)
```

```pike
Math.Matrix()->`+(Math.Matrix other) -> Math.Matrix
Math.Matrix()->`-(Math.Matrix other) -> Math.Matrix
Math.Matrix()->`*(Math.Matrix|float other) -> Math.Matrix
Math.Matrix()->det() -> float
Math.Matrix()->invert() -> Math.Matrix
Math.Matrix()->transpose() -> Math.Matrix
Math.Matrix()->norm() -> float
Math.Matrix()->cast(string type) -> array(array)
```

### Transforms

```pike
Math.Transforms
```
Coordinate transformation utilities.

### Angle

```pike
Math.Angle
```
Angle representation and conversion.

---

## Process

```pike
Process.create_process(array(string) args, mapping|void options) -> Process.create_process
```
Create a new process. `options` can include: `"cwd"`, `"stdin"`, `"stdout"`, `"stderr"`, `"env"`, `"uid"`, `"gid"`.

```pike
Process.create_process()->wait() -> int
Process.create_process()->kill(int|void signal) -> void
Process.create_process()->pid() -> int
Process.create_process()->signaled() -> int
Process.create_process()->exit_status() -> int
```

```pike
Process.spawn(string command, mapping|void options) -> Process.spawn
```
Spawn a command via shell.

```pike
Process.run(array(string)|string command, mapping|void options) -> mapping
```
Run command and wait for completion. Returns `(["stdout": string, "stderr": string, "exitcode": int])`.

```pike
Process.exec(string file, string ... args) -> void
```
Replace current process (does not return).

```pike
Process.system(string command) -> int
```
Execute shell command, return exit code.

```pike
Process.popen(string command, string|void mode) -> Stdio.FILE|Stdio.File
```
Open a pipe to/from a command.

```pike
Process.kill(int pid, int|void signal) -> void
```
Send signal to process.

---

## Getopt

Command-line option parsing.

```pike
Getopt.find_option(array(string) argv, string short, string|void long, string|void env_var, mixed|void default_val) -> mixed
```
Find a single option. Returns the option value or `default_val`.

```pike
Getopt.find_all_options(array(string) argv, array(array) option_defs) -> array(array)
```
Parse all options. `option_defs` is `({ ({short, long, type, argname}), ... })`.
Returns `({ ({name, value}), ... })`.

```pike
Getopt.get_args(array(string) argv, int|void posix, int|void quiet) -> array(string)
```
Return remaining non-option arguments.

Option types: `Getopt.HAS_ARG`, `Getopt.NO_ARG`, `Getopt.MAY_HAVE_ARG`.

---

## Thread

### Thread.Thread

```pike
Thread.Thread(function(mixed ...:mixed) f, mixed ... args) -> Thread.Thread
```

```pike
Thread.Thread()->wait() -> mixed
Thread.Thread()->status() -> string
```
Returns "running", "done", or "failed".

### Thread.Mutex

```pike
Thread.Mutex()
```

```pike
Thread.Mutex()->lock(int|void disable_threads) -> Thread.MutexKey
Thread.Mutex()->trylock(int|void disable_threads) -> Thread.MutexKey|zero
```
Returns a key object; releasing the key (letting it go out of scope) unlocks.

### Thread.Condition

```pike
Thread.Condition()
```

```pike
Thread.Condition()->wait(Thread.MutexKey key, int|void seconds) -> Thread.MutexKey|zero
Thread.Condition()->signal() -> void
Thread.Condition()->broadcast() -> void
```

### Thread.Local

```pike
Thread.Local(mixed|void initial_value)
```

Thread-local storage. Assign/read via `obj->value` or `obj->set(value)`.

### Thread.Queue

Thread-safe FIFO queue.

```pike
Thread.Queue()
```

```pike
Thread.Queue()->write(mixed value) -> void
Thread.Queue()->read() -> mixed
Thread.Queue()->read_array() -> array
Thread.Queue()->sizeof() -> int
```

### Thread.Farm

Thread pool for parallel task execution.

```pike
Thread.Farm(int|void num_threads)
```

```pike
Thread.Farm()->run(function f, mixed ... args) -> Thread.Farm.Result
Thread.Farm()->run_multiple(array(function) funcs) -> array(Thread.Farm.Result)
Thread.Farm())->stop() -> void
```

---

## Error

Error classes for structured exception handling.

```pike
Error.Generic(string message, array|void backtrace)
Error.BadArgument(string|void message)
Error.Index(string|void message)
Error.Permission(string|void message)
Error.Resource(string|void message)
Error.Math(string|void message)
Error.Decode(string|void message)
Error.Compilation(string|void message)
Error.ModuleLoad(string|void message)
Error.MasterLoad(string|void message)
```

All inherit `Error.Generic`. Fields:
```pike
Error.Generic->message -> string
Error.Generic->backtrace -> array
Error.Generic->describe() -> string
```

---

## Val

Singleton value objects.

```pike
Val.true  -> Val.True
Val.false -> Val.False
Val.null  -> Val.Null
```

These are objects, not plain integers. Use for typed comparisons or JSON interop.

---

## System

```pike
System.getcwd() -> string
System.chdir(string path) -> int
System.hostname() -> string
System.time() -> int
System.gethrtime() -> int       // High-resolution time in nanoseconds
System.gethrvtime() -> int      // Virtual (CPU) time in nanoseconds
System.sleep(int|float seconds) -> void
System.usleep(int microseconds) -> void
System.uname() -> mapping
System.getenv(string|void name) -> string|mapping
System.setenv(string name, string value) -> void
System.stat(string path) -> Stdio.Stat
System.ls(string|void path) -> array(string)
System.rm(string path) -> int
System.mkdir(string path, int|void mode) -> int
```

---

## Regexp

```pike
Regexp(string pattern)
```
Compile a regular expression.

```pike
Regexp()->match(string subject) -> int
Regexp()->split(string subject) -> array(string)|zero
Regexp())->replace(string subject, string|function replacement) -> string
Regexp())->match_multiple(string subject) -> array(array(string))
```

---

## MIME

```pike
MIME.Message(string|void data, mapping|void headers, mapping|void transfer_decode)
```
Parse or construct a MIME message.

```pike
MIME.Message()->body() -> string
MIME.Message()->headers() -> mapping
MIME.Message()->get_filename() -> string|zero
MIME.Message()->boundary() -> string|zero
MIME.Message()->parts() -> array(MIME.Message)
MIME.Message())->setdata(string data) -> void
MIME.Message())->addpart(MIME.Message part) -> void
```

```pike
MIME.ext_to_media_type(string ext) -> string
MIME.guess_content_type(string filename) -> string
```

---

## Sql.Sql

Generic SQL database interface.

```pike
Sql.Sql(string connection_url)
```
Connect to database. URL format: `"driver://user:pass@host/db"` (e.g., `"mysql://..."`, `"postgres://..."`).

```pike
Sql.Sql()->query(string sql_query, mixed ... bindings) -> array(mapping)
```
Execute query, return array of row mappings. Each row is `(["col": value, ...])`.

```pike
Sql.Sql()->big_query(string sql_query, mixed ... bindings) -> Sql.sql_result
```
Execute query with streaming result support.

```pike
Sql.Sql()->list_dbs(string|void wild) -> array(string)
Sql.Sql()->list_tables(string|void wild) -> array(string)
Sql.Sql())->create_db(string dbname) -> void
Sql.Sql())->drop_db(string dbname) -> void
```

### Sql.Sql Result Object

```pike
Sql.sql_result()->fetch_row() -> array|zero
Sql.sql_result()->num_rows() -> int
Sql.sql_result()->num_fields() -> int
Sql.sql_result())->fetch_fields() -> array(mapping)
Sql.sql_result())->seek(int row) -> void
```

### Other SQL Classes

```pike
Sql.NULL    // Singleton null marker
Sql.Null    // Same as Sql.NULL
Sql.null    // Same as Sql.NULL
Sql.pgsql   // PostgreSQL driver
Sql.pgsqls  // PostgreSQL over SSL
Sql.rsql    // Remote SQL proxy
```

---

## Calendar

Date/time library with multiple calendar systems.

### Calendar.ISO

```pike
Calendar.ISO.Year(int year)
Calendar.ISO.Month(int year, int month)
Calendar.ISO.Week(int year, int week)
Calendar.ISO.Day(int year, int month, int day)
Calendar.ISO.Hour(int year, int month, int day, int hour)
Calendar.ISO.Minute(...)
Calendar.ISO.Second(...)
Calendar.ISO.now() -> Calendar.ISO.Second
Calendar.ISO.parse(string fmt) -> Calendar.TimeRange
```

### Calendar.YMD

Base for year/month/day calendars.

### Calendar.Time

Time-of-day utilities.

### Calendar.Duration

Time span (not anchored to a point).

```pike
Calendar.Duration(int|void years, int|void months, int|void weeks, int|void days, int|void hours, int|void minutes, int|void seconds)
```

### Calendar.Range

Anchored time range between two time points.

### Common TimeRange Methods

```pike
timerange->set_size(int n) -> Calendar.TimeRange
timerange->beginning() -> Calendar.TimeRange
timerange->end() -> Calendar.TimeRange
timerange->distance(Calendar.TimeRange other) -> Calendar.Duration
timerange->`+(Calendar.Duration d) -> Calendar.TimeRange
timerange->`-(Calendar.Duration|Calendar.TimeRange d) -> Calendar.TimeRange
timerange->format_iso_ymd() -> string
timerange->format_iso_time() -> string
timerange->unix_time() -> int
timerange->julian_day() -> float
timerange->year() -> Calendar.YMD.Year
timerange->month() -> Calendar.YMD.Month
timerange->week() -> Calendar.YMD.Week
timerange->day() -> Calendar.YMD.Day
timerange->hour() -> Calendar.Time.Hour
timerange->minute() -> Calendar.Time.Minute
timerange->second() -> Calendar.Time.Second
timerange->number_of_years() -> int
timerange->number_of_months() -> int
timerange->number_of_weeks() -> int
timerange->number_of_days() -> int
```

---

## Function

```pike
Function.splice(function f, mixed ... args) -> function
```
Return a new function with pre-applied arguments (partial application).

```pike
Function.defined(function f) -> string
```
Return the file:line where the function was defined.

---

## Program

```pike
Program.defined(program p) -> string
```
Return the file:line where the program was defined.
