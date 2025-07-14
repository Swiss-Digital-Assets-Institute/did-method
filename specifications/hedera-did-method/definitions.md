## Definitions

::: term
**DID Controller**
~ The entity that controls (creates, updates, deactivates) a given DID, as defined in [[spec: DID-CORE]]. In the Hedera DID Method v2.0, control is explicitly defined by the `controller` property within the DID document.
:::

::: term
**HCS Topic**
~ An entity created in the Hedera Consensus Service (HCS) to manage a stream of messages. Each message receives a consensus timestamp and sequence number, providing ordered, immutable records.
:::

::: term
**Hedera Consensus Service (HCS)**
~ A service provided by the Hedera network that provides functionality for publishing arbitrary messages (organized by topics) for consensus, giving each message a trusted timestamp and ordering. HCS offers high throughput, scalability, and low cost.
:::

::: term
**Namespace Specific Identifier (NSI)**
~ The unique identifier portion of a DID that follows the method name. For Hedera DIDs, this includes the network identifier, base58-encoded key component, and HCS topic ID.
:::

::: term
**did-topic-id**
~ A mandatory parameter in the Hedera DID identifier that specifies the HCS Topic ID where messages related to the DID are submitted. Format: `shard.realm.num` (e.g., `0.0.3474905`).
:::

::: term
**Hedera Mirror Node**
~ A public node that provides historical access to HCS messages and other Hedera network data through REST APIs. Used by DID resolvers to retrieve the message history needed to reconstruct DID document state.
:::
