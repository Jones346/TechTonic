// HANDSHAKE: coordinates + text -> verified | ambiguous | failed + evidence

const fs = require('fs');
const path = require('path');

async function defaultOsmIndex(queryCoords, maxDistanceMeters = 100) {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'osmMock.json'), 'utf8'));
  // Return features that are within maxDistanceMeters (mock uses a distance property)
  return data.filter(f => (typeof f.distance === 'number' ? f.distance <= maxDistanceMeters : true));
}

function textMatchesLandmark(feature, userText) {
  if (!feature || !userText) return false;
  const name = (feature.name || '').toLowerCase();
  const text = userText.toLowerCase();
  return name.includes(text) || text.includes(name) || name.split(' ').some(t => text.includes(t) && t.length > 3);
}

function buildRiderInstructionFromFeature(feature) {
  const desc = feature.description || feature.name || feature.tags && Object.values(feature.tags)[0] || 'unnamed feature';
  return `Entrance: ${desc} — approximately ${Math.round(feature.distance || 0)}m from pin. Call on arrival.`;
}

function createHandshakePrompt(context) {
  return `You are given:\n- user coordinates: ${context.coords.lat}, ${context.coords.lon}\n- user landmark text: "${context.userText}"\n- nearby map features (name, type, distance): ${JSON.stringify(context.nearbyFeatures)}\n\nTask:\n1) Based on the nearby features and the user's description, say whether the description plausibly matches a nearby feature.\n2) If yes, produce a 1-2 sentence \"Verified Instruction\" a delivery rider can follow.\n3) If unsure, be explicit and suggest the best fallback (closest named feature with distance).\n\nRespond in JSON:\n{ "plausible": true|false, "confidence": 0.0-1.0, "instruction": "..." }`;
}

function extractJson(text) {
  // very small helper to extract first JSON substring
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start >= 0 && end > start) return text.slice(start, end + 1);
  return text;
}

function parseLlMHandshakeResponse(llmResponse) {
  try {
    const text = llmResponse.text || '';
    const json = JSON.parse(extractJson(text));
    return json;
  } catch (e) {
    return null;
  }
}

async function handshakeValidate(userCoords, userLandmark, { osmIndex = defaultOsmIndex, llmClient = null, maxDistanceMeters = 100 } = {}) {
  // 1) Deterministic spatial index
  const nearby = await osmIndex(userCoords, maxDistanceMeters);

  // 2) Heuristic match: look for textual matches among nearby features
  const matched = nearby.find(f => textMatchesLandmark(f, userLandmark));

  if (matched) {
    return {
      status: 'verified',
      instruction: buildRiderInstructionFromFeature(matched),
      evidence: { matchedFeature: matched }
    };
  }

  // 3) No deterministic match — ask the LLM (if provided)
  if (llmClient && typeof llmClient.generate === 'function') {
    const context = { coords: userCoords, userText: userLandmark, nearbyFeatures: nearby.slice(0, 8) };
    const prompt = createHandshakePrompt(context);
    const llmResponse = await llmClient.generate({ prompt });
    const parsed = parseLlMHandshakeResponse(llmResponse);

    if (parsed && parsed.confidence >= 0.75 && parsed.instruction) {
      return { status: 'verified', instruction: parsed.instruction, evidence: { llm: parsed, nearbyFeatures: nearby } };
    }

    return { status: 'ambiguous', instruction: parsed && parsed.instruction ? parsed.instruction : buildFallbackInstruction(nearby, userLandmark), evidence: { nearbyFeatures: nearby, llmRaw: llmResponse } };
  }

  // 4) No LLM available and no deterministic match
  return { status: 'ambiguous', instruction: buildFallbackInstruction(nearby, userLandmark), evidence: { nearbyFeatures: nearby } };
}

function buildFallbackInstruction(nearby, userLandmark) {
  if (!nearby || nearby.length === 0) return `No nearby named features. Ask customer to provide a photo or alternative landmark.`;
  const closest = nearby.reduce((a, b) => (a.distance < b.distance ? a : b));
  return `Closest named feature: '${closest.name}' ~${Math.round(closest.distance)}m. Ask customer to confirm or provide a photo.`;
}

module.exports = {
  handshakeValidate,
  textMatchesLandmark,
  buildRiderInstructionFromFeature,
  createHandshakePrompt,
  parseLlMHandshakeResponse
};
