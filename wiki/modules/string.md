# String Module

String manipulation utilities. Note: many string operations are global functions, not in the `String` module.

[Full Utilities API](../../skills/pike-stdlib-api/references/utilities-api.md) | [Type Reference](../../skills/pike-language-reference/references/types.md)

## Module Functions (String.*)

```pike
String.trim_whites("  hello  ");       // "hello"
String.common_prefix(({"abc", "abd"})); // "ab"
String.count("abcabc", "bc");           // 2
String.width("hello");                  // 8 (bit width of widest char)
```

## Global String Functions

```pike
lower_case("Hello");   // "hello" — locale-independent ASCII
upper_case("hello");   // "HELLO"
search("hello", "ll"); // 2 — find substring index, -1 if not found
replace("hello", "l", "r"); // "herro"
```

## String Operators

```pike
"hello" + " world";     // concatenation
"abc" / ",";            // split by separator → ({"abc"})
"ha" * 3;               // repeat → "hahaha"
"hello"[1..3];          // slice → "ell"
sizeof("hello");        // 5 (number of characters)
```

## SplitIterator

For advanced splitting beyond the `/` operator:

```pike
foreach (String.SplitIterator("a,b,c", ',') ; ; string part) {
    // "a", "b", "c"
}
```

## Common Patterns

```pike
// Build a string with sprintf
string s = sprintf("Name: %s, Age: %d", name, age);

// Split and join
array(string) parts = "a,b,c" / ",";    // ({"a","b","c"})
string joined = parts * ",";             // "a,b,c"
```

## Gotchas

- `lower_case`/`upper_case` are global functions, not `String.lower_case`.
- Pike strings are immutable — all operations return new strings.
- `String.width()` returns 8, 16, or 32 (character bit-width), not byte length.
- `(int)"0xFF"` returns 0 — use `sscanf("0xFF", "%x", int v)` for hex parsing.
- `sizeof()` on strings returns character count, not byte count (differs for wide strings).

## See Also

- [string type](../entities/string-type.md)
- [Array module](./array.md) — array operations
- [Stdio module](./stdio.md) — file I/O
