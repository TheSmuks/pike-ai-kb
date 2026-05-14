# Protocols Module

HTTP client/server, SSL/TLS, and parsers for HTML, XML, CSV, and more.

[Full Protocols & Parser API](../../skills/pike-stdlib-api/references/protocols-api.md)

## HTTP Client

```pike
// Synchronous requests
Protocols.HTTP.Query q = Protocols.HTTP.get_url("http://example.com");
string body = q->data;
int status = q->status;
mapping headers = q->headers;

Protocols.HTTP.post_url(url, "post data");
Protocols.HTTP.put_url(url, data, headers);
Protocols.HTTP.delete_url(url);
```

## HTTP Server

```pike
Protocols.HTTP.Server.Port server =
    Protocols.HTTP.Server.Port(
        lambda(Protocols.HTTP.Server.Request req) {
            return ([ "error": 200, "data": "Hello", "type": "text/plain" ]);
        }, 8080);
```

## SSL/TLS

```pike
SSL.Context ctx = SSL.Context();
ctx->add_cert(key, ({ cert }), extra_certs);
SSL.File ssl = SSL.File(Stdio.File(), ctx);
ssl->connect("example.com");
```

## HTTP Session (Cookies, Connection Reuse)

```pike
Protocols.HTTP.Session session = Protocols.HTTP.Session();
session->get_url("http://example.com");
session->post_url("http://example.com/api", "data");
```

## Parser.HTML

Event-driven HTML parser with tag/container callbacks:

```pike
Parser.HTML p = Parser.HTML();
p->add_container("a",
    lambda(Parser.HTML parser, mapping attrs, string content) {
        write("Link: %O -> %s\n", attrs->href, content);
    });
p->feed(html_data);
p->finish();
```

## Parser.XML.Simple

```pike
Parser.XML.Simple()->parse(xml_data,
    lambda(string type, string name, mapping attrs,
           string content, mapping extra) {
        // type: "<" open, ">" close, "" text
    });
```

## Gotchas

- `Protocols.HTTP.get_url` returns a `Query` object, not a string. Access `.data` for body.
- HTTP server callback returns a mapping with `"error"`, `"data"`, `"type"` keys.
- `Parser.HTML` tag callbacks receive `(parser, attrs)`, container callbacks get `(parser, attrs, content)`. The tag name is NOT passed — use `add_tag`/`add_container` per tag.
- `SSL.File` wraps a `Stdio.File` — create the raw socket first.
- `Protocols.HTTP.Query->ok` is non-zero for 2xx status codes.

## See Also

- [Crypto module](./crypto.md) — cryptographic primitives
- [Standards module](./standards.md) — JSON, URI, Base64
