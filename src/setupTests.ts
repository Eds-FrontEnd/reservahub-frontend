import "@testing-library/jest-dom";

// Garante o suporte ao TextEncoder e TextDecoder sem depender do módulo util do Node no TS
const globalAny: any = globalThis;

if (typeof globalAny.TextEncoder === "undefined") {
  globalAny.TextEncoder = class {
    encode(input: string = "") {
      const buf = new Uint8Array(input.length);
      for (let i = 0; i < input.length; i++) {
        buf[i] = input.charCodeAt(i);
      }
      return buf;
    }
  };
}

if (typeof globalAny.TextDecoder === "undefined") {
  globalAny.TextDecoder = class {
    decode(bytes?: Uint8Array) {
      if (!bytes) return "";
      return String.fromCharCode.apply(null, Array.from(bytes));
    }
  };
}
