## Reference Implementations and Testing

### Production SDK

Reference SDK packages implementing the Hedera DID Method v2.0 are available through npm:

- `@swiss-digital-assets-institute/core` - Core DID functionality
- `@swiss-digital-assets-institute/publisher-internal` - DID publishing to Hedera
- `@swiss-digital-assets-institute/registrar` - DID registration
- `@swiss-digital-assets-institute/resolver` - DID resolution
- `@swiss-digital-assets-institute/signer-internal` - Internal signing implementation
- `@swiss-digital-assets-institute/signer-hashicorp-vault` - HashiCorp Vault integration

These packages are used in the [PoC repository](https://github.com/Swiss-Digital-Assets-Institute/hedera-did-method-v2-poc) and demonstrate how to create, resolve, update, and deactivate DIDs according to this specification.

### Proof of Concept Repository

A comprehensive set of runnable Proof of Concept (PoC) implementations demonstrating all v2.0 features is available at: [hedera-did-method-v2-poc](https://github.com/Swiss-Digital-Assets-Institute/hedera-did-method-v2-poc).

The PoC repository validates the following specification features:

**Controller Operations:**
- Single-controller DID lifecycle (create, update, deactivate, resolve)
- Multi-controller operations and authorization
- Control transfer between DIDs

**Key Management:**
- Controller key rotation without DID disruption
- DID subject key rotation (authentication keys)
- Secure key replacement processes

**Verification Methods:**
- `Multikey` (Ed25519 and BLS implementations)
- `JsonWebKey2020` (JWK format support)
- Embedded and referenced controller representations

**Historical Resolution:**
- Point-in-time DID document retrieval using `versionId`
- Time-based resolution using `versionTime`
- Implicit key revocation through versioning

Each PoC can be run independently after setting up a Hedera Testnet account:

```bash
# Install dependencies
npm install

# Configure environment
cp .env.template .env
# Edit .env with your Hedera Testnet credentials

# Run specific PoCs
npm run poc:create-did-with-controller
npm run poc:did-key-rotation
npm run poc:resolution-with-version-id
npm run poc:did-transfer-controller
# See repository README for complete list of 15 available PoCs
```

The PoC repository includes a detailed [PoC Plan](https://github.com/Swiss-Digital-Assets-Institute/hedera-did-method-v2-poc/blob/main/POC-PLAN.md) that outlines objectives, scope, success criteria, and validation methodology for each feature.

### Test Vectors

To ensure interoperability and compliance with this specification, implementers (of SDKs, resolvers, or applications interacting with `did:hedera`) **should** validate their implementations against standardized test vectors. These test vectors **should** cover various scenarios, including:

- Valid `create`, `update`, and `deactivate` operations with different cryptosuites.
- Handling of multiple messages within the same consensus second (sequence number ordering).
- Validation of proofs against the correct historical controller.
- Rejection of invalid messages (missing fields, bad proofs, unauthorized keys, incorrect version).
- Resolution of deactivated DIDs.
- Handling of controller changes.
- Resolution using `versionId` to a specific sequence number.
- Resolution using `versionTime` to a specific timestamp.
- Resolution with both `versionId` and `versionTime` to test precedence.
- Resolution to points in history after the DID was deactivated.

::: note
Test vectors and JSON Schema definitions for v2.0 are planned for inclusion in the [PoC repository](https://github.com/Swiss-Digital-Assets-Institute/hedera-did-method-v2-poc).
:::
