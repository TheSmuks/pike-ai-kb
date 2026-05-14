# Crypto Module

Cryptographic primitives: hashes, ciphers, HMAC, RSA, ECC, password hashing, and random generation.

[Full Crypto API](../../skills/pike-stdlib-api/references/crypto-api.md)

## Key Components

| Component | Purpose |
|-----------|---------|
| `Crypto.SHA256`, `Crypto.SHA512` | Hash functions (use these for new code) |
| `Crypto.AES` | Block cipher (16-byte blocks, 128/192/256-bit keys) |
| `Crypto.CBC` | Cipher Block Chaining mode |
| `Crypto.HMAC` | Hash-based Message Authentication Code |
| `Crypto.RSA` | RSA public-key encryption/signing |
| `Crypto.ECC` | Elliptic Curve Cryptography (ECDSA) |
| `Crypto.Password` | Password hashing and verification |
| `Crypto.Random` | Cryptographically secure random bytes |

## Hash Functions

```pike
// One-shot hash
string digest = Crypto.SHA256.hash("message");

// Incremental hash
Crypto.SHA256.State h = Crypto.SHA256.State();
h->update("part1")->update("part2");
string digest = h->digest();
```

## HMAC

```pike
string mac = Crypto.HMAC(Crypto.SHA256)("secret_key")("message");
// Or incrementally:
Crypto.HMAC.State hmac = Crypto.HMAC(Crypto.SHA256)("secret_key");
hmac->update("data");
string mac = hmac->digest();
```

## Symmetric Encryption (AES + CBC)

```pike
Crypto.CBC.State cipher = Crypto.CBC(Crypto.AES)->State();
cipher->set_encrypt_key("16-byte-key-here");
cipher->set_iv("16-byte-iv-here!");
string encrypted = cipher->crypt(plaintext);
```

## RSA Key Generation and Signing

```pike
Crypto.RSA.State rsa = Crypto.RSA.State();
rsa->generate_key(2048);
string sig = rsa->sign("message", Crypto.SHA256);
int valid = rsa->verify("message", Crypto.SHA256, sig);
```

## Password Hashing

```pike
string hash = Crypto.Password.hash("password");
int ok = Crypto.Password.verify("password", hash);
```

## Random Generation

```pike
string bytes = Crypto.Random.random_string(32);
Gmp.mpz rnd = Crypto.Random.random(1000);  // [0, 1000)
```

## Gotchas

- `Crypto.SHA1` and `Crypto.MD5` are legacy — avoid for new code.
- `key_size()` returns 0 before a key is set.
- Only CBC mode is available in Pike 8.0 (no GCM/EAX/CCM).
- GCM, EAX, CCM AEAD modes are NOT available in Pike 8.0.1116.
- `Crypto.RSA.State()->encrypt()` does raw RSA — use PKCS padding for real security.

## See Also

- [Protocols module](./protocols.md) — SSL/TLS with `SSL.File`
- [Standards module](./standards.md) — PEM, Base64
