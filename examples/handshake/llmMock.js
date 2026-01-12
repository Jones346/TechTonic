// Simple LLM mock used for tests. It inspects nearby features and user text
// and returns a deterministic JSON response that mimics an LLM's output.

module.exports = {
  async generate({ prompt }) {
    // Basic heuristic: if one of the feature names is contained in prompt, return high confidence
    const lower = prompt.toLowerCase();
    if (lower.includes('mama amina') || lower.includes('mama') || lower.includes('amina')) {
      return {
        text: JSON.stringify({ plausible: true, confidence: 0.9, instruction: "Entrance: next to 'Mama Amina Kiosk' (blue sign). Call customer on arrival." })
      };
    }

    if (lower.includes('fuel') || lower.includes('station')) {
      return {
        text: JSON.stringify({ plausible: true, confidence: 0.8, instruction: "Landmark: fuel station canopy. Park near the pump and call the customer." })
      };
    }

    // Ambiguous fallback
    return { text: JSON.stringify({ plausible: false, confidence: 0.4, instruction: "Closest named feature: 'Fuel Station' ~30m. Request photo or confirm landmark." }) };
  }
};
