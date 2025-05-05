# Hedera DID Deactivation Flow

This sequence diagram demonstrates the process of deactivating an existing Decentralized Identifier (DID) on the Hedera network. The diagram shows the interaction between the DID Controller, DID SDK, DID Resolver, and Hedera network components. It outlines how the current DID document state is resolved before deactivation, the importance of verifying the DID is currently active, and the process of building a proof object using the controller's private key. The diagram illustrates how a deactivation message is constructed and submitted to the Hedera Consensus Service (HCS), resulting in the permanent deactivation of the DID.

```mermaid
sequenceDiagram
    title Hedera DID Deactivation Flow (v2.0)

    participant Controller as DID Controller
    participant SDK as DID SDK
    participant Resolver as DID Resolver
    participant Mirror as Hedera Mirror Node
    participant Hedera as Hedera Network Node

    Note over Controller: Wants to deactivate an existing DID

    Controller->>SDK: Deactivate DID request

    SDK->>Resolver: Resolve current DID document state
    Resolver->>Mirror: Query topicID history
    Mirror->>Resolver: Return ordered messages
    Resolver->>SDK: Return current DID document

    Note over SDK: IMPORTANT: DID must be currently active<br/>and not previously deactivated

    SDK->>SDK: Build proof object:
    Note over SDK: 1. Select verification method from current document<br/>that's associated with the controller<br/>2. Set proofPurpose "capabilityInvocation"<br/>3. Add created timestamp<br/>4. Calculate proof value by signing operation data<br/>using the controller's private key

    SDK->>SDK: Construct HCS message payload:
    Note over SDK: {<br/>  "version": "2.0",<br/>  "operation": "deactivate",<br/>  "proof": {<br/>    "type": "Ed25519Signature2020",<br/>    "created": "2023-01-01T12:00:00Z",<br/>    "verificationMethod": "did:hedera:...#key-1",<br/>    "proofPurpose": "capabilityInvocation",<br/>    "proofValue": "z58j9..."<br/>  }<br/>}

    SDK->>Hedera: Submit ConsensusSubmitMessage<br/>with payload to topicID
    Hedera->>SDK: Return transaction receipt

    Note over Hedera: HCS processes transaction<br/>and records message with<br/>consensus timestamp

    Hedera-->>Mirror: Synchronize message data

    Note over Controller: DID is now deactivated
```
