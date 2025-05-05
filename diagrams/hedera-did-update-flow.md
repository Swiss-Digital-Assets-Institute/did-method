# Hedera DID Update Flow

This sequence diagram illustrates the process of updating an existing Decentralized Identifier (DID) document on the Hedera network. The diagram shows how a DID Controller can request modifications such as adding or removing keys, updating services, or changing the controller. It highlights the critical requirement that proof must be generated using the current controller's key from the existing document. The flow demonstrates how the DID SDK resolves the current document state, prepares the updated document, builds a proper proof object, and submits the update message to the Hedera Consensus Service (HCS), resulting in an updated DID document.

```mermaid
sequenceDiagram
    title Hedera DID Update Flow (v2.0)

    participant Controller as DID Controller
    participant SDK as DID SDK
    participant Resolver as DID Resolver
    participant Mirror as Hedera Mirror Node
    participant Hedera as Hedera Network Node

    Note over Controller: Wants to update an existing DID document

    Controller->>SDK: Update DID request<br/>(add/remove keys, services, change controller, etc.)

    SDK->>Resolver: Resolve current DID document state
    Resolver->>Mirror: Query topicID history
    Mirror->>Resolver: Return ordered messages
    Resolver->>SDK: Return current DID document

    Note over SDK: Prepare updated DID Document<br/>with desired changes

    Note over SDK: IMPORTANT: Generate proof using key from<br/>CURRENT controller(s) in existing document

    SDK->>SDK: Build proof object:
    Note over SDK: 1. Select verification method from current document<br/>that's associated with the controller<br/>2. Set proofPurpose "capabilityInvocation"<br/>3. Add created timestamp<br/>4. Calculate proof value by signing operation data<br/>using the controller's private key

    SDK->>SDK: Construct HCS message payload:
    Note over SDK: {<br/>  "version": "2.0",<br/>  "operation": "update",<br/>  "didDocument": { complete updated document },<br/>  "proof": {<br/>    "type": "Ed25519Signature2020",<br/>    "created": "2023-01-01T12:00:00Z",<br/>    "verificationMethod": "did:hedera:...#key-1",<br/>    "proofPurpose": "capabilityInvocation",<br/>    "proofValue": "z58j9..."<br/>  }<br/>}

    SDK->>Hedera: Submit ConsensusSubmitMessage<br/>with payload to topicID
    Hedera->>SDK: Return transaction receipt

    Note over Hedera: HCS processes transaction<br/>and records message with<br/>consensus timestamp

    Hedera-->>Mirror: Synchronize message data

    Note over Controller: DID document is now updated
```
