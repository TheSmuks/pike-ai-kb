# string Type

Immutable sequence of bytes/characters. Value type — copied on assignment. All operations return new strings.

[Type Reference](../../skills/pike-language-reference/references/types.md) | [String Module](../modules/string.md)

## Literal Syntax

```pike
string s = "hello";
string empty = "";
string wide = "\x1234";          // wide character (16-bit)
string raw = #"raw\nstring";     // no escape processing
```

## Key Operations

| Operation | Example | Notes |
|-----------|---------|-------|
| Concatenate | `"a" + "b"` | Returns "ab" |
| Repeat | `"ab" * 3` | Returns "ababab" |
| Split | `"a,b,c" / ","` | Returns `({"a","b","c"})` |
| Index | `s[0]` | Returns int (character code) |
| Slice | `s[1..3]` | Returns "ell" for "hello" |
| Length | `sizeof(s)` | Character count (not bytes for wide) |
| Search | `search(s, "ll")` | Returns index or -1 |
| Replace | `replace(s, "x", "y")` | Returns new string |
| Case | `upper_case(s)`, `lower_case(s)` | Global functions |
| Trim | `String.trim_whites(s)` | Module function |
| Format | `sprintf("%d", 42)` | Returns "42" |

## Common Patterns

```pike
// Split and join
array(string) parts = "one,two,three" / ",";
string joined = parts * ",";

// Build strings efficiently with sprintf
string msg = sprintf("User %s has %d items", name, count);

// Character access
int code = s[0];           // first char as int
string ch = s[0..0];       // first char as string

// Type checking
stringp(x);                // returns 1 if x is a string
```

## Common Pitfalls

- Strings are immutable. `s[0] = 'H'` is not valid — construct a new string instead.
- `s[0]` returns an int (character code), not a single-character string. Use `s[0..0]` for that.
- `sizeof()` returns character count, which differs from byte count for wide strings.
- `(int)"0xFF"` returns 0 — use `sscanf` for hex parsing.
- `(int)"3.9"` returns 3 (truncation, not rounding). Use `(int)round(f)`.
- `(int)"hello"` returns 0 (no error thrown).
- `lower_case`/`upper_case` are global functions, not `String.*` methods.

## See Also

- [String module](../modules/string.md) — `String.trim_whites`, `String.SplitIterator`
- [array type](./array-type.md) — `(array)"hi"` converts to `({104, 105})`
- [Stdio module](../modules/stdio.md) — `Stdio.Buffer` for binary string I/O
