## Hedera DID Method Version Changelog

Lists of substantive changes in each version of the specification.

### Version 2.0

- **W3C Controller Model Adoption:** Full adoption of the standard W3C controller pattern for DID authorization, replacing the v1.0 `#did-root-key` model. Control is now determined solely by the `controller` property within the DID document.
- **Proof-Based Authorization:** Introduction of cryptographic proofs conforming to the W3C Verifiable Credential Data Integrity v1.0 specification for all DID operations (create, update, deactivate).
- **Version Resolution Parameters:** Support for `versionId` and `versionTime` DID URL query parameters enabling resolution to specific points in a DID's history.
- **Enhanced Message Structure:** New v2.0 HCS message format with mandatory `version`, `did`, `operation`, and `proof` fields, improving efficiency in shared topic scenarios.
- **Flexible Key Management:** Support for key rotation and multi-controller scenarios without requiring DID identifier changes.
- **Topic Association Models:** Formal documentation of dedicated and shared topic models with their respective trade-offs.
- **Improved Security Model:** Clear separation between HCS topic `submitKey` (network permission) and DID `controller` proofs (logical authorization).

### Version 1.0

- Initial version of the specification
- Established DID identifier format on Hedera using HCS
- Tied DID control to the key embedded in the identifier (`#did-root-key` logic)
