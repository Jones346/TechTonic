# LastMile.AI — Solving the "Last 10 Meters" Gap

LastMile.AI is a focused prototype that tackles a common and costly problem in international logistics: the "last 10 meters" — the final stretch between a delivery vehicle and the recipient when formal street addressing is absent or unreliable. This document explains the problem space, the three-node architecture (Warehouse, AI, Rider), and the core "Handshake" logic where spatial data meets human language.

Table of contents
- Problem: the "Last 10 Meters" gap
- Why it matters
- Design principles
- Three-Node Architecture
  - Source (Virtual Mailbox)
  - Destination (Digital Address)
  - Rider Interface
- The Handshake: the AI validation step
  - Concept
  - Runnable reference (example code)
- Privacy, safety, and fallback behaviours
- How to find the Handshake in code
- How to contribute & invite feedback

---

Problem: the "Last 10 Meters" gap

Global e-commerce platforms and international warehouses expect rigid, structured addresses (street number, street name, postal code). In many regions — especially parts of Africa, South Asia, and informal settlements — physical addressing can be informal, landmark-driven, or missing entirely. Users often enter descriptions like:

- "The green house opposite the fuel station"
- "Next to Mama Amina's kiosk, behind the big banyan tree"
- "Third blue gate after the mosque"

Consequences:
- Checkout Rejection — international forms mark addresses as "invalid" because they do not match validation regexes or postal databases.
- Delivery Failure — local riders have local knowledge but lack machine-readable instructions; repeated failed attempts increase operational cost.

Why it matters

Bridging this gap unlocks commerce and convenience for end users and reduces cost for merchants and carriers. A practical solution must be robust to noisy human text, limited or offline connectivity, and privacy constraints.

Design principles

- Pragmatism: solve the rider's problem first — can a human find the customer? — not only database correctness.
- Local-first: accept landmark language as first-class input.
- Explainability: produce concise, actionable instructions for riders.
- Privacy-by-default: minimize PII exposure and use masked channels.

---

Three-Node Architecture

We model the flow as three cooperating nodes that act as a proxy layer between international checkouts and local delivery operations.

1) The Source — Virtual Mailbox
- Purpose: allow international checkouts to complete using a standardized, accepted warehouse-style address.
- Capabilities:
  - One-click form-fill fields that satisfy strict checkout validation.
  - "AI Form-Hacker": parse and normalize warehouse address tokens for different checkout providers.
- Responsibility: ensure parcels clear customs and arrive at a local consolidation point.

2) The Destination — Digital Address
- Purpose: represent the true customer location in a machine- and rider-friendly form.
- Capabilities:
  - High-accuracy GPS pin (user-provided or assisted), plus human landmark text.
  - Normalization layer: cross-reference OpenStreetMap (OSM) and other geospatial datasets and annotate nearby features (fuel stations, mosques, shops, gates, trees).
  - Labeled "Verified Instructions": short, prioritized steps a rider can follow (e.g., "Gate with red corrugated metal; call on arrival; knock twice").
- Responsibility: convert free-text and coordinates into a small navigation packet.

3) The Rider Interface
- Purpose: deliver the navigation packet to riders in the field with resilience to intermittent connectivity.
- Capabilities:
  - Offline-first navigation packet that bundles vector tiles or small map extracts, the verified instructions, and a minimal contact channel (masked numbers, one-touch call).
  - Feedback loop: rider can flag "unverified landmark" so the AI can improve future validation.
- Responsibility: enable successful handoffs and allow graceful fallbacks (e.g., rendezvous points).

---

The Handshake: where AI validates human landmarks against spatial data

Concept

The Handshake is the decision point where the system decides whether the user's textual landmark matches the geospatial context around the provided coordinates. It combines deterministic checks (is there a named fuel station within N meters?) with a restrained LLM step that interprets ambiguous human language and synthesizes clear, rider-friendly instructions.

Goals of the Handshake:
- Verify the claimed landmark exists (or an acceptable equivalent exists).
- Produce a short, confident "Verified Instruction" for a rider.
- If verification fails, propose safe fallbacks (closest known landmark, ask for a photo, request confirmation).

Runnable reference

See the example in the repository under examples/handshake. It contains a small OSM mock, a deterministic matching step, a simple LLM mock used for disambiguation, and Jest tests demonstrating verified and ambiguous outcomes.

---

Privacy, safety, and fallback behaviours

- Mask customer phone numbers and use a brokered call system to avoid exposing personal numbers.
- Only store minimal PII required for delivery and obey local data-retention policies.
- When in doubt, prefer rendezvous points or ask the customer for a photo/confirmation.
- Rate-limit LLM calls and cache recent verifications for identical (or very similar) text+coords.

How to find the Handshake in code

Look for the function where GPS coordinates and the user's natural-language description come together. We typically label that function as "handshake", "validateLandmark", or "generateVerifiedAddress". It usually:
- Accepts both coordinates and free-text landmark input,
- Queries a spatial data source (OSM or a local index),
- Produces a short "Verified Instruction" or an explicit ambiguity/fallback response.

Add an explicit comment to identify the function, for example:
// HANDSHAKE: coordinates + text → verified | ambiguous | failed + evidence

How to contribute & invite feedback

- Try the Handshake pattern on real or synthetic datasets and report false positives/negatives.
- Share edge cases from local addressing systems we might not have considered.
- Suggest performance, privacy, or UX improvements (smaller prompts, different confidence thresholds, offline similarity indices).
- Open a PR with an implementation that integrates an OSM snapshot, a small vector index, or a simulated rider UX.

For discussion, open an issue or start a Discussion in this repo titled "LastMile.AI — Handshake: edge cases & evaluation." Include sample coordinates and raw landmark text (anonymized or synthetic).

---

Final note

The LastMile problem is less about perfect geocoding and more about usable instructions for a human in the field. By combining deterministic spatial checks with careful, auditable LLM interpretation, we can move from repeated failed deliveries to confident handoffs — and do so without exposing customer data or demanding perfect addresses up front.

We welcome your experiences, edge cases, and ideas for improving the Handshake.

License: MIT
