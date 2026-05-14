# Object-Oriented Programming

Pike's OOP centers on classes (programs), single/multiple inheritance via `inherit`, and operator overloading through lfuns.

## Classes and Constructors

Every class is a `program` value. Calling it clones an `object`. `create()` is the constructor.

```pike
class Vec {
  float x, y;
  void create(float x, float y) { this->x = x; this->y = y; }
  float magnitude() { return sqrt(x*x + y*y); }
}
Vec v = Vec(3.0, 4.0);
v->magnitude();  // 5.0
```

- `this` — typed current instance
- `this_program` — current class (for self-cloning)
- `this_object()` — untyped object reference

## Access Modifiers

```pike
public int a;        // anywhere (default)
protected int b;     // class + subclasses
private int c;       // this class only
local int d;         // this class only, not inherited
final void safe() {} // cannot be overridden
```

## Inheritance

```pike
class Child {
  inherit Parent;
  void create(mixed ... args) { ::create(@args); }
}
class Combo { inherit A; inherit B : MyB; }
```

`::` variants: `::method()` (parent), `local::method()` (current only), `Renamed::method()` (specific).

## import vs inherit

`import` adds symbols without parent relationship. `inherit` creates IS-A with storage and `::` access.

```pike
import Stdio;                         // symbols directly accessible
class MyFile {
  inherit Stdio.File;                 // IS-A Stdio.File
  void create(string path) { ::create(path, "r"); }
}
```

## Operator Overloading (lfuns)

```pike
class Vec {
  float x, y;
  void create(float x, float y) { this->x = x; this->y = y; }
  Vec `+(Vec o) { return Vec(x + o->x, y + o->y); }
  int `==(mixed o) { return objectp(o) && x == o->x && y == o->y; }
  string _sprintf(int fmt) { return sprintf("Vec(%g,%g)", x, y); }
  mixed cast(string to) { return to == "array" && ({x, y}); }
}
```

Key lfuns: `` `+ `` `` `- `` `` `* `` `` `/ `` `` `[] `` `` `[]= `` `` `== `` `` `() `` `_sprintf`, `cast`, `__hash`, `_destruct`.

**If you implement `==`, you must also implement `__hash`.**

## Programs and Functions as Values

```pike
program p = Vec;          // the class itself
object o = p(1.0, 2.0);  // instantiate
object_program(o);        // Vec
```

## See Also

- [Type System](type-system.md) — `object`, `program`, `function` types
- [Syntax](syntax.md) — modifiers, `typedef`
- [Memory and References](memory-and-references.md) — object lifecycle, GC
- [Full syntax reference](../../skills/pike-language-reference/references/syntax.md)
