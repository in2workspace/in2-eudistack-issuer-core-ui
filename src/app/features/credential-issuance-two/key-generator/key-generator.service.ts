import { Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { keccak_256 } from '@noble/hashes/sha3';
// import { arrayify, hexToBytes } from '@ethersproject/bytes'; // Pots reemplaçar si vols, però arrayify és molt útil
import * as secp from '@noble/secp256k1';


interface KeyState {
  desmosPrivateKeyValue: string,
  desmosPublicKeyValue: string,
  desmosDidKeyValue: string,
  issValue: string,
  dltPrivateKeyValue: string,
  dltAddressValue: string
}


@Injectable({ providedIn: 'root' })
export class KeyGeneratorService {

private readonly keyState$: WritableSignal<KeyState|undefined> = signal(undefined);
public getState(): Signal<KeyState | undefined>{
  return this.keyState$.asReadonly();
}
public updateState(key: keyof(KeyState), value: string){
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

//copyToClipboard --util?

async generateP256() {
        const keyPair = await this.generateP256KeyPair();

        const privateKeyHex = await this.generateP256PrivateKeyHex(keyPair);

        const publicKeyHex = await this.generateP256PublicKeyHex(keyPair)

        const didKey = await this.generateDidKey(publicKeyHex)

        const iss = await this.sha256(didKey)

        this.updateState("desmosPrivateKeyValue", privateKeyHex);
        this.updateState("desmosPublicKeyValue", publicKeyHex);
        this.updateState("desmosDidKeyValue", didKey);
        this.updateState("issValue", "0x" + iss);

    }

    async generateP256KeyPair() {
        return await window.crypto.subtle.generateKey(
          {
            name: "ECDSA",
            namedCurve: "P-256"
          },
          true,
          ["sign", "verify"]
        );
    }

   async generateP256PrivateKeyHex(keyPair: CryptoKeyPair): Promise<string> {
    const privateKeyPkcs8: ArrayBuffer = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

    const privateKeyPkcs8Bytes: Uint8Array = new Uint8Array(privateKeyPkcs8);

    const privateKeyPkcs8Hex: string = this.bytesToHexString(privateKeyPkcs8Bytes);
    console.log("Private Key P-256 (Secp256r1) PKCS#8 (HEX): ", privateKeyPkcs8Hex);

    const privateKeyBytes: Uint8Array = privateKeyPkcs8Bytes.slice(36, 36 + 32);

    const privateKeyHexBytes: string = this.bytesToHexString(privateKeyBytes);

    return privateKeyHexBytes;
}

    async generateDidKey(publicKeyHex: string){
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

async generateP256PublicKeyHex(keyPair: CryptoKeyPair): Promise<string> {
    const publicKey: ArrayBuffer = await window.crypto.subtle.exportKey("raw", keyPair.publicKey);

    const publicKeyBytes: Uint8Array = new Uint8Array(publicKey);

    return this.bytesToHexString(publicKeyBytes);
}

bytesToHexString(bytesToTransform: Uint8Array): string {
    return `0x${Array.from(bytesToTransform).map(b => b.toString(16).padStart(2, '0')).join('')}`;
}

isHexNumberEven(hexNumber: string): boolean {
    const decimalNumber: bigint = BigInt("0x" + hexNumber);
    const stringNumber: string = decimalNumber.toString();

    const lastNumPosition: number = stringNumber.length - 1;
    const lastNumDecimal: number = parseInt(stringNumber[lastNumPosition]);

    const isEven: boolean = lastNumDecimal % 2 === 0;
    return isEven;
}

base58encode(
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

async sha256(message: string): Promise<string> {
    const msgBuffer = new Uint8Array(new TextEncoder().encode(message).buffer);

    const hashBuffer: ArrayBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

    const hashArray: number[] = Array.from(new Uint8Array(hashBuffer));

    const hashHex: string = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return hashHex;
}

async generateSecp256k1(): Promise<void> {
    const privateKey = this.generateSecp256k1PrivateKey();
    const ethereumAddress = await this.generateEthereumAddressFromPrivateKey(privateKey);

    // const privateKeyHexWithout0x = privateKey.toString(16); //! ?
    const privateKeyHex = '0x' + this.bytesToHexString(privateKey);

    // Aquí millor que no modifiquis DOM directament, però segueixo el teu exemple
    this.updateState("dltPrivateKeyValue", privateKeyHex);
    this.updateState("dltAddressValue", ethereumAddress);

  }

 generateSecp256k1PrivateKey(): Uint8Array {
  // Genera 32 bytes aleatoris amb Web Crypto
  return window.crypto.getRandomValues(new Uint8Array(32));
}

async generateEthereumAddressFromPrivateKey(privateKey: Uint8Array): Promise<string> {
  // Obtenim la clau pública en format no comprimida (65 bytes, prefix 0x04)
  const publicKey = secp.getPublicKey(privateKey, false); // false = no compressed
  
  // La clau pública sense el prefix 0x04 (primer byte)
  const publicKeyWithoutPrefix = publicKey.slice(1); // 64 bytes (x + y concatenats)
  
  // Hashejem amb keccak256
  const hash = keccak_256(publicKeyWithoutPrefix);
  
  // Últims 20 bytes de la hash, convertim a hex
  const address = '0x' + this.bytesToHexString(hash.slice(-20));
  
  // Opcional: calcular checksum EIP-55 (ho pots reutilitzar si tens la funció)
  const addressChecksum = this.calculateEthereumAddressChecksum(address);
  
  return addressChecksum;
}


calculateEthereumAddressChecksum(address: string): string {
  // Calculem el hash keccak256 de l'adreça en minúscula sense 0x
  const addressLower = address.toLowerCase().replace(/^0x/, '');
  const addressHash = keccak_256(new TextEncoder().encode(addressLower));
  const addressHashHex = this.bytesToHexString(addressHash);

  let checksumAddress = '';

  for (let i = 0; i < address.length; i++) {
    // Si el caràcter hex del hash és > 7 fem majúscula la lletra
    if (parseInt(addressHashHex[i], 16) > 7) {
      checksumAddress += address[i].toUpperCase();
    } else {
      checksumAddress += address[i];
    }
  }

  return checksumAddress;
}


}
