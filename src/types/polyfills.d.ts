declare module "crypto-browserify" {
    import { Cipher, Decipher, Hash } from "crypto";
  
    export function randomBytes(size: number, callback?: (err: Error | null, buf: Buffer) => void): Buffer;
    export function createHash(algorithm: string): Hash;
    export function createCipher(algorithm: string, password: Buffer | string): Cipher;
    export function createDecipher(algorithm: string, password: Buffer | string): Decipher;
    // Add other methods as needed based on usage in @metaplex-foundation/js
  }
  
  declare module "stream-browserify" {
    import { Stream } from "stream";
  
    export = Stream;
  }