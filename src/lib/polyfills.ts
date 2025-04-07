import CryptoJS from "crypto-js";

// Polyfill crypto.randomBytes
if (typeof window !== "undefined") {
  window.crypto = window.crypto || {};
  window.crypto.getRandomValues = window.crypto.getRandomValues || ((array: Uint8Array) => {
    const randomValues = CryptoJS.lib.WordArray.random(array.length).words;
    for (let i = 0; i < array.length; i++) {
      array[i] = randomValues[i] & 0xff;
    }
    return array;
  });
  (window as any).nodeCrypto = {
    randomBytes: (size: number) => {
      const array = new Uint8Array(size);
      window.crypto.getRandomValues(array);
      return Buffer.from(array);
    },
  };
}