# Hedera DID Method Specification

This folder contains the Hedera DID Method specification in [Spec-Up](https://github.com/decentralized-identity/spec-up) format.

For details on Spec-Up features and functionality, please see [Spec-Up Documentation](https://identity.foundation/spec-up/).

## Editing the specification locally

Editing the spec locally requires `npm` and `node` installed.

1. Run `npm install`
2. Edit the contents in the `hedera-did-method` folder
3. Run `npm run render`
   - Alternatively, you can use `npm run edit` to enable interactive editing (rendered spec will be updated automatically as you apply changes)
4. Open the resulting `hedera-did-method/index.html` file in a browser

## About the Hedera DID Method

The Hedera DID Method specification defines how Decentralized Identifiers (DIDs) are created, resolved, updated, and deactivated on the Hedera network using the Hedera Consensus Service (HCS).

Version 2.0 of this specification fully adopts the standard W3C controller pattern for authorization, providing:

- **W3C Standards Compliance**: Full alignment with DID Core v1.0 and Verifiable Credential Data Integrity specifications
- **Flexible Key Management**: Controller-based authorization enables key rotation without changing the DID identifier
- **Multi-Controller Support**: Native support for organizational and delegated control scenarios
- **Version Resolution**: Support for resolving DIDs to specific points in their history

Read the spec: [https://hashgraph.github.io/did-method/](https://hashgraph.github.io/did-method/)

## Reference Implementations

- JavaScript/TypeScript: [Swiss-Digital-Assets-Institute/hashgraph-did-sdk-js](https://github.com/Swiss-Digital-Assets-Institute/hashgraph-did-sdk-js)
