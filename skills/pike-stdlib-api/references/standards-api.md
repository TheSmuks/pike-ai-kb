# Standards API Reference (Pike 8.0.1116)

## Standards.JSON

```pike
Standards.JSON.encode(mixed value, bool|void utf8) -> string
```
Encode a Pike value to JSON. `utf8` controls Unicode handling.

```pike
Standards.JSON.decode(string json) -> mixed
```
Decode a JSON string to Pike values. Throws on invalid JSON.

Mapping keys must be strings. Arrays and mappings are the only compound types supported by JSON.

---

## Standards.URI

URI parsing, manipulation, and resolution.

```pike
Standards.URI(string|void uri, string|void base_uri)
```
Create a URI object. If `base_uri` is provided, `uri` is resolved relative to it.

### Fields

```pike
Standards.URI->scheme    -> string     // e.g. "http"
Standards.URI->authority -> string     // host[:port]
Standards.URI->user      -> string
Standards.URI->password  -> string
Standards.URI->host      -> string
Standards.URI->port      -> int|string
Standards.URI->path      -> string
Standards.URI->query     -> string     // raw query string
Standards.URI->fragment  -> string
Standards.URI->baseuri   -> string     // scheme + authority
```

### Methods

```pike
Standards.URI()->combine(string relative_uri) -> Standards.URI
Standards.URI()->reparse_uri() -> void
Standards.URI()->get_query_variables() -> mapping(string:string)
Standards.URI())->set_query_variables(mapping(string:string) vars) -> void
Standards.URI())->get_http_path_query() -> string
Standards.URI())->cast(string type) -> string
```
Casting to "string" produces the full URI.

---

## Standards.UUID

RFC 4122 UUID generation and parsing.

```pike
Standards.UUID.make_version1() -> Standards.UUID.UUID
Standards.UUID.make_version3(string namespace_uuid, string name) -> Standards.UUID.UUID
Standards.UUID.make_version4() -> Standards.UUID.UUID
Standards.UUID.make_version5(string namespace_uuid, string name) -> Standards.UUID.UUID
```

### Standards.UUID.UUID

```pike
Standards.UUID.UUID(string uuid_string)
```

```pike
Standards.UUID.UUID()->encode() -> string
Standards.UUID.UUID())->str() -> string
Standards.UUID.UUID())->variant() -> int
Standards.UUID.UUID())->version() -> int
Standards.UUID.UUID())->cast(string type) -> string
```

### Namespace Constants

```pike
Standards.UUID.Namespace.DNS    // "6ba7b810-9dad-11d1-80b4-00c04fd430c8"
Standards.UUID.Namespace.URL    // "6ba7b811-9dad-11d1-80b4-00c04fd430c8"
Standards.UUID.Namespace.OID    // "6ba7b812-9dad-11d1-80b4-00c04fd430c8"
Standards.UUID.Namespace.X500   // "6ba7b814-9dad-11d1-80b4-00c04fd430c8"
```

---

## Standards.BASE64

```pike
Standards.BASE64.encode(string data, int|void line_length) -> string
```
Encode binary data to base64. `line_length` inserts line breaks.

```pike
Standards.BASE64.decode(string encoded) -> string
```
Decode base64 to binary data.

---

## Standards.PEM

PEM (Privacy Enhanced Mail) format handling for certificates and keys.

```pike
Standards.PEM content(string pem_string) -> array(mapping)
```
Parse PEM content. Each mapping contains `("type": string, "data": string, "headers": mapping)`.

```pike
Standards.PEM.build(string type, string data, mapping|void headers) -> string
```
Build a PEM-encoded string.

---

## Standards.IDNA

Internationalized Domain Names handling.

```pike
Standards.IDNA.encode_hostname(string hostname) -> string
```
Encode a Unicode hostname to IDNA (punycode) format.

```pike
Standards.IDNA.decode_hostname(string hostname) -> string
```
Decode an IDNA/punycode hostname to Unicode.

---

## Standards.BSON

BSON (Binary JSON) encoding/decoding for MongoDB compatibility.

```pike
Standards.BSON.encode(mixed value) -> string
Standards.BSON.decode(string data) -> mixed
```
