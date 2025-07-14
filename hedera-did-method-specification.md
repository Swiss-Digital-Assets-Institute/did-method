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
    - [2.2.1. Mandatory Parameters](#221-mandatory-parameters)
    - [2.2.2. Version Resolution Parameters](#222-version-resolution-parameters)
- [3. CRUD Operations](#3-crud-operations)
  - [3.1. Operations](#31-operations)
    - [3.1.1. Create](#311-create)
    - [3.1.2 Read (Resolve)](#312-read-resolve)
    - [3.1.3 Update](#313-update)
    - [3.1.4 Deactivate](#314-deactivate)
- [4. Security Considerations](#4-security-considerations)
- [5. Privacy Considerations](#5-privacy-considerations)
- [6. Reference Implementations and Testing](#6-reference-implementations-and-testing)
- [7. References](#7-references)

# 1. About

The Hedera DID method specification conforms to the requirements specified in the [Decentralized Identifiers (DIDs) v1.0](https://www.w3.org/TR/2022/REC-did-core-20220719/) W3C Recommendation, published 19 July 2022.

The `hedera` DID Method is registered in the [W3C DID Method Registry](https://w3c-ccg.github.io/did-method-registry/).

## 1.1. Status of This Document

This document is published as a Draft for feedback. Comments and contributions are welcome.

## 1.2. About Hedera Hashgraph

[Hedera](https://hedera.com/) [Hashgraph](https://github.com/hashgraph) is a public, open-source, proof-of-stake network that utilizes the hashgraph consensus algorithm. It offers high throughput, low fees, and finality in seconds for various services, including the Hedera Consensus Service (HCS) leveraged by this DID method.

## 1.3. Motivation

Version 1.0 of the Hedera DID Method established a functional DID method on Hedera using HCS but tied DID control rigidly to the key embedded in the identifier (referred to as `#did-root-key` logic). This deviated from the standard W3C controller model, creating significant limitations:

- _Deviation from W3C Standard:_ Hindered interoperability with standard DID tools, libraries, and platforms expecting the `controller` property to define authority.
- _Rigid Control:_ Made rotation of the primary controlling key difficult or impossible without changing the DID identifier itself, complicating security best practices (like key rotation) and delegation scenarios. _Example: Under v1.0, a compromised `<base58-key>` requires changing the DID identifier entirely to revoke control, disrupting existing integrations. v2.0 allows key rotation via the `controller` property without altering the DID identifier._
- _Limited Multi-Controller Support:_ The v1.0 model's focus on a single identifier-linked key made native support for multiple controllers, common in organizational or delegated scenarios, cumbersome.

Hedera DID Method v2.0 aims to rectify these issues by fully adopting the standard W3C controller pattern for authorization. This change occurs _while retaining the established v1.0 identifier format_ to ensure naming continuity for existing DID concepts on Hedera. The result is a more flexible, robust, secure, and interoperable DID method aligned with global standards.

_[Note: This specification defines a new ruleset (v2.0). Existing v1.0 DIDs remain under v1.0 rules; new DIDs **must** be created under v2.0 rules to benefit from the W3C-aligned control mechanism. There is no in-place upgrade path from v1.0 to v2.0 for an existing DID identifier.]_

# 2. Hedera Hashgraph DID Method

The namestring that **shall** identify this DID method is: `hedera`

A DID that uses this method **must** begin with the following prefix: `did:hedera:`. Per the DID specification, this string **must** be in lowercase. The remainder of the DID, after the prefix, is the Namespace Specific Identifier (NSI) specified below. This section defines the identifier format, which remains consistent between v1.0 and v2.0 of this method.

## 2.1. Namespace Specific Identifier (NSI)

The `did:hedera` NSI is defined by the following ABNF grammar:

```abnf
hedera-did = "did:hedera:" hedera-specific-idstring "_" hedera-specific-parameters
hedera-specific-idstring = hedera-network ":" hedera-base58btc-key
hedera-specific-parameters = did-topic-id
did-topic-id = 1*DIGIT "." 1*DIGIT "." 1*DIGIT

hedera-network = "mainnet" / "testnet"
hedera-base58btc-key = 32*44(base58btc) ; Using the Bitcoin Base58 alphabet
base58btc = "1" / "2" / "3" / "4" / "5" / "6" / "7" / "8" / "9" / "A" / "B" /
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

The method-specific identifier (`hedera-specific-idstring` combined with `hedera-specific-parameters`) consists of:

- A Hedera network identifier (`mainnet` or `testnet`).
- A Base58 bitcoin encoded value (`hedera-base58btc-key`), typically derived from the public key used during the initial creation of the DID. **Crucially, under the v2.0 rules defined in this specification, this `<base58btc-key>` component serves _only as part of the unique identifier_ after creation and does not grant ongoing control authority over the DID.**
- A Hedera Topic ID (`did-topic-id`), separated by an underscore (`_`), identifying the Hedera Consensus Service (HCS) topic used for messages related to this DID.

Control and authorization for managing the DID under v2.0 are determined solely by the `controller` property within the DID document and verified via cryptographic `proof` mechanisms submitted in HCS messages (detailed in Section 3), aligning with the W3C DID Core specification. The v1.0 concept of a mandatory `#did-root-key` intrinsically linked to the identifier for control is superseded in v2.0.

_[Note: The following example illustrates the structure of a DID document under v2.0 rules. The `controller` property defines authority. While a verification method like `#key-1` might use a key related to the identifier's `<base58btc-key>` component, this method holds no special control privileges granted by this DID method specification itself. Authorization relies on proofs generated by keys authorized by the `controller`(s) for specific capabilities (like `capabilityInvocation`), as detailed in Section 3.]_

```json
{
  "@context": [
    "https://www.w3.org/ns/did/v1",
    "https://w3id.org/security/multikey/v1",
    "https://w3id.org/security/suites/jws-2020/v1"
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
      "type": "JsonWebKey2020",
      "controller": "did:hedera:testnet:z6MkipomYgdGz1MXBm5ZJNVNVqTgumeMboAy3fCpd_0.0.645701",
      "publicKeyJwk": {
        "kty": "OKP",
        "crv": "Ed25519",
        "x": "iaRFURYLA-QTlCYjFo_8UfMScPZgYTCpJzVEiJmQ_50"
      }
    }
  ],
  "capabilityInvocation": [
    "did:hedera:testnet:z6MkipomYgdGz1MXBm5ZJNVNVqTgumeMboAy3fCpd_0.0.645701#key-1"
  ],
  "authentication": [
    "did:hedera:testnet:z6MkipomYgdGz1MXBm5ZJNVNVqTgumeMboAy3fCpd_0.0.645701#key-1"
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

The Hedera DID method supports several method-specific DID URL parameters that enable version-specific resolution and provide additional metadata about DID document states:

### 2.2.1. Mandatory Parameters

- `did-topic-id` - a mandatory parameter, separated from the `hedera-specific-idstring` by an underscore (`_`), that defines the TopicID of the Hedera Consensus Service (HCS) topic to which messages for a particular DID are submitted. This allows resolvers to locate the relevant HCS message stream via Hedera mirror nodes.

A Hedera TopicID is a triplet of numbers (shard.realm.num), e.g., `0.0.29656231`, represents topic identifier `29656231` within realm `0` and shard `0`. Realms and shards are Hedera network constructs; currently, all topics reside in shard 0 and realm 0.

### 2.2.2. Version Resolution Parameters

The Hedera DID method supports two optional DID URL parameters for version-specific resolution, conforming to the [DID Resolution v1.0](https://w3c-ccg.github.io/did-resolution/) specification:

- `versionId` - an optional parameter that specifies the sequence number of the last HCS message chunk that should be considered when resolving the DID document. This parameter enables resolution to a specific point in the DID's history based on the message sequence number. The sequence number corresponds to the order of messages within the HCS topic, with lower numbers representing earlier messages.

- `versionTime` - an optional parameter that specifies the consensus timestamp of the HCS message transaction that should be considered when resolving the DID document. This parameter enables resolution to a specific point in time in the DID's history. The timestamp format **must** conform to ISO 8601 (e.g., `2025-01-15T10:30:00Z`).

**Version Resolution Behavior:**

When either `versionId` or `versionTime` is specified in a DID URL, resolvers **must**:

1. Process all HCS messages up to and including the specified version point (either by sequence number or consensus timestamp).
2. Return the DID document state as it existed at that specific point in the DID's history.
3. Include metadata in the resolution result indicating the version parameters used and the actual sequence number and consensus timestamp of the last processed message.

**Version Parameter Precedence:**

If both `versionId` and `versionTime` are specified in the same DID URL, the `versionId` parameter **must** take precedence, as it provides more precise control over the exact message to consider.

**Examples:**

```text
# Resolve to a specific sequence number
did:hedera:testnet:z6MkipomYgdGz1MXBm5ZJNVNVqTgumeMboAy3fCpd_0.0.645701?versionId=5

# Resolve to a specific point in time
did:hedera:testnet:z6MkipomYgdGz1MXBm5ZJNVNVqTgumeMboAy3fCpd_0.0.645701?versionTime=2025-01-15T10:30:00Z

# Resolve to the latest state (no version parameters)
did:hedera:testnet:z6MkipomYgdGz1MXBm5ZJNVNVqTgumeMboAy3fCpd_0.0.645701
```

# 3\. CRUD Operations

Create, Update, and Deactivate operations against a DID Document under the v2.0 ruleset are performed by submitting authorized messages to the DID's associated Hedera Consensus Service (HCS) topic. Authorization **must** be achieved via cryptographic proofs linked to the DID's designated controller(s), as detailed below.

![alt text](./images/crud.flow.drawio.svg "Create, Update and Deactivate flow")

The Read operation (resolution) of a DID document **must** occur by querying a Hedera mirror node for the HCS topic history and reconstructing the state based on the ordered, authorized messages.

![alt text](./images/read.flow.drawio.svg "Read flow")

A valid v2.0 HCS message payload for Create, Update, or Deactivate operations **must** be a JSON object containing at least the following top-level fields:

- `version`: **must** be the string `"2.0"` to identify the ruleset version being used.
- `operation`: A string indicating the operation type. Values **must** include `"create"`, `"update"`, or `"deactivate"`. (Note: `"update"` covers modifications to the DID document, potentially including adding or removing properties like verification methods or services, effectively replacing the specific "revoke property" concept from v1.0).
- `proof`: A mandatory `proof` object whose structure and processing model **must** be based on the **W3C Verifiable Credential Data Integrity v1.0** specification.
  - It **must** conform to a specific Data Integrity cryptosuite specification (e.g., `eddsa-jcs-2022`, `bbs-2023`).
  - This `proof` authorizes the operation and **must** be verifiable against a verification method associated with the DID's current designated `controller`(s).
  - The `proof` **must** include a `proofPurpose` such as `"capabilityInvocation"` to specify that the proof's verification method is being used by the controller to invoke the cryptographic capability of managing the DID document (e.g., creating, updating, or deactivating it).
- **Operation Payload Fields:** Additional fields specific to the `operation`. For instance:
  - `"create"` operations **must** include a `didDocument` field containing the initial DID Document.
  - `"update"` operations **must** include a `didDocument` field containing the _complete_ proposed new state of the DID Document after the update.
  - `"deactivate"` operations **may** omit additional payload fields beyond the core `version`, `operation`, and `proof`.

_(The previous v1.0 message structure based on nested `message` and `signature` fields tied to the identifier's key is superseded by this v2.0 structure)._

_[Note: The following example is illustrative. Specific values like DIDs, keys, timestamps, and proof values will vary.]_

```json
{
  "version": "2.0",
  "operation": "create",
  "didDocument": {
    "@context": [
      "https://www.w3.org/ns/did/v1",
      "https://w3id.org/security/multikey/v1",
      "https://w3id.org/security/suites/jws-2020/v1"
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
        "type": "JsonWebKey2020",
        "controller": "did:hedera:testnet:z6MkipomYgdGz1MXBm5ZJNVNVqTgumeMboAy3fCpd_0.0.645701",
        "publicKeyJwk": {
          "kty": "OKP",
          "crv": "Ed25519",
          "x": "iaRFURYLA-QTlCYjFo_8UfMScPZgYTCpJzVEiJmQ_50"
        }
      }
    ],
    "capabilityInvocation": [
      "did:hedera:testnet:z6MkipomYgdGz1MXBm5ZJNVNVqTgumeMboAy3fCpd_0.0.645701#key-1"
    ],
    "authentication": [
      "did:hedera:testnet:z6MkipomYgdGz1MXBm5ZJNVNVqTgumeMboAy3fCpd_0.0.645701#key-1"
    ],
    "service": [
      {
        "id": "did:hedera:testnet:z6MkipomYgdGz1MXBm5ZJNVNVqTgumeMboAy3fCpd_0.0.645701#service-1",
        "type": "LinkedDomains",
        "serviceEndpoint": "https://test.com/did"
      }
    ]
  },
  "proof": {
    "type": "Ed25519Signature2020",
    "created": "2025-04-30T12:00:00Z",
    "verificationMethod": "did:hedera:testnet:z6MkipomYgdGz1MXBm5ZJNVNVqTgumeMboAy3fCpd_0.0.645701#key-1",
    "proofPurpose": "capabilityInvocation",
    "proofValue": "z5uJVg3hJn5fL8gK1fG5hV6fK8gL3kH7jR9wQ4bD5pT2mN1rS7yZ3xW"
  }
}
```

**Validation and Authorization:**

Neither Hedera network nodes nor standard mirror nodes validate the semantics of DID documents or the cryptographic proofs within HCS messages against the DID's controller. This validation **must** be performed by DID resolvers and client applications according to the v2.0 specification rules. Specifically, resolvers **must**:

- Process HCS messages in the strict order determined by their consensus timestamp and sequence number. In cases of conflicting messages within the same consensus second, the message with the lower sequence number **must** take precedence.
- Verify that the `version` field is `"2.0"`. Messages with other versions **must** be processed according to their respective version specifications or ignored if unsupported.
- Verify the cryptographic `proof` accompanying each operation against the verification method specified in the proof, ensuring that this verification method is authorized by the DID's designated `controller`(s) _at that point in time according to the processed message history_. The specific validation rules depend on the operation type (see Section 3.1.2).
- Reject any message with a missing, invalid, or unverifiable `proof`, or a proof generated by an unauthorized key (i.e., a key not associated with the controller for the specified `proofPurpose` at that time).
- When processing an update that changes the `controller` property itself, validate the operation's `proof` against the _previous_ (currently authorized) controller's keys.

**HCS Topic Access Control vs. DID Control:**

It is the responsibility of the entity managing the DID (the controller or their delegate) to manage access to the associated HCS topic. Access control for _submitting messages_ to the HCS topic is defined by the topic's `submitKey` property, managed via Hedera's `ConsensusUpdateTopicTransaction`.

- **Crucially, the HCS `submitKey` only grants network-level permission to submit messages (which could be valid or invalid according to DID rules) to the topic. It does not grant logical authorization to modify the DID state.**
- Logical authorization to perform valid DID operations (`create`, `update`, `deactivate`) **must** be established via a valid cryptographic `proof` generated by the DID's designated `controller`, as described above.
- If no `submitKey` is defined for a topic, any party can submit messages. However, only messages containing valid proofs from the authorized controller will result in state changes when processed by a conforming DID resolver. Detailed information on Hedera Consensus Service APIs can be found in the official [Hedera API documentation](https://docs.hedera.com/hedera-api/consensus/consensusservice).

_[Note on Message Size: Hedera Consensus Service messages have a size limit per transaction. However, the official Hedera SDKs automatically handle segmentation (chunking) of messages larger than the single transaction limit, allowing for the submission of typical DID documents and proofs without manual chunking in most cases. Developers **should** generally use the standard SDK functions for message submission.]_

## 3.1. Operations

### 3.1.1. Create

A DID is created under the v2.0 ruleset by sending a `ConsensusSubmitMessage` transaction to a Hedera network node containing the initial DID document and an authorization proof from the designated controller. This is executed by sending a `submitMessage` RPC call (or equivalent SDK function) to the HCS API with the `ConsensusSubmitMessageTransactionBody` containing:

- `topicID`: The HCS Topic ID specified in the `did-topic-id` parameter of the DID being created.
- `message`: The HCS message payload, which **must** be the valid JSON object described in the introduction to Section 3, specifically structured for a `create` operation:
  - The `version` field **must** be `"2.0"`.
  - The `operation` field **must** be `"create"`.
  - A `didDocument` field **must** be present, containing the complete initial state of the DID Document. This document **must** include at least the `id` (matching the DID being created) and the initial `controller` property designating who controls this DID.
  - A `proof` field **must** be present. This proof **must** cryptographically verify the integrity of the message contents and provide authorization. The proof **must** be generated using the private key corresponding to the public key specified in the `proof.verificationMethod` field. This verification method **must** be associated with the `controller` designated within the `didDocument` payload of this _same message_. This proof demonstrates the controller invoking their capability (e.g., indicated by `proofPurpose: "capabilityInvocation"`) to authorize the creation of the DID.

### 3.1.2 Read (Resolve)

Resolving a `did:hedera` DID under v2.0 rules involves querying the HCS topic history associated with the DID's `did-topic-id` (typically via a mirror node) and reconstructing the DID document's state by processing authorized messages in consensus order. The process **must** follow these steps:

1.  **Parse DID URL Parameters:** Extract any version resolution parameters (`versionId` or `versionTime`) from the DID URL if present. These parameters determine the specific point in the DID's history to resolve to.
2.  **Fetch History:** Retrieve all messages from the specified HCS `topicID` via a Hedera mirror node.
3.  **Order Messages:** Sort the retrieved messages strictly according to their consensus timestamp and sequence number (lower sequence number first for messages within the same second).
4.  **Determine Resolution Point:** Based on the version parameters:

    - If `versionId` is specified, identify the message with the specified sequence number as the resolution endpoint.
    - If `versionTime` is specified, identify the last message with a consensus timestamp less than or equal to the specified time as the resolution endpoint.
    - If neither parameter is specified, process all messages to resolve to the latest state.
    - If both parameters are specified, `versionId` **must** take precedence.

5.  **Process Sequentially:** Iterate through the ordered messages up to the determined resolution point, maintaining the current known state of the DID document (initially null) and the current authorized controller(s) (initially null). For each message:

    1. **Check Version:** Verify if the message payload is a JSON object with a `version` field equal to `"2.0"`. If not, or if the message is malformed, ignore this message and proceed to the next. _[Note: Resolvers supporting multiple versions would apply version-specific logic here.]_
    2. **Validate Proof:**
       - If the `operation` is `create`, the `proof` **must** be validated against a verification method associated with the `controller` specified _within the `didDocument` payload of this create message itself_.
       - If the `operation` is `update` or `deactivate`, the `proof` **must** be validated against a verification method associated with the _current known controller(s)_ established by prior valid messages in the sequence (i.e., the controller(s) authorized _before_ this operation takes effect).
       - If the `proof` field is missing, malformed, invalid according to its cryptosuite, or if it fails to demonstrate that an authorized controller is invoking the necessary capability (e.g., the `proof.verificationMethod` is not associated with the authorized controller(s) for `capabilityInvocation` at this point in the history), the message **must** be considered invalid and ignored.
    3. **Apply Operation (if proof is valid):**
       - **`create`:** If the current state is null (i.e., this is the first valid message encountered), parse the `didDocument` from the payload. This becomes the initial valid state of the DID Document. Record the `controller`(s) defined within this document. If a state already exists (meaning a prior valid `create` was processed), this subsequent `create` message **should** be ignored or treated as an error according to resolver policy.
       - **`update`:** Replace the entire current known state of the DID document with the `didDocument` provided in the message payload. Update the record of the current `controller`(s) based on the `controller` property in this new document state.
       - **`deactivate`:** Mark the DID as deactivated. Store any relevant metadata from the message (like the proof details or timestamp) associated with the deactivation event. Once deactivated, subsequent `update` operations for this DID **must** be ignored.
    4. **Check Resolution Endpoint:** If a version parameter was specified and the current message reaches or exceeds the resolution endpoint, stop processing and proceed to step 6.

6.  **Return Result:** After processing messages up to the resolution endpoint:
    1. If the DID was marked as deactivated by the latest valid operation within the resolution scope, the resolver **must** return a DID resolution result indicating the deactivated status, potentially including metadata about the deactivation event. The resolved DID document representation **should** be null or empty.
    2. Otherwise, return the final reconstructed state of the DID document according to the requested representation (e.g., `application/did+ld+json`).
    3. If no valid `create` message was found for the specified DID within the resolution scope, the DID cannot be resolved, and the resolver **must** return an error (e.g., `notFound`).
    4. Include version metadata in the resolution result:
       - If `versionId` was specified, include the actual sequence number of the last processed message.
       - If `versionTime` was specified, include the actual consensus timestamp of the last processed message.
       - Include information about whether the resolution was to a specific version or the latest state.

### 3.1.3 Update

An existing DID document is updated under the v2.0 ruleset by submitting a `ConsensusSubmitMessage` transaction containing the complete new state of the document and an authorization proof from the current controller. This is executed by sending a `submitMessage` RPC call (or equivalent SDK function) to the HCS API with the `ConsensusSubmitMessageTransactionBody` containing:

- `topicID`: The HCS Topic ID specified in the `did-topic-id` parameter of the DID being updated.
- `message`: The HCS message payload, which **must** be a valid JSON object as described in the introduction to Section 3, specifically structured for an `update` operation:
  - The `version` field **must** be `"2.0"`.
  - The `operation` field **must** be `"update"`.
  - A `didDocument` field **must** be present, containing the **complete desired state** of the DID Document _after_ the update. Modifications, additions, or removals of properties (like `verificationMethod`, `service`, or changing the `controller`) **must** be achieved by providing the full document reflecting this new state. Partial updates are not supported at the message level; the entire document state **must** be provided.
  - A `proof` field **must** be present. This proof **must** be valid and demonstrate the **current `controller`(s)** (i.e., the controller(s) authorized _before_ this update is applied) invoking their capability to authorize the update. This is typically indicated by a `proofPurpose` of `"capabilityInvocation"` and generated using a verification method associated with that controller for this purpose.

### 3.1.4 Deactivate

A DID document is deactivated under the v2.0 ruleset (marking it as no longer valid or resolvable to a current state) by submitting a `ConsensusSubmitMessage` transaction authorized by the current controller. This is executed by sending a `submitMessage` RPC call (or equivalent SDK function) to the HCS API with the `ConsensusSubmitMessageTransactionBody` containing:

- `topicID`: The HCS Topic ID specified in the `did-topic-id` parameter of the DID being deactivated.
- `message`: The HCS message payload, which **must** be a valid JSON object as described in the introduction to Section 3, specifically structured for a `deactivate` operation:
  - The `version` field **must** be `"2.0"`.
  - The `operation` field **must** be `"deactivate"`.
  - A `proof` field **must** be present. This proof **must** be valid and demonstrate the **current `controller`(s)** invoking their capability to authorize the deactivation. This is typically indicated by a `proofPurpose` of `"capabilityInvocation"` and generated using a verification method associated with that controller for this purpose.
  - Any additional payload fields beyond `version`, `operation`, and `proof` **may** be ignored by resolvers processing the deactivation.

# 4\. Security Considerations

The security model for Hedera DID Method v2.0 relies on the inherent security properties of the Hedera network (specifically HCS consensus and finality) combined with the robustness of the W3C controller model and cryptographic proofs. Key considerations include:

- **Identifier Component Roles (v2.0 Rule):**

  - _Crucial Distinction:_ The `<base58btc-key>` component within the DID identifier string (`did:hedera:<network>:<base58btc-key>_<topic-id>`) serves **only as part of the unique identifier** after the initial `create` operation under v2.0 rules. It **must not** be interpreted as granting ongoing control authority or authorization privileges for managing the DID document. Control is solely determined by the `controller` property within the DID document state and verified via the `proof` mechanism in HCS messages. Misunderstanding this distinction presents a significant security risk, potentially leading to incorrect implementation of authorization logic.

- **Controller Authority & Compromise:**

  - _Primary Trust Anchor:_ The security of a v2.0 Hedera DID rests fundamentally on the security of the DID(s) designated in its `controller` property and their associated cryptographic keys used for `capabilityInvocation`. Control authority is explicitly defined and delegated by this property.
  - _Controller Compromise Impact:_ The most significant threat is the compromise of a designated `controller`'s private keys that are authorized for DID management (e.g., linked via `capabilityInvocation`). An attacker gaining control of such a key gains full authority to modify the DID document (including changing the `controller` to themselves or another entity) or deactivate the Hedera DID.
  - _Key Management:_ Robust key management practices (secure generation, storage, backup, rotation, and revocation procedures) for all keys associated with `controller` DIDs are essential for maintaining the security of the Hedera DIDs they control.

- **HCS Topic Interaction & Access Control:**

  - _`submitKey` Role (Network Permission):_ The HCS topic `submitKey` (an optional Hedera feature) controls the **network-level permission** to submit messages (valid or invalid according to DID rules) to the DID's associated topic. Compromising the `submitKey` allows an attacker to submit arbitrary messages to the topic. While this does not grant them logical control over the DID state (which requires a controller's proof), it could potentially disrupt the DID by submitting spam or malformed messages (Denial-of-Service risk, increased resolution cost for clients filtering invalid messages).
  - _`controller` Proof Role (Logical Authorization):_ The HCS `submitKey` **does not** grant the ability to submit _validly authorized_ state changes (i.e., messages with valid proofs from the controller). Logical authorization to modify the DID state requires a valid cryptographic `proof` generated by the DID's `controller`.
  - _Distinct Controls:_ Implementers and users **must** understand the clear separation between HCS topic write access (controlled by `submitKey`, if set) and DID logical control (controlled by `controller` proofs).
  - _SubmitKey Mitigation Strategies:_ To mitigate DoS risks associated with open topics or compromised `submitKey`s, operators **should** consider:
    - Setting an appropriate `submitKey` on the HCS topic and managing it securely.
    - Rotating the HCS topic `submitKey` periodically, if feasible within their operational model.
    - Implementing monitoring on HCS topics (e.g., via mirror nodes) to detect unusual activity or spam volume.
    - Designing resolvers to be resilient to invalid messages (efficiently filtering them out based on proof validation).

- **Validation Responsibility (Resolvers & Clients):**

  - As stated previously, neither Hedera network nodes nor standard mirror nodes validate DID document semantics or controller proofs against the DID logic. This validation **must** be performed by DID resolvers and client applications according to the v2.0 specification rules outlined in Section 3. Failure to perform these validations correctly breaks the security model.
  - _Resolver Validation Requirements (Checklist):_ Resolvers **must**:
    - Strictly follow the HCS consensus timestamp and sequence number ordering for messages.
    - Reject any v2.0 message that lacks a `proof` field.
    - Reject any v2.0 message containing a `proof` that is invalid (e.g., signature mismatch, incorrect format), unverifiable (e.g., key cannot be resolved), or does not demonstrate authorized capability invocation by the controller _at that point in the DID's history_.
    - When processing an update that changes the `controller` property, validate the operation's `proof` against the verification methods authorized by the _previous_ (currently valid) controller.
    - Reject messages with incorrect `version` fields (unless supporting multiple versions) or malformed structures that prevent validation.

# 5\. Privacy Considerations

DID Documents **should not** include Personally Identifiable Information (PII) directly. Information included in a DID document is typically public.

The use of identifiers, particularly public and persistent identifiers like DIDs, can create risks of correlation. When the same DID is used across multiple contexts or interactions, it allows observing parties (including websites, applications, and resolvers) to link those activities together. This correlation can potentially reveal sensitive information about the DID subject's behavior or relationships without their consent.

The DID resolution process itself can leak information. When a party (the verifier) resolves a DID presented by the DID subject, the resolver learns that the subject is interacting with that specific verifier at that time.

To mitigate correlation risks, DID controllers **should** consider using pairwise DIDs – creating a unique DID for each distinct relationship or interaction. Correspondingly, the DID Documents for these pairwise DIDs **should** contain unique public keys and service endpoints specific to that relationship, further compartmentalizing interactions.

# 6\. Reference Implementations and Testing

A reference implementation for the Hedera DID Method v2.0, demonstrating how to create, resolve, update, and deactivate DIDs according to this specification using JavaScript, is being developed. The work-in-progress SDK is available at: [Swiss-Digital-Assets-Institute/hashgraph-did-sdk-js](https://github.com/Swiss-Digital-Assets-Institute/hashgraph-did-sdk-js).

To ensure interoperability and compliance with this specification, implementers (of SDKs, resolvers, or applications interacting with `did:hedera`) **should** validate their implementations against standardized test vectors. These test vectors **should** cover various scenarios, including:

- Valid `create`, `update`, and `deactivate` operations with different cryptosuites.
- Handling of multiple messages within the same consensus second (sequence number ordering).
- Validation of proofs against the correct historical controller.
- Rejection of invalid messages (missing fields, bad proofs, unauthorized keys, incorrect version).
- Resolution of deactivated DIDs.
- Handling of controller changes.
- Version resolution scenarios:
  - Resolution using `versionId` parameter to specific sequence numbers.
  - Resolution using `versionTime` parameter to specific timestamps.
  - Resolution with both `versionId` and `versionTime` parameters (testing precedence).
  - Resolution to points in history before the DID was created (should return `notFound`).
  - Resolution to points in history after the DID was deactivated.
  - Resolution with invalid version parameters (malformed timestamps, negative sequence numbers).
  - Resolution metadata inclusion (actual sequence numbers and timestamps in results).
    _[Note: A dedicated repository or section within the specification project should be established to host these test vectors.]_

# 7\. References

- [Decentralized Identifiers (DIDs) v1.0 - W3C Recommendation](https://www.w3.org/TR/did-core/) [DID-CORE]
- [Verifiable Credential Data Integrity v1.0 - W3C Recommendation](https://www.w3.org/TR/vc-data-integrity/) [VC-DI-1.0]
- [DID Resolution v1.0 - W3C Community Group Draft Report](https://www.google.com/search?q=https://w3c-ccg.github.io/did-resolution/) [DID-RESOLUTION]
- [Key words for use in RFCs to Indicate Requirement Levels - RFC 2119](https://www.rfc-editor.org/rfc/rfc2119.html) [RFC2119]
- [Hedera DID Method v1.0 Specification (For historical context)](https://github.com/hashgraph/did-method/blob/v1.0/hedera-did-method-specification.md)
- [Hedera Documentation](https://docs.hedera.com)
- [Hedera Website](https://www.hedera.com)
