# program Type

A class/program value — the blueprint, not an instance. Used for type checking, dynamic instantiation, and introspection.

[Type Reference](../../skills/pike-language-reference/references/types.md)

## Concept

```pike
program p = MyClass;          // program value (the class itself)
object o = p(42);             // instantiate
object o2 = MyClass(42);     // same thing directly
```

## Key Operations

| Operation | Example | Notes |
|-----------|---------|-------|
| Get program | `object_program(obj)` | Returns the program of an object |
| Type check | `programp(x)` | Returns 1 if x is a program |
| Instantiate | `p(args)` | Create new instance |
| Typed object | `object(MyClass) o` | Constrain to specific program |
| Inheritance | `inherit Parent;` | Class inherits from program |

## Common Patterns

```pike
// Dynamic instantiation
program cls = load_module("Some.Module");
object instance = cls();

// Type-safe object variable
object(Stdio.File) f = Stdio.File("data.txt", "r");
f->read(100);  // type-checked method call

// Runtime type checking
if (object_program(obj) == MyClass) {
    // obj is exactly a MyClass instance
}

// Check if object implements interface
if (programp(SomeClass)) {
    object o = SomeClass();
}
```

## Common Pitfalls

- A `program` is NOT an instance. `MyClass` is a program; `MyClass()` is an object.
- `object_program()` returns the program, not the class name string. Use `sprintf("%O", object_program(obj))` for a name.
- `object(SomeClass) o` constrains the variable type but does not prevent assignment of subclasses.
- `programp()` returns 0 for objects. Use `objectp()` for instance checks and `object_program()` to get the program from an instance.
- Classes defined with `class { }` are programs. Calling them with `()` creates objects.

## See Also

- [function type](./function-type.md) — callable references
- [Stdio module](../modules/stdio.md) — `Stdio.File` is a program; `Stdio.File()` is an object
- [ADT module](../modules/adt.md) — `ADT.Stack`, `ADT.Queue` etc. are programs
