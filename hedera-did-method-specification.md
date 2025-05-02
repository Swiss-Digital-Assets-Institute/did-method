% Hashgraph DID Method Specification
% Authors: Jakub Sydor, Pablo Buitrago
% Version: 2.0
<!-- [pandoc `title block`](https://pandoc.org/MANUAL.html#extension-pandoc_title_block) -->

**Table of Contents**

- [1. About](#1-about)
  - [1.1. Status of This Document](#11-status-of-this-document)
  - [1.2. About Hedera Hashgraph](#12-about-hedera-hashgraph)
  - [1.3. Motivation](#13-motivation)
- [2. Hedera Hashgraph DID Method](#2-hedera-hashgraph-did-method)
  - [2.1. Namespace Specific Identifier (NSI)](#21-namespace-specific-identifier-nsi)
  - [2.2. Method-Specific DID URL Parameters](#22-method-specific-did-url-parameters)
- [3. CRUD Operations](#3-crud-operations)
  - [3.1. Operations](#31-operations)
    - [3.1.1. Create](#311-create)
    - [3.1.2. Read (Resolve)](#312-read-resolve)
    - [3.1.3. Update](#313-update)
    - [3.1.4. Deactivate](#314-deactivate)
- [4. Security Considerations](#4-security-considerations)
- [5. Privacy Considerations](#5-privacy-considerations)
- [6. Reference Implementations and Testing](#6-reference-implementations-and-testing)
- [7. References](#7-references)

# 1. About

The Hedera DID method specification conforms to the requirements of the [Decentralized Identifiers (DIDs) v1.0](https://www.w3.org/TR/2022/REC-did-core-20220719/) [W3C Recommendation](https://www.w3.org/standards/types#REC), published 19 July 2022. 

The following DID Method is registered in the [DID Method Registry](https://w3c-ccg.github.io/did-method-registry/).

## 1.1. Status of This Document

This document is published as a Draft for feedback.

## 1.2. About Hedera Hashgraph

[Hedera](https://hedera.com/) [Hashgraph](https://github.com/hashgraph) is a multi-purpose open public ledger that uses hashgraph consensus - a fast, fair, and secure alternative to blockchains.

## 1.3. Motivation

Version 1.0 of the Hedera DID Method established a functional DID method on Hedera using HCS but tied DID control rigidly to the key embedded in the identifier (referred to as `#did-root-key` logic). This deviated from the standard W3C controller model, creating significant limitations:

. *Deviation from W3C Standard:* Hindered interoperability with standard DID tools, libraries, and platforms expecting the `controller` property to define authority.
. *Rigid Control:* Made rotation of the primary controlling key difficult or impossible without changing the DID identifier itself, complicating security best practices and delegation scenarios. *Example: Under v1.0, a compromised `<base58-key>` requires changing the DID identifier entirely to revoke control, disrupting existing integrations. v2.0 allows key rotation via the `controller` property without altering the DID.*
. *Limited Multi-Controller Support:* The v1.0 model's focus on a single identifier-linked key made native support for multiple controllers, common in organizational or delegated scenarios, cumbersome.

Hedera DID Method v2.0 aims to rectify these issues by fully adopting the standard W3C controller pattern for authorization. This change occurs *while retaining the established v1.0 identifier format* to ensure naming continuity for existing DID concepts on Hedera. The result is a more flexible, robust, secure, and interoperable DID method aligned with global standards.

*Note:* This specification defines a new ruleset (v2.0). *Existing v1.0 DIDs remain under v1.0 rules; new DIDs must be created under v2.0 for W3C-aligned control.* There is no in-place upgrade path from v1.0 to v2.0 for an existing DID identifier.

# 2. Hedera Hashgraph DID Method

The namestring that shall identify this DID method is: `hedera`

A DID that uses this method MUST begin with the following prefix: `did:hedera`. Per the DID specification, this string MUST be in lowercase. The remainder of the DID, after the prefix, is the Namespace Specific Identifier (NSI) specified below. This section defines the identifier format, which remains consistent between v1.0 and v2.0 of this method.

## 2.1. Namespace Specific Identifier (NSI)

The `did:hedera` namestring is defined by the following ABNF:

```abnf
hedera-did = "did:hedera:" hedera-specific-idstring "_" hedera-specific-parameters
hedera-specific-idstring = hedera-network ":" hedera-base58-key
hedera-specific-parameters = did-topic-id
did-topic-id = 1*DIGIT "." 1*DIGIT "." 1*DIGIT

hedera-network = "mainnet" / "testnet"
hedera-base58-key = 32*44(base58)
base58 = "1" / "2" / "3" / "4" / "5" / "6" / "7" / "8" / "9" / "A" / "B" /
         "C" / "D" / "E" / "F" / "G" / "H" / "J" / "K" / "L" / "M" / "N" /
         "P" / "Q" / "R" / "S" / "T" / "U" / "V" / "W" / "X" / "Y" / "Z" /
         "a" / "b" / "c" / "d" / "e" / "f" / "g" / "h" / "i" / "j" / "k" /
         "m" / "n" / "o" / "p" / "q" / "r" / "s" / "t" / "u" / "v" / "w" /
         "x" / "y" / "z"
```

Example:

```text
did:hedera:mainnet:z52k2w6rFF9xxzvmSiuyqwJS8b7oFnDtk8S3bhY4YbnJq_0.0.3474905
```

The method specific identifier (`hedera-specific-idstring` combined with `hedera-specific-parameters`) consists of:
* A Hedera network identifier (`mainnet` or `testnet`).
* A Base58 bitcoin encoded value (`hedera-base58btc-key`), typically derived from the public key used during the initial creation of the DID. **Crucially, under the v2.0 rules defined in this specification, this `<base58btc-key>` component serves *only as part of the unique identifier* after creation and *does not* grant ongoing control authority over the DID.**
* A Hedera Topic ID (`did-topic-id`), separated by an underscore (`_`), identifying the Hedera Consensus Service (HCS) topic used for messages related to this DID.

Control and authorization for managing the DID under v2.0 are determined solely by the `controller` property within the DID document and verified via cryptographic `proof` mechanisms submitted in HCS messages (detailed in Section 3), aligning with the W3C DID Core specification. The v1.0 concept of a mandatory `#did-root-key` intrinsically linked to the identifier for control is superseded in v2.0.

Example Hedera DID document:
_[Note: The following example illustrates the structure of a DID document. Under v2.0 rules, the `controller` property defines authority. While a key like `#key-1` related to the identifier might exist, it holds no special control privileges granted by this DID method specification itself. Authorization relies on proofs generated by keys authorized by the `controller`(s), as detailed in Section 3.]_

```json
{
  "@context": [
    "https://www.w3.org/ns/did/v1",
    "https://w3id.org/security/multikey/v1"
  ],
  "id": "did:hedera:testnet:z6MkipomYgdGz1MXBm5ZJNVNVqTgumeMboAy3fCpd_0.0.645701",
  "controller": "did:hedera:testnet:z6MkipomYgdGz1MXBm5ZJNVNVqTgumeMboAy3fCpd_0.0.645701",
  "verificationMethod": [
    {
      "id": "did:hedera:testnet:z6MkipomYgdGz1MXBm5ZJNVNVqTgumeMboAy3fCpd_0.0.645701#key-1",
      "type": "Multikey",
      "controller": "did:hedera:testnet:z6MkipomYgdGz1MXBm5ZJNVNVqTgumeMboAy3fCpd_0.0.645701",
      "publicKeyMultibase": "z6MkipomYgdGz1MXBm5ZJNVNVqTgumeMboAy3fCpd"
    },
    {
      "id": "did:hedera:testnet:z6MkipomYgdGz1MXBm5ZJNVNVqTgumeMboAy3fCpd_0.0.645701#key-2",
      "type": "Multikey",
      "controller": "did:hedera:testnet:z6MkipomYgdGz1MXBm5ZJNVNVqTgumeMboAy3fCpd_0.0.645701",
      "publicKeyMultibase": "z6Mkj1AvU2AEh8ybRqNwHAM3CjbkjYaYHpt9oA1uugW9EVTg6P"
    }
  ],
  "capabilityInvocation": [
    "did:hedera:testnet:z6MkipomYgdGz1MXBm5ZJNVNVqTgumeMboAy3fCpd_0.0.645701#key-1"
  ],
  "authentication": [
    "did:hedera:testnet:z6MkipomYgdGz1MXBm5ZJNVNVqTgumeMboAy3fCpd_0.0.645701#key-1",
    "did:hedera:testnet:z6MkipomYgdGz1MXBm5ZJNVNVqTgumeMboAy3fCpd_0.0.645701#key-2"
  ],
  "service": [
    {
      "id": "did:hedera:testnet:z6MkipomYgdGz1MXBm5ZJNVNVqTgumeMboAy3fCpd_0.0.645701#service-1",
      "type": "LinkedDomains",
      "serviceEndpoint": "https://test.com/did"
    }
  ]
}
```

## 2.2. Method-Specific DID URL Parameters

There is one method-specific parameter defined as part of the Hedera DID NSI:

- `did-topic-id` - a mandatory parameter, separated by `_`, that defines the TopicID of the Hedera Consensus Service (HCS) topic to which messages for a particular DID are submitted. This allows resolvers to locate the relevant HCS message stream via Hedera mirror nodes.

A Hedera TopicID is a triplet of numbers, e.g. `0.0.29656231` represents topic identifier `29656231` within realm `0` and shard `0`.

Realms allow Solidity smart contracts to run in parallel. Realms are not currently relevant to this DID method. In the future, when the number of consensus nodes warrants it, the Hedera network may be divided into shards such that a particular transaction will be processed into consensus only by a subset of the full set of nodes.

# 3. CRUD Operations

Create, Update, and Deactivate operations against a DID Document under the v2.0 ruleset are performed by submitting authorized messages to the DID's associated Hedera Consensus Service (HCS) topic. Authorization is achieved via cryptographic proofs linked to the DID's designated controller(s), as detailed below.

![alt text](./images/crud.flow.drawio.svg "Create, Update and Deactivate flow") 

The Read operation (resolution) of a DID document from a DID still occurs by querying a Hedera mirror node for the HCS topic history and reconstructing the state based on the ordered messages.

![alt text](./images/read.flow.drawio.svg "Read flow") 

A valid v2.0 HCS message payload for Create, Update, or Deactivate operations MUST be a JSON object containing at least the following top-level fields:

- `version`: MUST be the string `"2.0"` to identify the ruleset version being used.
- `operation`: A string indicating the operation type. Common values include `"create"`, `"update"`, `"deactivate"`. (Note: `"update"` covers modifications to the DID document, potentially including adding or removing properties like verification methods or services, replacing the specific "revoke property" concept from v1.0).
- `proof`: A mandatory `proof` object whose structure and processing model are based on the **W3C Verifiable Credential Data Integrity v1.0** specification [VC-DI-1.0].
    - It MUST conform to a specific Data Integrity cryptosuite specification supported by this DID method (e.g., `Ed25519Signature2020`, `JsonWebSignature2020`).
    - This proof authorizes the operation and MUST be verifiable against a verification method associated with the DID's current designated `controller`(s).
    - The `proof` SHOULD typically include a `proofPurpose` like `"capabilityInvocation"` to signify control assertion over the DID.
- **Operation Payload Fields:** Additional fields specific to the `operation`. For instance:
    - `"create"` operations typically require a `didDocument` field containing the initial DID Document.
    - `"update"` operations also typically require a `didDocument` field containing the *complete* proposed new state of the DID Document after the update.
    - `"deactivate"` operations might not require additional payload fields beyond the core `version`, `operation`, and `proof`.

_(The previous v1.0 message structure based on nested `message` and `signature` fields tied to the identifier's key is superseded by this v2.0 structure)._

Here is an illustrative example of a v2.0 `create` operation message payload:
_[Note: This example is illustrative. Specific values like DIDs and proof values would vary.]_

```json
{
  "version": "2.0",
  "operation": "create",
  "didDocument": {
    "@context": [
      "https://www.w3.org/ns/did/v1",
      "https://w3id.org/security/multikey/v1"
    ],
    "id": "did:hedera:testnet:z6MkpP1q8JB5N7eMMPvF6RQN41dF7L9f4V3eY8X4o7X1h4xP_0.0.123456",
    "controller": "did:hedera:testnet:z6MkhdNf4kYt1q5k1Z1hY9fJp5n1Z1t4q8gR3jH9kX6mP7dQ_0.0.987654",
    "verificationMethod": [
      {
        "id": "did:hedera:testnet:z6MkhdNf4kYt1q5k1Z1hY9fJp5n1Z1t4q8gR3jH9kX6mP7dQ_0.0.987654#key-1",
        "type": "Multikey",
        "controller": "did:hedera:testnet:z6MkhdNf4kYt1q5k1Z1hY9fJp5n1Z1t4q8gR3jH9kX6mP7dQ_0.0.987654",
        "publicKeyMultibase": "z6MkhdNf4kYt1q5k1Z1hY9fJp5n1Z1t4q8gR3jH9kX6mP7dQ"
      },
      {
        "id": "did:hedera:testnet:z6MkpP1q8JB5N7eMMPvF6RQN41dF7L9f4V3eY8X4o7X1h4xP_0.0.123456#key-2",
        "type": "Multikey",
        "controller": "did:hedera:testnet:z6MkhdNf4kYt1q5k1Z1hY9fJp5n1Z1t4q8gR3jH9kX6mP7dQ_0.0.987654",
        "publicKeyMultibase": "z6MkpP1q8JB5N7eMMPvF6RQN41dF7L9f4V3eY8X4o7X1h4xP"
      }
    ],
    "authentication": [
      "did:hedera:testnet:z6MkhdNf4kYt1q5k1Z1hY9fJp5n1Z1t4q8gR3jH9kX6mP7dQ_0.0.987654#key-1"
    ],
    "assertionMethod": [
       "did:hedera:testnet:z6MkpP1q8JB5N7eMMPvF6RQN41dF7L9f4V3eY8X4o7X1h4xP_0.0.123456#key-2"
    ]
  },
  "proof": {
    "type": "Ed25519Signature2020",
    "created": "2025-04-30T12:00:00Z",
    "verificationMethod": "did:hedera:testnet:z6MkhdNf4kYt1q5k1Z1hY9fJp5n1Z1t4q8gR3jH9kX6mP7dQ_0.0.987654#key-1",
    "proofPurpose": "capabilityInvocation",
    "proofValue": "z5uJVg3hJn5fL8gK1fG5hV6fK8gL3kH7jR9wQ4bD5pT2mN1rS7yZ3xW"
  }
}
```

**Validation and Authorization:**

Neither Hedera network nodes nor standard mirror nodes validate the semantics of DID documents or the cryptographic proofs within HCS messages against the DID's controller. This validation **MUST** be performed by DID resolvers and client applications according to the v2.0 specification rules. Specifically, resolvers MUST:
* Process HCS messages in the strict order determined by their consensus timestamp and sequence number. In cases of conflicting messages within the same consensus second, the message with the lower sequence number takes precedence.
* Verify that the `version` field is `"2.0"`.
* Verify the cryptographic `proof` accompanying each operation against the verification method specified in the proof, ensuring that this verification method is authorized by the DID's designated `controller`(s) *at that point in time according to the processed message history*.
* Reject any message with a missing, invalid, or unverifiable `proof`, or a proof generated by an unauthorized key.
* When processing an update that changes the `controller` property itself, validate the operation's `proof` against the *previous* (currently authorized) controller's keys.

**HCS Topic Access Control vs. DID Control:**

It is the responsibility of the entity managing the DID (the controller or their delegate) to manage access to the associated HCS topic. Access control for *submitting messages* to the HCS topic is defined by the topic's `submitKey` property, managed via `ConsensusUpdateTopicTransaction`.
* **Crucially, the HCS `submitKey` only grants network-level permission to submit messages (valid or invalid) to the topic. It does *not* grant logical authorization to modify the DID state.**
* Logical authorization to perform valid DID operations (`create`, `update`, `deactivate`) requires a valid cryptographic `proof` generated by the DID's designated `controller`, as described above.
If no `submitKey` is defined for a topic, any party can submit messages (though only messages with valid proofs from the controller will result in state changes when processed by a conforming resolver). Detailed information on Hedera Consensus Service APIs can be found in the official [Hedera API documentation](https://docs.hedera.com/hedera-api/consensus/consensusservice).

*(Note on Message Size: Hedera Consensus Service messages have a size limit per transaction. However, the official Hedera SDKs automatically handle segmentation (chunking) of messages larger than the single transaction limit, allowing for the submission of typical DID documents and proofs. Developers should generally use the standard SDK functions for message submission.)*

## 3.1. Operations

### 3.1.1. Create

A DID is created under the v2.0 ruleset by sending a `ConsensusSubmitMessage` transaction to a Hedera network node containing the initial DID document and an authorization proof from the designated controller. This is executed by sending a `submitMessage` RPC call to the HCS API with the `ConsensusSubmitMessageTransactionBody` containing:

-   `topicID`: The HCS Topic ID specified in the `did-topic-id` parameter of the DID being created.
-   `message`: The HCS message payload, which MUST be the valid JSON object described in the introduction to Section 3, specifically structured for a `create` operation:
    * The `version` field MUST be `"2.0"`.
    * The `operation` field MUST be `"create"`.
    * A `didDocument` field MUST be present, containing the complete initial state of the DID Document. This document MUST include at least the `id` (matching the DID being created) and the initial `controller` property designating who controls this DID.
    * A `proof` field MUST be present. This proof, conforming to W3C Data Integrity specifications, MUST cryptographically verify the integrity of the message contents and provide authorization. The proof MUST be generated using the private key corresponding to the public key specified in the `proof.verificationMethod` field. This verification method MUST be associated with the `controller` designated within the `didDocument` payload of this same message. This confirms the initial controller's authorization for creating the DID.

### 3.1.2 Read (Resolve)

Resolving a `did:hedera` DID under v2.0 rules involves querying the HCS topic history associated with the DID's `did-topic-id` (typically via a mirror node) and reconstructing the DID document's state by processing authorized messages in order. The process MUST follow these steps:

1.  **Fetch History:** Retrieve all messages from the specified HCS `topicID`.
2.  **Order Messages:** Sort the retrieved messages strictly according to their consensus timestamp and sequence number (lower sequence number first for messages within the same second).
3.  **Process Sequentially:** Iterate through the ordered messages, maintaining the current known state of the DID document (initially null) and the current authorized controller(s) (initially null). For each message:
    a.  **Check Version:** Verify if the message payload is a JSON object with a `version` field equal to `"2.0"`. If not, or if the message is malformed, ignore this message and proceed to the next. *(Note: Resolvers supporting multiple versions would apply version-specific logic here).*
    b.  **Validate Proof:**
        i.  If the operation is `create`, the `proof` MUST be validated against a verification method associated with the `controller` specified *within the `didDocument` payload of this create message itself*.
        ii. If the operation is `update` or `deactivate`, the `proof` MUST be validated against a verification method associated with the *current known controller(s)* established by prior valid messages in the sequence.
        iii. If the `proof` field is missing, malformed, invalid according to its cryptosuite, or the `proof.verificationMethod` is not associated with the authorized controller(s), the message MUST be considered invalid and ignored.
    c.  **Apply Operation (if proof is valid):**
        i.  **`create`:** If the current state is null (i.e., this is the first valid message), parse the `didDocument` from the payload. This becomes the initial valid state of the DID Document. Record the `controller`(s) defined within this document. If a state already exists, this subsequent `create` message is typically ignored or treated as an error depending on resolver policy.
        ii. **`update`:** Replace the entire current known state of the DID document with the `didDocument` provided in the message payload. Update the record of the current `controller`(s) based on the `controller` property in this new document state.
        iii. **`deactivate`:** Mark the DID as deactivated. Store any relevant metadata from the message (like the proof details or timestamp) associated with the deactivation event. Once deactivated, subsequent `update` operations MUST be ignored.
4.  **Return Result:** After processing all messages:
    a.  If the DID was marked as deactivated by the latest valid operation, the resolver MUST return a representation indicating the deactivated status, potentially including metadata about the deactivation event (conformant with [DID-RESOLUTION]). The resolved DID document is typically null or empty.
    b.  Otherwise, return the final reconstructed state of the DID document according to the requested representation (e.g., `application/did+ld+json`).
    c.  If no valid `create` message was found, the DID cannot be resolved (error: `notFound`).

### 3.1.3 Update

An existing DID document is updated under the v2.0 ruleset by submitting a `ConsensusSubmitMessage` transaction containing the complete new state of the document and an authorization proof. This is executed by sending a `submitMessage` RPC call to the HCS API with the `ConsensusSubmitMessageTransactionBody` containing:

-   `topicID`: The HCS Topic ID specified in the `did-topic-id` parameter of the DID being updated.
-   `message`: The HCS message payload, which MUST be a valid JSON object as described in the introduction to Section 3, specifically structured for an `update` operation:
    * The `version` field MUST be `"2.0"`.
    * The `operation` field MUST be `"update"`.
    * A `didDocument` field MUST be present, containing the **complete desired state** of the DID Document *after* the update. Modifications, additions, or removals of properties (like `verificationMethod`, `service`, or changing the `controller`) are achieved by providing the full document reflecting this new state.
    * A `proof` field MUST be present. This proof MUST be valid and generated using a verification method associated with the DID's **current `controller`(s)** (i.e., the controller(s) authorized *before* this update is applied).

### 3.1.4 Deactivate

A DID document is deactivated under the v2.0 ruleset (marking it as no longer valid or resolvable to a current state) by submitting a `ConsensusSubmitMessage` transaction authorized by the current controller. This is executed by sending a `submitMessage` RPC call to the HCS API with the `ConsensusSubmitMessageTransactionBody` containing:

-   `topicID`: The HCS Topic ID specified in the `did-topic-id` parameter of the DID being deactivated.
-   `message`: The HCS message payload, which MUST be a valid JSON object as described in the introduction to Section 3, specifically structured for a `deactivate` operation:
    * The `version` field MUST be `"2.0"`.
    * The `operation` field MUST be `"deactivate"`.
    * A `proof` field MUST be present. This proof MUST be valid and generated using a verification method associated with the DID's **current `controller`(s)**.
    * Any additional payload fields beyond `version`, `operation`, and `proof` MAY be ignored by resolvers.

# 4. Security Considerations

The security model for Hedera DID Method v2.0 relies on the inherent security of the Hedera network (via HCS) and the robustness of the W3C controller model and cryptographic proofs. Key considerations include:

* **Identifier Component Roles (v2.0 Rule):**
    * *Crucial Distinction:* The `<base58btc-key>` component within the DID identifier string (`did:hedera:<network>:<base58btc-key>_<topic-id>`) serves **only as part of the unique identifier** after the initial creation operation. It **does not grant** ongoing control authority or authorization privileges for managing the DID document under v2.0 rules. Control is solely determined by the `controller` property within the DID document and verified via the `proof` mechanism. Misunderstanding this is a security risk.

* **Controller Authority & Compromise:**
    * *Primary Trust Anchor:* The security of a v2.0 Hedera DID rests primarily on the security of the DID(s) designated in its `controller` property and their associated cryptographic keys. Control authority is explicitly defined by this property.
    * *Controller Compromise:* The most significant threat is the compromise of a designated `controller`'s keys. An attacker gaining control of a controller gains full authority to modify (including changing the controller) or deactivate the Hedera DID documents managed by it.
    * *Key Management:* Robust key management practices (secure generation, storage, rotation, revocation) for all keys associated with `controller` DIDs are essential for maintaining the security of the Hedera DIDs they control.

* **HCS Topic Interaction & Access Control:**
    * *`submitKey` Role (Network Permission):* The HCS topic `submitKey` controls the **network-level permission** to submit messages (valid or invalid) to the DID's associated topic. Compromising the `submitKey` allows an attacker to potentially disrupt the DID by submitting spam or malformed messages (DoS risk, increased resolution cost).
    * *`controller` Proof Role (Logical Authorization):* The `submitKey` **does not** grant the ability to submit *validly authorized* state changes. Logical authorization to modify the DID state requires a valid cryptographic `proof` generated by the DID's `controller`.
    * *Distinct Controls:* Implementers and users must understand the clear separation between HCS topic write access (`submitKey`) and DID logical control (`controller` proof).
    * *SubmitKey Mitigation Strategies:* To mitigate DoS risks associated with `submitKey` compromise, operators SHOULD consider:
        * Rotating the HCS topic `submitKey` periodically, if feasible within their operational model.
        * Implementing monitoring on HCS topics to detect unusual activity or spam.
        * Potentially using HCS topic metadata or application-level logic to flag or ignore messages submitted by known malicious actors (though this is outside the core DID method spec).

* **Validation Responsibility:**
    * Neither Hedera network nodes nor standard mirror nodes validate DID document semantics or controller proofs. This validation **must** be performed by DID resolvers and client applications according to the v2.0 specification rules (verifying proofs against the controller's keys). Failure to validate proofs correctly breaks the security model.
    * *Resolver Validation Requirements (Anti-Patterns to Avoid):* Resolvers MUST:
        * Strictly follow the HCS consensus timestamp ordering for messages.
        * Reject any v2.0 message that lacks a `proof` field or contains an invalid or unverifiable `proof`.
        * When processing an update that changes the `controller` property, validate the operation's `proof` against the *previous* (currently authorized) controller's keys.
        * Reject messages with incorrect `version` fields or malformed structures.

# 5. Privacy Considerations

A DID Document should not include Personally Identifiable Information (PII).

The identifiers used to identify a subject create a greater risk of correlation when those identifiers are long-lived or used across more than one application domain as those domains could use that shared handle for the subject to share information about that subject without their express consent.

The resolution process may leak PII as the resolver can infer that the subject presenting the DID is interacting with the verifier resolving the DID.

If DID Controllers want to mitigate the risk of correlation, they should use unique DIDs for every interaction and the corresponding DID Documents should contain unique public keys.

# 6. Reference Implementations and Testing

A reference implementation for the Hedera DID Method v2.0, demonstrating how to create, resolve, update, and deactivate DIDs according to this specification using JavaScript, is being developed. The work-in-progress SDK is available at: [Swiss-Digital-Assets-Institute/hashgraph-did-sdk-js](https://github.com/Swiss-Digital-Assets-Institute/hashgraph-did-sdk-js).

To ensure interoperability and compliance with this specification, implementers (of SDKs, resolvers, or applications) SHOULD validate their implementations against standardized test vectors covering various scenarios, including valid/invalid messages, proof handling, controller management, deactivation, and conflict resolution. *(A dedicated repository or section within the specification project should host these test vectors).*

# 7. References

* [Decentralized Identifiers (DIDs) v1.0 - W3C Recommendation](https://www.w3.org/TR/did-core/) [DID-CORE]
* [Verifiable Credential Data Integrity v1.0 - W3C Recommendation](https://www.w3.org/TR/vc-data-integrity/) [VC-DI-1.0]
* [Hedera DID Method v1.0 Specification (For historical context)](https://github.com/hashgraph/did-method/blob/v1.0/hedera-did-method-specification.md)
* [Hedera Documentation](https://docs.hedera.com)
* [Hedera Website](https://www.hedera.com)