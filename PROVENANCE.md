# TerraWitness Cryptographic Provenance Specification

## 1. Core Cryptographic Principle

TerraWitness rejects unnecessary blockchain complexity and cryptocurrency terminology. Instead, it implements a verifiable, append-only **SHA-256 cryptographic hash chain** embedded directly into the project lifecycle.

Every lifecycle event (creation, upload, fingerprinting, metadata extraction, pairing, alignment, reviewer approval, and export) is sealed into the sequence.

---

## 2. Canonical JSON Serialization

To ensure deterministic hash reproduction across Node.js runtime versions, operating systems, and database engines, all event payloads are serialized through `canonicalJson()`:

1. Object keys are recursively sorted in lexicographical order.
2. Extra whitespace, line breaks, and indentation are omitted.
3. Floating point numbers maintain consistent representation.
4. Null and undefined types are serialized deterministically.

---

## 3. Event Hash Computation

Each event computes its hash digest as:

$$\text{event\_hash} = \text{SHA-256}(\text{previous\_event\_hash} \parallel \text{event\_type} \parallel \text{canonical\_json}(\text{payload}) \parallel \text{timestamp\_utc} \parallel \text{actor\_id} \parallel \text{asset\_hash})$$

* **Delimiter**: Pipe character (`|`)
* **Genesis Initialization**: The initial event of any project specifies `previous_event_hash = "GENESIS"`.
* **State Continuity**: Every subsequent event must point precisely to the `event_hash` of sequence number $N-1$.

---

## 4. Chain Verification Algorithm

When `IntegrityService.verifyChain(projectId)` executes:

1. Retrieves all events ordered by `sequenceNumber ASC`.
2. Verifies that sequence number 1 points to `previousHash = "GENESIS"`.
3. For each event $i$:
   * Verifies that `event[i].previousHash === event[i-1].eventHash`.
   * Re-serializes stored payload via `canonicalJson()`.
   * Recomputes SHA-256 over event fields.
   * Compares recomputed digest with stored `event[i].eventHash`.
4. If all checks match:
   * Returns `status = "INTACT"`
   * Emits latest `rootHash`
5. If any link fails:
   * Returns `status = "INTEGRITY_FAILURE"`
   * Identifies exact `affectedEventId`
   * Explains observed vs expected hash
   * Generates actionable review instruction

---

## 5. Diagnostic Integrity States

* **`INTACT`**: All hashes validate with unbroken chronological continuity.
* **`DERIVED`**: Media asset was generated through an authorized, recorded transformation from an immutable parent asset.
* **`UNVERIFIED`**: Insufficient provenance evidence has been recorded.
* **`REVIEW_REQUIRED`**: Automated anomaly detectors identified metadata or perceptual discrepancies requiring human interpretation.
* **`INTEGRITY_FAILURE`**: Cryptographic sequence or stored byte fingerprints have been modified post-sealing.
