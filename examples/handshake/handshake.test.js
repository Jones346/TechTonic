const path = require('path');
const osmMock = require('./osmMock.json');
const llmMock = require('./llmMock');
const { handshakeValidate } = require('./handshake');

describe('handshakeValidate', () => {
  test('deterministic match returns verified', async () => {
    const coords = { lat: -1.2921, lon: 36.8219 };
    const landmark = 'Mama Amina Kiosk';

    const result = await handshakeValidate(coords, landmark, { osmIndex: async () => osmMock });

    expect(result.status).toBe('verified');
    expect(result.instruction).toContain('Mama Amina');
    expect(result.evidence.matchedFeature).toBeDefined();
  });

  test('llm disambiguates when deterministic fails', async () => {
    const coords = { lat: -1.2921, lon: 36.8219 };
    const landmark = 'near the fuel station';

    const result = await handshakeValidate(coords, landmark, { osmIndex: async () => osmMock, llmClient: llmMock });

    expect(['verified', 'ambiguous']).toContain(result.status);
    expect(result.instruction).toBeDefined();
  });

  test('ambiguous when nothing matches and no llm', async () => {
    const coords = { lat: -1.2921, lon: 36.8219 };
    const landmark = 'an unknown name that does not match';

    const result = await handshakeValidate(coords, landmark, { osmIndex: async () => osmMock });

    expect(result.status).toBe('ambiguous');
    expect(result.instruction).toContain('Closest named feature');
  });
});
