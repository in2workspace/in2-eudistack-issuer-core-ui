import { KeyGeneratorService } from './key-generator.service';

describe('KeyGeneratorService', () => {
  let service: KeyGeneratorService;

  beforeEach(() => {
    // Ensure crypto.subtle is available for Jest environment
    if (!window.crypto) {
      // @ts-ignore
      window.crypto = {};
    }
    // @ts-ignore
    window.crypto.subtle = {
      exportKey: jest.fn(),
      generateKey: jest.fn()
    };

    service = new KeyGeneratorService();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should have initial state undefined and displayedKeys$ returns partial with undefined', () => {
    expect(service.getState()()).toBeUndefined();
    expect(service.displayedKeys$()).toEqual({ desmosPrivateKeyValue: undefined });
  });

  it('should update desmosPrivateKeyValue correctly', () => {
    service.updateState('desmosPrivateKeyValue', 'abc');
    expect(service.getState()()).toMatchObject({ desmosPrivateKeyValue: 'abc' });
    expect(service.displayedKeys$()).toEqual({ desmosPrivateKeyValue: 'abc' });
  });

  it('should update desmosDidKeyValue correctly', () => {
    service.updateState('desmosDidKeyValue', 'did:abc');
    expect(service.getState()()).toMatchObject({ desmosDidKeyValue: 'did:abc' });
    expect(service.displayedKeys$()).toEqual({ desmosPrivateKeyValue: '' });
  });

  it('generateP256 should call sub-methods and update state', async () => {
    const mockPrivateHex = 'deadbeef';
    const mockDid = 'did:key:zTest';
    const mockKeyPair = {} as CryptoKeyPair;

    jest.spyOn(service as any, 'generateP256KeyPair').mockResolvedValue(mockKeyPair);
    jest.spyOn(service as any, 'generateP256PrivateKeyHex').mockResolvedValue(mockPrivateHex);
    jest.spyOn(service as any, 'generateP256PublicKeyHex').mockResolvedValue('0x04cafebabe');
    jest.spyOn(service as any, 'generateDidKey').mockResolvedValue(mockDid);

    await service.generateP256();

    expect(service.getState()()).toMatchObject({
      desmosPrivateKeyValue: mockPrivateHex,
      desmosDidKeyValue: mockDid,
    });
  });

  describe('private methods', () => {
    it('bytesToHexString should convert a Uint8Array to a hex string with "0x" prefix', () => {
      const bytes = new Uint8Array([0, 15, 255]);
      const hex = (service as any).bytesToHexString(bytes);
      expect(hex).toBe('0x000fff');
    });

    it('isHexNumberEven should correctly detect even and odd hex numbers', () => {
      expect((service as any).isHexNumberEven('2')).toBe(true);
      expect((service as any).isHexNumberEven('3')).toBe(false);
    });

    it('base58encode should correctly encode simple arrays', () => {
      const MAP = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
      expect((service as any).base58encode(new Uint8Array([0]), MAP)).toBe('1');
      expect((service as any).base58encode(new Uint8Array([1]), MAP)).toBe('2');
    });

    it('generateDidKey should build the did:key using base58encode', async () => {
      const hex = '0x04' + 'a'.repeat(64) + 'b'.repeat(64);
      jest.spyOn(service as any, 'isHexNumberEven').mockReturnValue(true);
      const base58Spy = jest.spyOn(service as any, 'base58encode').mockReturnValue('XYZ');

      const result = await (service as any).generateDidKey(hex);
      expect(result).toBe('did:key:zXYZ');
      expect(base58Spy).toHaveBeenCalledWith(
        expect.any(Uint8Array),
        '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
      );
    });

    it('generateP256PrivateKeyHex should correctly extract the 32 bytes of the private key', async () => {
      const fakeKeyPair = { privateKey: {} } as CryptoKeyPair;
      const full = new Uint8Array(68);
      full.forEach((_, i) => full[i] = i);
      // @ts-ignore
      (window.crypto.subtle.exportKey as jest.Mock).mockResolvedValue(full.buffer);

      const hex = await (service as any).generateP256PrivateKeyHex(fakeKeyPair);
      const slice = full.slice(36, 36 + 32);
      const expected = '0x' + Array.from(slice)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      expect(hex).toBe(expected);
    });

    it('generateP256PublicKeyHex should convert raw public key bytes to hex', async () => {
      const fakeKeyPair = { publicKey: {} } as CryptoKeyPair;
      const buf = new Uint8Array([1,2,3,4]);
      // @ts-ignore
      (window.crypto.subtle.exportKey as jest.Mock).mockResolvedValue(buf.buffer);

      const hex = await (service as any).generateP256PublicKeyHex(fakeKeyPair);
      expect(hex).toBe('0x01020304');
    });

    it('generateP256KeyPair should call crypto.subtle.generateKey with the correct parameters', async () => {
      // @ts-ignore
      const spy = (window.crypto.subtle.generateKey as jest.Mock)
        .mockResolvedValue({} as CryptoKeyPair);

      const pair = await (service as any).generateP256KeyPair();
      expect(spy).toHaveBeenCalledWith(
        { name: 'ECDSA', namedCurve: 'P-256' },
        true,
        ['sign', 'verify']
      );
      expect(pair).toBeDefined();
    });
  });
});
