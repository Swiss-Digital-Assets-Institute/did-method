# Hedera DID Method Specification

[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-green)](LICENSE)
[![Status: Draft](https://img.shields.io/badge/status-Draft-blue)](hedera-did-method-specification.md)

This repository contains the official specification for the **Hedera DID Method (`did:hedera`)**.

The `did:hedera` method is a W3C-compliant Decentralized Identifier method that uses the Hedera Consensus Service (HCS) as a verifiable, append-only log for DID operations. The current **v2.0** specification is designed for full alignment with the W3C DID Core v1.0 standard, particularly its controller-based authorization model.

## Key Features of v2.0

-   **W3C Compliant:** Fully aligns with the DID Core v1.0 data model, using the `controller` property as the sole source of authority for DID management.
-   **Proof-Based Authorization:** Operations like creating, updating, and deactivating DIDs are authorized using cryptographic proofs that conform to the W3C Data Integrity specification.
-   **Persistent Identifiers:** The DID identifier is decoupled from the cryptographic keys used to control it. This allows for robust security practices like key rotation without ever needing to change the DID itself.
-   **Leverages Hedera Consensus Service (HCS):** Utilizes HCS to provide a fast, fair, and publicly verifiable log of all DID operations, with finality in seconds.

## Specification Document

The most current version of the specification is:
-   ➡️ **[Hedera DID Method Specification v2.0](hedera-did-method-specification.md)**

<details>
  <summary>Historical Versions</summary>

  - [v1.0](https://github.com/Meeco/hedera-did-method/releases/tag/v1.0)
  - [v0.9](https://github.com/Meeco/hedera-did-method/releases/tag/v0.9)
  - [v0.1](https://github.com/Meeco/hedera-did-method/releases/tag/v0.1)

</details>

## Reference Implementations

SDKs supporting the Hedera DID Method include:
-   **JavaScript/TypeScript:** [hashgraph-did-sdk-js](https://github.com/Swiss-Digital-Assets-Institute/hashgraph-did-sdk-js) *(Work-in-progress for v2.0)*

## For Contributors & Developers

This specification uses [pandoc `title block` syntax](https://pandoc.org/MANUAL.html#extension-pandoc_title_block) for its title and metadata.

### Building a PDF

To generate a PDF version of the specification document, you will need to install the following dependencies (example for Debian/Ubuntu):

```bash
sudo apt install pandoc librsvg2-bin texlive-latex-extra
````

Then run the following command from the repository root:

```bash
pandoc hedera-did-method-specification.md -o hedera-did-method-specification.pdf
```

## License

This work is licensed under the Apache License, Version 2.0. See the [LICENSE](https://www.google.com/search?q=LICENSE) file for details.