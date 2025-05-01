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
    - [3.1.2. Read](#312-read)
    - [3.1.3. Update](#313-update)
    - [3.1.4. Revoke](#314-revoke)
    - [3.1.5. Delete](#315-delete)
  - [3.2. Event Payload](#32-event-payload)
    - [3.2.1. DID Document](#321-did-document)
    - [3.2.2. DID Owner](#322-did-owner)
    - [3.2.3. Verification Method](#323-verification-method)
    - [3.2.4. Verification Relationship](#324-verification-relationship)
    - [3.2.5. Services](#325-services)
- [4. Security Considerations](#4-security-considerations)
- [5. Privacy Considerations](#5-privacy-considerations)
- [6. Reference Implementations](#6-reference-implementations)
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
* A Base58 encoded value (`hedera-base58-key`), typically derived from the public key used during the initial creation of the DID. **Crucially, under the v2.0 rules defined in this specification, this `<base58-key>` component serves *only as part of the unique identifier* after creation and *does not* grant ongoing control authority over the DID.**
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
  "assertionMethod": [
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

A DID is created by sending a `ConsensusSubmitMessage` transaction to a Hedera network node. It is executed by sending a `submitMessage` RPC call to the HCS API with the `ConsensusSubmitMessageTransactionBody` containing:

- `topicID` - equal to the `did-topic-id` element of the DID namestring.
- `message` - a JSON DID message envelope described above
  - `operation` set to `create`
  - `event` payload either a `DIDOwner` or `DIDDocument` object

### 3.1.2. Read

Read, or Resolve, occurs by reading messages from the HCS topic set in the `did-topic-id` element of the DID namestring, and processing messages as below:

1. If the most recent valid message has `operation` set to `delete`, the DID document returned MUST be empty.
2. If the most recent valid message has `operation` set to `create`, and event object is `DIDDocument`, the DID document returned is the document resolve from the IPFS CID reference.
3. Otherwise
   1. Read valid message until one has `operation` set to `create`, and event object is `DIDOwner`.
   2. Construct DID document by applying message `update` and `revoke` operations in order.
   3. Return constructed DID document.

### 3.1.3. Update

A property or a DID document is updated by sending a `ConsensusSubmitMessage` transaction to a Hedera network node. It is executed by sending a `submitMessage` RPC call to HCS with the `ConsensusSubmitMessageTransactionBody` containing:

- `topicID` - equal to the `did-topic-id` element of the DID namestring.
- `message` - a JSON DID message envelope described above
  - `operation` set to `update`
  - `event` payload either a `Service`, `VerificationMethod` or `VerificationRelationship` object

### 3.1.4. Revoke

A property or a DID document is updated by sending a `ConsensusSubmitMessage` transaction to a Hedera network node. It is executed by sending a `submitMessage` RPC call to HCS with the `ConsensusSubmitMessageTransactionBody` containing:

- `topicID` - equal to the `did-topic-id` element of the DID namestring.
- `message` - a JSON DID message envelope described above
  - `operation` set to `revoke`
  - `event` payload either a `Service`, `VerificationMethod` or `VerificationRelationship` object with `id` set to the property to remove.

### 3.1.5. Delete

A Whole DID document is deleted/nullified by sending `ConsensusSubmitMessage` transaction to a Hedera network node. It is executed by sending a `submitMessage` RPC call to HCS with the `ConsensusSubmitMessageTransactionBody` containing:

- `topicID` - equal to the `did-topic-id` element of the DID namestring.
- `message` - a JSON DID message envelope described above
  - `operation` set to `revoke`
  - `event` payload will be ignored

## 3.2. Event Payload

A Base64-encoded JSON object that conforms the different properties of a DID documents to the [DID Specification](https://w3c.github.io/did-core/), the accepted events are listed within this section.

### 3.2.1. DID Document

A Hedera DID MAY be created by creating a reference to a DID document available in [IPFS](https://ipfs.io/).

`DIDDocument` event value must have a JSON structure defined by a [DIDDocument-schema](DIDDocument.schema.json) and contains the following properties:

- `DIDDocument` - The DIDOwner event with the following attributes:
  - `id` - The DID id
  - `type` - The document type, MAY include the DID document serialisation representation.
  - `cid` - The Content Identifiers to point to DID document in IPFS.
  - `url` - A URL to the IPFS document MAY be included for convenience.

```json
{
  "DIDDocument": {
    "id": "did:hedera:testnet:z6MknSnvSESWvijDEysG1wHGnaiZSLSkQEXMECWvXWnd1uaJ_0.0.1723780",
    "type": "DIDDocument",
    "cid": "bafybeifn6wwfs355md56nhwaklgr2uvuoknnjobh2d2suzsdv6zpoxajfa/did-document.json",
    "url": "https://ipfs.io/ipfs/bafybeifn6wwfs355md56nhwaklgr2uvuoknnjobh2d2suzsdv6zpoxajfa/did-document.json"
  }
}
```

### 3.2.2. DID Owner

Each identifier always has a controller address. By default, it is the same as the identifier address, however the resolver must validate this against the DID document. This controller address must be represented in the DID document as a verificationMethod entry with the id set as the DID being resolved and with the fragment `#did-root-key` appended to it. A reference to it must also be added to the authentication and assertionMethod arrays of the DID document.

If the controller for a particular DID is changed, a `DIDOwner` event is emitted through an DID update message. The event data MUST be used to update the `#did-root-key` entry in the verificationMethod array.

`DIDOwner` event must have a JSON structure defined by a [DIDOwner-schema](DIDOwner.schema.json) and contains the following properties:

- `DIDOwner` - The DIDOwner event with the following attributes:
  - `id` - The Id property of the verification method.
  - `type` - reference to the verification method type.
  - `controller` - The DID of the entity that is authorized to make the change.
  - `publickeyMultibase` - Mutlibase encoded public key.

```json
{
  "DIDOwner": {
    "id": "did:hedera:mainnet:7Prd74ry1Uct87nZqL3ny7aR7Cg46JamVbJgk8azVgUm_0.0.12345",
    "type": "Ed25519VerificationKey2018", 
    "controller": "did:hedera:mainnet:a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
    "publicKeyMultibase": "H3C2AVvLMv6gmMNam3uVAjZpfkcJCwDwnZn6z3wXmqPV",
  }
}
```

### 3.2.3. Verification Method

A DID document can express verification methods, such as cryptographic public keys, which can be used to authenticate or authorize interactions with the DID subject or associated parties.

VerificationMethod event must have a JSON structure defined by a [VerificationMethod-schema](VerificationMethod.schema.json) and contains the following properties:

- `VerificationMethod` - The VerificationMethod event with the following attributes:
  - `id` - The Id property of the verification method.
  - `type` - reference to the verification method type.
  - `controller` - The DID of the entity that is authorized to make the change.
  - `publickeyMultibase` - Mutlibase encoded public key.

```json
{
  "VerificationMethod": {
    "id":"did:hedera:mainnet:7Prd74ry1Uct87nZqL3ny7aR7Cg46JamVbJgk8azVgUm_0.0.12345#delegate-key1",
    "type": "Ed25519VerificationKey2018", 
    "controller": "did:hedera:mainnet:7Prd74ry1Uct87nZqL3ny7aR7Cg46JamVbJgk8azVgUm_0.0.12345",
    "publicKeyMultibase": "H3C2AVvLMv6gmMNam3uVAjZpfkcJCwDwnZn6z3wXmqPV",
  },
}
```

### 3.2.4. Verification Relationship

A verification relationship expresses the relationship between the DID subject and a verification method.

Different verification relationships enable the associated verification methods to be used for different purposes. Several useful verification relationship include:

- `authentication` verification relationship is used to specify how the DID subject is expected to be authenticated, for purposes such as logging into a website or engaging in any sort of challenge-response protocol. 
- `assertionMethod` verification relationship allows verifier to check if a verifiable credential contains a proof created by the DID subject.
- `keyAgreement` verification relationship allows the DID subject to specify how an entity can generate encryption material in order to transmit confidential information, such as for the purposes of establishing a secure communication channel with the recipient.
- `capabilityInvocation` verification relationship allows the DID subject to invoke a cryptographic capability for a specific authorisation.
- `capabilityDelegation` verification relationship is used to specify a mechanism that might be used by the DID subject to delegate a cryptographic capability to another party, such as delegating the authority to access a specific HTTP API to a subordinate.

`VerificationRelationship` event must have a JSON structure defined by a [VerificationRelationship-schema](VerificationRelationship.schema.json) and contains the following properties:

- `VerificationRelationship` - The VerificationRelationship event with the following attributes:
  - `id` - The Id property of the verification method.
  - `relationshipType` - Relationship type that is linked to specific verification method. to be performed on the DID document.  Valid values are: `authentication` , `assertionMethod` , `keyAgreement` , `capabilityInvocation` and `capabilityDelegation`.
  - `type` - reference to the verification method type.
  - `controller` - The DID of the entity that is authorized to make the change.
  - `publickeyMultibase` - Multibase encoded public key.

```json
{
  "VerificationRelationship": {
    "id":"did:hedera:mainnet:7Prd74ry1Uct87nZqL3ny7aR7Cg46JamVbJgk8azVgUm_0.0.12345#delegate-key1",
    "relationshipType": "authentication",
    "type": "Ed25519VerificationKey2018", 
    "controller": "did:hedera:mainnet:7Prd74ry1Uct87nZqL3ny7aR7Cg46JamVbJgk8azVgUm_0.0.12345",
    "publicKeyMultibase": "H3C2AVvLMv6gmMNam3uVAjZpfkcJCwDwnZn6z3wXmqPV",
  },
}
```

### 3.2.5. Services

Services are used in DID documents to express ways of communicating with the DID subject or associated entities. A service can be any type of service the DID subject wants to advertise, including decentralized identity management services for further discovery, authentication, authorization, or interaction.

Service event must have a JSON structure defined by a [service-schema](Service.schema.json) and contains the following properties:

- `Service` - The Service event with the following attributes:
  - `id` - The Id property of the service.
  - `type` - reference to the service type.
  - `serviceEndpoint` - valid urn to the service endpoint.

```json
{
  "Service":
    {
      "id": "did:hedera:mainnet:7Prd74ry1Uct87nZqL3ny7aR7Cg46JamVbJgk8azVgUm_0.0.12345#vcs",
      "type": "VerifiableCredentialService",
      "serviceEndpoint": "https://example.com/vc/"
    },
}
```

# 4. Security Considerations

Security of Hedera DID Documents inherits the security properties of Hedera Hashgraph network itself.

Hedera Hashgraph uses the hashgraph algorithm for the consensus timestamping and ordering of transactions. Hashgraph is Asynchronous Byzantine Fault Tolerant (ABFT) and fair, in that no particular node has the sole authority to decide the order of transactions, even if only for a short period of time.

Hedera uses a proof of stake (POS) model to mitigate Sybil attacks. The influence of a particular node towards consensus is weighted by the amount of HBARs, the network's native coin, they control.

Hedera charges fees for the processing of transactions into consensus and to partially mitigate Denial of Service attacks.

In the HCS model, messages are submitted to the Hedera network nodes, which collectively assign them a consensus timestamp and order within a topic, and then are deleted from those network consensus nodes. Consensus network nodes do not persist HCS messages beyond 3 minutes.

The messages are persisted only on mirror nodes, and appnet members that are subscribed to the corresponding topic.

A public DID Document is sent unencrypted. Public DIDs/DID Documents include public keys and service endpoints.

Write access to Hedera Consensus Service DID Topics can be controlled by stipulating a list of public keys for the topic by the DID Controller. Only HCS messages signed by the corresponding private keys will be accepted. A key can be a "threshold key", which means a list of M keys, any N of which must sign in order for the threshold signature to be considered valid. The keys within a threshold signature may themselves be threshold signatures, to allow complex signature requirements.

# 5. Privacy Considerations

A DID Document should not include Personally Identifiable Information (PII).

The identifiers used to identify a subject create a greater risk of correlation when those identifiers are long-lived or used across more than one application domain as those domains could use that shared handle for the subject to share information about that subject without their express consent.

The resolution process may leak PII as the resolver can infer that the Subject presenting the DID is interacting with the verifier resolving the DID.

If DID Controllers want to mitigate the risk of correlation, they should use unique DIDs for every interaction and the corresponding DID Documents should contain a unique public key.

# 6. Reference Implementations

The code at [hashgraph/did-sdk-js](https://github.com/hashgraph/did-sdk-js) is intended to provide a JavaScript SDK for this DID method specification. A set of unit tests and example script commands within this repository present a reference implementation of this DID method.

# 7. References

- [DID Primer](https://github.com/WebOfTrustInfo/rwot5-boston/blob/master/topics-and-advance-readings/did-primer.md)
- [DID Spec](https://w3c.github.io/did-core/)
- <https://github.com/hashgraph/did-sdk-js>
- [Hedera docs](https://docs.hedera.com)
- [Hedera website](https://www.hedera.com)
