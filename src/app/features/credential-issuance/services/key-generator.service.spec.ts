import { KeyGeneratorService } from './key-generator.service';

describe('KeyGeneratorService', () => {
  let service: KeyGeneratorService;

  beforeEach(() => {
    service = new KeyGeneratorService();
  });

  it('should have initial state undefined and displayedKeys$ returns partial with undefined', () => {
    // Initially, no keys are set
    expect(service.getState()()).toBeUndefined();
    // displayedKeys$ should return only desmosPrivateKeyValue as undefined
    expect(service.displayedKeys$()).toEqual({ desmosPrivateKeyValue: undefined });
  });

  it('should update desmosPrivateKeyValue correctly', () => {
    // Update the private key value
    service.updateState('desmosPrivateKeyValue', 'abc');
    // State should include the new private key
    expect(service.getState()()).toMatchObject({ desmosPrivateKeyValue: 'abc' });
    // displayedKeys$ should reflect the new private key
    expect(service.displayedKeys$()).toEqual({ desmosPrivateKeyValue: 'abc' });
  });

  it('should update desmosDidKeyValue correctly', () => {
    // Update the DID key value
    service.updateState('desmosDidKeyValue', 'did:abc');
    // State should include the new DID key
    expect(service.getState()()).toMatchObject({ desmosDidKeyValue: 'did:abc' });
    // displayedKeys$ remains based on private key (still undefined)
    expect(service.displayedKeys$()).toEqual({ desmosPrivateKeyValue: "" });
  });

  it('generateP256 should call sub-methods and update state', async () => {
    const mockPrivateHex = 'deadbeef';
    const mockDid = 'did:key:zTest';
    const mockKeyPair = {} as CryptoKeyPair;

    // Spy on internal methods to control their outputs
    jest.spyOn(service as any, 'generateP256KeyPair').mockResolvedValue(mockKeyPair);
    jest.spyOn(service as any, 'generateP256PrivateKeyHex').mockResolvedValue(mockPrivateHex);
    jest.spyOn(service as any, 'generateP256PublicKeyHex').mockResolvedValue('0x04cafebabe');
    jest.spyOn(service as any, 'generateDidKey').mockResolvedValue(mockDid);

    // Execute the method under test
    await service.generateP256();

    // After generation, both private key and DID key should be set
    expect(service.getState()()).toMatchObject({
      desmosPrivateKeyValue: mockPrivateHex,
      desmosDidKeyValue: mockDid,
    });
  });
});
