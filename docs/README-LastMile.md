# LastMile.AI — Example: Handshake Runnable Reference

This folder contains a runnable handshake example demonstrating the deterministic + LLM pattern for validating human landmarks against nearby spatial data.

Quick start

1. cd examples/handshake
2. npm install
3. npm test

What you get
- A small OSM mock (osmMock.json)
- A deterministic spatial check that finds named nearby features
- A simple LLM mock used for disambiguation (llmMock.js)
- Tests demonstrating verified and ambiguous outcomes

Notes
- The example is intentionally minimal and synchronous-friendly for teaching and testing.
- Replace the LLM mock with a real LLM client in production, and replace the OSM mock with a spatial index or an OSM tile extract.

Contributing
- Open an issue or PR in this repository with edge cases, performance suggestions, or improved examples.

License: MIT
