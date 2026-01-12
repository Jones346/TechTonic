# LastMile.AI — Handshake Example & Technical Write-up

This repository contains a focused prototype and technical write-up for addressing the "last 10 meters" delivery problem in regions with informal or landmark-based addressing.

Highlights
- docs/LastMile.AI-Technical-Writeup.md — Full technical write-up and architecture.
- examples/handshake — Runnable handshake example (OSM mock, LLM mock, Jest tests).
- Purpose: demonstrate a pragmatic deterministic + LLM pattern that verifies human landmarks against nearby spatial features and synthesizes rider-friendly instructions.

Quick start (examples/handshake)
1. cd examples/handshake
2. npm install
3. npm test

What to look for
- HANDSHAKE function: combines coordinates + free-text landmark → verified | ambiguous | failed + evidence.
- Deterministic checks first (OSM/local index), LLM only for disambiguation.
- Evidence/provenance recorded for auditing.

Contributing
- Try the example with real or synthetic datasets and open issues with edge cases.
- Replace the LLM mock with a real provider and the OSM mock with a spatial index for integration tests.
- Suggestions and PRs welcome.

License: MIT
