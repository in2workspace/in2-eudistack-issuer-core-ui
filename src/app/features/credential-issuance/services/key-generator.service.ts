import { computed, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { KeyState } from 'src/app/core/models/entity/lear-credential-issuance';


@Injectable() //not provided in root but in key generator component
export class KeyGeneratorService {

  public readonly displayedKeys$: Signal<Partial<KeyState>|undefined> = computed(() => {
    return {desmosPrivateKeyValue: this.keyState$()?.desmosPrivateKeyValue}
  });
  private readonly keyState$: WritableSignal<KeyState|undefined> = signal(undefined);
  public getState(): Signal<KeyState | undefined>{
    return this.keyState$.asReadonly();
  }
  public updateState(key: keyof(KeyState), value: string): void{
    const current = this.keyState$() ?? {
    desmosPrivateKeyValue: '',
    desmosPublicKeyValue: '',
    desmosDidKeyValue: '',
    dltPrivateKeyValue: '',
    dltAddressValue: '',
    issValue: '',
  };
    this.keyState$.set({...current, [key]: value});
  }

  public async generateP256(): Promise<void> {
          const keyPair = await this.generateP256KeyPair();

          const privateKeyHex = await this.generateP256PrivateKeyHex(keyPair);

          const publicKeyHex = await this.generateP256PublicKeyHex(keyPair)

          const didKey = await this.generateDidKey(publicKeyHex)


          this.updateState("desmosPrivateKeyValue", privateKeyHex);
          this.updateState("desmosDidKeyValue", didKey);

      }

  private async generateP256KeyPair(): Promise<CryptoKeyPair> {
      return await window.crypto.subtle.generateKey(
        {
          name: "ECDSA",
          namedCurve: "P-256"
        },
        true,
        ["sign", "verify"]
      );
  }

  private async generateP256PrivateKeyHex(keyPair: CryptoKeyPair): Promise<string> {
    const privateKeyPkcs8: ArrayBuffer = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

    const privateKeyPkcs8Bytes: Uint8Array = new Uint8Array(privateKeyPkcs8);

    const privateKeyPkcs8Hex: string = this.bytesToHexString(privateKeyPkcs8Bytes);
    console.log("Private Key P-256 (Secp256r1) PKCS#8 (HEX): ", privateKeyPkcs8Hex);

    const privateKeyBytes: Uint8Array = privateKeyPkcs8Bytes.slice(36, 36 + 32);

    const privateKeyHexBytes: string = this.bytesToHexString(privateKeyBytes);

    return privateKeyHexBytes;
  }

  private async generateDidKey(publicKeyHex: string): Promise<string>{
      const publicKeyHexWithout0xAndPrefix = publicKeyHex.slice(4)

      const publicKeyX = publicKeyHexWithout0xAndPrefix.slice(0, 64)

      const publicKeyY = publicKeyHexWithout0xAndPrefix.slice(64)
      const isPublicKeyYEven = this.isHexNumberEven(publicKeyY)

      const compressedPublicKeyX = (isPublicKeyYEven ? "02" : "03") + publicKeyX;

      const multicodecHex = "8024" + compressedPublicKeyX

      const matchResult = multicodecHex.match(/.{1,2}/g);
      if (!matchResult) {
        throw new Error('Invalid multicodecHex string');
      }
      const multicodecBytes = new Uint8Array(matchResult.map(byte => parseInt(byte, 16)));
      const MAP = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
      const multicodecBase58 = this.base58encode(multicodecBytes, MAP);

      return 'did:key:z' + multicodecBase58;
  }

  private async generateP256PublicKeyHex(keyPair: CryptoKeyPair): Promise<string> {
      const publicKey: ArrayBuffer = await window.crypto.subtle.exportKey("raw", keyPair.publicKey);

      const publicKeyBytes: Uint8Array = new Uint8Array(publicKey);

      return this.bytesToHexString(publicKeyBytes);
  }

  private bytesToHexString(bytesToTransform: Uint8Array): string {
      return `0x${Array.from(bytesToTransform).map(b => b.toString(16).padStart(2, '0')).join('')}`;
  }

  private isHexNumberEven(hexNumber: string): boolean {
      const decimalNumber: bigint = BigInt("0x" + hexNumber);
      const stringNumber: string = decimalNumber.toString();

      const lastNumPosition: number = stringNumber.length - 1;
      const lastNumDecimal: number = parseInt(stringNumber[lastNumPosition]);

      const isEven: boolean = lastNumDecimal % 2 === 0;
      return isEven;
  }

  private base58encode(
      B: Uint8Array,     // Raw byte input
      A: string          // Base58 characters, e.g., "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
  ): string {
      const d: number[] = [];  // Stream of base58 digits
      let s = "";              // Result string

      for (let i = 0; i < B.length; i++) {
          let j = 0;
          let c = B[i];
          s += c || s.length ^ i ? "" : "1"; // Prepend '1' for leading zeros

          while (j < d.length || c) {
              let n = d[j];
              n = n ? n * 256 + c : c;
              c = Math.floor(n / 58);
              d[j] = n % 58;
              j++;
          }
      }

      while (d.length) {
          s += A[d.pop()!]; // `!` because we know pop() won't return undefined here
      }

      return s;
  }

}
