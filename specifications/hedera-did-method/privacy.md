## Privacy Considerations

DID Documents **should not** include Personally Identifiable Information (PII) directly. Information included in a DID document is typically public.

### Correlation Risks

The use of identifiers, particularly public and persistent identifiers like DIDs, can create risks of correlation. When the same DID is used across multiple contexts or interactions, it allows observing parties (including websites, applications, and resolvers) to link those activities together. This correlation can potentially reveal sensitive information about the DID subject's behavior or relationships without their consent.

### Resolution Privacy

The DID resolution process itself can leak information. When a party (the verifier) resolves a DID presented by the DID subject, the resolver learns that the subject is interacting with that specific verifier at that time.

### Mitigation Strategies

To mitigate correlation risks, DID controllers **should** consider using pairwise DIDs – creating a unique DID for each distinct relationship or interaction. Correspondingly, the DID Documents for these pairwise DIDs **should** contain unique public keys and service endpoints specific to that relationship, further compartmentalizing interactions.
