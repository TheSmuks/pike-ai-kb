# Utilities API Reference (Pike 8.0.1116)

## String

```pike
String.trim_whites(string s) -> string
```
Remove leading and trailing whitespace.

```pike
lower_case(string s) -> string
upper_case(string s) -> string
```
Case conversion (locale-independent ASCII). These are global functions, not in the String module.

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
String.SplitIterator(string s, int|array(int)|multiset(int) separators)
```
Iterate over string split by separator characters. For simple splitting, use the `/` operator: `"a,b,c"/","` → `({"a","b","c"})`.

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
Array.diff(array a, array b) -> array(array(array))
```
Compute longest common subsequence diff. Returns `({a_segments, b_segments})` — two parallel arrays of array segments.


```pike
Array.permute(array a, int i) -> array
```
Return the i-th permutation of array.

```pike
Array.all(array a, function(mixed:int) test) -> int
```
True if test passes for all elements.

```pike
Array.any(array a, function(mixed:int) test) -> int
```
True if test passes for any element.

```pike
search(array a, mixed value) -> int
```
Find index of value in array, -1 if not found. Global function.

```pike
Array.sort(array a, array ... extra) -> array
```
Sort array in place and return it. For custom comparison, use `Array.sort_array(array, function)`.

```pike
Array.shuffle(array a) -> array
```
Randomly reorder array.

```pike
Array.sum(array(int|float) a) -> int|float
min(mixed ... args) -> mixed    // global function
max(mixed ... args) -> mixed    // global function
```

---

## Math

### Basic Functions

```pike
sqrt(float|int x) -> float
sin(float x) -> float
cos(float x) -> float
tan(float x) -> float
pow(float|int base, float|int exp) -> float
log(float x) -> float
exp(float x) -> float
floor(float x) -> float
ceil(float x) -> float
round(float x) -> float
```
These are all **global functions**, not members of the Math module.

### Constants

```pike
Math.inf  -> float   // Positive infinity
Math.nan  -> float   // Not a number
Math.pi   -> float   // pi
Math.e    -> float   // Euler's number
```

### Matrix

```pike
Math.Matrix(int rows, int cols, int|float|void fill)
Math.Matrix(array(array(int|float)) rows)
Math.Matrix(array(int|float)) column_vector
```

```pike
Math.Matrix()->`+(Math.Matrix other) -> Math.Matrix
Math.Matrix()->`-(Math.Matrix other) -> Math.Matrix
Math.Matrix()->`*(Math.Matrix|float other) -> Math.Matrix
Math.Matrix()->transpose() -> Math.Matrix
Math.Matrix()->norm() -> float              // vectors only
Math.Matrix()->norm2() -> float
Math.Matrix()->dot_product(Math.Matrix) -> float
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
Process.create_process()->status() -> int
Process.create_process()->last_signal -> int
```

```pike
Process.spawn(string command, void|Stream stdin, void|Stream stdout, void|Stream stderr) -> Process.Process
```
Spawn a command via shell.

```pike
Process.run(array(string)|string command, mapping|void options) -> mapping
```
Run command and wait for completion. Returns `(["stdout": string, "stderr": string, "exitcode": int])`.

```pike
Process.exec(string file, string ... args) -> int
```
Replace current process (does not return on success).

```pike
Process.system(string command) -> int
```
Execute shell command, return exit code.

```pike
Process.popen(string command) -> string
Process.popen(string command, string mode) -> Stdio.FILE
```
Without mode, executes command and returns output as string. With mode, returns a Stdio.FILE stream.

```pike
kill(int pid, int signal) -> int
```
Send signal to process. Global function.

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
Parse all options. `option_defs` is `({ ({name, type, aliases, argname, default}), ... })` where `aliases` is `string|array(string)` with `-`/`--` prefixes.
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
Thread.Thread()->status() -> int
```
Status returns an int: `Thread.THREAD_RUNNING` (0), `Thread.THREAD_EXITED` (1), `Thread.THREAD_ABORTED` (2).

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
Thread.Local()
```
Thread-local storage. Access via `obj->get()` and `obj->set(value)`.

### Thread.Queue

Thread-safe FIFO queue.

```pike
Thread.Queue()
```

```pike
Thread.Queue()->write(mixed value) -> void
Thread.Queue()->read() -> mixed
Thread.Queue()->read_array() -> array
Thread.Queue()->size() -> int
```

### Thread.Farm

Thread pool for parallel task execution.

```pike
Thread.Farm()
```

```pike
Thread.Farm()->run(function f, mixed ... args) -> Thread.Farm.Result
Thread.Farm()->run_multiple(array(function) funcs) -> array(Thread.Farm.Result)
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
getcwd() -> string                  // global
cd(string path) -> int              // global
time() -> int                        // global
gethrtime() -> int                   // global (nanoseconds)
gethrvtime() -> int                  // global (CPU nanoseconds)
sleep(int|float seconds) -> void     // global
getenv(string|void name) -> string|mapping  // global
System.gethostname() -> string
System.sleep(int seconds) -> int
System.usleep(int microseconds) -> void
System.uname() -> mapping
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
Regexp()->replace(string subject, string|function replacement) -> string
```

---

## MIME

```pike
MIME.Message(string|void data, mapping|void headers, mapping|void transfer_decode)
```
Parse or construct a MIME message.

```pike
MIME.Message()->getdata() -> string
MIME.Message()->headers -> mapping
MIME.Message()->get_filename() -> string|zero
MIME.Message()->boundary -> string|zero
MIME.Message()->body_parts -> array(MIME.Message)
MIME.Message()->setdata(string data) -> void
```

```pike
MIME.ext_to_media_type(string ext) -> string
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
Sql.NULL    // Val.null — singleton null marker for SQL NULL values
Sql.Null    // Class; Sql.Null() produces Val.null
Sql.null    // Class; Sql.null() produces a separate null object (distinct from Val.null)
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
Calendar.ISO.Day(int year, int month, int day)
// Hour/Minute/Second are not direct constructors.
// Access via parent: Calendar.ISO.Day(y,m,d)->hour(int), ->minute(int,int), ->second(int,int,int)
Calendar.ISO.now() -> Calendar.ISO.Second
Calendar.ISO.parse(string fmt) -> Calendar.TimeRange
```

### Calendar.YMD

Base for year/month/day calendars.

### Calendar.Time

Module object providing time-of-day utilities. **Not instantiable** — use `Calendar.ISO` or another calendar subsystem to create time objects.
### Calendar.TimeRange

Base class for anchored time ranges between two time points.

### Common TimeRange Methods

```pike
timerange->set_size(int n) -> Calendar.TimeRange
timerange->beginning() -> Calendar.TimeRange
timerange->end() -> Calendar.TimeRange
timerange->distance(Calendar.TimeRange other) -> Calendar.TimeRange
timerange->`+(int n) -> Calendar.TimeRange
timerange->`-(int|Calendar.TimeRange n) -> Calendar.TimeRange
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
Function.curry(function f) -> function
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
