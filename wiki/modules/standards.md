# Standards Module

Standards-compliant encoding/decoding: JSON, URI, UUID, Base64, PEM, IDNA, BSON.

[Full Standards API](../../skills/pike-stdlib-api/references/standards-api.md)

## Standards.JSON

```pike
string json = Standards.JSON.encode((["key": "value", "nums": ({1, 2, 3})]));
mixed data = Standards.JSON.decode(json);  // throws on invalid JSON
```

- Mapping keys must be strings.
- Arrays and mappings are the only compound types JSON supports.
- `encode` with `utf8` flag for Unicode handling.

## Standards.URI

```pike
Standards.URI url = Standards.URI("http://user:pass@example.com:8080/path?q=1#frag");
url->scheme;    // "http"
url->host;      // "example.com"
url->port;      // 8080
url->path;      // "/path"
url->query;     // "q=1"
url->fragment;  // "frag"
mapping vars = url->get_query_variables();  // (["q": "1"])
(string)url;    // full URI string
```

- Supports relative URI resolution with second `base_uri` argument.

## Standards.UUID

```pike
Standards.UUID.UUID u = Standards.UUID.make_version4();
string s = u->str();  // "550e8400-e29b-41d4-a716-446655440000"
int ver = u->version;  // 4
```

- Versions: `make_version1(node)`, `make_version3(name, ns)`, `make_version4()`, `make_version5(name, ns)`.
- Namespace constants: `NameSpace_DNS`, `NameSpace_URL`, `NameSpace_OID`, `NameSpace_X500`.

## MIME Base64

```pike
string encoded = MIME.encode_base64("raw data");
string decoded = MIME.decode_base64(encoded);
```

- `encode_base64` wraps lines by default. Pass `1` as second arg to disable.

## Standards.PEM

```pike
string data = Standards.PEM.simple_decode(pem_string);
```

## Standards.IDNA

```pike
string ascii = Standards.IDNA.to_ascii("münchen.de");  // "xn--mnchen-3ya.de"
string uni   = Standards.IDNA.to_unicode("xn--mnchen-3ya.de");
```

## Gotchas

- `Standards.JSON.decode` throws on invalid JSON — wrap in catch.
- URI `port` field may be int or string depending on input.
- `MIME.encode_base64` is in the `MIME` module, not `Standards`.
- `Standards.BSON` is available for MongoDB compatibility.

## See Also

- [Protocols module](./protocols.md) — HTTP client/server
- [Crypto module](./crypto.md) — PEM-encoded keys and certificates
