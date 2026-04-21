# Crypto API Reference (Pike 8.0.1116)

## Overview

The Crypto module provides cryptographic primitives: hash functions, block/stream ciphers, cipher modes, HMAC, RSA, password hashing, and random number generation.

---

## Hash Functions

All hash functions follow the same pattern. Each hash module exports a `.State` class.

### Common Hash State Interface

```pike
Crypto.<Hash>.State()
```

```pike
Crypto.<Hash>.State()->update(string data) -> Crypto.<Hash>.State
```
Feed data into the hash. Chainable.

```pike
Crypto.<Hash>.State()->digest() -> string
```
Return the raw hash digest (binary string). Resets state.

```pike
Crypto.<Hash>.State()->hash_value() -> string
```
Alias for digest.

```pike
Crypto.<Hash>.State()->crypt_hash(string password) -> string
```
Hash a password using the Unix crypt format.

### Convenience

```pike
Crypto.<Hash>.hash(string data) -> string
```
One-shot hash of the input data.

```pike
Crypto.<Hash>.hash_value(string data) -> string
```
Alias for the one-shot hash.

### Available Hashes

| Module | Digest Size | Notes |
|--------|-------------|-------|
| `Crypto.SHA256` | 32 bytes | SHA-2 256-bit |
| `Crypto.SHA224` | 28 bytes | SHA-2 224-bit |
| `Crypto.SHA384` | 48 bytes | SHA-2 384-bit |
| `Crypto.SHA512` | 64 bytes | SHA-2 512-bit |
| `Crypto.SHA1` | 20 bytes | Legacy, avoid for new code |
| `Crypto.MD5` | 16 bytes | Legacy, avoid for new code |
| `Crypto.MD4` | 16 bytes | Legacy, broken |
| `Crypto.MD2` | 16 bytes | Legacy, broken |
| `Crypto.RIPEMD160` | 20 bytes | RIPEMD-160 |
| `Crypto.GOST94` | 32 bytes | Russian standard |
| `Crypto.SHA3_224` | 28 bytes | SHA-3 (Keccak) |
| `Crypto.SHA3_256` | 32 bytes | SHA-3 (Keccak) |
| `Crypto.SHA3_384` | 48 bytes | SHA-3 (Keccak) |
| `Crypto.SHA3_512` | 64 bytes | SHA-3 (Keccak) |

### Base Classes

```pike
Crypto.Hash
```
Base class for all hash algorithms. Defines the State interface.

```pike
Crypto.HashState
```
Instance base class for incremental hashing.

---

## Block Ciphers

All block ciphers follow the same pattern. Each cipher module exports a `.State` class.

### Common Cipher State Interface

```pike
Crypto.<Cipher>.State()
```

```pike
Crypto.<Cipher>.State()->set_encrypt_key(string key) -> void
Crypto.<Cipher>.State()->set_decrypt_key(string key) -> void
Crypto.<Cipher>.State()->crypt(string block) -> string
```
Encrypt or decrypt a single block (depending on key set).

```pike
Crypto.<Cipher>.State()->block_size() -> int
Crypto.<Cipher>.State()->key_size() -> int
Crypto.<Cipher>.State()->iv_size() -> int
```

### Available Block Ciphers

| Module | Block Size | Key Sizes | Notes |
|--------|-----------|-----------|-------|
| `Crypto.AES` | 16 bytes | 16, 24, 32 | Rijndael |
| `Crypto.Blowfish` | 8 bytes | 1-56 | Variable key length |
| `Crypto.CAST` | 8 bytes | 5-16 | CAST-128/CAST-5 |
| `Crypto.Camellia` | 16 bytes | 16, 24, 32 | |
| `Crypto.DES` | 8 bytes | 8 | Single DES |
| `Crypto.DES3` | 8 bytes | 24 | Triple DES |
| `Crypto.IDEA` | 8 bytes | 16 | |
| `Crypto.Serpent` | 16 bytes | 16, 24, 32 | AES finalist |
| `Crypto.Twofish` | 16 bytes | 16, 24, 32 | AES finalist |

### Stream Ciphers

| Module | Notes |
|--------|-------|
| `Crypto.Arcfour` | RC4-compatible stream cipher |
| `Crypto.ChaCha20` | 20-round ChaCha |
| `Crypto.SALSA20` | Salsa20 stream cipher |

### Base Classes

```pike
Crypto.BlockCipher   // 8-byte block ciphers
Crypto.BlockCipher16 // 16-byte block ciphers (inherits BlockCipher)
Crypto.Cipher        // Base for all ciphers
Crypto.CipherState   // Base instance for cipher operations
Crypto.BufferedCipher // Adds buffering logic
```

---

## Cipher Modes

Modes wrap a block cipher to handle data longer than one block.

### CBC (Cipher Block Chaining)

```pike
Crypto.CBC(Crypto.Cipher cipher)
```

```pike
Crypto.CBC.State(cipher_state, string iv)
```

```pike
Crypto.CBC.State()->set_encrypt_key(string key) -> void
Crypto.CBC.State()->set_decrypt_key(string key) -> void
Crypto.CBC.State()->crypt(string data) -> string
Crypto.CBC.State()->set_iv(string iv) -> void
Crypto.CBC.State()->get_iv() -> string
```

### CFB (Cipher Feedback)

Same interface pattern as CBC.

### CTR (Counter)

Same interface pattern as CBC. Counter mode turns a block cipher into a stream cipher.

### OFB (Output Feedback)

Same interface pattern as CBC.

