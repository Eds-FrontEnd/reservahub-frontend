import "@testing-library/jest-dom";

import { TextDecoder, TextEncoder } from "node:util";

Object.defineProperty(globalThis, "TextEncoder", {
  configurable: true,
  value: TextEncoder,
});

Object.defineProperty(globalThis, "TextDecoder", {
  configurable: true,
  value: TextDecoder,
});
