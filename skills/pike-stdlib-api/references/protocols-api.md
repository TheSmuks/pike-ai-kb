# Protocols & Parser API Reference (Pike 8.0.1116)

## Protocols.HTTP

### Top-Level Functions

```pike
Protocols.HTTP.get_url(string url, mapping|void headers, ... ) -> Protocols.HTTP.Query
```
Synchronous GET request. Returns the Query object after completion.

```pike
Protocols.HTTP.post_url(string url, mapping|void headers, string|void data) -> Protocols.HTTP.Query
```
Synchronous POST request.

```pike
Protocols.HTTP.put_url(string url, mapping|void headers, string|void data) -> Protocols.HTTP.Query
```
Synchronous PUT request.

```pike
Protocols.HTTP.delete_url(string url, mapping|void headers) -> Protocols.HTTP.Query
```
Synchronous DELETE request.

```pike
Protocols.HTTP.request_url(string url, string method, mapping|void headers, string|void data) -> Protocols.HTTP.Query
```
Synchronous request with arbitrary method.

```pike
Protocols.HTTP.async_request(string method, string url, mapping|void headers, string|void data, function|void success_cb, function|void failure_cb) -> Protocols.HTTP.Query
```
Asynchronous HTTP request. Returns immediately; callbacks invoked on completion.

### Protocols.HTTP.Query

Represents an HTTP request/response pair.

```pike
Protocols.HTTP.Query()
```

```pike
Protocols.HTTP.Query()->set_callbacks(function success, function failure) -> void
Protocols.HTTP.Query()->fetch(string url) -> int
Protocols.HTTP.Query()->objectp() -> int
```

#### Response Access

```pike
Protocols.HTTP.Query()->status -> int          // HTTP status code
Protocols.HTTP.Query()->headers -> mapping     // Response headers
Protocols.HTTP.Query()->data -> string         // Response body
Protios.HTTP.Query()->ok -> int                // Non-zero if 2xx
```

#### Request Configuration

```pike
Protocols.HTTP.Query()->request_headers -> mapping
Protocols.HTTP.Query()->request_method -> string
Protocols.HTTP.Query()->request_data -> string
Protocols.HTTP.Query()->follow_redirects -> int
Protocols.HTTP.Query()->timeout -> int
```

### Protocols.HTTP.Server

HTTP server implementation.

#### Protocols.HTTP.Server.Port

```pike
Protocols.HTTP.Server.Port(function(Protocols.HTTP.Server.Request:mapping) callback, int port, string|void interface)
```
Create an HTTP server on the given port. `callback` receives each request and should return a response mapping.

#### Protocols.HTTP.Server.SSLPort

```pike
Protocols.HTTP.Server.SSLPort(function callback, int port, string|void interface, SSL.Context|void ctx)
```
HTTPS server port.

#### Protocols.HTTP.Server.Request

Passed to the server callback.

```pike
Protocols.HTTP.Server.Request->request_method -> string
Protocols.HTTP.Server.Request->request_headers -> mapping
Protocols.HTTP.Server.Request->request_data -> string
Protocols.HTTP.Server.Request->query_variables -> mapping
Protocols.HTTP.Server.Request->variables -> mapping
Protocols.HTTP.Server.Request->not_query -> string
Protocols.HTTP.Server.Request->real_url -> string
Protocols.HTTP.Server.Request->remoteaddr -> string
```

Response mapping format:
```pike
([
  "error": 200,
  "data": "response body",
  "type": "text/html",
  "extra_heads": ([ "X-Custom": "value" ])
])
```

#### Protocols.HTTP.Server.Filesystem

Serves files from a directory.

```pike
Protocols.HTTP.Server.Filesystem(string base_dir)
```

#### Protocols.HTTP.Server.Chained

Chains multiple request handlers.

#### Protocols.HTTP.Server.HeaderParser

Parses HTTP headers from raw data.

### Protocols.HTTP.Session

HTTP session manager with cookie handling and connection reuse.

```pike
Protocols.HTTP.Session()
```

```pike
Protocols.HTTP.Session()->get_url(string url) -> Protocols.HTTP.Session.Request
Protocols.HTTP.Session()->post_url(string url, string|void data) -> Protocols.HTTP.Session.Request
Protocols.HTTP.Session()->async_get_url(string url, function callbacks) -> Protocols.HTTP.Session.Request
Protocols.HTTP.Session()->async_post_url(string url, string data, function callbacks) -> Protocols.HTTP.Session.Request
```

