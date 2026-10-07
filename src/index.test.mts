import { describe, expect, it } from "vitest";
import {
  MAX_VERSION_CODE,
  VERSION_CODE_WIDTH,
  padVersionCode,
  verToCode,
} from "./index.mts";

describe("verToCode", () => {
  it.each([
    ["0.0.1", 1],
    ["1.0.1", 10000001],
    ["21.3.23", 210003023],
    ["210.0.0", 2100000000],
    ["1.2.3-beta.1", 10002003],
    ["1.2.3+sha.abc", 10002003],
  ])("verToCode(%s) === %d", (ver, expected) => {
    expect(verToCode(ver)).toBe(expected);
  });

  it.each(["1.2", "abc", "1.2.x", ""])("잘못된 형식 throw: %s", (ver) => {
    expect(() => verToCode(ver)).toThrow();
  });

  it("minor 상한(9999) 초과 시 throw", () => {
    expect(() => verToCode("1.10000.0")).toThrow(/minor/);
  });

  it("patch 상한(999) 초과 시 throw", () => {
    expect(() => verToCode("1.0.1000")).toThrow(/patch/);
  });

  it("Play Store 상한 초과 시 throw", () => {
    expect(() => verToCode("211.0.0")).toThrow(/Play Store/);
  });

  it("versionCode 0(0.0.0) 시 throw", () => {
    expect(() => verToCode("0.0.0")).toThrow(/1 이상/);
  });
});

describe("padVersionCode", () => {
  it.each([
    [1, "0000000001"],
    [210003023, "0210003023"],
    [2100000000, "2100000000"],
  ])("padVersionCode(%d) === %s", (code, expected) => {
    expect(padVersionCode(code)).toBe(expected);
  });
});

describe("상수", () => {
  it("VERSION_CODE_WIDTH === 10", () => {
    expect(VERSION_CODE_WIDTH).toBe(10);
  });

  it("MAX_VERSION_CODE === 2_100_000_000", () => {
    expect(MAX_VERSION_CODE).toBe(2_100_000_000);
  });
});
