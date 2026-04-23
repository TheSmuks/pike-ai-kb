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
Crypto.<Hash>.crypt_hash(string password, string salt, int rounds) -> string
```
Hash a password using the Unix crypt format. Module-level function, not on State.

### Convenience

```pike
Crypto.<Hash>.hash(string data) -> string
```
One-shot hash of the input data.


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
Crypto.<Cipher>.State()->key_size() -> int  // returns 0; valid key sizes are cipher-specific (see table below)
```

Note: `key_size()` returns 0 before a key is set; after `set_encrypt_key`/`set_decrypt_key`, it returns the actual key length. Valid key sizes are documented per-cipher in the table above.
`iv_size()` is not available on cipher State objects; it is only relevant in cipher modes (e.g., CBC).
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
Crypto.CBC(Cipher.State state, string iv)  // returns a CBC-wrapped cipher state directly; no separate .State subclass
```

```pike
Crypto.CBC.State()->set_encrypt_key(string key) -> void
Crypto.CBC.State()->set_decrypt_key(string key) -> void
Crypto.CBC.State()->crypt(string data) -> string
Crypto.CBC.State()->set_iv(string iv) -> void
```

### Authenticated Encryption Base Classes

```pike
Crypto.AEAD  // Base for authenticated encryption with associated data
Crypto.AE    // Base for authenticated encryption (without AAD)
```

Note: GCM, EAX, CCM and other AEAD mode implementations are not available in Pike 8.0.1116. Only CBC mode is provided.

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
```

### Convenience

```pike
Crypto.HMAC(Crypto.Hash)(string key)->update(string data)->digest() -> string
Crypto.HMAC(Crypto.Hash)(string key)(string data) -> string  // one-shot via () call operator
```

Example:
```pike
string mac = Crypto.HMAC(Crypto.SHA256)("secret_key")("message");
```

---

## RSA

```pike
Crypto.RSA.State()
```

### Key Management

```pike
Crypto.RSA.State()->set_public_key(Gmp.mpz|int n, Gmp.mpz|int e) -> this
Crypto.RSA.State()->set_private_key(Gmp.mpz|int d, array(Gmp.mpz|int)|void extra) -> this
```
Where `extra` is `({p, q})` or `({p, q, n})`.

### Operations

```pike
Crypto.RSA.State()->sign(string message, .Hash h) -> string
Crypto.RSA.State()->verify(string message, .Hash h, string signature) -> int
Crypto.RSA.State()->encrypt(string message) -> string
Crypto.RSA.State()->decrypt(string ciphertext) -> string
Crypto.RSA.State()->rsa_pad(string message, int(1..2) type) -> Gmp.mpz
Crypto.RSA.State()->rsa_unpad(Gmp.mpz block, int(1..2) type) -> string
```

### Key Generation

```pike
Crypto.RSA.State()->generate_key(int bits, int|Gmp.mpz|void e) -> this
```
Second parameter is the public exponent `e` (default 65537). Retrieve key components with:

```pike
Crypto.RSA.State()->get_n() -> Gmp.mpz
Crypto.RSA.State()->get_e() -> Gmp.mpz
Crypto.RSA.State()->get_d() -> Gmp.mpz
```

---

## DSA, DH, ECC

### DSA

```pike
Crypto.DSA.State()->generate_key(int p_bits, int q_bits) -> this
Crypto.DSA.State()->set_public_key(Gmp.mpz p, Gmp.mpz q, Gmp.mpz g, Gmp.mpz y) -> this
Crypto.DSA.State()->set_private_key(Gmp.mpz p, Gmp.mpz q, Gmp.mpz g, Gmp.mpz x) -> this
Crypto.DSA.State()->pkcs_sign(string msg, .Hash h) -> string
Crypto.DSA.State()->pkcs_verify(string msg, .Hash h, string sig) -> int
Crypto.DSA.State()->raw_sign(string msg, .Hash h) -> string
Crypto.DSA.State()->raw_verify(string msg, .Hash h, string sig) -> int
```

```pike
Crypto.DH.Parameters(int|Crypto.DSA.State|Crypto.DH.Parameters params)
```

```pike
Crypto.DH.Parameters()->p  // Gmp.mpz field
Crypto.DH.Parameters()->g  // Gmp.mpz field
Crypto.DH.Parameters()->q  // Gmp.mpz field
Crypto.DH.Parameters()->generate_keypair(function rnd) -> array(Gmp.mpz)
Crypto.DH.Parameters()->generate(int bits, function|void rng) -> this
Crypto.DH.Parameters()->validate() -> int
```

Pre-defined parameter groups: `Crypto.DH.FFDHE2048` through `Crypto.DH.FFDHE8192`,
`Crypto.DH.MODPGroup1`, `MODPGroup2`, `MODPGroup5`, `MODPGroup14` through `MODPGroup18`, `MODPGroup22` through `MODPGroup24`.

### ECC (Elliptic Curve Cryptography)

Key operations are performed via the curve's algorithm-specific sub-objects:

```pike
Crypto.ECC.SECP_256R1.ECDSA()       // ECDSA signing
Crypto.ECC.SECP_384R1.ECDSA()       // ECDSA on P-384
Crypto.ECC.SECP_521R1.ECDSA()       // ECDSA on P-521
```

```pike
Crypto.ECC.<Curve>.ECDSA()->generate_key() -> this
Crypto.ECC.<Curve>.ECDSA()->get_private_key() -> int
Crypto.ECC.<Curve>.ECDSA()->get_public_key() -> string
Crypto.ECC.<Curve>.ECDSA()->get_point() -> Crypto.ECC.<Curve>.Point
```

Available curves: `SECP_256R1`, `SECP_384R1`, `SECP_521R1`.

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


---

## Random

```pike
Crypto.Random.random_string(int len) -> string
```
Return `len` random bytes. The `len` argument is required.

```pike
Crypto.Random.random(int max) -> Gmp.mpz
```
Return a random integer in [0, max).

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
