import { describe, it, expect } from "vitest";
import { Guard } from "../guard.js";

describe("Guard Utility Primitive", () => {
  describe("againstNullOrUndefined", () => {
    it("should return ok for valid defined values", () => {
      const result = Guard.againstNullOrUndefined("valid", "testArg");
      expect(result.isSuccess).toBe(true);
    });

    it("should return failure for null or undefined", () => {
      const nullResult = Guard.againstNullOrUndefined(null, "testArg");
      expect(nullResult.isFailure).toBe(true);

      const undefResult = Guard.againstNullOrUndefined(undefined, "testArg");
      expect(undefResult.isFailure).toBe(true);
    });
  });

  describe("againstNullOrUndefinedBulk", () => {
    it("should return ok when all args are defined", () => {
      const result = Guard.againstNullOrUndefinedBulk([
        { value: "a", argumentName: "argA" },
        { value: 123, argumentName: "argB" },
      ]);
      expect(result.isSuccess).toBe(true);
    });

    it("should return failure on first null/undefined arg", () => {
      const result = Guard.againstNullOrUndefinedBulk([
        { value: "a", argumentName: "argA" },
        { value: null, argumentName: "argB" },
      ]);
      expect(result.isFailure).toBe(true);
    });
  });

  describe("againstEmptyString", () => {
    it("should return ok for non-empty strings", () => {
      const result = Guard.againstEmptyString("Hello", "title");
      expect(result.isSuccess).toBe(true);
    });

    it("should return failure for empty strings or whitespace", () => {
      const emptyResult = Guard.againstEmptyString("", "title");
      expect(emptyResult.isFailure).toBe(true);

      const spaceResult = Guard.againstEmptyString("   ", "title");
      expect(spaceResult.isFailure).toBe(true);
    });
  });

  describe("againstInvalidLength", () => {
    it("should return ok when string length is within bounds", () => {
      const result = Guard.againstInvalidLength("abc", 2, 5, "name");
      expect(result.isSuccess).toBe(true);
    });

    it("should return failure when string length is out of bounds", () => {
      const shortResult = Guard.againstInvalidLength("a", 2, 5, "name");
      expect(shortResult.isFailure).toBe(true);

      const longResult = Guard.againstInvalidLength("abcdef", 2, 5, "name");
      expect(longResult.isFailure).toBe(true);
    });
  });

  describe("againstNegativeOrZero", () => {
    it("should return ok for positive numbers", () => {
      const result = Guard.againstNegativeOrZero(5, "count");
      expect(result.isSuccess).toBe(true);
    });

    it("should return failure for zero, negative numbers, or NaN", () => {
      expect(Guard.againstNegativeOrZero(0, "count").isFailure).toBe(true);
      expect(Guard.againstNegativeOrZero(-5, "count").isFailure).toBe(true);
      expect(Guard.againstNegativeOrZero(NaN, "count").isFailure).toBe(true);
    });
  });

  describe("inRange", () => {
    it("should return ok for numbers inside inclusive range", () => {
      expect(Guard.inRange(5, 1, 10, "val").isSuccess).toBe(true);
      expect(Guard.inRange(1, 1, 10, "val").isSuccess).toBe(true);
      expect(Guard.inRange(10, 1, 10, "val").isSuccess).toBe(true);
    });

    it("should return failure for numbers outside inclusive range", () => {
      expect(Guard.inRange(0, 1, 10, "val").isFailure).toBe(true);
      expect(Guard.inRange(11, 1, 10, "val").isFailure).toBe(true);
    });
  });
});
