# Hedera DID Creation Flow

This sequence diagram illustrates the process of creating a new Decentralized Identifier (DID) on the Hedera network. The flow shows how a DID Controller interacts with the DID SDK to generate cryptographic keys, construct the DID identifier, create a Hedera Consensus Service (HCS) topic if needed, and prepare the initial DID Document. The diagram highlights how proof is generated using the controller's key and how the message payload is submitted to the Hedera network, ultimately resulting in a fully created DID that's defined by its controller property rather than the identifier key itself.

```mermaid
sequenceDiagram
    title Hedera DID Creation Flow (v2.0)

    participant Controller as DID Controller
    participant SDK as DID SDK
    participant Hedera as Hedera Network Node
    participant Mirror as Hedera Mirror Node
    participant Resolver as DID Resolver

    Note over Controller: Wants to create a new DID

    Controller->>SDK: Create new DID request

    Note over SDK: 1. Generate key pair(s)
    Note over SDK: 2. Construct DID identifier<br/>did:hedera:{network}:{base58btc-key}_{topic-id}
    Note over SDK: 3. Create HCS topic (if needed)
    Note over SDK: 4. Prepare initial DID Document<br/>with controller property

    SDK->>SDK: Generate proof for create operation<br/>using controller's key

    SDK->>SDK: Construct HCS message payload:
    Note over SDK: {<br/>  "version": "2.0",<br/>  "operation": "create",<br/>  "didDocument": { initial document },<br/>  "proof": { proof object }<br/>}

    SDK->>Hedera: Submit ConsensusSubmitMessage<br/>with payload to topicID
    Hedera->>SDK: Return transaction receipt

    Note over Hedera: HCS processes transaction<br/>and records message with<br/>consensus timestamp

    Hedera-->>Mirror: Synchronize message data

    Note over Controller: DID is now created<br/>Control is defined by controller<br/>property, not the identifier key
```