### PCBC (Propagating Cipher Block Chaining)

Same interface pattern as CBC.

### Authenticated Encryption Modes

#### GCM (Galois/Counter Mode)

```pike
Crypto.GCM(Crypto.BlockCipher16 cipher)
```

```pike
Crypto.GCM.State()->set_encrypt_key(string key) -> void
Crypto.GCM.State()->set_decrypt_key(string key) -> void
Crypto.GCM.State()->set_iv(string iv) -> void
Crypto.GCM.State()->crypt(string data) -> string
Crypto.GCM.State()->update(string aad) -> void   // additional authenticated data
Crypto.GCM.State()->digest() -> string            // authentication tag
Crypto.GCM.State()->digest_size(int|void n) -> int
```

#### EAX

Same AEAD pattern as GCM. Combines CTR + OMAC.

#### CCM

Same AEAD pattern. Combines CTR + CBC-MAC.

### AEAD Base Class

```pike
Crypto.AEAD  // Base for authenticated encryption with associated data
Crypto.AE    // Base for authenticated encryption (without AAD)
```

---

## HMAC

```pike
Crypto.HMAC(Crypto.Hash hash_algo)
```

```pike
Crypto.HMAC.State(string key)
```

```pike
Crypto.HMAC.State()->update(string data) -> Crypto.HMAC.State
Crypto.HMAC.State()->digest() -> string
Crypto.HMAC.State()->hash_value() -> string
```

### Convenience

```pike
Crypto.HMAC(Crypto.Hash)(string key)->hash(string data) -> string
Crypto.HMAC(Crypto.Hash)(string key)->update(string data)->digest() -> string
```

Example:
```pike
string mac = Crypto.HMAC(Crypto.SHA256)("secret_key")->hash("message");
```

---

## RSA

```pike
Crypto.RSA.State()
```

### Key Management

```pike
Crypto.RSA.State()->set_public_key(Crypto.DSA.state|Gmp.mpz n, Gmp.mpz e) -> this
Crypto.RSA.State()->set_private_key(Crypto.DSA.state|Gmp.mpz n, Gmp.mpz d, array(Gmp.mpz)|void factors) -> this
```

### Operations

```pike
Crypto.RSA.State()->sign(string message, .Hash h) -> string
Crypto.RSA.State()->verify(string message, .Hash h, string signature) -> int
Crypto.RSA.State()->encrypt(string message, .Hash|void h) -> string
Crypto.RSA.State()->decrypt(string ciphertext, .Hash|void h) -> string
Crypto.RSA.State()->rsa_pad(string message, .Hash|void h) -> string
Crypto.RSA.State()->rsa_unpad(string padded) -> string
```

### Key Generation

```pike
Crypto.RSA.State()->generate_key(int bits, function(int:int)|void random) -> this
Crypto.RSA.State()->get_public_key() -> array(Gmp.mpz)
```

---

## DSA, DH, ECC

### DSA

```pike
Crypto.DSA.State()->generate_key(int bits, function|void rng) -> this
Crypto.DSA.State()->set_public_key(Gmp.mpz p, Gmp.mpz q, Gmp.mpz g, Gmp.mpz y) -> this
Crypto.DSA.State()->set_private_key(Gmp.mpz p, Gmp.mpz q, Gmp.mpz g, Gmp.mpz x) -> this
Crypto.DSA.State()->sign(string msg, .Hash h) -> string
Crypto.DSA.State()->verify(string msg, .Hash h, string sig) -> int
```

### DH (Diffie-Hellman)

```pike
Crypto.DH.State()->generate_key(int bits, function|void rng) -> this
Crypto.DH.State()->set_public_key(Gmp.mpz p, Gmp.mpz g, Gmp.mpz y) -> this
Crypto.DH.State()->set_private_key(Gmp.mpz p, Gmp.mpz g, Gmp.mpz x) -> this
Crypto.DH.State()->get_shared_secret(Gmp.mpz other_public) -> Gmp.mpz
```

### ECC (Elliptic Curve Cryptography)

```pike
Crypto.ECC.Curve()
Crypto.ECC.Curve()->generate_key() -> Crypto.ECC.Point
Crypto.ECC.Curve()->get_private_key(Crypto.ECC.Point) -> Gmp.mpz
Crypto.ECC.Curve()->get_public_key(Crypto.ECC.Point) -> Crypto.ECC.Point
```

---

## Password Hashing

```pike
Crypto.Password.hash(string password, string|void scheme) -> string
```
Hash a password. `scheme` defaults to the best available (e.g., "$6$" for SHA-512 crypt). Returns the full hash string including scheme and salt.

```pike
Crypto.Password.verify(string password, string hash) -> int
```
Verify a password against a stored hash. Returns 1 on match, 0 otherwise.

```pike
Crypto.Password.schemes() -> array(string)
```
List available hashing schemes.

---

## Random

```pike
Crypto.Random.random_string(int|void len) -> string
```
Return `len` random bytes (default 1).

```pike
Crypto.Random.uint32() -> int
Crypto.Random.uint64() -> int
```
Random unsigned integers.

```pike
Crypto.Random.randint(int min, int max) -> int
```
Random integer in [min, max].

---

## Other Classes

```pike
Crypto.MAC    // Message Authentication Code base
Crypto.Pipe   // Cipher pipeline (chain multiple operations)
Crypto.Sign   // Base for signature algorithms
Crypto.Substitution  // Substitution cipher base
Crypto.Buffer // Cryptographic buffer operations
Crypto.None   // Identity "cipher" (no-op)
```
