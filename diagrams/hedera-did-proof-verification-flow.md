# Hedera DID Proof Verification Flow

This flowchart illustrates the systematic process for verifying cryptographic proofs within Hedera DID operations. The diagram presents a step-by-step validation sequence that checks for the presence of a proof object, validates required fields (type, created, verificationMethod, and proofValue), confirms the cryptosuite is supported, and verifies the proof purpose is set to "capabilityInvocation." The flow then resolves the controller DID to access verification methods, prepares verification data based on the cryptosuite, and validates the signature. Each validation step has clear error paths, ensuring thorough verification before confirming a DID operation as authentic.

```mermaid
flowchart TD
    start([Start Proof Verification]) --> checkProofObj{Does message
    contain proof object?}

    checkProofObj -- No --> invalid(Return Invalid:
    Missing proof)

    checkProofObj -- Yes --> checkRequiredFields{Does proof have
    required fields?
    type, created,
    verificationMethod, proofValue}

    checkRequiredFields -- No --> invalid2(Return Invalid:
    Missing required fields)

    checkRequiredFields -- Yes --> checkProofType{Is proof.type a
    supported cryptosuite?
    e.g., Ed25519Signature2020}

    checkProofType -- No --> invalid3(Return Invalid:
    Unsupported cryptosuite)

    checkProofType -- Yes --> checkProofPurpose{Is proof.proofPurpose
    set to capabilityInvocation?}

    checkProofPurpose -- No --> invalid4(Return Invalid:
    Incorrect proof purpose)

    checkProofPurpose -- Yes --> resolveController[Resolve controller DID
    to get verification methods]

    resolveController --> findVerificationMethod{Does controller have
    verification method matching
    proof.verificationMethod?}

    findVerificationMethod -- No --> invalid5(Return Invalid:
    Verification method not found)

    findVerificationMethod -- Yes --> prepareDataToVerify[
    1.Create verification data based on used cryptosuite
    2.Extract signature from proofValue]

    prepareDataToVerify --> verification[Verify verification data with extracted signature]

    verification --> verificationResult{Is signature valid?}

    verificationResult -- No --> invalid6(Return Invalid:
    Verification failed)

    verificationResult -- Yes --> returnData(
    Return verified=true and verified document)

```
