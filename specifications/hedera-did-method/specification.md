## Hedera Hashgraph DID Method Specification

### About Hedera Hashgraph

[Hedera](https://hedera.com/) [Hashgraph](https://github.com/hashgraph) is a public, open-source, proof-of-stake network that utilizes the hashgraph consensus algorithm. It offers high throughput, low fees, and finality in seconds for various services, including the Hedera Consensus Service (HCS) leveraged by this DID method.

### Motivation

Version 1.0 of the Hedera DID Method established a functional DID method on Hedera using HCS but tied DID control rigidly to the key embedded in the identifier (referred to as `#did-root-key` logic). This deviated from the standard W3C controller model, creating significant limitations:

- **Deviation from W3C Standard:** Hindered interoperability with standard DID tools, libraries, and platforms expecting the `controller` property to define authority.
- **Rigid Control:** Made rotation of the primary controlling key difficult or impossible without changing the DID identifier itself, complicating security best practices (like key rotation) and delegation scenarios.
  - *Example:* Under v1.0, a compromised `<base58btc-key>` requires changing the DID identifier entirely to revoke control, disrupting existing integrations. v2.0 allows key rotation via the `controller` property without altering the DID identifier.
- **Limited Multi-Controller Support:** The v1.0 model's focus on a single identifier-linked key made native support for multiple controllers, common in organizational or delegated scenarios, cumbersome.

Hedera DID Method v2.0 aims to rectify these issues by fully adopting the standard W3C controller pattern for authorization. This change occurs *while retaining the established v1.0 identifier format* to ensure naming continuity for existing DID concepts on Hedera. The result is a more flexible, robust, secure, and interoperable DID method aligned with global standards.

::: note
This specification defines a new ruleset (v2.0). Existing v1.0 DIDs remain under v1.0 rules; new DIDs **must** be created under v2.0 rules to benefit from the W3C-aligned control mechanism. There is no in-place upgrade path from v1.0 to v2.0 for an existing DID identifier.
:::

### Method Name

The namestring that **shall** identify this DID method is: `hedera`

A DID that uses this method **must** begin with the following prefix: `did:hedera:`. Per the [[spec: DID-CORE]] specification, this string **must** be in lowercase. The remainder of the DID, after the prefix, is the Namespace Specific Identifier (NSI) specified below. This section defines the identifier format, which remains consistent between v1.0 and v2.0 of this method.

### Namespace Specific Identifier (NSI)

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

::: example DID Identifier Example
```text
did:hedera:mainnet:z52k2w6rFF9xxzvmSiuyqwJS8b7oFnDtk8S3bhY4YbnJq_0.0.3474905
```
:::

The method-specific identifier (`hedera-specific-idstring` combined with `hedera-specific-parameters`) consists of:

- A Hedera network identifier (`mainnet` or `testnet`).
- A Base58 bitcoin encoded value (`hedera-base58btc-key`), typically derived from the public key used during the initial creation of the DID. **Crucially, under the v2.0 rules defined in this specification, this `<base58btc-key>` component serves *only as part of the unique identifier* after creation and does not grant ongoing control authority over the DID.**
- A Hedera Topic ID (`did-topic-id`), separated by an underscore (`_`), identifying the Hedera Consensus Service (HCS) topic used for messages related to this DID.

Control and authorization for managing the DID under v2.0 are determined solely by the `controller` property within the DID document and verified via cryptographic `proof` mechanisms submitted in HCS messages (detailed in the CRUD Operations section), aligning with the [[spec: DID-CORE]] specification. The v1.0 concept of a mandatory `#did-root-key` intrinsically linked to the identifier for control is superseded in v2.0.

::: example DID Document Structure (v2.0)
The following example illustrates the structure of a DID document under v2.0 rules. The `controller` property defines authority. While a verification method like `#key-1` might use a key related to the identifier's `<base58btc-key>` component, this method holds no special control privileges granted by this DID method specification itself. Authorization relies on proofs generated by keys authorized by the `controller`(s) for specific capabilities (like `capabilityInvocation`).

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
:::

### Method-Specific DID URL Parameters

#### Mandatory Identifier Parameter

There is one method-specific parameter that is a **mandatory** component of the NSI:

- `did-topic-id` - a mandatory parameter, separated from the `hedera-specific-idstring` by an underscore (`_`), that defines the TopicID of the Hedera Consensus Service (HCS) topic to which messages for a particular DID are submitted. This allows resolvers to locate the relevant HCS message stream via Hedera mirror nodes.

A Hedera TopicID is a triplet of numbers (shard.realm.num), e.g., `0.0.29656231`, represents topic identifier `29656231` within realm `0` and shard `0`. Realms and shards are Hedera network constructs; currently, all topics reside in shard 0 and realm 0.

#### Optional Version Resolution Parameters

The Hedera DID method supports two **optional** DID URL query parameters for version-specific resolution, conforming to the [[spec: DID-RESOLUTION]] specification:

- `versionId` - an optional parameter that specifies the sequence number of the last HCS message chunk that should be considered when resolving the DID document. This parameter enables resolution to a specific point in the DID's history based on the message sequence number.

- `versionTime` - an optional parameter that specifies the consensus timestamp of the HCS message transaction that should be considered when resolving the DID document. This parameter enables resolution to a specific point in time in the DID's history. The timestamp format **must** conform to ISO 8601 (e.g., `2025-07-14T19:10:00-03:00`).

**Version Resolution Behavior:**

When either `versionId` or `versionTime` is specified in a DID URL, resolvers **must** return the DID document state as it existed at that specific point in the DID's history. If neither parameter is present, the resolver returns the latest version of the DID document.

**Version Parameter Precedence:**

If both `versionId` and `versionTime` are specified in the same DID URL, the `versionId` parameter **must** take precedence.

::: example Version Resolution Examples
```text
# Resolve to a specific sequence number
did:hedera:testnet:z6MkipomYgdGz1MXBm5ZJNVNVqTgumeMboAy3fCpd_0.0.645701?versionId=5

# Resolve to a specific point in time
did:hedera:testnet:z6MkipomYgdGz1MXBm5ZJNVNVqTgumeMboAy3fCpd_0.0.645701?versionTime=2025-07-14T22:10:00Z
```
:::

### Topic Association Models

The `did-topic-id` parameter allows for flexibility in how DID operations are logged on HCS. The choice between these models is left to the implementer or DID controller, and involves trade-offs between cost and performance.

#### Dedicated Topic Model (One Topic per DID)

- **Cost:** This model requires a distinct `ConsensusCreateTopicTransaction` for each DID, incurring the associated network fee for every DID created. This can become a significant factor for applications needing to provision thousands or millions of DIDs.
- **Resolution Performance:** This approach offers optimal resolution performance. When a resolver queries the topic associated with a specific DID, it can be confident that every message on that topic is relevant. This leads to faster lookup times, lower data transfer from mirror nodes, and reduced computational load.
- **Isolation:** It provides strong logical isolation. The activity on one DID's topic does not interfere with another's, simplifying monitoring and reducing the "noise" a resolver must process.

#### Shared Topic Model (Many DIDs per Topic)

- **Cost:** This is the primary benefit. A single HCS topic can be created once, and its ID can be reused in the identifiers of many DIDs. This dramatically reduces on-chain creation costs, making it highly suitable for applications that manage large volumes of DIDs (e.g., for IoT devices or customers).
- **Resolution Performance:** The trade-off is a potential decrease in resolution performance. A resolver must fetch all messages from the shared topic and perform a critical first filtering step by inspecting the top-level `did` property on every message, discarding those not relevant to the target DID. This can increase data transfer, memory usage, and CPU load on the resolver, especially for topics with very high message throughput.
- **Use Case:** This model is ideal for systems where cost-efficiency for DID provisioning at scale is a higher priority than per-resolution performance, and where a single entity manages the related cohort of DIDs.

### CRUD Operations

Create, Update, and Deactivate operations against a DID Document under the v2.0 ruleset are performed by submitting authorized messages to the DID's associated Hedera Consensus Service (HCS) topic. Authorization **must** be achieved via cryptographic proofs linked to the DID's designated controller(s), as detailed below.

![CRUD Flow](../../images/crud.flow.drawio.svg)

The Read operation (resolution) of a DID document **must** occur by querying a Hedera mirror node for the HCS topic history and reconstructing the state based on the ordered, authorized messages.

![Read Flow](../../images/read.flow.drawio.svg)

#### Message Structure

A valid v2.0 HCS message payload for Create, Update, or Deactivate operations **must** be a JSON object containing at least the following top-level fields:

- `version`: **must** be the string `"2.0"` to identify the ruleset version being used.
- `did`: A string containing the full DID to which the operation applies (e.g., `"did:hedera:testnet:..."`). This field **must** be present for all operations. For `create` and `update` operations, its value **must** match the `id` property within the `didDocument`.
- `operation`: A string indicating the operation type. Values **must** include `"create"`, `"update"`, or `"deactivate"`. (Note: `"update"` covers modifications to the DID document, potentially including adding or removing properties like verification methods or services, effectively replacing the specific "revoke property" concept from v1.0).
- `proof`: A mandatory `proof` object whose structure and processing model **must** be based on the [[spec: VC-DATA-INTEGRITY]] specification.
  - It **must** conform to a specific Data Integrity cryptosuite specification (e.g., `eddsa-jcs-2022`, `bbs-2023`).
  - This `proof` authorizes the operation and **must** be verifiable against a verification method associated with the DID's current designated `controller`(s).
  - The `proof` **must** include a `proofPurpose` such as `"capabilityInvocation"` to specify that the proof's verification method is being used by the controller to invoke the cryptographic capability of managing the DID document (e.g., creating, updating, or deactivating it).
- **Operation Payload Fields:** Additional fields specific to the `operation`. For instance:
  - `"create"` operations **must** include a `didDocument` field containing the initial DID Document.
  - `"update"` operations **must** include a `didDocument` field containing the *complete* proposed new state of the DID Document after the update.
  - `"deactivate"` operations **may** omit additional payload fields beyond the core `version`, `operation`, `did`, and `proof`.

::: note
Including a mandatory, top-level `did` field provides an unambiguous subject for every operation at the message envelope level. While this information is redundant for `create` and `update` operations (where it **must** match the `id` in the `didDocument`), it is essential for operations like `deactivate`, where the message payload does not contain a `didDocument`. This ensures the target of a deactivation is always explicit within the message itself.

The mandatory `did` property also significantly improves resolver efficiency, particularly in a **Shared Topic Model**. When multiple DIDs log their operations to the same HCS topic, a resolver must filter through all messages to find those relevant to the specific DID it is resolving. The top-level `did` field allows a resolver to perform this filtering by checking a simple string value first. If the `did` does not match the target DID being resolved, the resolver can immediately discard the message without needing to parse the potentially large and complex `didDocument` object within the payload. This acts as an efficient "fast-lane" filter, reducing computational overhead.
:::

::: example Create Operation Message
The following example is illustrative. Specific values like DIDs, keys, timestamps, and proof values will vary.

```json
{
  "version": "2.0",
  "did": "did:hedera:testnet:z6MkipomYgdGz1MXBm5ZJNVNVqTgumeMboAy3fCpd_0.0.645701",
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
:::

#### Validation and Authorization

Neither Hedera network nodes nor standard mirror nodes validate the semantics of DID documents or the cryptographic proofs within HCS messages against the DID logic. This validation **must** be performed by DID resolvers and client applications according to the v2.0 specification rules. Specifically, resolvers **must**:

- Process HCS messages in the strict order determined by their consensus timestamp and sequence number. In cases of conflicting messages within the same consensus second, the message with the lower sequence number **must** take precedence.
- Verify that the `version` field is `"2.0"`. Messages with other versions **must** be processed according to their respective version specifications or ignored if unsupported.
- Verify the cryptographic `proof` accompanying each operation against the verification method specified in the proof, ensuring that this verification method is authorized by the DID's designated `controller`(s) *at that point in time according to the processed message history*. The specific validation rules depend on the operation type.
- Validate that the top-level `did` field in the HCS message matches the `didDocument.id` when the `didDocument` property is present.
- Reject any message with a missing, invalid, or unverifiable `proof`, or a proof generated by an unauthorized key (i.e., a key not associated with the controller for the specified `proofPurpose` at that time).
- When processing an update that changes the `controller` property itself, validate the operation's `proof` against the *previous* (currently authorized) controller's keys.

#### HCS Topic Access Control vs. DID Control

It is the responsibility of the entity managing the DID (the controller or their delegate) to manage access to the associated HCS topic. Access control for *submitting messages* to the HCS topic is defined by the topic's `submitKey` property, managed via Hedera's `ConsensusUpdateTopicTransaction`.

- **Crucially, the HCS `submitKey` only grants network-level permission to submit messages (which could be valid or invalid according to DID rules) to the topic. It does not grant logical authorization to modify the DID state.**
- Logical authorization to perform valid DID operations (`create`, `update`, `deactivate`) **must** be established via a valid cryptographic `proof` generated by the DID's designated `controller`, as described above.
- If no `submitKey` is defined for a topic, any party can submit messages. However, only messages containing valid proofs from the authorized controller will result in state changes when processed by a conforming DID resolver. Detailed information on Hedera Consensus Service APIs can be found in the official [Hedera API documentation](https://docs.hedera.com/hedera/api).

::: note
Hedera Consensus Service messages have a size limit per transaction. However, the official Hedera SDKs automatically handle segmentation (chunking) of messages larger than the single transaction limit, allowing for the submission of typical DID documents and proofs without manual chunking in most cases. Developers **should** generally use the standard SDK functions for message submission.
:::

### Operations

#### Create

A DID is created under the v2.0 ruleset by sending a `ConsensusSubmitMessage` transaction to a Hedera network node containing the initial DID document and an authorization proof from the designated controller. This is executed by sending a `submitMessage` RPC call (or equivalent SDK function) to the HCS API with the `ConsensusSubmitMessageTransactionBody` containing:

- `topicID`: The HCS Topic ID specified in the `did-topic-id` parameter of the DID being created.
- `message`: The HCS message payload, which **must** be the valid JSON object described above, specifically structured for a `create` operation:
  - The `version` field **must** be `"2.0"`.
  - The `did` field **must** be present and match the `id` field within the `didDocument`.
  - The `operation` field **must** be `"create"`.
  - A `didDocument` field **must** be present, containing the complete initial state of the DID Document. This document **must** include at least the `id` (matching the `did` field) and the initial `controller` property designating who controls this DID.
  - A `proof` field **must** be present. This proof **must** cryptographically verify the integrity of the message contents and provide authorization. The proof **must** be generated using the private key corresponding to the public key specified in the `proof.verificationMethod` field. This verification method **must** be associated with the `controller` designated within the `didDocument` payload of this *same message*. This proof demonstrates the controller invoking their capability (e.g., indicated by `proofPurpose: "capabilityInvocation"`) to authorize the creation of the DID.

#### Read (Resolve)

Resolving a `did:hedera` DID under v2.0 rules involves querying the HCS topic history associated with the DID's `did-topic-id` and reconstructing the DID document's state by processing authorized messages in consensus order. The process **must** follow these steps:

1. **Parse DID URL Parameters:** Extract any optional version resolution parameters (`versionId` or `versionTime`) from the DID URL if present.
2. **Fetch History:** Retrieve all messages from the specified HCS `topicID` via a Hedera mirror node.
3. **Order Messages:** Sort the retrieved messages strictly according to their consensus timestamp and sequence number (lower sequence number first for messages within the same second).
4. **Determine Resolution Point:** Based on the version parameters:
   - If `versionId` is specified, identify the message with that sequence number as the resolution endpoint.
   - If `versionTime` is specified, identify the last message with a consensus timestamp less than or equal to the specified time as the resolution endpoint.
   - If neither parameter is present, the resolution endpoint is the last message in the topic.
   - If both parameters are specified, `versionId` **must** take precedence.
5. **Process Sequentially:** Iterate through the ordered messages up to the determined resolution point, maintaining the current known state of the DID document (initially null) and the current authorized controller(s) (initially null). For each message:
   1. **Check Version:** Verify if the message payload is a JSON object with a `version` field equal to `"2.0"`. If not, or if the message is malformed, ignore it.
   2. **Filter by DID:** If the message has a top-level `did` property, verify that it matches the DID being resolved. If it does not, ignore this message.
   3. **Validate Proof:**
      - If the `operation` is `create`, the `proof` **must** be validated against a verification method associated with the `controller` specified *within the `didDocument` payload of this create message itself*.
      - If the `operation` is `update` or `deactivate`, the `proof` **must** be validated against a verification method associated with the *current known controller(s)* established by prior valid messages in the sequence.
      - If the `proof` field is missing, malformed, or fails validation, the message **must** be considered invalid and ignored.
   4. **Apply Operation (if proof is valid):**
      - **`create`:** If the current state is null, parse the `didDocument` from the payload. This becomes the initial valid state. Record the `controller`(s) defined within this document. If a state already exists, this subsequent `create` message **should** be ignored.
      - **`update`:** Replace the entire current known state of the DID document with the `didDocument` provided in the message payload. Update the record of the current `controller`(s) based on the `controller` property in this new document state.
      - **`deactivate`:** Mark the DID as deactivated. Subsequent `update` operations **must** be ignored.
   5. **Check Resolution Endpoint:** If the current message reaches the resolution endpoint, stop processing.
6. **Return Result:** After processing messages:
   - If the DID was marked as deactivated, the resolver **must** return a result indicating the deactivated status.
   - Otherwise, return the final reconstructed state of the DID document.
   - If no valid `create` message was found within the resolution scope, the resolver **must** return an error (e.g., `notFound`).
   - Include version metadata in the resolution result (the actual sequence number and timestamp of the resolved state).

#### Update

An existing DID document is updated under the v2.0 ruleset by submitting a `ConsensusSubmitMessage` transaction containing the complete new state of the document and an authorization proof from the current controller. This is executed by sending a `submitMessage` RPC call (or equivalent SDK function) to the HCS API with the `ConsensusSubmitMessageTransactionBody` containing:

- `topicID`: The HCS Topic ID specified in the `did-topic-id` parameter of the DID being updated.
- `message`: The HCS message payload, which **must** be a valid JSON object as described above, specifically structured for an `update` operation:
  - The `version` field **must** be `"2.0"`.
  - The `did` field **must** be present and identify the DID being updated.
  - The `operation` field **must** be `"update"`.
  - A `didDocument` field **must** be present, containing the **complete desired state** of the DID Document *after* the update. Modifications, additions, or removals of properties (like `verificationMethod`, `service`, or changing the `controller`) **must** be achieved by providing the full document reflecting this new state. Partial updates are not supported at the message level; the entire document state **must** be provided.
  - A `proof` field **must** be present. This proof **must** be valid and demonstrate the **current `controller`(s)** (i.e., the controller(s) authorized *before* this update is applied) invoking their capability to authorize the update. This is typically indicated by a `proofPurpose` of `"capabilityInvocation"` and generated using a verification method associated with that controller for this purpose.

#### Deactivate

A DID document is deactivated under the v2.0 ruleset (marking it as no longer valid or resolvable to a current state) by submitting a `ConsensusSubmitMessage` transaction authorized by the current controller. This is executed by sending a `submitMessage` RPC call (or equivalent SDK function) to the HCS API with the `ConsensusSubmitMessageTransactionBody` containing:

- `topicID`: The HCS Topic ID specified in the `did-topic-id` parameter of the DID being deactivated.
- `message`: The HCS message payload, which **must** be a valid JSON object as described above, specifically structured for a `deactivate` operation:
  - The `version` field **must** be `"2.0"`.
  - The `did` field **must** be present and identify the DID being deactivated.
  - The `operation` field **must** be `"deactivate"`.
  - A `proof` field **must** be present. This proof **must** be valid and demonstrate the **current `controller`(s)** invoking their capability to authorize the deactivation. This is typically indicated by a `proofPurpose` of `"capabilityInvocation"` and generated using a verification method associated with that controller for this purpose.
  - Any additional payload fields beyond `version`, `did`, `operation`, and `proof` **may** be ignored by resolvers processing the deactivation.