---

## SSL

### SSL.Context

Holds certificates, keys, and SSL configuration.

```pike
SSL.Context()
```

```pike
SSL.Context()->add_cert(string|Crypto.RSA.State key, array(string) certs, array(string)|void extra_certs) -> void
SSL.Context()->set_authorities(array(string) ca_certs) -> void
SSL.Context()->set_min_protocol_version(int version) -> void
SSL.Context()->set_max_protocol_version(int version) -> void
SSL.Context()->get_min_protocol_version() -> int
SSL.Context()->get_max_protocol_version() -> int
SSL.Context()->preferred_suites -> array
SSL.Context()->configure(array(int) suites, int|void min_version) -> void
```

### SSL.File

SSL-wrapped file stream.

```pike
SSL.File(Stdio.File stream, SSL.Context ctx)
```

```pike
SSL.File()->connect(string host, int port) -> int
SSL.File()->is_open() -> int
SSL.File()->read(int|void nbytes) -> string
SSL.File()->write(string data) -> int
SSL.File()->close() -> void
SSL.File()->set_blocking() -> void
SSL.File()->set_nonblocking(function rcb, function wcb, function ccb) -> void
SSL.File()->query_connection() -> SSL.Connection
SSL.File()->peer_certificate_chain() -> array(string)
SSL.File()->get_peer_cert_issuer() -> string
SSL.File()->get_peer_cert_subject() -> string
```

### SSL.Port

SSL server port.

```pike
SSL.Port(SSL.Context ctx)
```

```pike
SSL.Port()->bind(int port, function accept_callback, string|void interface) -> void
SSL.Port()->accept() -> SSL.File
```

### SSL.Connection

Represents an SSL connection state.

```pike
SSL.Connection(SSL.Context ctx, int is_server, string|void remote_host)
```

### SSL.Constants

SSL/TLS protocol version constants and cipher suite definitions.

### SSL.https

```pike
SSL.https(string url) -> string
```
Fetch a URL over HTTPS, return body.

---

## Parser.HTML

Event-driven HTML parser.

```pike
Parser.HTML()
```

```pike
Parser.HTML()->add_tag(string tag, function callback) -> void
Parser.HTML()->add_container_tag(string tag, function callback) -> void
Parser.HTML()->add_quote_tag(string tag, function callback, string|void end) -> void
Parser.HTML()->feed(string data) -> string
Parser.HTML()->finish() -> string
Parser.HTML()->set_extra(mixed ... extra) -> void
Parser.HTML()->clone() -> Parser.HTML
```

Tag callback signature: `function(string tag, mapping attrs, string content|void ... extra)`

---

## Parser.CSV

CSV parser and encoder.

```pike
Parser.CSV(string|void data, string|void separator, string|void quote)
```

```pike
Parser.CSV()->fetch() -> array(string)|zero
Parser.CSV()->get_all() -> array(array(string))
```

---

## Parser.XML.Simple

Simple XML parser.

```pike
Parser.XML.Simple()
```

```pike
Parser.XML.Simple()->parse(string data, function callback) -> mixed
Parser.XML.Simple()->parse_tag(string tag, mapping attrs, string content|void) -> mixed
```

### Parser.XML.Validating

Validating XML parser with DTD support.

---

## Parser.Tabular

Parse tabular text (fixed-width, delimited) into structured data.

```pike
Parser.Tabular(string format)
```

---

## Parser.Pike

Pike source code tokenizer.

```pike
Parser.Pike.Token(string text, string type)
```

---

## Parser.C

C code tokenizer/parser.

```pike
Parser.C.Token(string text, string type)
Parser.C.UnterminatedStringError
```

---

## Parser.Python

Python source code tokenizer.

---

## Parser.RCS

RCS file format parser.

```pike
Parser.RCS(string data)
```

```pike
Parser.RCS()->parse(string data) -> mapping
```

---

## Parser.SGML

SGML parser (base for HTML).

---

## Parser.LR

LALR(1) parser generator.

```pike
Parser.LR.Parser(array rules)
Parser.LR.Rule(int symbol, array symbols, function|void action)
Parser.LR.Priority(int value, string assoc)
Parser.LR.ErrorHandler
```
